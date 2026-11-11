'use client';
import penangananDarurat from '@/app/admin/(dashboard)/_state/kesehatan/penanganan-darurat/penangananDarurat';
import colors from '@/con/colors';
import { Box, Center, Image, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import BackButton from '../../../pemerintahan/layanan/_com/BackButto';

function DetailPenangananDaruratUser() {
  const state = useProxy(penangananDarurat);
  const params = useParams();

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string);
  }, []);

  if (!state.findUnique.data) {
    return (
      <Stack py={40}>
        <Skeleton height={400} radius="md" />
        <Skeleton height={20} width="80%" radius="md" />
        <Skeleton height={20} width="60%" radius="md" />
      </Stack>
    );
  }

  const data = state.findUnique.data;

  return (
    <Box py={20}>
      {/* Tombol Back */}
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      {/* Wrapper Detail */}
      <Box pt={20} px={{ base: 'md', md: 100 }}>
        <Paper
          withBorder
          w={'100%'}
          bg={colors['white-1']}
          p="xl"
          radius="lg"
          shadow="sm"
        >
          <Stack gap="md">
            <Title
              ta={"center"}
              order={1}
              fw={700}
              c={colors['blue-button']}
              style={{ wordBreak: 'break-word' }}
            >
              {data.name || 'Penanganan Darurat'}
            </Title>
            <Center>
              {data.image?.link && (
                <Image
                  src={data.image.link}
                  alt={data.name}
                  radius="md"
                  mah={300}
                  fit="contain"
                  loading="lazy"
                  mb="md"
                />
              )}
            </Center>

            <Box >
              <Text
                ta="justify"
                dangerouslySetInnerHTML={{ __html: data.deskripsi }}
                style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
              />
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default DetailPenangananDaruratUser;