import { getPathMatch } from 'next/dist/shared/lib/router/utils/path-match';
import nextConfig from '../../next.config';

export type Redirect = { source: string; destination: string; permanent?: boolean };

/** Muat daftar redirects() dari next.config.ts. */
export const loadRedirects = async (): Promise<Redirect[]> => {
  if (!nextConfig.redirects) throw new Error('next.config.ts tidak punya redirects()');
  return (await nextConfig.redirects()) as Redirect[];
};

/**
 * Destination redirect PERTAMA yang cocok untuk pathname (urutan sama dengan runtime Next),
 * atau null bila tidak ada. Pola dicocokkan memakai matcher bawaan Next (path-match).
 */
export const resolveRedirect = (redirects: Redirect[], pathname: string): string | null => {
  for (const r of redirects) {
    const params = getPathMatch(r.source, { removeUnnamedParams: true, strict: true })(pathname);
    if (params === false) continue;
    const rest = Array.isArray(params.path) ? params.path.join('/') : '';
    const destination = r.destination
      .replace('/:path*', rest ? `/${rest}` : '')
      .replace(':id', typeof params.id === 'string' ? params.id : ':id');
    return destination || '/';
  }
  return null;
};
