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
            Pendidikan Non Formal
          </Title>
          <Text pb={20} ta={'justify'} fz={'xl'} px={{ base: 'md', md: 100 }}>
            Pendidikan Non Formal adalah bentuk pendidikan di luar sekolah yang diselenggarakan secara terstruktur dan bertujuan memberikan keterampilan, pengetahuan, serta pengembangan karakter masyarakat dari berbagai usia dan latar belakang.
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
                <ListItem fz={'h4'}>Memberikan kesempatan belajar yang fleksibel bagi warga desa</ListItem>
                <ListItem fz={'h4'}>Meningkatkan keterampilan hidup dan kemandirian ekonomi</ListItem>
                <ListItem fz={'h4'}>Mendorong partisipasi masyarakat dalam pembangunan desa</ListItem>
                <ListItem fz={'h4'}>Mengurangi angka putus sekolah dan meningkatkan kualitas SDM</ListItem>
              </List>
            </Paper>
          </Box>
          <Box>
            <Paper h={{ base: 0, md: 210 }} p={'xl'} radius={'md'} bg={colors['white-trans-1']}>
              <Title order={2} fw={'bold'} c={colors['blue-button']}>
                Tempat Kegiatan
              </Title>
              <List>
                <ListItem fz={'h4'}>Balai Desa Darmasaba</ListItem>
                <ListItem fz={'h4'}>TPK, Perpustakaan Desa, atau Posyandu</ListItem>
                <ListItem fz={'h4'}>Bisa juga dilakukan secara mobile atau door to door</ListItem>
              </List>
            </Paper>
          </Box>
        </SimpleGrid>
        <Box py={20}>
          <Paper p={'xl'} radius={'md'} bg={colors['white-trans-1']}>
            <Title order={2} fw={'bold'} c={colors['blue-button']}>
              Jenis Program yang Diselenggarakan
            </Title>
            <Text fz={'h4'}>Program Pendidikan Non Formal yang diselenggarakan di Desa Darmasaba meliputi:</Text>
            <Stack>
              <Box>
                <Text fz={'h4'}> 1) Keaksaraan Fungsional</Text>
                <List>
                  <ListItem fz={'h4'}>Untuk warga yang belum bisa membaca dan menulis</ListItem>
                </List>
              </Box>
              <Box>
                <Text fz={'h4'}> 2) Pendidikan Kesetaraan (Paket A, B, C)</Text>
                <List>
                  <ListItem fz={'h4'}>Setara SD, SMP, dan SMA bagi yang tidak menyelesaikan pendidikan formal</ListItem>
                </List>
              </Box>
              <Box>
                <Text fz={'h4'}> 3) Pelatihan Keterampilan</Text>
                <List>
                  <ListItem fz={'h4'}>Menjahit, memasak, sablon, pertanian, peternakan, hingga teknologi digital</ListItem>
                </List>
              </Box>
              <Box>
                <Text fz={'h4'}> 4) Kursus & Pelatihan Soft Skill</Text>
                <List>
                  <ListItem fz={'h4'}>Public speaking, pengelolaan keuangan, kepemimpinan pemuda</ListItem>
                </List>
              </Box>
              <Box>
                <Text fz={'h4'}> 5) Pendidikan Keluarga & Parenting</Text>
                <List>
                  <ListItem fz={'h4'}>Untuk membekali orang tua dalam mendampingi tumbuh kembang anak</ListItem>
                </List>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Stack>
  );
}

export default Page;
