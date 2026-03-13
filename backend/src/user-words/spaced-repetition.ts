export interface ReviewState {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  status: 'learn' | 'known' | 'mastered';
  nextReviewAt: Date;
}

export function calculateNextReview(
  current: ReviewState,
  correct: boolean,
): ReviewState {
  if (correct) {
    const repetitions = current.repetitions + 1;
    let intervalDays: number;

    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(current.intervalDays * current.easeFactor);
    }

    const easeFactor = Math.max(1.3, current.easeFactor + 0.1);
    const status = repetitions >= 5 ? 'mastered' : current.status;
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

    return { easeFactor, intervalDays, repetitions, status, nextReviewAt };
  } else {
    return {
      easeFactor: Math.max(1.3, current.easeFactor - 0.2),
      intervalDays: 1,
      repetitions: 0,
      status: current.status === 'mastered' ? 'learn' : current.status,
      nextReviewAt: new Date(),
    };
  }
}
