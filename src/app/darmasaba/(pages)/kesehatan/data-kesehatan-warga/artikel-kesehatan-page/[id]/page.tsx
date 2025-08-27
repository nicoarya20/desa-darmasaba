'use client'
import artikelKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Box, Divider, Group, List, ListItem, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconAlertCircle, IconCalendar, IconInfoCircle } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function Page() {
  const state = useProxy(artikelKesehatanState);
  const params = useParams();

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string);
  }, []);

  if (!state.findUnique.data) {
    return (
      <Stack py="xl" px="md">
        <Skeleton h={420} radius="lg" />
        <Skeleton h={20} mt="md" w="60%" />
        <Skeleton h={20} w="40%" />
        <Skeleton h={200} radius="md" />
      </Stack>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="xl">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <Stack gap="lg">
          <Paper radius="xl" shadow="md" withBorder>
            <Box style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }} bg={colors['blue-button']}>
              <Text p="md" fz={{ base: 'h3', md: 'h2' }} c={colors['white-1']} fw="bold">
                {state.findUnique.data.title || 'Detail Artikel Kesehatan'}
              </Text>
            </Box>

            <Box p="lg">
              <Stack gap="lg">
                <Group gap="xs">
                  <IconCalendar size={18} color={colors['blue-button']} />
                  <Text c="dimmed" fz="sm">
                    {new Date(state.findUnique.data.createdAt).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </Group>

                <Stack gap="lg">
                  <Box>
                    <Text fz="h4" fw="bold">Pendahuluan</Text>
                    <Divider my="xs" />
                    <Text fz="md" lh={1.6} ta="justify">
                      {state.findUnique.data.introduction?.content}
                    </Text>
                  </Box>

                  <Box>
                    <Text fz="h4" fw="bold">Kenali Gejala DBD</Text>
                    <Divider my="xs" />
                    <Text fz="md" fw="semibold">{state.findUnique.data.symptom?.title}</Text>
                    <Text fz="md" lh={1.6} ta="justify" dangerouslySetInnerHTML={{ __html: state.findUnique.data.symptom?.content }} />
                  </Box>

                  <Box>
                    <Text fz="h4" fw="bold">{state.findUnique.data.prevention?.title}</Text>
                    <Divider my="xs" />
                    <Text fz="md" lh={1.6} ta="justify" dangerouslySetInnerHTML={{ __html: state.findUnique.data.prevention?.content }} />
                  </Box>

                  <Box>
                    <Text fz="h4" fw="bold">{state.findUnique.data.firstaid?.title}</Text>
                    <Divider my="xs" />
                    <Text fz="md" lh={1.6} ta="justify" dangerouslySetInnerHTML={{ __html: state.findUnique.data.firstaid?.content }} />
                  </Box>

                  <Box>
                    <Text fz="h4" fw="bold">{state.findUnique.data.mythvsfact?.title}</Text>
                    <Divider my="xs" />
                    <Box pb="md">
                      <Table highlightOnHover withTableBorder withColumnBorders striped>
                        <TableThead>
                          <TableTr>
                            <TableTh fz="sm" fw="bold">Mitos</TableTh>
                            <TableTh fz="sm" fw="bold">Fakta</TableTh>
                          </TableTr>
                        </TableThead>
                        <TableTbody>
                          {state.findUnique.data?.mythvsfact ? (
                            <TableTr>
                              <TableTd>
                                <Text fz="sm" lh={1.6} dangerouslySetInnerHTML={{ __html: state.findUnique.data.mythvsfact.mitos }} />
                              </TableTd>
                              <TableTd>
                                <Text fz="sm" lh={1.6} dangerouslySetInnerHTML={{ __html: state.findUnique.data.mythvsfact.fakta }} />
                              </TableTd>
                            </TableTr>
                          ) : (
                            <TableTr>
                              <TableTd colSpan={2} ta="center" c="dimmed">Belum ada data mitos dan fakta</TableTd>
                            </TableTr>
                          )}
                        </TableTbody>
                      </Table>
                    </Box>
                  </Box>

                  <Box>
                    <Text fz="h4" fw="bold">Kapan Harus ke Dokter?</Text>
                    <Divider my="xs" />
                    <Group gap="xs" mb="xs">
                      <IconAlertCircle size={18} color="red" />
                      <Text fz="md">Segera bawa penderita ke fasilitas kesehatan jika mengalami:</Text>
                    </Group>
                    <Text fz="md" lh={1.6} dangerouslySetInnerHTML={{ __html: state.findUnique.data.doctorsign.content }} />
                  </Box>

                  <Box>
                    <Text fz="h4" fw="bold">Kasus DBD di Wilayah Abiansemal</Text>
                    <Divider my="xs" />

                    <Paper p="lg" radius="md" bg={colors['blue-button-trans']} withBorder>
                      <Group gap="xs" mb="sm">
                        <IconInfoCircle size={20} color={colors['white-1']} />
                        <Text fz="h4" c={colors['white-1']} fw="bold">Informasi Lebih Lanjut</Text>
                      </Group>
                      <Stack gap={4}>
                        <Text fz="sm" c={colors['white-1']}>Hotline DBD: <b>(0361) 123456</b></Text>
                        <Text fz="sm" c={colors['white-1']}>WhatsApp Center: <b>081234567890</b></Text>
                        <Text fz="sm" c={colors['white-1']}>Email: <b>p2p@dinkes.badungkab.go.id</b></Text>
                      </Stack>
                    </Paper>
                  </Box>

                  <Box>
                    <Text fz="h4" fw="bold">Referensi</Text>
                    <Divider my="xs" />
                    <List spacing="xs" size="sm" type="ordered">
                      <ListItem>Kementerian Kesehatan RI. (2024). Pedoman Pencegahan dan Pengendalian DBD.</ListItem>
                      <ListItem>World Health Organization. (2024). Dengue Guidelines for Diagnosis, Treatment, Prevention and Control.</ListItem>
                      <ListItem>Dinas Kesehatan Kabupaten Badung. (2025). Laporan Surveilans DBD Triwulan I 2025.</ListItem>
                    </List>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
