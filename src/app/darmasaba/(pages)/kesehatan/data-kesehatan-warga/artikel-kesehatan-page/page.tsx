'use client'
import artikelKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import colors from '@/con/colors';
import { Anchor, Box, Card, Divider, Group, Image, Loader, Paper, Stack, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconCalendar, IconChevronRight } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function ArtikelKesehatanPage() {
  const state = useProxy(artikelKesehatanState)
  const router = useRouter()

  useShallowEffect(()=> {
    state.findMany.load()
  }, [])

  if(!state.findMany.data){
    return (
      <Box py="xl" ta="center">
        <Loader size="lg" color={colors['blue-button']} />
        <Text mt="md" c="dimmed" fz="md">Memuat artikel kesehatan...</Text>
      </Box>
    )
  }

  if(state.findMany.data.length === 0){
    return (
      <Box py="xl" ta="center">
        <Image src="/empty-state.svg" alt="Tidak ada data" w={220} mx="auto" />
        <Text mt="md" fw="bold" fz="lg">Belum ada artikel kesehatan</Text>
        <Text c="dimmed" fz="sm">Artikel akan tampil di sini setelah tersedia.</Text>
      </Box>
    )
  }

  return (
    <Box>
      <Paper p="xl" bg={colors['white-trans-1']} radius="xl" shadow="md">
        <Stack gap="xl">
          <Title order={2} ta="center" c={colors['blue-button']}>Artikel Kesehatan</Title>
          <Divider color={colors['blue-button']} />
          <Stack gap="lg">
            {state.findMany.data.map((item) => (
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
                  <Image src={'/api/img/dbd.png'} alt={item.title} height={200} fit="cover" />
                </Card.Section>
                <Stack gap="xs" mt="md">
                  <Text fw="bold" fz="xl" c="dark">{item.title}</Text>
                  <Group gap="xs">
                    <IconCalendar size={16} color={colors['blue-button']} />
                    <Text fz="sm" c="dimmed">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} • Dinas Kesehatan
                    </Text>
                  </Group>
                  <Text fz="md" c="dark" lineClamp={3}>
                    {item.content}
                  </Text>
                  <Tooltip label="Baca artikel lengkap">
                    <Anchor 
                      onClick={()=> router.push(`/darmasaba/kesehatan/data-kesehatan-warga/artikel-kesehatan-page/${item.id}`)} 
                      variant="light" 
                      c={colors['blue-button']}
                    >
                      <Group gap="xs">
                        <Text fw="bold" fz="md">Baca Selengkapnya</Text>
                        <IconChevronRight size={18} />
                      </Group>
                    </Anchor>
                  </Tooltip>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

export default ArtikelKesehatanPage;
