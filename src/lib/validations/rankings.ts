import { z } from "zod";

export const rankingsFiltersSchema = z.object({
  game: z.string().optional().default(""),
  store: z.string().optional().default(""),
  city: z.string().optional().default(""),
});

export type RankingsFiltersValues = z.output<typeof rankingsFiltersSchema>;
