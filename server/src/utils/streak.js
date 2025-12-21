
const differenceInCalendarDays = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    const diffTime = d2 - d1;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculates the new streak state based on the last post date.
 * @param {Date} lastPostedAt 
 * @param {number} currentStreak 
 * @returns {{ shouldReset: boolean, newStreak: number }}
 */
const calculateStreak = (lastPostedAt, currentStreak) => {
    if (!lastPostedAt) return { shouldReset: false, newStreak: 0 }; // Or maintain 0

    const now = new Date();
    const diff = differenceInCalendarDays(lastPostedAt, now);

    if (diff === 0) {
        // posted today
        return { shouldReset: false, newStreak: currentStreak };
    } else if (diff === 1) {
        // posted yesterday - streak safe
        return { shouldReset: false, newStreak: currentStreak };
    } else {
        // Missed a day (diff >= 2)
        return { shouldReset: true, newStreak: 0 };
    }
};

module.exports = { calculateStreak, differenceInCalendarDays };
