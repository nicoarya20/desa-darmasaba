'use client'
import stateKonservasiAdatBali from '@/app/admin/(dashboard)/_state/lingkungan/konservasi-adat-bali';
import colors from '@/con/colors';
import { Box, Center, Paper, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';


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
      <Box px={{ base: 'md', md: 100 }} >
        <Title
          order={1}
          ta="center"
          c={colors['blue-button']}
          fw="bold"
          style={{ lineHeight: 1.15 }}
          
        >
          Konservasi Adat Bali
        </Title>
        <Text
          px={20}
          ta="center"
          fz={{ base: 'sm', md: 'lg' }}
          c="black"
          style={{ lineHeight: 1.55 }}
        >
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
                  <Title
                    order={3}
                    c="black"
                    fw="bold"
                    style={{ lineHeight: 1.15 }}
                  >
                    {filosofi.data?.judul}
                  </Title>
                </Center>
                <div 
                  style={{ 
                    wordBreak: "break-word", 
                    whiteSpace: "normal",
                    flexGrow: 1,
                    fontSize: '14px',
                    lineHeight: 1.55,
                    color: 'black'
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
                  <Title
                    order={3}
                    c="black"
                    fw="bold"
                    style={{ lineHeight: 1.15 }}
                  >
                    {nilai.data?.judul}
                  </Title>
                </Center>
                <div 
                  style={{ 
                    wordBreak: "break-word", 
                    whiteSpace: "normal",
                    flexGrow: 1,
                    minHeight: 0,
                    fontSize: '14px',
                    lineHeight: 1.55,
                    color: 'black'
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
                  <Title
                    order={3}
                    c="black"
                    fw="bold"
                    style={{ lineHeight: 1.15 }}
                  >
                    {bentuk.data?.judul}
                  </Title>
                </Center>
                <div 
                  style={{ 
                    wordBreak: "break-word", 
                    whiteSpace: "normal",
                    flexGrow: 1,
                    minHeight: 0,
                    fontSize: '14px',
                    lineHeight: 1.55,
                    color: 'black'
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