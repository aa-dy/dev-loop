
export const generateICS = (
  title: string,
  description: string,
  startTime: Date,
  location: string
): string => {
  const endTime = new Date(startTime.getTime());
  endTime.setHours(startTime.getHours() + 1); // Assume 1-hour session

  const toUTCString = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DevLoop//DSA Session//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@devloop.app`,
    `DTSTAMP:${toUTCString(new Date())}`,
    `DTSTART:${toUTCString(startTime)}`,
    `DTEND:${toUTCString(endTime)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return icsContent;
};

export const downloadICS = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/calendar' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
