'use client'
import stateKonservasiAdatBali from '@/app/admin/(dashboard)/_state/lingkungan/konservasi-adat-bali';
import colors from '@/con/colors';
import { Box, Center, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const filosofi = useProxy(stateKonservasiAdatBali.stateFilosofiTriHita.findById)
  const nilai = useProxy(stateKonservasiAdatBali.stateNilaiKonservasiAdat.findById)
  const bentuk = useProxy(stateKonservasiAdatBali.stateBentukKonservasiBerdasarkanAdat.findById)

  useShallowEffect(() => {
    filosofi.load('edit')
    nilai.load('edit')
    bentuk.load('edit')
  }, [])

  if (filosofi.loading || !filosofi.data || nilai.loading || !nilai.data || bentuk.loading || !bentuk.data) {
    return (
      <Stack py={20} align="center">
        <Skeleton radius="md" height={600} width="100%" />
      </Stack>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="24">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} pb={30}>
        <Text ta="center" fz={{ base: '2xl', md: '3rem' }} c={colors['blue-button']} fw="bold">
          Konservasi Adat Bali
        </Text>
        <Text px={20} ta="center" fz="lg" c="black">
          Pelestarian lingkungan di Bali yang berpijak pada kearifan lokal, menjaga harmoni antara alam, budaya, dan manusia.
        </Text>
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" style={{ alignItems: 'stretch' }}>
          {/* Filsosofi */}
          <Box style={{ display: 'flex', height: '100%' }}>
            <Paper
              p="lg"
              style={{ 
                borderRadius: 16, 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Stack gap="md" px={20} style={{ height: '100%' }}>
                <Center>
                  <Text fz="xl" fw="bold" c="black">
                    {filosofi.data?.judul}
                  </Text> 
                </Center>
                <div 
                  style={{ 
                    wordBreak: "break-word", 
                    whiteSpace: "normal",
                    flexGrow: 1
                  }} 
                  dangerouslySetInnerHTML={{ __html: filosofi.data?.deskripsi || '' }} 
                />
              </Stack>
            </Paper>
         </Box>
         {/* Nilai */}
         <Box style={{ display: 'flex', height: '100%' }}>
         <Paper
              p="lg"
              style={{ 
                borderRadius: 16, 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Stack gap="md" px={20} style={{ height: '100%' }}>
                <Center>
                  <Text fz="xl" fw="bold" c="black">
                    {nilai.data?.judul}
                  </Text> 
                </Center>
                <div 
                  style={{ 
                    wordBreak: "break-word", 
                    whiteSpace: "normal",
                    flexGrow: 1,
                    minHeight: 0
                  }} 
                  dangerouslySetInnerHTML={{ __html: nilai.data?.deskripsi || '' }} 
                />
              </Stack>
            </Paper>
         </Box>
         {/* Bentuk */}
         <Box>
            <Paper
              p="lg"
              style={{ 
                borderRadius: 16, 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Stack gap="md" px={20} style={{ height: '100%' }}>
                <Center>
                  <Text fz="xl" fw="bold" c="black">
                    {bentuk.data?.judul}
                  </Text> 
                </Center>
                <div 
                  style={{ 
                    wordBreak: "break-word", 
                    whiteSpace: "normal",
                    flexGrow: 1,
                    minHeight: 0
                  }} 
                  dangerouslySetInnerHTML={{ __html: bentuk.data?.deskripsi || '' }} 
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
