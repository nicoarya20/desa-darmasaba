'use client'
import { phoneInfo } from '@/app/(public)/_com/kontak-darurat/kontak-phone.logic';
import { PENGELOLA_WEBSITE } from '@/con/kontak-desa';
import { Anchor, Skeleton, Stack, Text } from '@mantine/core';
import { useKontakDesa } from './use-kontak-desa';

const SKELETON_LINES = [220, 260, 160, 200] as const;

/** Blok kontak kantor desa (dari CMS) + pengelola website di footer publik (alamat, telepon, WhatsApp bila diisi, email, tim redaksi). */
export function FooterKontakDesa() {
  const { kontak, error } = useKontakDesa();
  const telepon = kontak ? phoneInfo(kontak.telepon) : null;
  const whatsapp = kontak?.whatsapp ? phoneInfo(kontak.whatsapp) : null;
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
        </>
      ) : (
        !error && SKELETON_LINES.map((width) => <Skeleton key={width} h={12} w={width} maw="100%" aria-hidden />)
      )}
      <Text fz="xs" c="#F3F2EC" mt={4}>
        Pengelola website: {PENGELOLA_WEBSITE.lembaga}
        {PENGELOLA_WEBSITE.timRedaksi.length > 0
          ? ` (${PENGELOLA_WEBSITE.timRedaksi.map((a) => `${a.nama} – ${a.jabatan}`).join('; ')})`
          : ''}
      </Text>
    </Stack>
  );
}
