import Link from "next/link";
import { MessageSquare, UserPlus, Users } from "lucide-react";

import { ChatMessageForm } from "@/features/chat/components/chat-message-form";
import { ChatThread } from "@/features/chat/components/chat-thread";
import { getChatPageData } from "@/features/chat/queries";
import { FriendRequestResponseForm } from "@/features/social/components/friend-request-response-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth/permissions";
import { formatCompactDate, getInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAuth();
  const data = await getChatPageData(session.user.id, await searchParams);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-white">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">Social</p>
        <h1 className="mt-2 text-3xl font-semibold">Amigos y Chat</h1>
        <p className="mt-2 max-w-3xl text-sm text-white/65">
          Gestiona solicitudes de amistad, abre conversaciones y manda mensajes
          desde un mismo espacio.
        </p>
      </section>

      {data.blockedChatTarget ? (
        <Card className="border-amber-300/30 bg-amber-300/10 text-amber-100">
          <CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm">
              Aun no puedes chatear con @{data.blockedChatTarget.nick}. Necesitas una
              amistad aceptada.
            </p>
            <Button asChild variant="outline" className="border-amber-200/40 bg-transparent">
              <Link href={`/profile/${data.blockedChatTarget.id}`}>
                Anadir amigo para poder chatear
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Solicitudes pendientes</CardTitle>
              <Badge
                variant="outline"
                className="border-amber-300/30 bg-amber-300/10 text-amber-100"
              >
                {data.incomingFriendRequests.length}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.incomingFriendRequests.length ? (
                data.incomingFriendRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <Avatar className="size-10 border border-white/10">
                        <AvatarImage
                          src={request.requester.avatarUrl ?? undefined}
                          alt={request.requester.displayName}
                        />
                        <AvatarFallback>
                          {getInitials(request.requester.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{request.requester.displayName}</p>
                        <p className="text-sm text-white/55">@{request.requester.nick}</p>
                        <p className="text-xs text-white/45">
                          {request.requester.city} - ELO {request.requester.eloGlobal}
                        </p>
                      </div>
                    </div>
                    <FriendRequestResponseForm friendshipId={request.id} compact />
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                  No tienes solicitudes de amistad pendientes.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Amigos</CardTitle>
              <Badge variant="outline" className="border-white/10 bg-white/5 text-white">
                {data.friends.length}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.friends.length ? (
                data.friends.map((friend) => (
                  <div
                    key={friend.friendUserId}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-3"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <Avatar className="size-10 border border-white/10">
                        <AvatarImage
                          src={friend.avatarUrl ?? undefined}
                          alt={friend.displayName}
                        />
                        <AvatarFallback>{getInitials(friend.displayName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{friend.displayName}</p>
                        <p className="truncate text-sm text-white/55">@{friend.nick}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                      >
                        <Link href={`/chat?with=${friend.friendUserId}`}>
                          <MessageSquare className="size-4" />
                          Mensaje
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                      >
                        <Link href={`/profile/${friend.friendUserId}`}>Ver perfil</Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                  Aun no tienes amistades aceptadas.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Solicitudes enviadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.outgoingFriendRequests.length ? (
                data.outgoingFriendRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-3"
                  >
                    <p className="font-medium">{request.addressee.displayName}</p>
                    <p className="text-sm text-white/55">@{request.addressee.nick}</p>
                    <p className="text-xs text-white/45">
                      Enviada {formatCompactDate(request.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                  No has enviado solicitudes pendientes.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Conversaciones</CardTitle>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <Link href="/profile/me">
                  <UserPlus className="size-4" />
                  Gestionar amigos
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.conversations.length ? (
                data.conversations.map((conversation) => (
                  <Link
                    key={conversation.id}
                    href={`/chat?chat=${conversation.id}`}
                    className={
                      data.selectedChatId === conversation.id
                        ? "block rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4"
                        : "block rounded-2xl border border-white/10 bg-slate-950/40 p-4 transition-colors hover:border-cyan-300/30 hover:bg-white/10"
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="size-10 border border-white/10">
                          <AvatarImage
                            src={conversation.partner.avatarUrl ?? undefined}
                            alt={conversation.partner.displayName}
                          />
                          <AvatarFallback>
                            {getInitials(conversation.partner.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {conversation.partner.displayName}
                          </p>
                          <p className="truncate text-sm text-white/60">
                            {conversation.latestMessage
                              ? conversation.latestMessage.content
                              : "Sin mensajes aun"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {conversation.latestMessage ? (
                          <p className="text-xs text-white/45">
                            {formatCompactDate(conversation.latestMessage.createdAt)}
                          </p>
                        ) : null}
                        {conversation.unreadCount ? (
                          <Badge
                            variant="outline"
                            className="mt-1 border-amber-300/30 bg-amber-300/10 text-amber-100"
                          >
                            {conversation.unreadCount}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-6 text-center text-sm text-white/60">
                  <p>No tienes conversaciones.</p>
                  <p className="mt-2">
                    Abre perfiles de tus amigos y pulsa en Mensaje para iniciar chat.
                  </p>
                  <Button asChild variant="outline" className="mt-4 border-white/10 bg-white/5 text-white hover:bg-white/10">
                    <Link href="/profile/me">Añadir amigos</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>
                {data.selectedConversation
                  ? `Chat con ${data.selectedConversation.partner.displayName}`
                  : "Selecciona una conversacion"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.selectedConversation ? (
                <>
                  <ChatThread
                    currentUserId={session.user.id}
                    messages={data.selectedConversation.messages}
                  />
                  <ChatMessageForm chatId={data.selectedConversation.id} />
                </>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-8 text-center">
                  <Users className="mx-auto size-8 text-cyan-300" />
                  <p className="mt-3 text-sm text-white/70">
                    Elige una conversacion para ver el historial y mandar mensajes.
                  </p>
                  <Button asChild variant="outline" className="mt-4 border-white/10 bg-white/5 text-white hover:bg-white/10">
                    <Link href="/profile/me">Añadir amigos</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
