export const SUPPORTED_GAMES = [
  { slug: "riftbound", name: "Riftbound" },
  { slug: "one-piece", name: "One Piece" },
  { slug: "pokemon", name: "Pokemon" },
  { slug: "magic", name: "Magic" },
  { slug: "lorcana", name: "Lorcana" },
] as const;

export const DEFAULT_MAIN_GAME = SUPPORTED_GAMES[0];
