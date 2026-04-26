export const MATCH_FORMAT_VALUES = ["BO1", "BO3", "BO5"] as const;

export type MatchFormatValue = (typeof MATCH_FORMAT_VALUES)[number];

type ScorePair = {
  playerAScore: number;
  playerBScore: number;
};

const formatLabels: Record<MatchFormatValue, string> = {
  BO1: "Mejor de 1",
  BO3: "Mejor de 3",
  BO5: "Mejor de 5",
};

const validScoresByFormat: Record<MatchFormatValue, ScorePair[]> = {
  BO1: [
    { playerAScore: 1, playerBScore: 0 },
    { playerAScore: 0, playerBScore: 1 },
  ],
  BO3: [
    { playerAScore: 2, playerBScore: 0 },
    { playerAScore: 2, playerBScore: 1 },
    { playerAScore: 1, playerBScore: 2 },
    { playerAScore: 0, playerBScore: 2 },
  ],
  BO5: [
    { playerAScore: 3, playerBScore: 0 },
    { playerAScore: 3, playerBScore: 1 },
    { playerAScore: 3, playerBScore: 2 },
    { playerAScore: 2, playerBScore: 3 },
    { playerAScore: 1, playerBScore: 3 },
    { playerAScore: 0, playerBScore: 3 },
  ],
};

const marginFactorByWinnerScore: Record<MatchFormatValue, Record<string, number>> = {
  BO1: {
    "1-0": 1,
  },
  BO3: {
    "2-0": 1.15,
    "2-1": 0.85,
  },
  BO5: {
    "3-0": 1.25,
    "3-1": 1.05,
    "3-2": 0.85,
  },
};

export function isMatchFormatValue(value: string): value is MatchFormatValue {
  return MATCH_FORMAT_VALUES.includes(value as MatchFormatValue);
}

export function normalizeMatchFormat(value: string): MatchFormatValue | null {
  const normalized = value.toUpperCase().trim();

  if (!isMatchFormatValue(normalized)) {
    const prefixedFormat = MATCH_FORMAT_VALUES.find((format) =>
      normalized.startsWith(format),
    );

    if (prefixedFormat) {
      return prefixedFormat;
    }

    return null;
  }

  return normalized;
}

export function getMatchFormatLabel(value: string) {
  const format = normalizeMatchFormat(value);

  if (!format) {
    return value;
  }

  return formatLabels[format];
}

export function getMatchFormatDisplay(value: string) {
  const format = normalizeMatchFormat(value);

  if (!format) {
    return value;
  }

  return `${format} (${formatLabels[format]})`;
}

export function getValidSeriesScores(value: string): ScorePair[] {
  const format = normalizeMatchFormat(value);

  if (!format) {
    return [];
  }

  return validScoresByFormat[format];
}

export function validateSeriesScore(input: {
  format: string;
  playerAScore: number;
  playerBScore: number;
}) {
  const format = normalizeMatchFormat(input.format);

  if (!format) {
    return {
      isValid: false,
      reason: "El formato de la partida no es valido.",
      format: null as MatchFormatValue | null,
      winner: null as "A" | "B" | null,
    };
  }

  const isValid = validScoresByFormat[format].some(
    (result) =>
      result.playerAScore === input.playerAScore &&
      result.playerBScore === input.playerBScore,
  );

  if (!isValid) {
    return {
      isValid: false,
      reason: `El resultado ${input.playerAScore}-${input.playerBScore} no es valido para ${format}.`,
      format,
      winner: null as "A" | "B" | null,
    };
  }

  return {
    isValid: true,
    reason: null,
    format,
    winner: input.playerAScore > input.playerBScore ? ("A" as const) : ("B" as const),
  };
}

export function getSeriesMarginFactor(input: {
  format: string;
  winnerScore: number;
  loserScore: number;
}) {
  const format = normalizeMatchFormat(input.format);

  if (!format) {
    return 1;
  }

  const key = `${input.winnerScore}-${input.loserScore}`;
  return marginFactorByWinnerScore[format][key] ?? 1;
}

export function formatSeriesScore(playerAScore: number | null, playerBScore: number | null) {
  if (typeof playerAScore !== "number" || typeof playerBScore !== "number") {
    return null;
  }

  return `${playerAScore}-${playerBScore}`;
}
