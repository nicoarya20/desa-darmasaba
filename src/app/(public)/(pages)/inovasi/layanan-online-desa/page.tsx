
'use client'
import colors from '@/con/colors';
import { Box, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';
import AdministrasiOnline from './administrasi-online/page';
import PengaduanMasyarakat from './pengaduan-masyarakat/page';

function Page() {
  const router = useRouter()
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Layanan Online Desa
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <SimpleGrid
            cols={{
              base: 1,
              md: 1
            }}
          >
            <Stack gap={'lg'}>
              <AdministrasiOnline />
              <PengaduanMasyarakat />
              <Box>
                <Stack>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => router.push('/inovasi/layanan-online-desa/informasi-desa')}
                  >
                    <Paper p={'xl'} >
                      <Box>
                        <IconBell size={50} color={colors['blue-button']} />
                      </Box>
                      <Text fz={'h3'} fw={'bold'} c={colors['blue-button']}>Informasi Desa</Text>
                      <Text fz={'lg'} c={'black'}>Akses berita dan pengumuman terbaru seputar kegiatan desa</Text>
                    </Paper>
                  </motion.div>
                </Stack>
              </Box>
            </Stack>
          </SimpleGrid>
        </Stack>
      </Box >
    </Stack >
  );
}

export default Page;
