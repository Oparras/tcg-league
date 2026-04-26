import { FriendshipStatus } from "@prisma/client";

import { getFriendNetwork } from "@/features/social/queries";
import { normalizeDirectChatParticipants } from "@/lib/chat";
import { getDb } from "@/lib/db";

function getSearchParam(
  rawSearchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = rawSearchParams[key];

  return typeof value === "string" ? value : "";
}

export async function getLatestChatPreviews(userId: string, limit = 4) {
  const chats = await getDb().chat.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    take: limit,
    include: {
      userA: {
        select: {
          id: true,
          playerProfile: {
            select: {
              nick: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      },
      userB: {
        select: {
          id: true,
          playerProfile: {
            select: {
              nick: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          content: true,
          senderId: true,
          createdAt: true,
          readAt: true,
        },
      },
    },
  });

  return chats.map((chat) => {
    const partner = chat.userAId === userId ? chat.userB : chat.userA;
    const lastMessage = chat.messages[0] ?? null;
    const isUnread =
      Boolean(lastMessage) &&
      lastMessage!.senderId !== userId &&
      !lastMessage!.readAt;

    return {
      id: chat.id,
      partnerId: partner.id,
      partner: {
        nick: partner.playerProfile?.nick ?? "player",
        displayName: partner.playerProfile?.displayName ?? "Jugador",
        avatarUrl: partner.playerProfile?.avatarUrl ?? null,
      },
      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            isUnread,
          }
        : null,
    };
  });
}

export async function getChatPageData(
  userId: string,
  rawSearchParams: Record<string, string | string[] | undefined>,
) {
  const db = getDb();
  const friendNetwork = await getFriendNetwork(userId);
  const friendIds = new Set(friendNetwork.friends.map((friend) => friend.friendUserId));
  const chatParam = getSearchParam(rawSearchParams, "chat");
  const withParam = getSearchParam(rawSearchParams, "with");
  let selectedChatId = chatParam || null;
  let blockedChatTarget:
    | {
        id: string;
        nick: string;
        displayName: string;
      }
    | null = null;

  if (withParam && withParam !== userId && friendIds.has(withParam)) {
    const participants = normalizeDirectChatParticipants(userId, withParam);
    const chat = await db.chat.upsert({
      where: {
        userAId_userBId: participants,
      },
      update: {},
      create: participants,
      select: {
        id: true,
      },
    });

    selectedChatId = chat.id;
  }

  if (withParam && withParam !== userId && !friendIds.has(withParam)) {
    const targetProfile = await db.playerProfile.findUnique({
      where: {
        userId: withParam,
      },
      select: {
        userId: true,
        nick: true,
        displayName: true,
      },
    });

    if (targetProfile) {
      blockedChatTarget = {
        id: targetProfile.userId,
        nick: targetProfile.nick,
        displayName: targetProfile.displayName,
      };
    }
  }

  const conversations = await db.chat.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    include: {
      userA: {
        select: {
          id: true,
          playerProfile: {
            select: {
              nick: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      },
      userB: {
        select: {
          id: true,
          playerProfile: {
            select: {
              nick: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          content: true,
          senderId: true,
          createdAt: true,
          readAt: true,
        },
      },
    },
    take: 50,
  });

  const friendConversations = conversations.filter((conversation) => {
    const partnerId = conversation.userAId === userId ? conversation.userBId : conversation.userAId;

    return friendIds.has(partnerId);
  });

  const conversationsById = new Map(
    friendConversations.map((conversation) => [conversation.id, conversation]),
  );

  if (selectedChatId && !conversationsById.has(selectedChatId)) {
    selectedChatId = null;
  }

  const conversationIds = friendConversations.map((conversation) => conversation.id);
  const unreadRows = conversationIds.length
    ? await db.message.groupBy({
        by: ["chatId"],
        where: {
          chatId: {
            in: conversationIds,
          },
          senderId: {
            not: userId,
          },
          readAt: null,
        },
        _count: {
          _all: true,
        },
      })
    : [];
  const unreadCountByChatId = new Map(
    unreadRows.map((row) => [row.chatId, row._count._all]),
  );

  let selectedConversation:
    | {
        id: string;
        partner: {
          id: string;
          nick: string;
          displayName: string;
          avatarUrl: string | null;
        };
        messages: {
          id: string;
          content: string;
          createdAt: Date;
          readAt: Date | null;
          senderId: string;
          sender: {
            id: string;
            nick: string;
            displayName: string;
            avatarUrl: string | null;
          };
        }[];
      }
    | null = null;

  if (selectedChatId) {
    await db.message.updateMany({
      where: {
        chatId: selectedChatId,
        senderId: {
          not: userId,
        },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    const selectedChat = await db.chat.findUnique({
      where: {
        id: selectedChatId,
      },
      include: {
        userA: {
          select: {
            id: true,
            playerProfile: {
              select: {
                nick: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        userB: {
          select: {
            id: true,
            playerProfile: {
              select: {
                nick: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          take: 120,
          include: {
            sender: {
              select: {
                id: true,
                playerProfile: {
                  select: {
                    nick: true,
                    displayName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (
      selectedChat &&
      (selectedChat.userAId === userId || selectedChat.userBId === userId)
    ) {
      const partner = selectedChat.userAId === userId ? selectedChat.userB : selectedChat.userA;
      const hasFriendship = friendIds.has(partner.id);

      if (hasFriendship) {
        selectedConversation = {
          id: selectedChat.id,
          partner: {
            id: partner.id,
            nick: partner.playerProfile?.nick ?? "player",
            displayName: partner.playerProfile?.displayName ?? "Jugador",
            avatarUrl: partner.playerProfile?.avatarUrl ?? null,
          },
          messages: selectedChat.messages.map((message) => ({
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            readAt: message.readAt,
            senderId: message.senderId,
            sender: {
              id: message.sender.id,
              nick: message.sender.playerProfile?.nick ?? "player",
              displayName: message.sender.playerProfile?.displayName ?? "Jugador",
              avatarUrl: message.sender.playerProfile?.avatarUrl ?? null,
            },
          })),
        };
      }
    }
  }

  return {
    selectedChatId,
    selectedConversation,
    friends: friendNetwork.friends,
    incomingFriendRequests: friendNetwork.incomingRequests,
    outgoingFriendRequests: friendNetwork.outgoingRequests,
    conversations: friendConversations.map((conversation) => {
      const partner =
        conversation.userAId === userId ? conversation.userB : conversation.userA;
      const latestMessage = conversation.messages[0] ?? null;

      return {
        id: conversation.id,
        partner: {
          id: partner.id,
          nick: partner.playerProfile?.nick ?? "player",
          displayName: partner.playerProfile?.displayName ?? "Jugador",
          avatarUrl: partner.playerProfile?.avatarUrl ?? null,
        },
        latestMessage: latestMessage
          ? {
              content: latestMessage.content,
              senderId: latestMessage.senderId,
              createdAt: latestMessage.createdAt,
            }
          : null,
        unreadCount:
          conversation.id === selectedChatId
            ? 0
            : (unreadCountByChatId.get(conversation.id) ?? 0),
      };
    }),
    canStartChatWithParam:
      Boolean(withParam) &&
      withParam !== userId &&
      friendIds.has(withParam),
    blockedChatTarget,
  };
}

export async function canUserAccessChat(userId: string, chatId: string) {
  const chat = await getDb().chat.findUnique({
    where: { id: chatId },
    select: {
      id: true,
      userAId: true,
      userBId: true,
    },
  });

  if (!chat) {
    return false;
  }

  if (chat.userAId !== userId && chat.userBId !== userId) {
    return false;
  }

  const friendship = await getDb().friendship.findFirst({
    where: {
      status: FriendshipStatus.ACCEPTED,
      OR: [
        {
          requesterId: chat.userAId,
          addresseeId: chat.userBId,
        },
        {
          requesterId: chat.userBId,
          addresseeId: chat.userAId,
        },
      ],
    },
    select: {
      id: true,
    },
  });

  return Boolean(friendship);
}
