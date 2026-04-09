/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PrismaClient } from "@prisma/client";
import { safeSeedUnique } from "./safeseedUnique";
import cliProgress from 'cli-progress';

type SafeSeedOptions = {
  skipUpdate?: boolean;
  silent?: boolean; // Opsional: untuk suppress log
};

/**
 * Batch upsert with progress logging
 */
export async function safeSeedMany<T extends keyof PrismaClient>(
  model: T,
  items: Array<{ where: Record<string, any>; data: Record<string, any> }>,
  options: SafeSeedOptions = {}
) {
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(items.length, 0);

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (const [index, item] of items.entries()) {
    try {
      const result = await safeSeedUnique(model, item.where, item.data, {
        ...options,
        silent: true,
      });
      if (result) success++;
      else skipped++;
    } catch (err) {
      failed++;
    }
    bar.update(index + 1);
  }

  bar.stop();
  console.log(`✅ ${String(model)}: ${success} seeded, ${skipped} skipped, ${failed} failed`);
  
  return { success, skipped, failed };
}