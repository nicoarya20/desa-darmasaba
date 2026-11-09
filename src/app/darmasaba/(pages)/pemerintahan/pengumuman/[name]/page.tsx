'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import stateDesaPengumuman from '@/app/admin/(dashboard)/_state/desa/pengumuman';
import colors from '@/con/colors';
import { Box, Button, Center, Container, Group, Pagination, Paper, Stack, Text, Title } from '@mantine/core';
import { IconArrowRight, IconCalendar } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import { useTransitionRouter } from 'next-view-transitions';
import BackButton from '../../layanan/_com/BackButto';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const LIMIT_PER_PAGE = 5;

function Page() {
  const router = useTransitionRouter();
  const unwrappedParams = useParams();
  const kategoriState = useProxy(stateDesaPengumuman);
  const categoryName = decodeURIComponent(unwrappedParams.name as string);
  const [page, setPage] = useState(1);
  const totalPages = kategoriState.pengumuman.findMany.totalPages || 1;

  // Reset ke halaman 1 saat kategori berganti
  useEffect(() => {
    setPage(1);
  }, [categoryName]);

  useEffect(() => {
    kategoriState.category.findUnique.load(categoryName);
    kategoriState.pengumuman.findMany.load(page, LIMIT_PER_PAGE, '', categoryName);
  }, [categoryName, page]);

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="md">
      {/* Header */}
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>

      <Container size="lg" px="md">
        <Stack align="center" gap="xs">
          <Title
            order={1}
            c={colors["blue-button"]}
            ta="center"
            style={{ fontWeight: 'bold' }}
          >
            {categoryName.split('-').map(word =>
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </Title>
          <Text
            ta="center"
            px="md"
            pb="sm"
            fz={{ base: 'sm', md: 'md' }}
            lh={{ base: 1.5, md: 1.6 }}
            c="dimmed"
          >
            Informasi dan pengumuman resmi terkait {categoryName.split('-').join(' ')}
          </Text>
        </Stack>
      </Container>

      <Box px={{ base: 'md', md: 100 }}>
        {!kategoriState.pengumuman.findMany.data?.length ? (
          <Paper p="lg" radius="md" shadow="md" bg={colors["white-1"]}>
            <Text
              fz={{ base: 'sm', md: 'md' }}
              ta="center"
              c="dimmed"
            >
              Tidak ada pengumuman yang ditemukan
            </Text>
          </Paper>
        ) : (
          kategoriState.pengumuman.findMany.data?.map((v, k) => (
            <Paper
              mb="md"
              key={k}
              withBorder
              p="lg"
              radius="md"
              shadow="md"
              bg={colors["white-1"]}
            >
              <Title order={3}>{v.judul}</Title>
              <Group style={{ color: 'black' }} pb="sm">
                <Group gap="xs">
                  <IconCalendar size={18} />
                  <Text
                    fz={{ base: 'xs', md: 'sm' }}
                    lh={{ base: 1.4, md: 1.5 }}
                  >
                    {v.createdAt
                      ? new Date(v.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'No date available'}
                  </Text>
                </Group>
              </Group>
              <Text
                ta="justify"
                fz={{ base: 'sm', md: 'md' }}
                lh={{ base: 1.6, md: 1.7 }}
                lineClamp={3}
                style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                dangerouslySetInnerHTML={{ __html: v.deskripsi }}
              />
              <Group justify="flex-end" mt="md">
                <Button
                  variant="light"
                  color={colors['blue-button']}
                  rightSection={<IconArrowRight size={16} />}
                  onClick={() =>
                    router.push(`/darmasaba/pemerintahan/pengumuman/${categoryName}/${v.id}`)
                  }
                >
                  Baca Selengkapnya
                </Button>
              </Group>
            </Paper>
          ))
        )}

        {totalPages > 1 && (
          <Center mt="xl">
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
              siblings={1}
              boundaries={1}
              withEdges
              color={colors['blue-button']}
              fz={{ base: 'xs', md: 'sm' }}
            />
          </Center>
        )}
      </Box>
    </Stack>
  );
}

export default Page;