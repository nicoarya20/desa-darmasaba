import { redirect } from 'next/navigation'

// Menu Access pindah ke Pengaturan (2026-11-12). Redirect ini menjaga bookmark/tautan lama;
// boleh dihapus setelah satu rilis stabil tanpa akses ke URL lama.
export default function OldMenuAccessPage() {
  redirect('/admin/pengaturan/menu-access')
}
