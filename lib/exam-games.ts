import { isCorrect } from "./exam";
import type { Attempt } from "./exam-types";

export function gameRunStats(attempt: Attempt) {
  let combo = 0;
  let bestCombo = 0;
  let correct = 0;
  let misses = 0;
  for (const id of attempt.ids) {
    if (!attempt.answers[id]) {
      combo = 0;
      continue;
    }
    if (isCorrect(attempt, id)) {
      correct++;
      combo++;
      bestCombo = Math.max(bestCombo, combo);
    } else {
      misses++;
      combo = 0;
    }
  }
  const timeBonus =
    attempt.duration && attempt.finishedAt
      ? Math.floor(
          Math.max(
            0,
            attempt.duration - (attempt.finishedAt - attempt.startedAt),
          ) / 1000,
        ) * 5
      : 0;
  const score = correct * 100 + bestCombo * bestCombo * 10 + timeBonus;
  return { correct, misses, currentCombo: combo, bestCombo, score };
}

export function personalGameRecords(attempts: Attempt[]) {
  const modes = ["blitz", "survival", "boss"] as const;
  return Object.fromEntries(
    modes.map((mode) => {
      const scores = attempts
        .filter((attempt) => attempt.challenge === mode && !!attempt.finishedAt)
        .map((attempt) => gameRunStats(attempt).score);
      return [mode, { best: Math.max(0, ...scores), clears: scores.length }];
    }),
  ) as Record<(typeof modes)[number], { best: number; clears: number }>;
}
