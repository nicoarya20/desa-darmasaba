/** Detik → "2 hari 3 jam" / "5 jam 12 menit" / "4 menit" / "< 1 menit". */
export function formatUptime(totalSec: number): string {
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return hours > 0 ? `${days} hari ${hours} jam` : `${days} hari`;
  if (hours > 0) return minutes > 0 ? `${hours} jam ${minutes} menit` : `${hours} jam`;
  if (minutes > 0) return `${minutes} menit`;
  return '< 1 menit';
}

export const NODE_ENV_LABEL: Record<string, string> = {
  production: 'Production',
  development: 'Development',
  test: 'Test',
};
