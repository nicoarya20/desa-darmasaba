'use client'
import { phoneInfo } from '@/app/(public)/_com/kontak-darurat/kontak-phone.logic';
import { PENGELOLA_WEBSITE } from '@/con/kontak-desa';
import { Anchor, Skeleton, Stack, Text } from '@mantine/core';
import { useKontakDesa } from './use-kontak-desa';
import { useTimPengelola } from './use-tim-pengelola';

const SKELETON_LINES = [220, 260, 160, 200] as const;
/** Awalan baris SK tim pengelola di footer: "SK Perbekel Nomor {nomor}". */
const TEKS_SK_PERBEKEL = 'SK Perbekel Nomor';

/**
 * Blok kontak kantor desa (dari CMS) + pengelola website di footer publik (alamat, telepon, WhatsApp dan jam layanan bila diisi,
 * email, lalu nomor SK tim pengelola yang menautkan ke PDF-nya bila ada; daftar anggota tidak ditampilkan di publik).
 */
export function FooterKontakDesa() {
  const { kontak, error } = useKontakDesa();
  const telepon = kontak ? phoneInfo(kontak.telepon) : null;
  const whatsapp = kontak?.whatsapp ? phoneInfo(kontak.whatsapp) : null;
  const { tim } = useTimPengelola();
  const nomorSk = tim?.nomorSk.trim();
  const { lembaga, tautan } = PENGELOLA_WEBSITE;
  const sisaLembaga = lembaga.startsWith(tautan.teks) ? lembaga.slice(tautan.teks.length) : null;
  return (
    <Stack gap={4}>
      <Text c="white" fz="sm" fw={600}>Kontak Kantor Desa</Text>
      {kontak ? (
        <>
          <Text fz="xs" c="#F3F2EC">{kontak.namaKantor}</Text>
          <Text fz="xs" c="#F3F2EC">{kontak.alamat}</Text>
          <Text fz="xs" c="#F3F2EC">
            Telepon:{' '}
            {telepon ? (
              <Anchor c="#F3F2EC" fz="xs" href={telepon.telHref}>{kontak.telepon}</Anchor>
            ) : (
              kontak.telepon
            )}
          </Text>
          {kontak.whatsapp && (
            <Text fz="xs" c="#F3F2EC">
              WhatsApp:{' '}
              {whatsapp?.waHref ? (
                <Anchor c="#F3F2EC" fz="xs" href={whatsapp.waHref} target="_blank" rel="noopener noreferrer">{kontak.whatsapp}</Anchor>
              ) : (
                kontak.whatsapp
              )}
            </Text>
          )}
          <Text fz="xs" c="#F3F2EC">
            Email: <Anchor c="#F3F2EC" fz="xs" href={`mailto:${kontak.email}`}>{kontak.email}</Anchor>
          </Text>
          {kontak.jamLayanan && <Text fz="xs" c="#F3F2EC">Jam layanan: {kontak.jamLayanan}</Text>}
        </>
      ) : (
        !error && SKELETON_LINES.map((width) => <Skeleton key={width} h={12} w={width} maw="100%" aria-hidden />)
      )}
      <Text fz="xs" c="#F3F2EC" mt={4}>
        Pengelola website:{' '}
        {sisaLembaga !== null ? (
          <>
            <Anchor c="white" fz="xs" fw={700} href={tautan.href} target="_blank" rel="noopener noreferrer">
              {tautan.teks}
            </Anchor>
            {sisaLembaga}
          </>
        ) : (
          lembaga
        )}
      </Text>
      {nomorSk && (
        <Text fz="xs" c="#F3F2EC">
          {tim?.skFile ? (
            <Anchor c="#F3F2EC" fz="xs" href={tim.skFile.link} target="_blank" rel="noopener noreferrer">
              {`${TEKS_SK_PERBEKEL} ${nomorSk}`}
            </Anchor>
          ) : (
            `${TEKS_SK_PERBEKEL} ${nomorSk}`
          )}
        </Text>
      )}
    </Stack>
  );
}
