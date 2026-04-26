export const DEFAULT_ELO = 1000;
export const ELO_K_FACTOR = 32;

export function getExpectedScore(eloA: number, eloB: number) {
  return 1 / (1 + 10 ** ((eloB - eloA) / 400));
}

export function calculateEloResult(input: {
  eloA: number;
  eloB: number;
  scoreA: 0 | 1;
  scoreB?: 0 | 1;
  kFactor?: number;
  marginFactor?: number;
}) {
  const scoreB = input.scoreB ?? (input.scoreA === 1 ? 0 : 1);
  const kFactor = input.kFactor ?? ELO_K_FACTOR;
  const marginFactor = input.marginFactor ?? 1;
  const expectedA = getExpectedScore(input.eloA, input.eloB);
  const expectedB = 1 - expectedA;
  const rawDeltaA = kFactor * (input.scoreA - expectedA) * marginFactor;
  const deltaA = Math.round(rawDeltaA);
  const newA = input.eloA + deltaA;
  const newB = input.eloB - deltaA;

  return {
    expectedA,
    expectedB,
    newA,
    newB,
    deltaA,
    deltaB: -deltaA,
    scoreB,
    marginFactor,
  };
}

export function calculateWinRate(wins: number, matchesPlayed: number) {
  if (!matchesPlayed) {
    return 0;
  }

  return Number(((wins / matchesPlayed) * 100).toFixed(1));
}
