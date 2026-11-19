import colors from '@/con/colors';
import type stateProfilePPID from '@/app/admin/(dashboard)/_state/ppid/profile_ppid/profile_PPID';
import { Box, Center, Divider, Flex, Image, List, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconBuildingCommunity, IconTargetArrow, IconTimeline, IconUser } from '@tabler/icons-react';
import classes from '../profil-ppid.module.css';
import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';

/** Satu profil perorangan pimpinan PPID dari `profile.data` (bentuk respons profilePPID). */
type Props = { item: NonNullable<typeof stateProfilePPID.profile.data> };

/** Kartu profil perorangan pimpinan PPID: foto + nama, lalu biografi, riwayat karir, organisasi, dan program unggulan. */
export function ProfilPerorangan({ item }: Props) {
  return (
    <Box px={{ base: 'md', md: 100 }}>
      <Paper p="xl" bg="var(--c-tile)" radius="lg">
        {/* LOGO & TITLE */}
        <Box px={{ base: 'md', md: 100 }}>
          <Center>
            <Image
              loading="lazy"
              src="/darmasaba-icon.png"
              h={{ base: 70, md: 120 }}
              w={{ base: 70, md: 120 }}
              alt="Logo Desa"
            />
          </Center>

          <Title
            order={2}
            ta="center"
            fz={{ base: '1.4rem', md: '2.2rem', lg: '2.6rem', xl: '3rem' }}
            lh={1.1}
            fw={800}
            mt="md"
          >
            Pejabat Pengelola Informasi dan Dokumentasi
          </Title>
        </Box>

        <Divider my="lg" />

        {/* GRID BLOCK */}
        <Box px={{ base: 0, md: 50 }}>
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
            {/* FOTO + NAMA — sticky di layout 2 kolom agar kolom kanan yang panjang tak menyisakan ruang kosong */}
            <Box px={{ base: 0, md: 50 }} className={classes.photoColumn}>
              <Paper bg="var(--c-tile-alt)" radius="xl" shadow="md" withBorder>
                <Stack gap={0}>
                  <Image
                    pt={{ base: 0, md: 100 }}
                    px="lg"
                    src={
                      item.image?.link
                        ? `${item.image.link}?t=${Date.now()}`
                        : '/perbekel.png'
                    }
                    alt="Foto Pimpinan"
                    radius="lg"
                    onError={(e) => (e.currentTarget.src = '/perbekel.png')}
                    loading="lazy"
                  />

                  <Paper
                    bg="var(--c-brand-fill)"
                    px="lg"
                    radius="0 0 var(--mantine-radius-xl) var(--mantine-radius-xl)"
                    className="glass3"
                    py={{ base: 20, md: 50 }}
                  >
                    <Title
                      order={3}
                      ta="center"
                      c={colors['white-1']}
                      fz={{ base: '1.4rem', md: '2.2rem' }}
                      lh={1.1}
                      fw={900}
                    >
                      {item.name}
                    </Title>
                  </Paper>
                </Stack>
              </Paper>
            </Box>

            {/* BIOGRAFI, RIWAYAT, ORGANISASI, PROGRAM */}
            <Box>
              <Stack gap="xl">
                {/* BIO */}
                <Box>
                  <Flex align="center" gap="sm" mb="sm">
                    <IconUser size={28} />
                    <Title order={3} fz={{ base: '1.3rem', md: '1.6rem' }} lh={1.2} fw={800}>
                      Biografi
                    </Title>
                  </Flex>

                  <Box px={20}>
                    <Text
                      fz={{ base: '1rem', md: '1.1rem', lg: '1.2rem' }}
                      lh={1.6}
                      ta="left"
                      className={rt.root}
                      dangerouslySetInnerHTML={{ __html: item.biodata }}
                      style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                    />
                  </Box>
                </Box>

                {/* RIWAYAT */}
                <Box>
                  <Flex align="center" gap="sm" mb="sm">
                    <IconTimeline size={28} />
                    <Title order={3} fz={{ base: '1.3rem', md: '1.6rem' }} lh={1.2} fw={800}>
                      Riwayat Karir
                    </Title>
                  </Flex>

                  <List spacing="xs" size="sm">
                    <Box px={20}>
                      <Text
                        fz={{ base: '1rem', md: '1.1rem', lg: '1.2rem' }}
                        lh={1.6}
                        ta="left"
                        className={rt.root}
                        dangerouslySetInnerHTML={{ __html: item.riwayat }}
                        style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                      />
                    </Box>
                  </List>
                </Box>

                {/* ORGANISASI */}
                <Box>
                  <Flex align="center" gap="sm" mb="sm">
                    <IconBuildingCommunity size={28} />
                    <Title order={3} fz={{ base: '1.3rem', md: '1.6rem' }} lh={1.2} fw={800}>
                      Pengalaman Organisasi
                    </Title>
                  </Flex>

                  <List spacing="xs" size="sm">
                    <Box px={20}>
                      <Text
                        fz={{ base: '1rem', md: '1.1rem', lg: '1.2rem' }}
                        lh={1.6}
                        ta="left"
                        className={rt.root}
                        dangerouslySetInnerHTML={{ __html: item.pengalaman }}
                        style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                      />
                    </Box>
                  </List>
                </Box>

                {/* PROGRAM UNGGULAN */}
                <Box>
                  <Flex align="center" gap="sm" mb="sm">
                    <IconTargetArrow size={28} />
                    <Title order={3} fz={{ base: '1.3rem', md: '1.6rem' }} lh={1.2} fw={800}>
                      Program Unggulan
                    </Title>
                  </Flex>

                  <List spacing="xs" size="sm">
                    <Box px={20}>
                      <Text
                        fz={{ base: '1rem', md: '1.1rem', lg: '1.2rem' }}
                        lh={1.6}
                        ta="left"
                        className={rt.root}
                        dangerouslySetInnerHTML={{ __html: item.unggulan }}
                        style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                      />
                    </Box>
                  </List>
                </Box>
              </Stack>
            </Box>
          </SimpleGrid>
        </Box>
      </Paper>
    </Box>
  );
}
