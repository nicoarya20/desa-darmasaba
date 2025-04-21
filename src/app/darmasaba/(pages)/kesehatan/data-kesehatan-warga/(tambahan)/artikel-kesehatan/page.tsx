import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Box, Button, Center, Divider, Flex, Group, Image, List, ListItem, Paper, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';

const dataMitos = [
  {
    id: 1,
    mitos: 'Daun pepaya dan daun jambu biji bisa menyembuhkan DBD',
    fakta: 'Belum ada bukti ilmiah yang kuat. Namun dapat dikonsumsi sebagai pendamping terapi medis',
  },
  {
    id: 2,
    mitos: 'DBD hanya menyerang anak-anak',
    fakta: 'DBD dapat menyerang siapa saja terlepas dari usia',
  },
  {
    id: 3,
    mitos: 'Nyamuk DBD hanya aktif pada malam hari',
    fakta: 'Nyamuk Aedes aegypti aktif pada pagi dan sore hari',
  },
  {
    id: 4,
    mitos: 'Sekali terkena DBD, tidak akan terkena lagi',
    fakta: 'Seseorang bisa terkena DBD hingga 4 kali karena terdapat 4 serotipe virus dengue',
  },
]
function Page() {
  const rows = dataMitos.map((element) => (
    <TableTr key={element.mitos}>
      <TableTd fz={'h4'}>{element.mitos}</TableTd>
      <TableTd fz={'h4'}>{element.fakta}</TableTd>
    </TableTr>
  ));
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <Paper radius={10}>
            <Box style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }} bg={colors['blue-button']}>
              <Text p={'md'} fz={{ base: "h3", md: "h2" }} c={colors['white-1']} fw={"bold"}>
                Detail Lengkap Fasilitas Kesehatan
              </Text>
            </Box>
            <Box p={'md'} >
              <Stack gap={'xs'}>
                <Center bg={'#DEE3E3FF'}>
                  <Image
                    w={'100%'}
                    src={'/api/img/dbd.png'}
                    alt='' />
                </Center>
                <Flex gap={'xs'}>
                  <Box>
                    <Text c={'#9A9D9DFF'} fz={{ base: 'h6', md: 'h5' }}>
                      12 Februari 2025
                    </Text>
                  </Box>
                  <Divider size="1" orientation="vertical" />
                  <Box>
                    <Text c={'#9A9D9DFF'} fz={{ base: 'h6', md: 'h5' }}>
                      Dinas Kesehatan
                    </Text>
                  </Box>
                  <Divider size="1" orientation="vertical" />
                  <Box>
                    <Text c={'#9A9D9DFF'} fz={{ base: 'h6', md: 'h5' }}>
                      Kategori: Kesehatan Masyarakat
                    </Text>
                  </Box>
                </Flex>
                {/* Pendahuluan */}
                <Text fz={'h4'} fw={"bold"}>
                  Pendahuluan
                </Text>
                <Divider />
                <Text pb={10} fz={'h4'} ta={'justify'}>
                  Demam Berdarah Dengue (DBD) adalah penyakit yang disebabkan oleh virus dengue yang ditularkan melalui gigitan nyamuk Aedes aegypti. Selama musim hujan, risiko penyebaran DBD meningkat karena genangan air menjadi tempat berkembang biaknya nyamuk. Artikel ini akan membahas cara efektif untuk mencegah dan menangani DBD di musim hujan.
                </Text>
                {/* Kenali Gejala DBD */}
                <Text fz={'h4'} fw={"bold"}>
                  Kenali Gejala DBD
                </Text>
                <Divider />
                <Text fz={'h4'}>
                  Gejala awal DBD seringkali mirip dengan flu biasa, namun ada beberapa tanda khas yang perlu diwaspadai:
                </Text>
                <List pb={10}>
                  <ListItem>
                    <Text pb={10} fz={'h4'} fw={"bold"}>
                      Demam tinggi mendadak <Text span fz={'h4'}>(38-40°C) yang berlangsung 2-7 hari</Text>
                    </Text>
                  </ListItem>
                  <ListItem>
                    <Text pb={10} fz={'h4'} fw={"bold"}>
                      Nyeri pada sendi, otot, dan tulang <Text span fz={'h4'}>yang sangat mengganggu</Text>
                    </Text>
                  </ListItem>
                  <ListItem>
                    <Text pb={10} fz={'h4'} fw={"bold"}>
                      Ruam kemerahan <Text span fz={'h4'}>pada kulit yang muncul 3-4 hari setelah demam</Text>
                    </Text>
                  </ListItem>
                  <ListItem>
                    <Text pb={10} fz={'h4'} fw={"bold"}>
                      Nyeri di belakang mata <Text span fz={'h4'}>yang bertambah parah saat menggerakkan mata</Text>
                    </Text>
                  </ListItem>
                  <ListItem>
                    <Text pb={10} fz={'h4'} fw={"bold"}>
                      Pendarahan <Text span fz={'h4'}>seperti mimisan, gusi berdarah, atau lebam pada kulit</Text>
                    </Text>
                  </ListItem>
                  <ListItem>
                    <Text pb={10} fz={'h4'} fw={"bold"}>
                      Penurunan jumlah trombosit <Text span fz={'h4'}>dalam pemeriksaan darah</Text>
                    </Text>
                  </ListItem>
                </List>
                {/* Cara Mencegah DBD */}
                <Text fz={'h4'} fw={"bold"}>
                  Cara Mencegah DBD
                </Text>
                <Divider />
                <List pb={10} type='ordered'>
                  <ListItem >
                    <Text pb={10} fz={'h4'} fw={"bold"}>
                      3M Plus:
                    </Text>
                    <List pb={5}>
                      <ListItem>
                        <Text pb={10} fz={'h4'} fw={"bold"}>
                          Menguras <Text span fz={'h4'}>tempat penampungan air minimal seminggu sekali</Text>
                        </Text>
                      </ListItem>
                      <ListItem>
                        <Text pb={10} fz={'h4'} fw={"bold"}>
                          Menutup <Text span fz={'h4'}>rapat tempat penampungan air</Text>
                        </Text>
                      </ListItem>
                      <ListItem>
                        <Text pb={10} fz={'h4'} fw={"bold"}>
                          Mengubur <Text span fz={'h4'}>atau mendaur ulang barang bekas yang dapat menampung air</Text>
                        </Text>
                      </ListItem>
                      <ListItem>
                        <Text pb={10} fz={'h4'} fw={"bold"}>
                          Plus: <Text span fz={'h4'}>menanam tanaman pengusir nyamuk, memelihara ikan pemakan jentik, dan menggunakan kelambu saat tidur</Text>
                        </Text>
                      </ListItem>
                    </List>
                  </ListItem>
                  <ListItem>
                    <Text pb={10} fz={'h4'} fw={"bold"}>
                      Penggunaan repellent atau lotion anti nyamuk <Text span fz={'h4'}>terutama pada pagi dan sore hari saat nyamuk DBD aktif</Text>
                    </Text>
                  </ListItem>
                  <ListItem>
                    <Text pb={10} fz={'h4'} fw={"bold"}>
                      Pemasangan kawat kasa <Text span fz={'h4'}>pada ventilasi rumah</Text>
                    </Text>
                  </ListItem>
                  <ListItem>
                    <Text pb={10} fz={'h4'} fw={"bold"}>
                      Fogging atau pengasapan <Text span fz={'h4'}>pada area dengan kasus DBD tinggi (dilakukan oleh petugas kesehatan)</Text>
                    </Text>
                  </ListItem>
                  <ListItem>
                    <Text pb={10} fz={'h4'} fw={"bold"}>
                      Bubuk abate <Text span fz={'h4'}>yang ditaburkan pada penampungan air yang sulit dikuras</Text>
                    </Text>
                  </ListItem>
                </List>
                {/* Pertolongan Pertama Pada Penderita DBD */}
                <Text fz={'h4'} fw={"bold"}>
                  Pertolongan Pertama Pada Penderita DBD
                </Text>
                <Divider />
                <List pb={10} type='ordered'>
                  <ListItem fz={'h4'}>
                    Berikan banyak cairan untuk mencegah dehidrasi
                  </ListItem>
                  <ListItem fz={'h4'}>
                    Kompres hangat untuk menurunkan demam (hindari kompres dingin)
                  </ListItem>
                  <ListItem fz={'h4'}>
                    Istirahat yang cukup dan pemberian paracetamol untuk meredakan demam (hindari obat aspirin dan ibuprofen)
                  </ListItem>
                  <ListItem fz={'h4'}>
                    Pantau gejala penurunan trombosit seperti bintik merah pada kulit
                  </ListItem>
                  <ListItem fz={'h4'}>
                    Segera bawa ke fasilitas kesehatan jika demam tidak turun setelah 2 hari
                  </ListItem>
                </List>
                {/* Mitos dan Fakta tentang DBD */}
                <Text fz={'h4'} fw={"bold"}>
                  Mitos dan Fakta tentang DBD
                </Text>
                <Divider />
                <Table pb={10} highlightOnHover withTableBorder withColumnBorders>
                  <TableThead>
                    <TableTr>
                      <TableTh fz={'h4'}>Mitos</TableTh>
                      <TableTh fz={'h4'}>Fakta</TableTh>
                    </TableTr>
                  </TableThead>
                  <TableTbody>{rows}</TableTbody>
                </Table>
                {/* Kapan Harus ke Dokter */}
                <Text fz={'h4'} fw={"bold"}>
                  Kapan Harus ke Dokter?
                </Text>
                <Divider />
                <Text fz={'h4'}>
                  Segera bawa penderita ke fasilitas kesehatan jika mengalami:
                </Text>
                <List pb={10}>
                  <ListItem fz={'h4'}>Demam tinggi yang tidak turun setelah 2 hari</ListItem>
                  <ListItem fz={'h4'}>Muntah terus-menerus</ListItem>
                  <ListItem fz={'h4'}>Nyeri perut yang hebat</ListItem>
                  <ListItem fz={'h4'}>Perdarahan dari hidung atau gusi</ListItem>
                  <ListItem fz={'h4'}>Bintik merah pada kulit (petekie)</ListItem>
                  <ListItem fz={'h4'}>Sulit bernapas</ListItem>
                  <ListItem fz={'h4'}>Gelisah atau letargi</ListItem>
                  <ListItem fz={'h4'}>Penurunan kesadaran</ListItem>
                </List>
                {/* Kasus DBD di Wilayah Abiansemal */}
                <Text fz={'h4'} fw={"bold"}>
                  Kasus DBD di Wilayah Abiansemal
                </Text>
                <Divider />

                <Paper p={'lg'} bg={colors['blue-button-trans']}>
                  <Text fz={'h3'} c={colors['white-1']} fw={'bold'}>Informasi Lebih Lanjut</Text>
                  <Text fz={'h4'} c={colors['white-1']} fw={"bold"}>
                    Hotline DBD : <Text span fz={'h4'}>(0361) 123456</Text>
                  </Text>
                  <Text fz={'h4'} c={colors['white-1']} fw={"bold"}>
                    WhatsApp Center : <Text span fz={'h4'}>081234567890</Text>
                  </Text>
                  <Text fz={'h4'} c={colors['white-1']} fw={"bold"}>
                    Email : <Text span fz={'h4'}>
                      p2p@dinkes.badungkab.go.id</Text>
                  </Text>
                </Paper>
                {/* Referensi */}
                <Text fz={'h4'} fw={"bold"}>
                  Referensi
                </Text>
                <Divider />
                <List pb={10} type='ordered'>
                  <ListItem fz={'h4'}>Kementerian Kesehatan RI. (2024). Pedoman Pencegahan dan Pengendalian DBD.</ListItem>
                  <ListItem fz={'h4'}>World Health Organization. (2024). Dengue Guidelines for Diagnosis, Treatment, Prevention and Control.</ListItem>
                  <ListItem fz={'h4'}>Dinas Kesehatan Kabupaten Badung. (2025). Laporan Surveilans DBD Triwulan I 2025.</ListItem>
                </List>
                <Group>
                  <Button fz={'lg'} bg={colors['blue-button']}>
                  Download Infografis Pencegahan DBD (PDF)
                  </Button>
                  <Button fz={'lg'} bg={'green'}>
                    Bagikan Artikel Ini
                  </Button>
                </Group>
              </Stack>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}


export default Page;
