'use client'
import {
  Box,
  Card,
  Center,
  Group,
  Pagination,
  Skeleton,
  Stack,
  Text,
  Title,
  Tooltip,
  Button,
  Paper,
} from '@mantine/core';
import { IconSearch, IconArrowRight } from '@tabler/icons-react';

import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import pencegahanKriminalitasState from '@/app/admin/(dashboard)/_state/keamanan/pencegahan-kriminalitas';
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';
import HeaderSearch from '@/app/admin/(dashboard)/_com/header';

function PencegahanKriminalitas() {
  const [search, setSearch] = useState("");

  return (
    <Box>
      <HeaderSearch
        title="Program Pencegahan Kriminalitas"
        placeholder="Cari program atau deskripsi..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPencegahanKriminalitas search={search} />
    </Box>
  );
}

function ListPencegahanKriminalitas({ search }: { search: string }) {
  const kriminalitasState = useProxy(pencegahanKriminalitasState);
  const router = useRouter();

  const { data, page, totalPages, loading, load } = kriminalitasState.findMany;

  useShallowEffect(() => {
    load(page, 6, search);
  }, [page, search]);

  if (loading || !data) {
    return (
      <Stack py="lg">
        <Skeleton height={300} radius="lg" />
        <Skeleton height={300} radius="lg" />
      </Stack>
    );
  }

  return (
    <Box py="lg">
      <Stack>
        {data.length > 0 ? (
          data.map((item) => (
            <Card
              key={item.id}
              withBorder
              radius="lg"
              shadow="md"
              p="lg"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f9fbff 100%)',
              }}
            >
              <Stack gap="xs">
                <Title order={4} c="blue" style={{ fontWeight: 600 }}>
                  {item.judul}
                </Title>
                <Text
                  fz="sm"
                  c="dimmed"
                  lineClamp={2}
                  dangerouslySetInnerHTML={{ __html: item.deskripsiSingkat || '' }}
                  style={{wordBreak: "break-word", whiteSpace: "normal"}}
                />
                <Group justify="flex-end" mt="sm">
                  <Tooltip label="Lihat detail program" withArrow>
                    <Button
                      size="sm"
                      variant="gradient"
                      gradient={{ from: 'blue', to: 'cyan' }}
                      rightSection={<IconArrowRight size={18} />}
                      onClick={() => router.push(`/darmasaba/keamanan/pencegahan-kriminalitas/${item.id}`)}
                    >
                      Lihat Detail
                    </Button>
                  </Tooltip>
                </Group>
              </Stack>
            </Card>
          ))
        ) : (
          <Paper withBorder radius="lg" p="xl" shadow="sm">
            <Center>
              <Stack align="center" gap="xs">
                <Text fz="lg" fw={500} c="dimmed">
                  Belum ada program pencegahan kriminalitas
                </Text>
                <Text fz="sm" c="dimmed">
                  Program akan ditampilkan di sini ketika tersedia
                </Text>
              </Stack>
            </Center>
          </Paper>
        )}
      </Stack>

      {totalPages > 1 && (
        <Center>
          <Pagination
            value={page}
            onChange={(newPage) => {
              load(newPage, 6, search);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            total={totalPages}
            mt="xl"
            color="blue"
            radius="lg"
          />
        </Center>
      )}
    </Box>
  );
}

export default PencegahanKriminalitas;
