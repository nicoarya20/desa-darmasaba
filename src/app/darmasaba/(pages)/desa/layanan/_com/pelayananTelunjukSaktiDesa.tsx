/* eslint-disable react-hooks/exhaustive-deps */
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import { Box, Card, Flex, Grid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

// Jumlah baris maksimum agar tinggi card seragam di semua baris grid
const TITLE_MAX_LINES = 2;
const LINK_MAX_LINES = 2;

interface ServiceItem {
  name: string;
  deskripsi: string;
  link: string;
}

function PelayananTelunjukSaktiDesa() {
  const state = useProxy(stateLayananDesa);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await state.pelayananTelunjukSaktiDesa.findMany.load();
      } catch (error) {
        console.error('Gagal memuat data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const data = (state.pelayananTelunjukSaktiDesa.findMany.data || []) as Array<{
    name: string;
    id: string;
    deskripsi: string;
    link: string;
    items: ServiceItem[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }>;

  return (
    <Box>
      <Stack gap="xs" mb="lg">
        <Title order={2} fw={700} lh={1.3} ta="left">
          Layanan Telunjuk Sakti Desa
        </Title>
        <Text c="black" fz={{ base: 'sm', md: 'md' }} fw={400} lh={1.5}>
          Terwujudnya sistem administrasi kependudukan terintegrasi berbasis elektronik, cerdas, dan aman
        </Text>
      </Stack>

      {loading ? (
        <Skeleton h={400} radius="lg" />
      ) : data.length === 0 ? (
        <Card shadow="sm" radius="lg" withBorder>
          <Text c="black" ta="center" py="xl" fz={{ base: 'sm', md: 'md' }} lh={1.5}>
            Belum ada layanan tersedia untuk saat ini
          </Text>
        </Card>
      ) : (
        <Grid gap="lg">
          {data.map((v, k) => (
            <Grid.Col span={{ base: 12, sm: 6, lg: 4 }} key={k}>
              <Card
                shadow="md"
                radius="xl"
                withBorder
                p="lg"
                h="100%"
                style={{
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                }}
              >
                <Stack gap="sm">
                  <Title order={3} fw={700} lh={1.3} mih="2.6em" lineClamp={TITLE_MAX_LINES} title={v.name}>
                    {v.name}
                  </Title>
                  <Flex gap="xs" align="center">
                    <IconExternalLink size={18} stroke={1.5} style={{ flexShrink: 0 }} />
                    <Text
                      component="a"
                      href={v.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      fz={{ base: 'xs', md: 'sm' }}
                      lh={1.5}
                      lineClamp={LINK_MAX_LINES}
                      title={v.deskripsi}
                      miw={0}
                      c="blue"
                      td="underline"
                      style={{ cursor: 'pointer', wordBreak: 'break-word' }}
                    >
                      {v.deskripsi}
                    </Text>
                  </Flex>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default PelayananTelunjukSaktiDesa;