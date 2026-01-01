interface TabUsageData {
  date: string;
  domains: { domain: string; seconds: number }[];
}

interface HourlyPresenceData {
  hours: { hour: number; seconds: number }[];
  totalSeconds: number;
  days: number;
  startDate: string;
  endDate: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  monthlySeconds: number;
  monthlyHours: number;
  totalOnlineHours: number;
}

interface LeaderboardData {
  month: string;
  leaderboard: LeaderboardEntry[];
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const min = Math.floor((seconds % 3600) / 60);
  const sec = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}h ${min}m ${sec}s`;
  } else if (min > 0) {
    return `${min}m ${sec}s`;
  }
  return `${sec}s`;
}

export function secondsToHours(seconds: number, decimals: number = 2): number {
  return parseFloat((seconds / 3600).toFixed(decimals));
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getTimestamp(): string {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function exportTabUsageAsCSV(data: TabUsageData[]): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const rows: string[] = [];
  rows.push('Date,Domain,Time (seconds),Time (hours),Time (formatted)');

  data.forEach(dayData => {
    dayData.domains.forEach(domain => {
      const hours = secondsToHours(domain.seconds);
      const formatted = formatDuration(domain.seconds);
      rows.push(`${dayData.date},"${domain.domain}",${domain.seconds},${hours},"${formatted}"`);
    });
  });

  const csvContent = rows.join('\n');
  const filename = `tab-usage-analytics-${getTimestamp()}.csv`;
  
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

export function exportTabUsageAsJSON(data: TabUsageData[]): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const enhancedData = {
    exportDate: new Date().toISOString(),
    reportType: 'Tab Usage Analytics',
    period: {
      startDate: data[0]?.date,
      endDate: data[data.length - 1]?.date,
      totalDays: data.length
    },
    summary: {
      totalSeconds: data.reduce((sum, day) => 
        sum + day.domains.reduce((daySum, domain) => daySum + domain.seconds, 0), 0
      ),
      totalHours: 0,
      totalDomains: [...new Set(data.flatMap(day => day.domains.map(d => d.domain)))].length,
      averageDailySeconds: 0
    },
    dailyData: data.map(dayData => ({
      date: dayData.date,
      totalSeconds: dayData.domains.reduce((sum, d) => sum + d.seconds, 0),
      totalHours: secondsToHours(dayData.domains.reduce((sum, d) => sum + d.seconds, 0)),
      domains: dayData.domains.map(domain => ({
        domain: domain.domain,
        seconds: domain.seconds,
        hours: secondsToHours(domain.seconds),
        formatted: formatDuration(domain.seconds)
      }))
    }))
  };

  enhancedData.summary.totalHours = secondsToHours(enhancedData.summary.totalSeconds);
  enhancedData.summary.averageDailySeconds = Math.round(
    enhancedData.summary.totalSeconds / enhancedData.dailyData.length
  );

  const jsonContent = JSON.stringify(enhancedData, null, 2);
  const filename = `tab-usage-analytics-${getTimestamp()}.json`;
  
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
}

export function exportHourlyPresenceAsCSV(data: HourlyPresenceData): void {
  if (!data || !data.hours || data.hours.length === 0) {
    console.warn('No data to export');
    return;
  }

  const rows: string[] = [];
  rows.push('Hour,Time (seconds),Time (minutes),Time (hours),Time (formatted)');

  data.hours.forEach(hourData => {
    const minutes = Math.round(hourData.seconds / 60);
    const hours = secondsToHours(hourData.seconds);
    const formatted = formatDuration(hourData.seconds);
    rows.push(`${hourData.hour}:00-${hourData.hour + 1}:00,${hourData.seconds},${minutes},${hours},"${formatted}"`);
  });

  const csvContent = rows.join('\n');
  const filename = `hourly-presence-analytics-${getTimestamp()}.csv`;
  
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

export function exportHourlyPresenceAsJSON(data: HourlyPresenceData): void {
  if (!data || !data.hours || data.hours.length === 0) {
    console.warn('No data to export');
    return;
  }

  const enhancedData = {
    exportDate: new Date().toISOString(),
    reportType: 'Hourly Presence Analytics',
    period: {
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.days
    },
    summary: {
      totalSeconds: data.totalSeconds,
      totalHours: secondsToHours(data.totalSeconds),
      formatted: formatDuration(data.totalSeconds),
      averagePerDay: secondsToHours(data.totalSeconds / data.days)
    },
    hourlyData: data.hours.map(hourData => ({
      hour: hourData.hour,
      timeRange: `${hourData.hour}:00-${hourData.hour + 1}:00`,
      seconds: hourData.seconds,
      minutes: Math.round(hourData.seconds / 60),
      hours: secondsToHours(hourData.seconds),
      formatted: formatDuration(hourData.seconds)
    }))
  };

  const jsonContent = JSON.stringify(enhancedData, null, 2);
  const filename = `hourly-presence-analytics-${getTimestamp()}.json`;
  
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
}

export function exportLeaderboardAsCSV(data: LeaderboardData): void {
  if (!data || !data.leaderboard || data.leaderboard.length === 0) {
    console.warn('No data to export');
    return;
  }

  const rows: string[] = [];
  rows.push('Rank,Username,Display Name,Monthly Hours,Total Online Hours,Monthly (formatted)');

  data.leaderboard.forEach(entry => {
    const monthlyFormatted = formatDuration(entry.monthlySeconds);
    rows.push(
      `${entry.rank},"${entry.username}","${entry.displayName}",${entry.monthlyHours},${entry.totalOnlineHours},"${monthlyFormatted}"`
    );
  });

  const csvContent = rows.join('\n');
  const filename = `leaderboard-${data.month}-${getTimestamp()}.csv`;
  
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

export function exportLeaderboardAsJSON(data: LeaderboardData): void {
  if (!data || !data.leaderboard || data.leaderboard.length === 0) {
    console.warn('No data to export');
    return;
  }

  const enhancedData = {
    exportDate: new Date().toISOString(),
    reportType: 'Leaderboard Rankings',
    month: data.month,
    totalEntries: data.leaderboard.length,
    leaderboard: data.leaderboard.map(entry => ({
      rank: entry.rank,
      userId: entry.userId,
      username: entry.username,
      displayName: entry.displayName,
      monthlySeconds: entry.monthlySeconds,
      monthlyHours: entry.monthlyHours,
      monthlyFormatted: formatDuration(entry.monthlySeconds),
      totalOnlineHours: entry.totalOnlineHours
    }))
  };

  const jsonContent = JSON.stringify(enhancedData, null, 2);
  const filename = `leaderboard-${data.month}-${getTimestamp()}.json`;
  
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
}

export function exportCompleteAnalytics(
  tabUsageData: TabUsageData[] | null,
  hourlyPresenceData: HourlyPresenceData | null,
  leaderboardData: LeaderboardData | null,
  userRank: any | null
): void {
  const completeData = {
    exportDate: new Date().toISOString(),
    reportType: 'Complete Analytics Summary',
    tabUsage: tabUsageData ? {
      period: {
        startDate: tabUsageData[0]?.date,
        endDate: tabUsageData[tabUsageData.length - 1]?.date,
        totalDays: tabUsageData.length
      },
      summary: {
        totalSeconds: tabUsageData.reduce((sum, day) => 
          sum + day.domains.reduce((daySum, domain) => daySum + domain.seconds, 0), 0
        ),
        totalDomains: [...new Set(tabUsageData.flatMap(day => day.domains.map(d => d.domain)))].length
      },
      dailyData: tabUsageData.map(day => ({
        date: day.date,
        domains: day.domains.map(d => ({
          domain: d.domain,
          seconds: d.seconds,
          formatted: formatDuration(d.seconds)
        }))
      }))
    } : null,
    hourlyPresence: hourlyPresenceData ? {
      period: {
        startDate: hourlyPresenceData.startDate,
        endDate: hourlyPresenceData.endDate,
        days: hourlyPresenceData.days
      },
      totalSeconds: hourlyPresenceData.totalSeconds,
      totalHours: secondsToHours(hourlyPresenceData.totalSeconds),
      hourlyData: hourlyPresenceData.hours.map(h => ({
        hour: h.hour,
        seconds: h.seconds,
        formatted: formatDuration(h.seconds)
      }))
    } : null,
    leaderboard: leaderboardData ? {
      month: leaderboardData.month,
      entries: leaderboardData.leaderboard
    } : null,
    userRank: userRank
  };

  const jsonContent = JSON.stringify(completeData, null, 2);
  const filename = `complete-analytics-${getTimestamp()}.json`;
  
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
}
