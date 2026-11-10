'use client'
import stateProfilePPID from '@/app/admin/(dashboard)/_state/ppid/profile_ppid/profile_PPID';
import colors from '@/con/colors';
import {
  Box,
  Center,
  Divider,
  Flex,
  Image,
  List,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import {
  IconBuildingCommunity,
  IconTargetArrow,
  IconTimeline,
  IconUser,
} from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';
import ScrollToTopButton from '@/app/darmasaba/_com/scrollToTopButton';
import classes from './profil-ppid.module.css';

function Page() {
  const allList = useProxy(stateProfilePPID);

  useShallowEffect(() => {
    allList.profile.load('edit');
  }, []);

  // LOADING SKELETON
  if (allList.profile.loading)
    return (
      <Stack bg={colors.Bg} py="xl" gap="22">
        <Box px={{ base: 'md', md: 100 }}>
          <Skeleton h={40} />
        </Box>
        <Box px={{ base: 'md', md: 100 }}>
          <Skeleton h={80} />
        </Box>
        <Box px={{ base: 'md', md: 100 }}>
          <Paper p="xl" bg={colors['white-trans-1']}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} h={40} mb="sm" />
            ))}
          </Paper>
        </Box>
      </Stack>
    );

  // ERROR HANDLING
  if (allList.profile.error)
    return (
      <Stack bg={colors.Bg} py="xl" gap="22" justify="center" align="center">
        <Box px={{ base: 'md', md: 100 }}>
          <Paper p="xl" bg={colors['white-trans-1']} radius="lg" shadow="xl">
            {allList.profile.error === "Belum ada data profil PPID yang aktif" ? (
              <>
                <Title order={3} ta="center" c={"orange"} fw={700}>
                  Data Profile PPID Belum Tersedia
                </Title>
                <Text ta="center" mt="md">Mohon maaf, data profil PPID belum tersedia saat ini</Text>
              </>
            ) : (
              <>
                <Title order={3} ta="center" c={"red"} fw={700}>
                  Gagal Memuat Data Profile
                </Title>
                <Text ta="center" mt="md">Silakan coba beberapa saat lagi</Text>
                <Text ta="center" size="sm" c={"gray"} mt="sm">
                  Error: {allList.profile.error}
                </Text>
              </>
            )}
          </Paper>
        </Box>
      </Stack>
    );

  // NO DATA HANDLING
  if (!allList.profile.data)
    return (
      <Stack bg={colors.Bg} py="xl" gap="22" justify="center" align="center">
        <Box px={{ base: 'md', md: 100 }}>
          <Paper p="xl" bg={colors['white-trans-1']} radius="lg" shadow="xl">
            <Title order={3} ta="center" c={"orange"} fw={700}>
              Data Profile PPID Belum Tersedia
            </Title>
            <Text ta="center" mt="md">Mohon maaf, data profil PPID belum tersedia saat ini</Text>
          </Paper>
        </Box>
      </Stack>
    );

  const dataArray = Array.isArray(allList.profile.data)
    ? allList.profile.data
    : [allList.profile.data];

  return (
    <Box>
      <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
        {/* Back Button */}
        <Box px={{ base: 'md', md: 100 }}>
          <BackButton />
        </Box>

        {/* Page Title */}
        <Box px={{ base: 'md', md: 100 }}>
          <Title
            order={1}
            ta="center"
            c={colors['blue-button']}
            fz={{ base: '2rem', md: '2.7rem', lg: '3.2rem', xl: '3.6rem' }}
            lh={{ base: 1.1, md: 1.1 }}
            fw={900}
          >
            Profil PPID Desa Darmasaba
          </Title>
        </Box>

        {dataArray.map((item) => (
          <Box key={item.id} px={{ base: 'md', md: 100 }}>
            <Paper p="xl" bg={colors['white-trans-1']} radius="lg" shadow="xl">
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
                    <Paper bg={colors['white-trans-1']} radius="xl" shadow="md" withBorder>
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
                          bg={colors['blue-button']}
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
                            ta="justify"
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
                              ta="justify"
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
                              ta="justify"
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
                              ta="justify"
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
        ))}
      </Stack>

      {/* tombol scroll */}
      <ScrollToTopButton />
    </Box>
  );
}

export default Page;
