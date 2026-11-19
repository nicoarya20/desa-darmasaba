// @vitest-environment node
// Sidebar admin: item aktif (induk & anak) punya garis kiri lurus — sudut kiri siku, kanan tetap membulat.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = readFileSync(path.resolve(__dirname, '../../src/app/admin/layout.tsx'), 'utf8');

describe('garis aktif sidebar admin lurus', () => {
  it('induk aktif: radius kiri 0, kanan tetap rem(10); tidak aktif rem(10)', () => {
    expect(SRC).toContain('borderRadius: mounted && isParentActive ? `0 ${rem(10)} ${rem(10)} 0` : rem(10),');
  });

  it('anak aktif: radius kiri 0, kanan tetap rem(8); tidak aktif rem(8)', () => {
    expect(SRC).toContain('borderRadius: mounted && isChildActive ? `0 ${rem(8)} ${rem(8)} 0` : rem(8),');
  });

  it('tidak ada longhand radius kondisional yang bentrok dengan shorthand', () => {
    expect(SRC).not.toMatch(/border(Top|Bottom)(Left|Right)Radius/);
  });

  it('borderLeft aktif tetap ada (induk 3px, anak 2px)', () => {
    expect(SRC.match(/borderLeft: `3px solid \$\{tokens\.colors\.primary\}`/g)).toHaveLength(2);
    expect(SRC.match(/borderLeft: `2px solid \$\{tokens\.colors\.primary\}`/g)).toHaveLength(2);
  });
});
