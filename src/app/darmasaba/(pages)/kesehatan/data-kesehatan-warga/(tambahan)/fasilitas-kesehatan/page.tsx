import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Box, Button, Divider, Group, List, ListItem, Paper, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';

const dataDokter = [
  {
    id: 1,
    nama: 'dr. Adi Putra',
    spesilisasi: 'Dokter Umum',
    jadwal: 'Senin-Jumat, 08:00-12:00'
  },
  {
    id: 2,
    nama: 'drg. Ratna Dewi',
    spesilisasi: 'Dokter Gigi',
    jadwal: 'Senin, Rabu, Jumat 08:00-14:00'
  },
  {
    id: 3,
    nama: 'Bidan Komang',
    spesilisasi: 'Kebidanan',
    jadwal: 'Setiap hari, 08:00-16:00'
  },
]
const dataBiaya = [
  {
    id: 1,
    layanan: 'Poli Umum',
    tarif: '15.000',
  },
  {
    id: 2,
    layanan: 'Poli Gigi',
    tarif: '20.000',
  },
  {
    id: 3,
    layanan: 'Imunisasi Dasar',
    tarif: 'Gratis',
  },
  {
    id: 4,
    layanan: 'Konsultasi KB',
    tarif: 'Gratis',
  },
]

function Page() {
  const rows = dataDokter.map((element) => (
    <TableTr key={element.nama}>
      <TableTd fz={'h4'}>{element.nama}</TableTd>
      <TableTd fz={'h4'}>{element.spesilisasi}</TableTd>
      <TableTd fz={'h4'}>{element.jadwal}</TableTd>
    </TableTr>
  ));

  const rows2 = dataBiaya.map((element2) => (
    <TableTr key={element2.layanan}>
      <TableTd fz={'h4'}>{element2.layanan}</TableTd>
      <TableTd fz={'h4'}>{element2.tarif}</TableTd>
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
                {/* Informasi Umum */}
                <Text fz={'h4'} fw={"bold"}>
                  Informasi Umum
                </Text>
                <Divider />
                <Text fz={'h4'} fw={"bold"}>
                  Nama Fasilitas : <Text span fz={'h4'}>UPTD Puskesmas Abiansemal III</Text>
                </Text>
                <Text fz={'h4'} fw={"bold"}>
                  Alamat : <Text span fz={'h4'}>Jl. Ratna, Sibang Kaja</Text>
                </Text>
                <Text pb={10} fz={'h4'} fw={"bold"}>
                  Jam Operasional: : <Text span fz={'h4'}>08:00-16:00 WITA (Senin-Sabtu)</Text>
                </Text>
                {/* Layanan Unggulan */}
                <Text fz={'h4'} fw={"bold"}>
                  Layanan Unggulan
                </Text>
                <Divider />
                <List pb={10}>
                  <ListItem fz={'h4'}>Poli Umum</ListItem>
                  <ListItem fz={'h4'}>Poli Gigi</ListItem>
                  <ListItem fz={'h4'}>Imunisasi</ListItem>
                  <ListItem fz={'h4'}>Ibu/KB</ListItem>
                  <ListItem fz={'h4'}>Laboratorium Dasar</ListItem>
                  <ListItem fz={'h4'}>Farmasi</ListItem>
                  <ListItem fz={'h4'}>Konsultasi Gizi</ListItem>
                </List>
                {/* Tenaga Medis */}
                <Text fz={'h4'} fw={"bold"}>
                  Dokter & Tenaga Medis
                </Text>
                <Divider />
                <Table pb={10} highlightOnHover withTableBorder withColumnBorders>
                  <TableThead>
                    <TableTr>
                      <TableTh fz={'h4'}>Nama</TableTh>
                      <TableTh fz={'h4'}>Spesialisasi</TableTh>
                      <TableTh fz={'h4'}>Jadwal</TableTh>
                    </TableTr>
                  </TableThead>
                  <TableTbody>{rows}</TableTbody>
                </Table>
                {/* Fasilitas Pendukung */}
                <Text fz={'h4'} fw={"bold"}>
                  Fasilitas Pendukung
                </Text>
                <Divider />
                <List pb={10}>
                  <ListItem fz={'h4'}>Apotek dengan ketersediaan obat lengkap</ListItem>
                  <ListItem fz={'h4'}>Ruang tunggu ber-AC</ListItem>
                  <ListItem fz={'h4'}>Area bermain anak</ListItem>
                  <ListItem fz={'h4'}>Ambulans 24 jam</ListItem>
                  <ListItem fz={'h4'}>Toilet khusus disabilitas</ListItem>
                  <ListItem fz={'h4'}>Tempat parkir luas</ListItem>
                </List>
                {/* Dokter */}
                <Text fz={'h4'} fw={"bold"}>
                 Layanan & Tarif
                </Text>
                <Divider />
                <Table highlightOnHover withTableBorder withColumnBorders>
                  <TableThead>
                    <TableTr>
                      <TableTh fz={'h4'}>Layanan</TableTh>
                      <TableTh fz={'h4'}>Tarif</TableTh>
                    </TableTr>
                  </TableThead>
                  <TableTbody>{rows2}</TableTbody>
                </Table>
                <Text fz={'h6'} pb={10} fw={"bold"}>
                  * Gratis dengan BPJS Kesehatan
                </Text>
                {/* Prosedur Pendaftaran */}
                <Text fz={'h4'} fw={"bold"}>
                  Prosedur Pendaftaran
                </Text>
                <Divider />
                <List type='ordered' pb={10} >
                  <ListItem fz={'h4'}>Pendaftaran dibuka pukul 07:30 WITA</ListItem>
                  <ListItem fz={'h4'}>Bawa KTP dan Kartu BPJS (jika ada)</ListItem>
                  <ListItem fz={'h4'}>Ambil nomor antrian di loket pendaftaran</ListItem>
                  <ListItem fz={'h4'}>Pengunjung baru wajib mengisi formulir pendaftaran</ListItem>
                  <ListItem fz={'h4'}>Pendaftaran online tersedia melalui aplikasi S-Sehat</ListItem>
                </List>
                <Paper p={'lg'} bg={colors['blue-button-trans']}>
                  <Text fz={'h3'} c={colors['white-1']} fw={'bold'}>Kontak Darurat</Text>
                  <Text fz={'h4'} c={colors['white-1']} fw={"bold"}>
                    Telepon : <Text span fz={'h4'}>(0361) 123456</Text>
                  </Text>
                  <Text fz={'h4'} c={colors['white-1']} fw={"bold"}>
                    WhatsApp : <Text span fz={'h4'}>081234567890</Text>
                  </Text>
                  <Text fz={'h4'} c={colors['white-1']} fw={"bold"}>
                    Email : <Text span fz={'h4'}>puskesmasabiansemal3@gmail.com</Text>
                  </Text>
                </Paper>
                <Paper p={'lg'} w={{ base: "100%", md: "100%" }}>
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.272172359321!2d115.21836257533302!3d-8.569807186941553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd23e9d99b9395f%3A0xb002795fdcb33b30!2sUPTD%20Puskesmas%20Abiansemal%20III!5e0!3m2!1sid!2sid!4v1744792682341!5m2!1sid!2sid" width="600" height="450" style={{ border: 2, width: "100%", borderRadius: 10 }} loading="lazy"></iframe>
                </Paper>
                <Group>
                  <Button fz={'lg'} bg={colors['blue-button']}>
                    Download Brosur Layanan (PDF)
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
