'use client'
import stateDesaPengumuman from '@/app/admin/(dashboard)/_state/desa/pengumuman';
import colors from '@/con/colors';
import { Box, Container, Group, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';

import NewsReader from '@/app/darmasaba/_com/NewsReader';
import BackButton from '../../../layanan/_com/BackButto';

function Page() {
  const detail = useProxy(stateDesaPengumuman.pengumuman.findUnique);
  const params = useParams();
  
  useShallowEffect(() => {
    stateDesaPengumuman.pengumuman.findUnique.load(params?.id as string);
  }, []);
  
  if (!detail.data) {
    return (
      <Box>
        <Skeleton h={400} />
      </Box>
    );
  }
  
  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="md">
      {/* Header */}
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      
      <Container size="lg" px="md">
        <Group>
          <NewsReader />
        </Group>
        
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start" wrap="wrap">
            <Title
              order={1}
              c={colors['blue-button']}
              fz={{ base: 28, md: 36 }}
              style={{ 
                wordBreak: 'break-word',
                flex: '1 1 auto',
                minWidth: 0
              }}
            >
              {detail.data?.judul}
            </Title>
            <Paper bg={colors['blue-button']} p={8} style={{ flexShrink: 0 }}>
              <Text c={colors['white-1']} fz={{ base: 'xs', md: 'sm' }} lh={1.2}>
                {detail.data?.CategoryPengumuman?.name}
              </Text>
            </Paper>
          </Group>
          
          <Paper 
            bg={colors['white-1']} 
            p="md"
            w="100%"
            mih={{ base: 200, md: 300 }}
          >
            <Text
              px="lg"
              id="news-content"
              fz={{ base: 14, md: 16 }}
              lh={{ base: 1.6, md: 1.6 }}
              style={{ 
                wordBreak: 'break-word', 
                whiteSpace: 'normal',
                width: '100%'
              }}
              dangerouslySetInnerHTML={{ __html: detail.data?.content }}
            />
            <Text
              px="lg"
              fz={{ base: 12, md: 14 }}
              c={colors['blue-button']}
              fw="bold"
              lh={{ base: 1.4, md: 1.4 }}
              mt="md"
            >
              {new Date(detail.data?.createdAt).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </Paper>
        </Stack>
      </Container>
    </Stack>
  );
}

export default Page;