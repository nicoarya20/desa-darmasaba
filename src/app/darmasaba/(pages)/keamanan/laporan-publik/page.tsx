import colors from '@/con/colors';
import { Stack, Box, Text, Flex, ColorSwatch, SimpleGrid, List, ListItem, Button, Paper, Title } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { IconArrowRight } from '@tabler/icons-react';


const data = [
  {
    id: 1,
    judul: 'Kasus Pencurian Banjar Tengah',
    tanggal: '3 Februari 2025, 02:00 WITA',
    deskripsi: <List>
      <ListItem>Laporan ke Polsek setempat</ListItem>
      <ListItem>Penyisiran area oleh Pecalang</ListItem>
      <ListItem>Koordinasi dengan dealer motor</ListItem>
      <ListItem>Penyebaran informasi ke grup keamanan</ListItem>
    </List>,
    button: <Button fz={'md'} fullWidth bg={'#2A742D'}>Terselesaikan</Button>

  },
  {
    id: 2,
    judul: 'Kasus Narkoba Banjar Kaja',
    tanggal: '10 Februari 2025, 22:30 WITA',
    deskripsi: <List>
      <ListItem>Koordinasi dengan Satres Narkoba</ListItem>
      <ListItem>Penggerebekan lokasi</ListItem>
      <ListItem>Pengamanan barang bukti</ListItem>
      <ListItem>Pemeriksaan saksi</ListItem>
    </List>,
    button: <Button fz={'md'} fullWidth bg={'#D1961F'}>Dalam Proses</Button>

  },
  {
    id: 3,
    judul: 'Kasus Tawuran Banjar Kaja',
    tanggal: '15 Februari 2025, 22:30 WITA',
    deskripsi: <List>
      <ListItem>Laporan ke Polsek setempat</ListItem>
      <ListItem>Penggerebekan lokasi</ListItem>
      <ListItem>Pengamanan barang bukti</ListItem>
      <ListItem>Pemeriksaan saksi</ListItem>
    </List>,
    button: <Button fz={'md'} fullWidth bg={'#2A742D'}>Terselesaikan</Button>

  },
]
function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box>
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Laporan Keamanan Lingkungan
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <Flex justify={'space-between'} align={'center'}>
            <Text fz={{ base: 'sm', md: 'h4' }} fw={'bold'}>Laporan Terbaru</Text>
            <Box>
              <Flex gap={'lg'}>
                <Box>
                  <Flex gap={{ base: 2, md: 5 }} align={'center'}>
                    <Text fz={{ base: 'sm', md: 'h4' }}>Terselesaikan</Text>
                    <ColorSwatch color="#2A742D" size={20} />
                  </Flex>
                </Box>
                <Box>
                  <Flex gap={{ base: 2, md: 5 }} align={'center'}>
                    <Text fz={{ base: 'sm', md: 'h4' }}>Dalam Proses</Text>
                    <ColorSwatch color="#D1961F" size={20} />
                  </Flex>
                </Box>
                <Box>
                  <Flex gap={{ base: 2, md: 5 }} align={'center'}>
                    <Text fz={{ base: 'sm', md: 'h4' }}>Gagal</Text>
                    <ColorSwatch color="#A34437" size={20} />
                  </Flex>
                </Box>
              </Flex>
            </Box>
          </Flex>
          <SimpleGrid
            cols={{
              base: 1,
              md: 3
          }}
          >
            {data.map((v, k) => {
              return (
                <Paper radius={'lg'} key={k} bg={colors['white-trans-1']} p={'xl'}>
                  <Stack>
                    <Title c={colors['blue-button']} order={1}>{v.judul}</Title>
                    <Text fs={'italic'} fz={'xl'}>{v.tanggal}</Text>
                    <Box>
                      <Text fw={'bold'}>Penanganan:</Text>
                      {v.deskripsi}
                    </Box>
                    <Box>
                      {v.button}
                    </Box>
                    <Button bg={colors['blue-button']} rightSection={<IconArrowRight size={20} color={colors['white-1']} />}>Lihat Detail Kronologi</Button>
                  </Stack>
                </Paper>
              )
            })}
          </SimpleGrid>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
