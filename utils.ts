export interface FetchConfig {
  symbol: string;
  interval: string;
  limit: number;
}

export function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}${month}${day}`;
}

export function generateFileName(
  symbol: string,
  interval: string,
  limit: number
): string {
  const todayString = getTodayString();
  return `${symbol.toLowerCase()}-${interval}-${limit}-${todayString}.json`;
}