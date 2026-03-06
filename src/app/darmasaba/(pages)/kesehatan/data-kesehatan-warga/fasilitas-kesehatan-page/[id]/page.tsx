/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { ActionIcon, AspectRatio, Badge, Box, Button, Card, CopyButton, Divider, Grid, Group, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, ThemeIcon, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconBrandWhatsapp, IconCheck, IconCopy, IconDeviceLandlinePhone, IconHeart, IconInfoCircle, IconMail, IconMapPin, IconMoodEmpty, IconSearch, IconUser } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useProxy } from 'valtio/utils';

interface Kontak {
  telepon: string;
  whatsapp: string;
  email: string;
}

interface Lokasi {
  mapsEmbed: string;
}

interface TarifDanLayanan {
  layanan: string;
  tarif: string | number;
  gratisBpjs?: boolean;
}

function Page() {
  const state = useProxy(fasilitasKesehatanState.fasilitasKesehatan);
  const params = useParams();

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string);
  }, []);

  const data = state.findUnique.data as any;

  const nama = data?.name || 'Fasilitas Kesehatan';
  const prosedur = data?.prosedurpendaftaran.content || '';
  const alamat = data?.informasiumum?.alamat || '-';
  const jam = data?.informasiumum?.jamOperasional || '-';
  const layananUnggulan = data?.layananunggulan?.content || '';
  const fasilitasPendukungHtml = data?.fasilitaspendukung?.content || '';
  const kontak = (data?.kontak as Kontak) || {
    telepon: '(0361) 123456',
    whatsapp: '6289647037426',
    email: 'info@fasilitas-kesehatan.id'
  };
  const lokasi = (data?.lokasi as Lokasi) || {
    mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.272172359321!2d115.21836257533302!3d-8.569807186941553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd23e9d99b9395f%3A0xb002795fdcb33b30!2sUPTD%20Puskesmas%20Abiansemal%20III!5e0!3m2!1sid!2sid!4v1744792682341!5m2!1sid!2sid'
  };

  const gratisBpjs = (data?.tarifdanlayanan as TarifDanLayanan)?.gratisBpjs ?? true;

  const formatRupiah = useMemo(
    () => (v?: number | string) => {
      if (v === null || v === undefined || v === '') return '-';
      const n = typeof v === 'string' ? Number(v) : v;
      if (Number.isNaN(n as number)) return String(v);
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n as number);
    },
    []
  );

  if (state.findUnique.loading || !data) {
    return (
      <Stack bg={colors.Bg} mih="100vh" p="lg" gap="lg">
        <Box px={{ base: 'md', md: 100 }}>
          <Skeleton h={32} w={220} />
        </Box>
        <Box px={{ base: 'md', md: 100 }}>
          <Skeleton h={64} radius="lg" />
        </Box>
        <Box px={{ base: 'md', md: 100 }}>
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Skeleton h={320} radius="lg" />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Skeleton h={320} radius="lg" />
            </Grid.Col>
          </Grid>
        </Box>
        <Box px={{ base: 'md', md: 100 }}>
          <Skeleton h={420} radius="lg" />
        </Box>
      </Stack>
    );
  }

  return (
    <Stack bg={colors.Bg} py="xl" gap="xl">
      <Box px={{ base: 'md', md: 100 }}>
        <Group justify="space-between">
          <Group gap="xs">
            <BackButton />
          </Group>
          <Group gap="xs">
            <Badge variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} radius="xl" size="lg" leftSection={<IconHeart size={16} />}>Pelayanan Aktif</Badge>
            <Badge variant="light" radius="xl" size="lg" leftSection={<IconInfoCircle size={16} />}>Jam: {jam}</Badge>
          </Group>
        </Group>
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <Card radius="xl" p="lg" withBorder style={{ backdropFilter: 'blur(6px)' }}>
          <Stack gap="sm">
            <Title order={2}>{nama}</Title>
            <Group gap="md" wrap="wrap">
              <Group gap="xs">
                <ThemeIcon variant="light" radius="xl"><IconMapPin size={18} /></ThemeIcon>
                <Text fz={{ base: 'sm', md: 'md' }} lh={1.5}>{alamat}</Text>
              </Group>
              <Group gap="xs">
                <ThemeIcon variant="light" radius="xl"><IconDeviceLandlinePhone size={18} /></ThemeIcon>
                <Text fz={{ base: 'sm', md: 'md' }} lh={1.5}>{kontak.telepon}</Text>
                <CopyButton value={kontak.telepon}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Disalin' : 'Salin nomor'}>
                      <ActionIcon variant="subtle" onClick={copy}>{copied ? <IconCheck size={18} /> : <IconCopy size={18} />}</ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
              <Group gap="xs">
                <ThemeIcon variant="light" radius="xl"><IconBrandWhatsapp size={18} /></ThemeIcon>
                <Text fz={{ base: 'sm', md: 'md' }} lh={1.5}>{kontak.whatsapp}</Text>
                <CopyButton value={kontak.whatsapp}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Disalin' : 'Salin WhatsApp'}>
                      <ActionIcon variant="subtle" onClick={copy}>{copied ? <IconCheck size={18} /> : <IconCopy size={18} />}</ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
              <Group gap="xs">
                <ThemeIcon variant="light" radius="xl"><IconMail size={18} /></ThemeIcon>
                <Text fz={{ base: 'sm', md: 'md' }} lh={1.5}>{kontak.email}</Text>
                <CopyButton value={kontak.email}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Disalin' : 'Salin email'}>
                      <ActionIcon variant="subtle" onClick={copy}>{copied ? <IconCheck size={18} /> : <IconCopy size={18} />}</ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
            </Group>
          </Stack>
        </Card>
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card radius="xl" p="lg" withBorder>
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Title order={3}>Informasi Umum</Title>
                  <Badge variant="gradient" gradient={{ from: 'cyan', to: 'blue' }} radius="xl">Terverifikasi</Badge>
                </Group>
                <Divider />
                <Group gap="xl" align="start">
                  <Stack gap={2}>
                    <Text c="dimmed" fz={{ base: 'xs', md: 'sm' }}>Nama Fasilitas</Text>
                    <Text fz={{ base: 'sm', md: 'md' }} fw={600} lh={1.5}>{nama}</Text>
                  </Stack>
                  <Stack gap={2}>
                    <Text c="dimmed" fz={{ base: 'xs', md: 'sm' }}>Jam Operasional</Text>
                    <Text fz={{ base: 'sm', md: 'md' }} fw={600} lh={1.5}>{jam}</Text>
                  </Stack>
                </Group>
                <Divider />
                <Title order={4}>Layanan Unggulan</Title>
                <Divider />
                {layananUnggulan ? (
                  <Box pl="lg">
                    <Text
                      fz={{ base: 'sm', md: 'md' }}
                      lh={{ base: 1.6, md: 1.7 }}
                      style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                      dangerouslySetInnerHTML={{ __html: layananUnggulan }}
                    />
                  </Box>
                ) : (
                  <Paper withBorder radius="md" p="md">
                    <Group gap="sm">
                      <IconMoodEmpty />
                      <Text fz={{ base: 'sm', md: 'md' }} c="dimmed">Belum ada informasi layanan unggulan.</Text>
                    </Group>
                  </Paper>
                )}
                <Divider />
                <Title order={4}>Peta Lokasi</Title>
                <AspectRatio ratio={16 / 9}>
                  <iframe
                    src={lokasi.mapsEmbed}
                    style={{ border: 0, width: '100%', height: '100%', borderRadius: 16 }}
                    loading="lazy"
                    aria-label="Peta Lokasi"
                  />
                </AspectRatio>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="lg">
              <Card radius="xl" p="lg" withBorder>
                <Stack gap="md">
                  <Title order={4}>Kontak Cepat</Title>
                  <Group gap="sm" wrap="wrap">
                    <Button variant="light" leftSection={<IconDeviceLandlinePhone size={18} />} component="a" href={`tel:${kontak.telepon}`} aria-label="Hubungi Telepon">
                      <Text fz={{ base: 'xs', md: 'sm' }}>Telepon</Text>
                    </Button>
                    <Button variant="light" leftSection={<IconBrandWhatsapp size={18} />} component="a" href={`https://wa.me/${kontak.whatsapp.replace(/\D/g, '')}`} target="_blank" aria-label="Hubungi WhatsApp">
                      <Text fz={{ base: 'xs', md: 'sm' }}>WhatsApp</Text>
                    </Button>
                    <Button variant="light" leftSection={<IconMail size={18} />} component="a" href={`mailto:${kontak.email}`} aria-label="Kirim Email">
                      <Text fz={{ base: 'xs', md: 'sm' }}>Email</Text>
                    </Button>
                  </Group>
                </Stack>
              </Card>

              <Card radius="xl" p="lg" withBorder>
                <Stack gap="md">
                  <Title order={4}>Dokter & Tenaga Medis</Title>
                  <Table highlightOnHover
                    layout="fixed" // 🔥 PENTING
                    withColumnBorders={false} withTableBorder aria-label="Tabel Dokter">
                    <TableThead>
                      <TableTr>
                        <TableTh>
                          <Text fz={{ base: 'xs', md: 'sm' }} fw={600}>Nama</Text>
                        </TableTh>
                        <TableTh>
                          <Text fz={{ base: 'xs', md: 'sm' }} fw={600}>Spesialisasi</Text>
                        </TableTh>
                        <TableTh>
                          <Text fz={{ base: 'xs', md: 'sm' }} fw={600}>Jadwal</Text>
                        </TableTh>
                      </TableTr>
                    </TableThead>
                    <TableTbody>
                      {Array.isArray(data?.dokterdantenagamedis) && data.dokterdantenagamedis.length > 0 ? (
                        data.dokterdantenagamedis.map((dokter: any) => (
                          <TableTr key={dokter.id}>
                            <TableTd>
                              <Group gap="xs">
                                <IconUser size={16} />
                                <Text fz={{ base: 'sm', md: 'md' }}>{dokter.name || '-'}</Text>
                              </Group>
                            </TableTd>
                            <TableTd>
                              <Text fz={{ base: 'sm', md: 'md' }}>{dokter.specialist || '-'}</Text>
                            </TableTd>
                            <TableTd>
                              <Text fz={{ base: 'sm', md: 'md' }}>{dokter.jadwal || '-'}</Text>
                            </TableTd>
                          </TableTr>
                        ))
                      ) : (
                        <TableTr>
                          <TableTd colSpan={3}>
                            <Group justify="center" gap="xs" c="dimmed">
                              <IconSearch size={18} />
                              <Text fz={{ base: 'sm', md: 'md' }}>Tidak ada data tenaga medis.</Text>
                            </Group>
                          </TableTd>
                        </TableTr>
                      )}
                    </TableTbody>
                  </Table>
                </Stack>
              </Card>

              <Card radius="xl" p="lg" withBorder>
                <Stack gap="md">
                  <Title order={3}>Fasilitas Pendukung</Title>
                  <Divider />
                  {fasilitasPendukungHtml ? (
                    <Box pl="lg">
                      <Text
                        fz={{ base: 'sm', md: 'md' }}
                        lh={{ base: 1.6, md: 1.7 }}
                        style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                        dangerouslySetInnerHTML={{ __html: fasilitasPendukungHtml }}
                      />
                    </Box>
                  ) : (
                    <Paper withBorder radius="md" p="md">
                      <Group gap="sm">
                        <IconMoodEmpty />
                        <Text fz={{ base: 'sm', md: 'md' }} c="dimmed">Belum ada informasi fasilitas pendukung.</Text>
                      </Group>
                    </Paper>
                  )}
                </Stack>
              </Card>

              <Card radius="xl" p="lg" withBorder>
                <Stack gap="md">
                  <Title order={3}>Layanan & Tarif</Title>
                  <Divider />
                  <Table highlightOnHover
                    layout="fixed" // 🔥 PENTING
                    withColumnBorders={false} withTableBorder aria-label="Tabel Layanan dan Tarif">
                    <TableThead>
                      <TableTr>
                        <TableTh>
                          <Text fz={{ base: 'xs', md: 'sm' }} fw={600}>Layanan</Text>
                        </TableTh>
                        <TableTh>
                          <Text fz={{ base: 'xs', md: 'sm' }} fw={600}>Tarif</Text>
                        </TableTh>
                      </TableTr>
                    </TableThead>
                    <TableTbody>
                      {Array.isArray(data?.tarifdanlayanan) && data.tarifdanlayanan.length > 0 ? (
                        data.tarifdanlayanan.map((item: any) => (
                          <TableTr key={item.id}>
                            <TableTd>
                              <Text fz={{ base: 'sm', md: 'md' }}>{item.layanan || '-'}</Text>
                            </TableTd>
                            <TableTd>
                              <Text fz={{ base: 'sm', md: 'md' }}>{formatRupiah(item.tarif)}</Text>
                            </TableTd>
                          </TableTr>
                        ))
                      ) : (
                        <TableTr>
                          <TableTd colSpan={2}>
                            <Group justify="center" gap="xs" c="dimmed">
                              <IconSearch size={18} />
                              <Text fz={{ base: 'sm', md: 'md' }}>Tidak ada data tarif.</Text>
                            </Group>
                          </TableTd>
                        </TableTr>
                      )}
                    </TableTbody>
                  </Table>
                  {gratisBpjs && (
                    <Group gap="xs">
                      <ThemeIcon variant="light" radius="xl"><IconCheck size={18} /></ThemeIcon>
                      <Text fz={{ base: 'sm', md: 'md' }} fw={600}>Gratis dengan BPJS Kesehatan</Text>
                    </Group>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Box>

      <Box px={{ base: 'md', md: 100 }} pb="xl">
        <Paper radius="xl" p="lg" withBorder>
          <Stack gap="md">
            <Title order={3}>Prosedur Pendaftaran</Title>
            <Divider />
            {prosedur ? (
              <Box pl="lg">
                <Text
                  fz={{ base: 'sm', md: 'md' }}
                  lh={{ base: 1.6, md: 1.7 }}
                  style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                  dangerouslySetInnerHTML={{ __html: prosedur }}
                />
              </Box>
            ) : (
              <Text fz={{ base: 'sm', md: 'md' }} c="dimmed">Belum ada prosedur pendaftaran</Text>
            )}
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
}

export default Page;