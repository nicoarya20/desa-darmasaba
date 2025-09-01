'use client'
import profileLandingPageState from '@/app/admin/(dashboard)/_state/landing-page/profile';
import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Badge, Box, Image, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconSparkles } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function Page() {
  const params = useParams();
  const id = params?.id as string;
  const state = useProxy(profileLandingPageState.programInovasi);

  const { data } = state.findUnique;

  useShallowEffect(() => {
    if (id) {
      state.findUnique.load(id);
    }
  }, [id]);

  if (!data) {
    return (
      <Box p="xl">
        <Skeleton h={400} radius="lg" />
        <Skeleton mt="md" h={30} radius="sm" />
        <Skeleton mt="sm" h={20} w="80%" radius="sm" />
      </Box>
    );
  }

  return (
    <Stack bg={colors.Bg} py="xl" gap="xl">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Paper
        shadow="sm"
        radius="xl"
        p={{ base: 'md', md: 'xl' }}
        mx="auto"
        w="100%"
        maw={1000}
        bg="white"
        style={{ border: '1px solid var(--mantine-color-gray-2)' }}
      >
        <Stack align="center" gap="md">
          <Badge
            leftSection={<IconSparkles size={16} />}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
            size="lg"
            radius="lg"
          >
            Program Inovasi
          </Badge>
          <Title
            order={1}
            fz={{ base: '2rem', md: '2.8rem' }}
            fw={800}
            ta="center"
            style={{ lineHeight: 1.3 }}
          >
            {data?.name}
          </Title>

          {data.image && (
            <Image
              src={data.image?.link}
              alt={data.name}
              fit="contain"
              mah={400}
              maw="80%"
              radius="lg"
              style={{
                boxShadow: '0 0 25px rgba(0, 190, 255, 0.25)',
              }}
            />
          )}

          <Text
            fz={{ base: 'md', md: 'lg' }}
            c="dimmed"
            mt="sm"
            lh={1.7}
            dangerouslySetInnerHTML={{ __html: data?.description || '-' }}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}

export default Page;
