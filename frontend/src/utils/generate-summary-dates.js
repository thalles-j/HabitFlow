import dayjs from "dayjs";

export function generateSummaryDates() {
  // Start 1 month ago, aligned to the start of the week
  const firstDay = dayjs().subtract(1, 'month').startOf('week'); 
  
  const dates = [];
  let compareDate = firstDay;

  // Generate dates for approx 3.5 months (1 month back + 2.5 months forward)
  // 1 month back = ~30 days
  // 75 days forward
  // Total ~105 days. 15 weeks * 7 = 105 days.
  const totalDays = 15 * 7; 

  for (let i = 0; i < totalDays; i++) {
    dates.push(compareDate.toDate());
    compareDate = compareDate.add(1, 'day');
  }

  return dates;
}