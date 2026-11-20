'use client'
import { phoneInfo } from '@/app/(public)/_com/kontak-darurat/kontak-phone.logic';
import { KONTAK_DESA, PENGELOLA_WEBSITE } from '@/con/kontak-desa';
import { Anchor, Stack, Text } from '@mantine/core';

/** Blok kontak kantor desa + pengelola website di footer publik (alamat, telepon, email, tim redaksi). */
export function FooterKontakDesa() {
  const telepon = phoneInfo(KONTAK_DESA.telepon);
  const { lembaga, tautan } = PENGELOLA_WEBSITE;
  const sisaLembaga = lembaga.startsWith(tautan.teks) ? lembaga.slice(tautan.teks.length) : null;
  return (
    <Stack gap={4}>
      <Text c="white" fz="sm" fw={600}>Kontak Kantor Desa</Text>
      <Text fz="xs" c="#F3F2EC">{KONTAK_DESA.namaKantor}</Text>
      <Text fz="xs" c="#F3F2EC">{KONTAK_DESA.alamat}</Text>
      <Text fz="xs" c="#F3F2EC">
        Telepon:{' '}
        {telepon ? (
          <Anchor c="#F3F2EC" fz="xs" href={telepon.telHref}>{KONTAK_DESA.telepon}</Anchor>
        ) : (
          KONTAK_DESA.telepon
        )}
      </Text>
      <Text fz="xs" c="#F3F2EC">
        Email: <Anchor c="#F3F2EC" fz="xs" href={`mailto:${KONTAK_DESA.email}`}>{KONTAK_DESA.email}</Anchor>
      </Text>
      <Text fz="xs" c="#F3F2EC" mt={4}>
        Pengelola website:{' '}
        {sisaLembaga !== null ? (
          <>
            <Anchor c="#F3F2EC" fz="xs" href={tautan.href} target="_blank" rel="noopener noreferrer">
              {tautan.teks}
            </Anchor>
            {sisaLembaga}
          </>
        ) : (
          lembaga
        )}
        {PENGELOLA_WEBSITE.timRedaksi.length > 0
          ? ` (${PENGELOLA_WEBSITE.timRedaksi.map((a) => `${a.nama} – ${a.jabatan}`).join('; ')})`
          : ''}
      </Text>
    </Stack>
  );
}
