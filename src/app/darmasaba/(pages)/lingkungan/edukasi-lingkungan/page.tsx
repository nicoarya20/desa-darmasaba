'use client'
import stateEdukasiLingkungan from '@/app/admin/(dashboard)/_state/lingkungan/edukasi-lingkungan';
import colors from '@/con/colors';
import { Box, Paper, SimpleGrid, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconLeaf, IconPlant2, IconRecycle } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const tujuan = useProxy(stateEdukasiLingkungan.stateTujuanEdukasi.findById)
  const materi = useProxy(stateEdukasiLingkungan.stateMateriEdukasiLingkungan.findById)
  const contoh = useProxy(stateEdukasiLingkungan.stateContohEdukasiLingkungan.findById)

  useShallowEffect(() => {
    tujuan.load('edit')
    materi.load('edit')
    contoh.load('edit')
  }, [])

  if (tujuan.loading || !tujuan.data || materi.loading || !materi.data || contoh.loading || !contoh.data) {
    return (
      <Stack py={20}>
        <Skeleton radius="md" height={600} />
      </Stack>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Box px={{ base: 'md', md: 100 }} pb={20}>
        <Text ta={'center'} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw="bold">
          Edukasi Lingkungan
        </Text>
        <Text ta={'center'} fz="h4" c="black">
          Program edukasi ini membimbing masyarakat untuk peduli dan bertanggung jawab terhadap alam,
          meningkatkan kesehatan, kenyamanan, dan keberlanjutan hidup bersama.
        </Text>
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" style={{ alignItems: 'stretch' }}>
          {/* Tujuan Edukasi Lingkungan */}
         <Box style={{ display: 'flex', height: '100%' }}>
            <Paper p={20} bg={colors['white-trans-1']} shadow="md" radius="md" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              <Stack gap="md">
                <Box>
                  <Tooltip label={tujuan.data?.judul} position="top" withArrow>
                    <Stack gap={4} align="center">
                    <IconLeaf size={28} color={colors['blue-button']} />
                      <Text fz="h3" fw="bold" c={colors['blue-button']} ta="center">
                        {tujuan.data?.judul}
                      </Text>
                    </Stack>
                  </Tooltip>
                </Box>
                <Text 
                  style={{ 
                    wordBreak: "break-word", 
                    whiteSpace: "normal",
                    flexGrow: 1
                  }} 
                  dangerouslySetInnerHTML={{ __html: tujuan.data?.deskripsi || '' }} 
                />
                <Box style={{ flexGrow: 1 }} />
              </Stack>
            </Paper>
          </Box>
          {/* Materi Edukasi Lingkungan */}
          <Box style={{ display: 'flex', height: '100%' }}>
            <Paper p={20} bg={colors['white-trans-1']} shadow="md" radius="md">
              <Stack gap="md">
                <Box>
                  <Tooltip label={materi.data?.judul} position="top" withArrow>
                    <Stack gap={4} align="center">
                    <IconRecycle size={28} color={colors['blue-button']} />
                      <Text fz="h3" fw="bold" c={colors['blue-button']} ta="center" dangerouslySetInnerHTML={{ __html: materi.data?.judul || '' }} />
                    </Stack>
                  </Tooltip>
                </Box>
                <Text 
                  style={{ 
                    wordBreak: "break-word", 
                    whiteSpace: "normal",
                    flexGrow: 1
                  }} 
                  dangerouslySetInnerHTML={{ __html: materi.data?.deskripsi || '' }} 
                />
                <Box style={{ flexGrow: 1 }} />
              </Stack>
            </Paper>
          </Box>
          {/* Contoh Edukasi Lingkungan */}
          <Box style={{ display: 'flex', height: '100%' }}>
            <Paper p={20} bg={colors['white-trans-1']} shadow="md" radius="md">
              <Stack gap="md">
                <Box>
                  <Tooltip label={contoh.data?.judul} position="top" withArrow>
                    <Stack gap={4} align="center">
                    <IconPlant2  size={28} color={colors['blue-button']} />
                      <Text fz="h3" fw="bold" c={colors['blue-button']} ta="center">
                        {contoh.data?.judul}
                      </Text>
                    </Stack>
                  </Tooltip>
                </Box>
                <Text 
                  style={{ 
                    wordBreak: "break-word", 
                    whiteSpace: "normal",
                    flexGrow: 1
                  }} 
                  dangerouslySetInnerHTML={{ __html: contoh.data?.deskripsi || '' }} 
                />
              </Stack>
            </Paper>
          </Box>
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

export default Page;
