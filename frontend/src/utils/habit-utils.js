export function sortHabits(habits) {
  return habits.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    
    // Primary sort: Date descending (newest first)
    if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
      const dateDiff = dateB - dateA;
      if (dateDiff !== 0) return dateDiff;
    }
    
    // Secondary sort: Title ascending
    if (a.title && b.title) {
      return a.title.localeCompare(b.title);
    }
    
    return 0;
  });
}
