'use client'
import artikelKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Box, Button, Center, Divider, Group, Image, List, ListItem, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function Page() {
  const state = useProxy(artikelKesehatanState)
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
                <Center bg={'#DEE3E3FF'}>
                  <Image
                    w={'100%'}
                    src={'/api/img/dbd.png'}
                    alt='' />
                </Center>
                <Box>
                  <Text c={'#9A9D9DFF'} fz={{ base: 'h6', md: 'h5' }}>
                    {new Date(state.findUnique.data.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </Text>
                </Box>
                {/* Pendahuluan */}
                <Text fz={'h4'} fw={"bold"}>
                  Pendahuluan
                </Text>
                <Divider />
                <Text pb={10} fz={'h4'} ta={'justify'}>
                  {state.findUnique.data.introduction?.content}
                </Text>
                {/* Kenali Gejala DBD */}
                <Text fz={'h4'} fw={"bold"}>
                  Kenali Gejala DBD
                </Text>
                <Divider />
                <Text fz={'h4'}>
                  {state.findUnique.data.symptom?.title}
                </Text>
                <Text fz={'h4'} dangerouslySetInnerHTML={{ __html: state.findUnique.data.symptom?.content }} />
                {/* Cara Mencegah DBD */}
                <Text fz={'h4'} fw={"bold"}>
                  {state.findUnique.data.prevention?.title}
                </Text>
                <Divider />
                <Text fz={'h4'} dangerouslySetInnerHTML={{ __html: state.findUnique.data.prevention?.content }} />
                {/* Pertolongan Pertama Pada Penderita DBD */}
                <Text fz={'h4'} fw={"bold"}>
                  {state.findUnique.data.firstaid?.title}
                </Text>
                <Divider />
                <Text fz={'h4'} dangerouslySetInnerHTML={{ __html: state.findUnique.data.firstaid?.content }} />
                {/* Mitos dan Fakta tentang DBD */}
                <Text fz={'h4'} fw={"bold"}>
                  {state.findUnique.data.mythvsfact?.title}
                </Text>
                <Divider />
                <Box pb={10}>
                  <Table highlightOnHover withTableBorder withColumnBorders>
                    <TableThead>
                      <TableTr>
                        <TableTh fz={'h4'}>Mitos</TableTh>
                        <TableTh fz={'h4'}>Fakta</TableTh>
                      </TableTr>
                    </TableThead>
                    <TableTbody>
                      {state.findUnique.data?.mythvsfact ? (
                        <TableTr>
                          <TableTd>
                            <Text fz={'h4'} dangerouslySetInnerHTML={{ __html: state.findUnique.data.mythvsfact.mitos }} />
                          </TableTd>
                          <TableTd>
                            <Text fz={'h4'} dangerouslySetInnerHTML={{ __html: state.findUnique.data.mythvsfact.fakta }} />
                          </TableTd>
                        </TableTr>
                      ) : (
                        <TableTr>
                          <TableTd colSpan={3} style={{ textAlign: 'center' }}>Tidak ada data mitos dan fakta</TableTd>
                        </TableTr>
                      )}
                    </TableTbody>
                  </Table>
                </Box>
                {/* Kapan Harus ke Dokter */}
                <Text fz={'h4'} fw={"bold"}>
                  Kapan Harus ke Dokter?
                </Text>
                <Divider />
                <Text fz={'h4'}>
                  Segera bawa penderita ke fasilitas kesehatan jika mengalami:
                </Text>
                <Text fz={'h4'} dangerouslySetInnerHTML={{ __html: state.findUnique.data.doctorsign.content }} />
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
