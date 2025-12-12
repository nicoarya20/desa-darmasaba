'use client'
import artikelKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import colors from '@/con/colors';
import { Box, Button, Card, Divider, Group, Image, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconCalendar, IconChevronRight } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function ArtikelKesehatanPage() {
  const state = useProxy(artikelKesehatanState)
  const router = useRouter()

  useShallowEffect(() => {
    state.findMany.load()
  }, [])

  if (!state.findMany.data) {
    return (
      <Box py="lg">
        <Skeleton h={500} radius="lg" />
      </Box>
    )
  }

  return (
    <Box>
      <Paper p="xl" bg={colors['white-trans-1']} radius="xl" shadow="md">
        <Stack gap="lg">
          <Title ta="center" order={1} c={colors['blue-button']}>
            Artikel Kesehatan
          </Title>
          <Divider size="sm" color={colors['blue-button']} />
          {state.findMany.data.length === 0 ? (
            <Box py="xl" ta="center">
              <Text fz={{ base: 'sm', sm: 'md' }} c="dimmed">
                Belum ada artikel kesehatan yang tersedia
              </Text>
            </Box>
          ) : (
            state.findMany.data.map((item) => (
              <Card
                key={item.id}
                withBorder
                radius="lg"
                shadow="sm"
                p="lg"
                style={{ transition: 'transform 200ms ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <Card.Section>
                  <Image
                    style={{ borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }}
                    src={item.image?.link}
                    alt={item.title}
                    height={200}
                    fit="cover"
                    loading="lazy"
                  />
                </Card.Section>
                <Stack gap="xs" mt="md">
                  <Title order={3} c={colors['blue-button']}>
                    {item.title}
                  </Title>
                  <Group gap="xs">
                    <IconCalendar size={16} color='gray' />
                    <Text fz={{ base: 'xs', sm: 'sm' }} c="dimmed">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} • Dinas Kesehatan
                    </Text>
                  </Group>
                  <Text fz={{ base: 'sm', sm: 'md' }} lh={{ base: 'sm', sm: 'md' }} lineClamp={3}>
                    {item.content}
                  </Text>
                  <Group justify="flex-start">
                    <Button
                      bg={colors['blue-button']}
                      radius="lg"
                      size="sm"
                      rightSection={<IconChevronRight size={18} />}
                      onClick={() => router.push(`/darmasaba/kesehatan/data-kesehatan-warga/artikel-kesehatan-page/${item.id}`)}
                    >
                      Baca Selengkapnya
                    </Button>
                  </Group>
                </Stack>
              </Card>
            ))
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

export default ArtikelKesehatanPage;