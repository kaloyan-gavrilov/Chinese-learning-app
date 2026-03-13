export interface ReviewState {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  status: 'learn' | 'known' | 'mastered';
  nextReviewAt: Date;
}

/**
 * Improved SM-2 spaced repetition algorithm.
 *
 * Key changes from basic SM-2:
 * - Graduated intervals: 4h → 1d → 3d → 7d → 14d → 30d+
 * - Known words get periodic review (never fully disappear)
 * - Mastered status requires 7+ consecutive correct answers
 * - Incorrect answers are harsher on high-interval words (lapse penalty)
 */
export function calculateNextReview(
  current: ReviewState,
  correct: boolean,
): ReviewState {
  const now = new Date();

  if (correct) {
    const repetitions = current.repetitions + 1;
    let intervalDays: number;

    // Graduated interval steps for early reviews
    if (repetitions === 1) {
      intervalDays = 0.17; // ~4 hours
    } else if (repetitions === 2) {
      intervalDays = 1;
    } else if (repetitions === 3) {
      intervalDays = 3;
    } else if (repetitions === 4) {
      intervalDays = 7;
    } else if (repetitions === 5) {
      intervalDays = 14;
    } else {
      intervalDays = Math.round(current.intervalDays * current.easeFactor);
    }

    const easeFactor = Math.max(1.3, current.easeFactor + 0.05);

    // Status transitions: learn → known (5+ reps) → mastered (8+ reps)
    let status = current.status;
    if (repetitions >= 8) {
      status = 'mastered';
    } else if (repetitions >= 5) {
      status = 'known';
    }

    const nextReviewAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

    return { easeFactor, intervalDays, repetitions, status, nextReviewAt };
  } else {
    // Lapse: harsher penalty for words that had long intervals (you "forgot" them)
    const lapsePenalty = current.intervalDays > 7 ? 0.25 : 0.15;
    const easeFactor = Math.max(1.3, current.easeFactor - lapsePenalty);

    // Demote status on lapse
    let status = current.status;
    if (status === 'mastered') {
      status = 'known';
    } else if (status === 'known' && current.repetitions <= 1) {
      status = 'learn';
    }

    return {
      easeFactor,
      intervalDays: 0.007, // ~10 minutes — immediate re-queue in current session
      repetitions: 0,
      status,
      nextReviewAt: now,
    };
  }
}
