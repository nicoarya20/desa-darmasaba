'use client'
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Box, Button, Divider, Group, List, ListItem, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function Page() {
  const state = useProxy(fasilitasKesehatanState.fasilitasKesehatan)
  const params = useParams()

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string)
  }, [])

  if (!state.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

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
                  Nama Fasilitas : <Text span fz={'h4'}>{state.findUnique.data?.name}</Text>
                </Text>
                <Text fz={'h4'} fw={"bold"}>
                  Alamat : <Text span fz={'h4'}>{state.findUnique.data?.informasiumum.alamat}</Text>
                </Text>
                <Text pb={10} fz={'h4'} fw={"bold"}>
                  Jam Operasional: : <Text span fz={'h4'}>{state.findUnique.data?.informasiumum.jamOperasional}</Text>
                </Text>
                {/* Layanan Unggulan */}
                <Text fz={'h4'} fw={"bold"}>
                  Layanan Unggulan
                </Text>
                <Divider />

                {/* Tenaga Medis */}
                <Text fz={'h4'} fw={"bold"}>
                  Dokter & Tenaga Medis
                </Text>
                <Divider />
                <Box pb={10}>
                  <Table highlightOnHover withTableBorder withColumnBorders>
                    <TableThead>
                      <TableTr>
                        <TableTh fz={'h4'}>Nama</TableTh>
                        <TableTh fz={'h4'}>Spesialisasi</TableTh>
                        <TableTh fz={'h4'}>Jadwal</TableTh>
                      </TableTr>
                    </TableThead>
                    <TableTbody>
                      {state.findUnique.data?.dokterdantenagamedis ? (
                        <TableTr>
                          <TableTd>{state.findUnique.data.dokterdantenagamedis.name}</TableTd>
                          <TableTd>{state.findUnique.data.dokterdantenagamedis.specialist}</TableTd>
                          <TableTd>{state.findUnique.data.dokterdantenagamedis.jadwal}</TableTd>
                        </TableTr>
                      ) : (
                        <TableTr>
                          <TableTd colSpan={3} style={{ textAlign: 'center' }}>Tidak ada data dokter/tenaga medis</TableTd>
                        </TableTr>
                      )}
                    </TableTbody>
                  </Table>
                </Box>
                {/* Fasilitas Pendukung */}
                <Text fz={'h4'} fw={"bold"}>
                  Fasilitas Pendukung
                </Text>
                <Divider />
                <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: state.findUnique.data?.fasilitaspendukung?.content }} />
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
                  <TableTbody>
                    <TableTr>
                      <TableTd>{state.findUnique?.data?.tarifdanlayanan.layanan}</TableTd>
                      <TableTd>{state.findUnique?.data?.tarifdanlayanan.tarif}</TableTd>
                    </TableTr>
                  </TableTbody>
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
