import ApiFetch from '@/lib/api-fetch';
import type { PerpustakaanWebsite } from '@/lib/perpustakaan-website';
import { readPerpusWebsite, type PerpusWebsiteBody } from './perpus-website.logic';

/** Pengaturan aktif halaman penghubung; `null` = belum diatur; galat → Error berkonteks. */
export async function loadPerpusWebsite(): Promise<PerpustakaanWebsite | null> {
  const res = await ApiFetch.api.pendidikan.perpustakaandigital.pengaturan.find.get();
  const body = (res.error ? res.error.value : res.data) as PerpusWebsiteBody;
  return readPerpusWebsite(res.status, body);
}
