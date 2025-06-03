// Format ISO timestamp to local time string
export const formatLocalTime = (timestamp) => {
  if (!timestamp) return '';
  // Parse the UTC timestamp string
  const utcDate = new Date(timestamp);
  // Get the user's local time zone offset in minutes
  const tzOffsetMinutes = utcDate.getTimezoneOffset();
  // Adjust the date by the offset (convert UTC to local)
  const localDate = new Date(utcDate.getTime() - tzOffsetMinutes * 60000);
  // Format as local time string (hour:minute AM/PM)
  return localDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

// Format date to YYYY-MM-DD format
export const formatYYYYMMDD = (date) => {
  return date.getFullYear() + '-' + 
    String(date.getMonth() + 1).padStart(2, '0') + '-' + 
    String(date.getDate()).padStart(2, '0');
};

// Get day of week from date
export const getDayOfWeek = (date) => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return daysOfWeek[date.getDay()];
};

// Format date with day of week
export const formatDateWithDay = (date) => {
  return `${formatYYYYMMDD(date)} (${getDayOfWeek(date)})`;
};
