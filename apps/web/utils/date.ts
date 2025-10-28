
import { getWeek, getYear } from 'date-fns';

export const getNextOccurrence = (dayOfWeek: number, hour: number, minute: number): Date => {
  const now = new Date();
  const result = new Date(now.getTime());
  
  result.setHours(hour, minute, 0, 0);

  // If it's already past the time on the target day, move to next week
  if (now.getDay() > dayOfWeek || (now.getDay() === dayOfWeek && now.getTime() > result.getTime())) {
    result.setDate(result.getDate() + (7 - now.getDay() + dayOfWeek) % 7);
  } else {
    result.setDate(result.getDate() + (dayOfWeek - now.getDay()));
  }

  // Handle edge case where it's Sunday and we want next Saturday
  if (now.getDay() > dayOfWeek) {
     result.setDate(result.getDate() + 7);
  }
  if (now.getDay() === dayOfWeek && now.getHours() >= hour) {
     result.setDate(result.getDate() + 7);
  }
   if (now.getDay() > dayOfWeek || (now.getDay() === dayOfWeek && now.getTime() >= result.getTime())) {
    result.setDate(result.getDate() + 7 - (now.getDay() - dayOfWeek + 7) % 7);
    if(result <= now) result.setDate(result.getDate() + 7);
  } else {
    result.setDate(result.getDate() + (dayOfWeek - now.getDay()));
  }

  // A more robust calculation to find the next occurrence
  const resultDate = new Date();
  resultDate.setHours(hour, minute, 0, 0);
  const currentDay = resultDate.getDay();
  const distance = (dayOfWeek - currentDay + 7) % 7;
  resultDate.setDate(resultDate.getDate() + distance);
  
  // If the calculated date is in the past (e.g., it's Saturday 7 PM, next Saturday 6 PM is next week)
  if (resultDate < new Date()) {
    resultDate.setDate(resultDate.getDate() + 7);
  }

  return resultDate;
};


export const getWeekTag = (date: Date = new Date()): string => {
  const year = getYear(date);
  const week = getWeek(date, { weekStartsOn: 1 }); // Monday as the first day of the week
  return `${year}-W${String(week).padStart(2, '0')}`;
};
