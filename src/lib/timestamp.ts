export function unixToDate(unix: number): { iso: string; utc: string; local: string; relative: string } {
  // Auto-detect seconds vs milliseconds
  const ms = unix > 1e12 ? unix : unix * 1000;
  const d = new Date(ms);

  const now = Date.now();
  const diff = now - ms;
  let relative: string;
  const absDiff = Math.abs(diff);
  if (absDiff < 60_000) relative = 'just now';
  else if (absDiff < 3_600_000) relative = `${Math.floor(absDiff / 60_000)}m ${diff > 0 ? 'ago' : 'from now'}`;
  else if (absDiff < 86_400_000) relative = `${Math.floor(absDiff / 3_600_000)}h ${diff > 0 ? 'ago' : 'from now'}`;
  else relative = `${Math.floor(absDiff / 86_400_000)}d ${diff > 0 ? 'ago' : 'from now'}`;

  return {
    iso: d.toISOString(),
    utc: d.toUTCString(),
    local: d.toLocaleString(),
    relative,
  };
}

export function dateToUnix(dateStr: string): { seconds: number; milliseconds: number } | null {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return {
    seconds: Math.floor(d.getTime() / 1000),
    milliseconds: d.getTime(),
  };
}

export function nowUnix(): { seconds: number; milliseconds: number } {
  const ms = Date.now();
  return { seconds: Math.floor(ms / 1000), milliseconds: ms };
}
