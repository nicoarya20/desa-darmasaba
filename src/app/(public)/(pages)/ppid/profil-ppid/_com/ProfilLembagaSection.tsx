import colors from '@/con/colors';
import { Box, Flex, Image, Paper, Stack, Title } from '@mantine/core';
import { IconInfoCircle, IconListDetails, IconRoute, IconTargetArrow } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import classes from '../profil-ppid.module.css';
import { profilLembagaBagian, type ProfilLembagaBagian, type ProfilLembagaPublik } from './profil-ppid.logic';
import { PROFIL_LEMBAGA_TEXT as T } from './profil-ppid.text';

const ICON_SIZE = 28;
const BAGIAN_ICON: Record<ProfilLembagaBagian['key'], ReactNode> = {
  deskripsi: <IconInfoCircle size={ICON_SIZE} aria-hidden />,
  tujuan: <IconTargetArrow size={ICON_SIZE} aria-hidden />,
  tugasFungsi: <IconListDetails size={ICON_SIZE} aria-hidden />,
};
const TITLE_ID = 'profil-lembaga-title';

/** Bagian utama halaman Profil PPID: deskripsi, tujuan, tugas dan fungsi lembaga, lalu gambar alur (bagian kosong dilewati). */
export function ProfilLembagaSection({ data }: { data: ProfilLembagaPublik }) {
  const gambar = data.gambarAlur?.link;
  return (
    <Box px={{ base: 'md', md: 100 }}>
      <Paper component="section" aria-labelledby={TITLE_ID} p="xl" bg={colors['white-trans-1']} radius="lg" shadow="xl">
        <Stack gap="xl" px={{ base: 0, md: 50 }}>
          <Title
            id={TITLE_ID}
            order={2}
            ta="center"
            fz={{ base: '1.4rem', md: '2.2rem', lg: '2.6rem', xl: '3rem' }}
            lh={1.1}
            fw={800}
          >
            {T.title}
          </Title>

          {profilLembagaBagian(data).map(({ key, label, html }) => (
            <Box key={key}>
              <Flex align="center" gap="sm" mb="sm">
                {BAGIAN_ICON[key]}
                <Title order={3} fz={{ base: '1.3rem', md: '1.6rem' }} lh={1.2} fw={800}>
                  {label}
                </Title>
              </Flex>
              {/* html sudah disaring sanitizeRichText (hanya tag teks dasar, tanpa atribut). */}
              <Box
                px={20}
                fz={{ base: '1rem', md: '1.1rem', lg: '1.2rem' }}
                lh={1.6}
                className={classes.rich}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </Box>
          ))}

          {gambar && (
            <Box>
              <Flex align="center" gap="sm" mb="sm">
                <IconRoute size={ICON_SIZE} aria-hidden />
                <Title order={3} fz={{ base: '1.3rem', md: '1.6rem' }} lh={1.2} fw={800}>
                  {T.alur}
                </Title>
              </Flex>
              <Image src={gambar} alt={T.alurAlt} radius="lg" fit="contain" loading="lazy" />
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
