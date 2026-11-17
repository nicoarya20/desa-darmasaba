'use client'
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { PengumumanPdfModal } from '@/app/(public)/(pages)/pemerintahan/pengumuman/_com/PengumumanPdfModal';
import { formatUkuran } from '@/lib/desa-anti-korupsi-sort';
import { jenisFilePeta, type WilayahPetaFile } from '@/lib/wilayah-desa';
import { Image } from '@mantine/core';
import { IconFileTypePdf } from '@tabler/icons-react';
import { useState } from 'react';
import { PROFIL_TEXT } from '../_com/profil.text';
import m from './media.module.css';

const T = PROFIL_TEXT.wilayah;

/** File peta wilayah dari CMS di atas peta embed: gambar (klik = ukuran penuh) atau PDF (pratinjau modal). */
export function WilayahPetaFile({ file }: { file: WilayahPetaFile | null | undefined }) {
  const [pdfAktif, setPdfAktif] = useState(false);
  const jenis = file?.link ? jenisFilePeta(file.mimeType) : null;
  if (!file || !jenis) return null;

  if (jenis === 'gambar') {
    return (
      <figure className={m.petaFile} data-wilayah-peta-file="gambar">
        <a href={file.link} target="_blank" rel="noopener noreferrer" aria-label={T.petaFileOpen} className={m.petaFileLink}>
          <Image src={file.link} alt={T.petaFileAlt} loading="lazy" className={m.petaFileImage} />
        </a>
      </figure>
    );
  }

  return (
    <div className={m.petaFile} data-wilayah-peta-file="pdf">
      <button type="button" aria-haspopup="dialog" className={`${m.petaPdf} ${r.trigger}`} onClick={() => setPdfAktif(true)}>
        <IconFileTypePdf size={32} stroke={1.5} className={m.petaPdfIcon} aria-hidden />
        <span className={m.petaPdfText}>
          <span className={`${m.petaPdfLabel} ${r.cta}`} data-text={T.petaPdf}>
            {T.petaPdf}
          </span>
          <span className={m.petaPdfMeta}>{T.petaPdfMeta(file.size == null ? null : formatUkuran(file.size))}</span>
        </span>
      </button>
      <PengumumanPdfModal file={pdfAktif ? file : null} onClose={() => setPdfAktif(false)} />
    </div>
  );
}
