// @vitest-environment node
// Sidebar admin: item aktif (induk & anak) menampilkan batang lurus berujung bulat (::before), bukan border-left.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const LAYOUT = readFileSync(path.resolve(__dirname, '../../src/app/admin/layout.tsx'), 'utf8');
const CSS = readFileSync(path.resolve(__dirname, '../../src/app/admin/_com/sidebar-nav.module.css'), 'utf8');

describe('indikator aktif sidebar admin', () => {
  it('layout.tsx tidak memakai borderLeft', () => {
    expect(LAYOUT).not.toMatch(/borderLeft/);
  });

  it('radius item tidak kondisional (induk rem(10), anak rem(8))', () => {
    expect(LAYOUT).toContain('borderRadius: rem(10),');
    expect(LAYOUT).toContain('borderRadius: rem(8),');
    expect(LAYOUT).not.toMatch(/`0 \$\{rem\(/);
  });

  it('CSS module: ::before absolut, lebar 2px, tinggi 76%, ujung bulat 999px', () => {
    expect(CSS).toMatch(/\.parent::before,\s*\.child::before\s*\{[^}]*position:\s*absolute/);
    expect(CSS).toMatch(/\.parent::before,\s*\.child::before\s*\{[^}]*width:\s*2px/);
    expect(CSS).toMatch(/\.parent::before,\s*\.child::before\s*\{[^}]*height:\s*76%/);
    expect(CSS).toMatch(/\.parent::before,\s*\.child::before\s*\{[^}]*border-radius:\s*999px/);
  });

  it('CSS module: indikator hanya tampil pada state aktif (data-active)', () => {
    expect(CSS).toMatch(/\.parent\[data-active\]::before,\s*\.child\[data-active\]::before\s*\{[^}]*opacity:\s*1/);
    expect(CSS).toMatch(/\.parent::before,\s*\.child::before\s*\{[^}]*opacity:\s*0/);
  });

  it('layout.tsx memakai class module pada NavLink induk dan anak', () => {
    expect(LAYOUT).toContain('import navStyles from "./_com/sidebar-nav.module.css"');
    expect(LAYOUT).toContain('classNames={{ root: navStyles.parent }}');
    expect(LAYOUT).toContain('classNames={{ root: navStyles.child }}');
  });

  it('warna indikator per tema: gelap = token link, terang = primary (induk & anak)', () => {
    const expr = "'--sidebar-indicator-color': isDark ? tokens.colors.text.link : tokens.colors.primary";
    expect(LAYOUT.split(expr)).toHaveLength(3);
  });

  it('latar aktif gelap dilembutkan selaras warna indikator', () => {
    expect(LAYOUT).toContain("backgroundColor: 'rgba(96,165,250,0.14)'");
    expect(LAYOUT).toContain("backgroundColor: 'rgba(96,165,250,0.10)'");
    expect(LAYOUT).not.toContain('rgba(59,130,246');
  });
});
