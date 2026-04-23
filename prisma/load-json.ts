import { readFileSync } from "fs";
import { join } from "path";

/**
 * Load JSON file dynamically from prisma/data directory
 * @param relativePath - Relative path from prisma/data (e.g., 'pendidikan/beasiswa-pendaftar/beasiswa-pendaftar.json')
 * @returns Parsed JSON data
 */
export function loadJsonData<T = any>(relativePath: string): T {
  const fullPath = join(process.cwd(), "prisma/data", relativePath);
  const content = readFileSync(fullPath, "utf-8");
  return JSON.parse(content);
}
