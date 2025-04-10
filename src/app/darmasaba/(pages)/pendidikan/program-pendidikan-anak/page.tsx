import colors from '@/con/colors';
import { Stack, Box, Title, Text, SimpleGrid, Paper, List, ListItem } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} pb={50}>
        <Box>
          <Title ta={'center'} order={1} fw={'bold'} c={colors['blue-button']}>
            Program Pendidikan Anak
          </Title>
          <Text pb={20} ta={'justify'} fz={'xl'} px={{ base: 'md', md: 100 }}>
            Desa Darmasaba berkomitmen untuk menciptakan generasi muda yang cerdas, berkarakter, dan berdaya saing melalui berbagai program pendidikan yang inklusif dan berkelanjutan. Pendidikan anak menjadi pondasi utama dalam mewujudkan masa depan desa yang lebih baik.
          </Text>
        </Box>
        <SimpleGrid
          cols={{
            base: 1,
            md: 2
          }}
        >
          <Box>
            <Paper p={'xl'} radius={'md'} bg={colors['white-trans-1']}>
              <Title order={2} fw={'bold'} c={colors['blue-button']}>
                Tujuan Program
              </Title>
              <List>
                <ListItem fz={'h4'}>Meningkatkan akses pendidikan yang merata dan berkualitas</ListItem>
                <ListItem fz={'h4'}>Menumbuhkan semangat belajar sejak dini</ListItem>
                <ListItem fz={'h4'}>Membentuk karakter anak yang berakhlak dan berwawasan lingkungan</ListItem>
                <ListItem fz={'h4'}>Mendukung tumbuh kembang anak melalui pendekatan pendidikan yang holistik</ListItem>
              </List>
            </Paper>
          </Box>
          <Box>
            <Paper h={{base: 0, md: 239}} p={'xl'} radius={'md'} bg={colors['white-trans-1']}>
              <Title order={2} fw={'bold'} c={colors['blue-button']}>
                Program Unggulan
              </Title>
              <List>
                <ListItem fz={'h4'}>Bimbingan Belajar Gratis: Untuk siswa kurang mampu</ListItem>
                <ListItem fz={'h4'}>Gerakan Literasi Desa: Meningkatkan minat baca sejak dini</ListItem>
                <ListItem fz={'h4'}>Pelatihan Digital untuk Anak dan Remaja</ListItem>
                <ListItem fz={'h4'}>Beasiswa Anak Berprestasi & Kurang Mampu</ListItem>
              </List>
            </Paper>
          </Box> 
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

export default Page;
