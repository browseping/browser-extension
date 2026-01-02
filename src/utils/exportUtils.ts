interface TabUsageData {
  date: string;
  domains: { domain: string; seconds: number }[];
}

interface HourlyPresenceData {
  hours: { hour: number; seconds: number }[];
  startDate: string;
  endDate: string;
  days: number;
  totalSeconds: number;
}

export const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const min = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs} hr${hrs > 1 ? 's' : ''}${min > 0 ? ` ${min} min` : ''}`;
  return `${min} min`;
};

export const secondsToHours = (seconds: number): number => {
  return Math.round((seconds / 3600) * 100) / 100;
};

export const exportTabUsageAsCSV = (tabUsageData: TabUsageData[]): void => {
  const csvRows = ['Date,Domain,Time (Hours),Time (Seconds)'];
  
  tabUsageData.forEach(day => {
    day.domains.forEach(domain => {
      const hours = secondsToHours(domain.seconds);
      csvRows.push(`${day.date},${domain.domain},${hours},${domain.seconds}`);
    });
  });
  
  const csvContent = csvRows.join('\n');
  downloadFile(csvContent, 'tab-usage-analytics.csv', 'text/csv');
};

export const exportTabUsageAsJSON = (tabUsageData: TabUsageData[]): void => {
  const jsonData = {
    exportedAt: new Date().toISOString(),
    type: 'Tab Usage Analytics',
    data: tabUsageData.map(day => ({
      date: day.date,
      domains: day.domains.map(domain => ({
        domain: domain.domain,
        timeSeconds: domain.seconds,
        timeHours: secondsToHours(domain.seconds),
        timeFormatted: formatDuration(domain.seconds)
      })),
      totalSeconds: day.domains.reduce((sum, d) => sum + d.seconds, 0),
      totalHours: secondsToHours(day.domains.reduce((sum, d) => sum + d.seconds, 0))
    }))
  };
  
  const jsonContent = JSON.stringify(jsonData, null, 2);
  downloadFile(jsonContent, 'tab-usage-analytics.json', 'application/json');
};

export const exportHourlyPresenceAsCSV = (hourlyData: HourlyPresenceData): void => {
  const csvRows = [
    `Period: ${hourlyData.startDate} to ${hourlyData.endDate}`,
    `Total Days: ${hourlyData.days}`,
    `Total Time: ${formatDuration(hourlyData.totalSeconds)}`,
    '',
    'Hour,Time (Minutes),Time (Seconds)'
  ];
  
  hourlyData.hours.forEach(hour => {
    const minutes = Math.round(hour.seconds / 60);
    csvRows.push(`${hour.hour}:00,${minutes},${hour.seconds}`);
  });
  
  const csvContent = csvRows.join('\n');
  downloadFile(csvContent, 'hourly-presence-analytics.csv', 'text/csv');
};

export const exportHourlyPresenceAsJSON = (hourlyData: HourlyPresenceData): void => {
  const jsonData = {
    exportedAt: new Date().toISOString(),
    type: 'Hourly Presence Analytics',
    period: {
      startDate: hourlyData.startDate,
      endDate: hourlyData.endDate,
      days: hourlyData.days
    },
    summary: {
      totalSeconds: hourlyData.totalSeconds,
      totalHours: secondsToHours(hourlyData.totalSeconds),
      totalFormatted: formatDuration(hourlyData.totalSeconds)
    },
    hourlyData: hourlyData.hours.map(hour => ({
      hour: hour.hour,
      timeRange: `${hour.hour}:00-${hour.hour + 1}:00`,
      timeSeconds: hour.seconds,
      timeMinutes: Math.round(hour.seconds / 60),
      timeFormatted: formatDuration(hour.seconds)
    }))
  };
  
  const jsonContent = JSON.stringify(jsonData, null, 2);
  downloadFile(jsonContent, 'hourly-presence-analytics.json', 'application/json');
};

const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
