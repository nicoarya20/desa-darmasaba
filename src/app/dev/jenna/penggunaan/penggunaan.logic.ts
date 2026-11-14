import type { JennaToolUsage } from '@/lib/jenna/usage-types';

export type ToolBar = JennaToolUsage & {
  /** 0–100, lebar bar relatif terhadap tool yang paling sering dipakai. */
  percent: number;
};

/** Bar proporsional: tool terbanyak = 100%, sisanya sebanding dengan jumlah pemanggilannya. */
export function toolBars(tools: readonly JennaToolUsage[]): ToolBar[] {
  const max = tools.reduce((top, tool) => Math.max(top, tool.count), 0);
  return tools.map((tool) => ({ ...tool, percent: max > 0 ? (tool.count / max) * 100 : 0 }));
}
