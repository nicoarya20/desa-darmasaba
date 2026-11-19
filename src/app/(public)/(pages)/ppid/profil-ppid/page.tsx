'use client'
import stateProfilLembagaPPID from '@/app/admin/(dashboard)/_state/ppid/profil_lembaga/profilLembaga';
import stateProfilePPID from '@/app/admin/(dashboard)/_state/ppid/profile_ppid/profile_PPID';
import { Box, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';
import ScrollToTopButton from '@/app/(public)/_com/scrollToTopButton';
import { ProfilLembagaSection } from './_com/ProfilLembagaSection';
import { ProfilPerorangan } from './_com/ProfilPerorangan';
import { hasProfilLembagaContent } from './_com/profil-ppid.logic';

function Page() {
  const allList = useProxy(stateProfilePPID);
  const lembagaState = useProxy(stateProfilLembagaPPID);

  useShallowEffect(() => {
    allList.profile.load('edit');
    lembagaState.find.load();
  }, []);

  // Profil lembaga tampil sebagai bagian utama hanya bila admin sudah mengisinya; tanpa itu halaman seperti semula.
  const lembaga = hasProfilLembagaContent(lembagaState.find.data) ? lembagaState.find.data : null;

  // LOADING SKELETON
  if (allList.profile.loading || lembagaState.find.loading)
    return (
      <Stack bg="var(--c-bg)" py="xl" gap="22">
        <Box px={{ base: 'md', md: 100 }}>
          <Skeleton h={40} />
        </Box>
        <Box px={{ base: 'md', md: 100 }}>
          <Skeleton h={80} />
        </Box>
        <Box px={{ base: 'md', md: 100 }}>
          <Paper p="xl" bg="var(--c-tile)">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} h={40} mb="sm" />
            ))}
          </Paper>
        </Box>
      </Stack>
    );

  // ERROR HANDLING
  if (!lembaga && allList.profile.error)
    return (
      <Stack bg="var(--c-bg)" py="xl" gap="22" justify="center" align="center">
        <Box px={{ base: 'md', md: 100 }}>
          <Paper p="xl" bg="var(--c-tile)" radius="lg">
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
  if (!lembaga && !allList.profile.data)
    return (
      <Stack bg="var(--c-bg)" py="xl" gap="22" justify="center" align="center">
        <Box px={{ base: 'md', md: 100 }}>
          <Paper p="xl" bg="var(--c-tile)" radius="lg">
            <Title order={3} ta="center" c={"orange"} fw={700}>
              Data Profile PPID Belum Tersedia
            </Title>
            <Text ta="center" mt="md">Mohon maaf, data profil PPID belum tersedia saat ini</Text>
          </Paper>
        </Box>
      </Stack>
    );

  // Dengan profil lembaga, profil perorangan yang belum ada/gagal dimuat cukup dilewati (bukan kartu galat).
  const dataArray = allList.profile.data ? [allList.profile.data] : [];

  return (
    <Box>
      <Stack pos="relative" bg="var(--c-bg)" py="xl" gap="22">
        {/* Back Button */}
        <Box px={{ base: 'md', md: 100 }}>
          <BackButton />
        </Box>

        {/* Page Title */}
        <Box px={{ base: 'md', md: 100 }}>
          <Title
            order={1}
            ta="center"
            c="var(--c-brand)"
            fz={{ base: '2rem', md: '2.7rem', lg: '3.2rem', xl: '3.6rem' }}
            lh={{ base: 1.1, md: 1.1 }}
            fw={900}
          >
            Profil PPID Desa Darmasaba
          </Title>
        </Box>

        {lembaga && <ProfilLembagaSection data={lembaga} />}

        {dataArray.map((item) => (
          <ProfilPerorangan key={item.id} item={item} />
        ))}
      </Stack>

      {/* tombol scroll */}
      <ScrollToTopButton />
    </Box>
  );
}

export default Page;
