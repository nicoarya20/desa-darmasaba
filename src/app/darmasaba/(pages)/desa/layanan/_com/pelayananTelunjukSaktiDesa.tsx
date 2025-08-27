/* eslint-disable react-hooks/exhaustive-deps */
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import { Box, Card, Flex, Grid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

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
      <Title order={2} mb="lg" fz={{ base: 22, md: 28 }} fw={700} style={{ lineHeight: 1.4 }}>
        Layanan Telunjuk Sakti Desa <br /> 
        <Text span c="dimmed" fz="lg" fw={400}>
          Terwujudnya sistem administrasi kependudukan terintegrasi berbasis elektronik, cerdas, dan aman
        </Text>
      </Title>

      {loading ? (
        <Skeleton h={400} radius="lg" />
      ) : data.length === 0 ? (
        <Card shadow="sm" radius="lg" withBorder>
          <Text c="dimmed" ta="center" py="xl">
            Belum ada layanan tersedia untuk saat ini
          </Text>
        </Card>
      ) : (
        <Grid gutter="lg">
          {data.map((v, k) => (
            <Grid.Col span={{ base: 12, sm: 6, lg: 4 }} key={k}>
              <Card
                shadow="md"
                radius="xl"
                withBorder
                p="lg"
                style={{
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                }}
              >
                <Stack gap="sm">
                  <Text fw={700} fz="lg" lh={1.4}>
                    {v.name}
                  </Text>
                  <Flex gap="xs" align="center">
                    <IconExternalLink size={18} stroke={1.5} />
                    <Text
                      component="a"
                      href={v.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      fz="sm"
                      c="blue"
                      td="underline"
                      style={{ cursor: 'pointer' }}
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
