'use client'
import artikelKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import t from '@/app/(public)/(pages)/kesehatan/_com/kesehatan-tema.module.css';
import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';
import BackButton from '@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto';
import { Box, Divider, Flex, Group, Image, List, ListItem, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
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
    <Stack pos="relative" className={t.tema} bg="var(--c-hero-bg)" py="xl" gap="xl">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <Stack gap="lg">
          <Paper radius="xl" shadow="md" withBorder>
            <Box style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }} bg="var(--c-brand-fill)">
              <Title order={1} p="md" c="var(--kt-on-fill)" fw="bold">
                {state.findUnique.data.title || 'Detail Artikel Kesehatan'}
              </Title>
            </Box>

            <Box p="lg">
              <Box style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                <Image
                  src={state.findUnique.data.image?.link}
                  alt={state.findUnique.data.title}
                  height={0}
                  style={{
                    height: 'auto',
                    width: '100%',
                    maxHeight: '500px',
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                  loading="lazy"
                />
              </Box>
            </Box>

            <Box p="lg">
              <Stack gap="lg">
                <Group gap="xs">
                  <IconCalendar size={18} color="var(--c-brand)" />
                  <Text fz={{ base: 'xs', md: 'sm' }} lh={1.5}>
                    {new Date(state.findUnique.data.createdAt).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </Group>

                <Stack gap="lg">
                  <Box>
                    <Title order={2} fw="bold">Pendahuluan</Title>
                    <Divider my="xs" />
                    <Box pl={20}>
                      <Text fz={{ base: 'sm', md: 'md' }} lh={1.6} ta="justify" className={rt.root} dangerouslySetInnerHTML={{ __html: state.findUnique.data.introduction?.content }} />
                    </Box>
                  </Box>

                  <Box>
                    <Title order={2} fw="bold">{state.findUnique.data.symptom?.title}</Title>
                    <Divider my="xs" />
                    <Box pl={20}>
                      <Text fz={{ base: 'sm', md: 'md' }} lh={1.6} ta="justify" style={{ wordBreak: "break-word", whiteSpace: "normal" }} className={rt.root} dangerouslySetInnerHTML={{ __html: state.findUnique.data.symptom?.content }} />
                    </Box>
                  </Box>

                  <Box>
                    <Title order={2} fw="bold">{state.findUnique.data.prevention?.title}</Title>
                    <Divider my="xs" />
                    <Box pl={20}>
                      <Text fz={{ base: 'sm', md: 'md' }} lh={1.6} ta="justify" style={{ wordBreak: "break-word", whiteSpace: "normal" }} className={rt.root} dangerouslySetInnerHTML={{ __html: state.findUnique.data.prevention?.content }} />
                    </Box>
                  </Box>

                  <Box>
                    <Title order={2} fw="bold">{state.findUnique.data.firstaid?.title}</Title>
                    <Divider my="xs" />
                    <Box pl={20}>
                      <Text fz={{ base: 'sm', md: 'md' }} lh={1.6} ta="justify" style={{ wordBreak: "break-word", whiteSpace: "normal" }} className={rt.root} dangerouslySetInnerHTML={{ __html: state.findUnique.data.firstaid?.content }} />
                    </Box>
                  </Box>

                  <Box>
                    <Title order={2} fw="bold">{state.findUnique.data.mythvsfact?.title}</Title>
                    <Divider my="xs" />
                    <Box pb="md">
                      <Table highlightOnHover
                        layout="fixed" // 🔥 PENTING
                        withColumnBorders={false} withTableBorder striped>
                        <TableThead>
                          <TableTr>
                            <TableTh fz={{ base: 'xs', md: 'sm' }} fw="bold">Mitos</TableTh>
                            <TableTh fz={{ base: 'xs', md: 'sm' }} fw="bold">Fakta</TableTh>
                          </TableTr>
                        </TableThead>
                        <TableTbody>
                          {state.findUnique.data?.mythvsfact ? (
                            <TableTr>
                              <TableTd>
                                <Box pl={20}>
                                  <Text fz={{ base: 'xs', md: 'sm' }} lh={1.6} style={{ wordBreak: "break-word", whiteSpace: "normal" }} className={rt.root} dangerouslySetInnerHTML={{ __html: state.findUnique.data.mythvsfact.mitos }} />
                                </Box>
                              </TableTd>
                              <TableTd>
                                <Box pl={20}>
                                  <Text fz={{ base: 'xs', md: 'sm' }} lh={1.6} style={{ wordBreak: "break-word", whiteSpace: "normal" }} className={rt.root} dangerouslySetInnerHTML={{ __html: state.findUnique.data.mythvsfact.fakta }} />
                                </Box>
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
                    <Title order={2} fw="bold">Kapan Harus ke Dokter?</Title>
                    <Divider my="xs" />
                    <Flex justify={'flex-start'} gap={"xs"} align={"center"} mb="xs">
                      <IconAlertCircle size={18} color="red" />
                      <Text fz={{ base: 'sm', md: 'md' }} lh={1.5}>Segera bawa penderita ke fasilitas kesehatan jika mengalami:</Text>
                    </Flex>
                    <Box pl={20}>
                      <Text fz={{ base: 'sm', md: 'md' }} lh={1.6} className={rt.root} dangerouslySetInnerHTML={{ __html: state.findUnique.data.doctorsign.content }} />
                    </Box>
                  </Box>

                  <Box>
                    <Paper p="lg" radius="md" bg="var(--kt-info)" withBorder>
                      <Group gap="xs" mb="sm">
                        <IconInfoCircle size={20} color="var(--kt-on-fill)" />
                        <Title order={3} c="var(--kt-on-fill)" fw="bold">Informasi Lebih Lanjut</Title>
                      </Group>
                      <Stack gap={4}>
                        <Text fz={{ base: 'xs', md: 'sm' }} c="var(--kt-on-fill)">Hotline DBD: <b>(0361) 123456</b></Text>
                        <Text fz={{ base: 'xs', md: 'sm' }} c="var(--kt-on-fill)">WhatsApp Center: <b>081234567890</b></Text>
                        <Text fz={{ base: 'xs', md: 'sm' }} c="var(--kt-on-fill)">Email: <b>p2p@dinkes.badungkab.go.id</b></Text>
                      </Stack>
                    </Paper>
                  </Box>

                  <Box>
                    <Title order={2} fw="bold">Referensi</Title>
                    <Divider my="xs" />
                    <List spacing="xs" fz={{ base: 'xs', md: 'sm' }} type="ordered">
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