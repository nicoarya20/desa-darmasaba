"use client";

import { LAYANAN_DESA } from "@/con/layanan-desa";
import { useDisclosure } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { useState } from "react";
import { LayananCard } from "./LayananCard";
import s from "./layanan-masyarakat.module.css";
import { LAYANAN_MASYARAKAT_TEXT } from "./layanan-masyarakat.text";

// Modal yang sama dengan footer; dimuat terpisah & baru dipasang saat pertama dibuka
// (editor tiptap + dropzone berat, dan fetch jenis pengaduan baru jalan saat dibutuhkan).
const PengaduanMasyarakatModal = dynamic(() => import("../../pengaduan/PengaduanMasyarakatModal"), { ssr: false });

/** Section beranda: 4 kartu layanan utama desa tanpa judul, duduk di pita galeri Layanan & Potensi (sumber sama dengan footer "Layanan Desa"). */
function LayananMasyarakat() {
  const [opened, { open, close }] = useDisclosure(false);
  const [mounted, setMounted] = useState(false);
  const openPengaduan = () => {
    setMounted(true);
    open();
  };

  return (
    <section className={s.section} aria-label={LAYANAN_MASYARAKAT_TEXT.ariaLabel}>
      <div className={s.inner}>
        <ul className={s.grid}>
          {LAYANAN_DESA.map((item) => (
            <li key={item.id} className={s.cell}>
              <LayananCard item={item} onOpenPengaduan={openPengaduan} />
            </li>
          ))}
        </ul>
      </div>

      {mounted && <PengaduanMasyarakatModal opened={opened} onClose={close} />}
    </section>
  );
}

export default LayananMasyarakat;
