import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { proxy } from "valtio";

// Bagian baca (detail, terbaru) state pengumuman — dipisah dari pengumuman.ts agar file tetap
// di bawah batas ukuran; tetap diakses lewat `stateDesaPengumuman.pengumuman.<nama>`.

/** Detail satu pengumuman (`GET /api/desa/pengumuman/:id`). */
export const pengumumanFindUnique = proxy({
  data: null as Prisma.PengumumanGetPayload<{
    include: {
      CategoryPengumuman: true;
    };
  }> | null,
  async load(id: string) {
    try {
      const res = await fetch(`/api/desa/pengumuman/${id}`);
      if (res.ok) {
        const data = await res.json();
        pengumumanFindUnique.data = data.data ?? null;
      } else {
        console.error("Failed to fetch pengumuman:", res.statusText);
        pengumumanFindUnique.data = null;
      }
    } catch (error) {
      console.error("Error fetching pengumuman:", error);
      pengumumanFindUnique.data = null;
    }
  },
});

/** Pengumuman terbaru (satu) untuk halaman informasi desa. */
export const pengumumanFindFirst = proxy({
  data: null as Prisma.PengumumanGetPayload<{
    include: {
      CategoryPengumuman: true;
    };
  }> | null,
  loading: false,
  async load() {
    this.loading = true;
    try {
      const res = await ApiFetch.api.desa.pengumuman["find-first"].get();
      if (res.status === 200 && res.data?.success) {
        pengumumanFindFirst.data = res.data
          .data as Prisma.PengumumanGetPayload<{
          include: {
            CategoryPengumuman: true;
          };
        }> | null;
      }
    } catch (err) {
      console.error("Gagal fetch pengumuman terbaru:", err);
    } finally {
      this.loading = false;
    }
  },
});

/** Empat pengumuman terbaru. */
export const pengumumanFindRecent = proxy({
  data: [] as Prisma.PengumumanGetPayload<{
    include: {
      CategoryPengumuman: true;
    };
  }>[],
  loading: false,

  async load() {
    try {
      this.loading = true;
      const res = await ApiFetch.api.desa.pengumuman["find-recent"].get();
      if (res.status === 200 && res.data?.success) {
        this.data = res.data.data ?? [];
      }
    } catch (error) {
      console.error("Gagal fetch pengumuman recent:", error);
    } finally {
      this.loading = false;
    }
  },
});
