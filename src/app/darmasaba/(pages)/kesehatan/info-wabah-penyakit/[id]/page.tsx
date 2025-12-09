'use client'
import infoWabahPenyakit from '@/app/admin/(dashboard)/_state/kesehatan/info-wabah-penyakit/infoWabahPenyakit';
import colors from '@/con/colors';
import { Box, Button, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';


function DetailInfoWabahPenyakitUser() {
  const state = useProxy(infoWabahPenyakit);
  const router = useRouter();
  const params = useParams();

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string);
  }, []);

  if (!state.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={400} radius="md" />
      </Stack>
    );
  }

  const data = state.findUnique.data;

  return (
    <Box py={10} px={{ base: 'md', md: 100 }}>
      {/* Tombol Back */}
      <Box>
        <Button
          variant="subtle"
          onClick={() => router.back()}
          leftSection={<IconArrowBack size={22} color={colors['blue-button']} />}
          mb={15}
        >
          Kembali
        </Button>
      </Box>

      {/* Wrapper Detail */}
      <Paper
        withBorder
        w="100%"
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="lg">
          {/* Judul */}
          <Text fz="xl" fw="bold" c={colors['blue-button']} ta="center">
            {data.name || 'Kontak Darurat'}
          </Text>

          {/* Gambar */}
          {data.image?.link && (
            <Image
              src={data.image.link}
              alt={data.name}
              radius="md"
              maw={400}
              mx="auto"
              loading="lazy"
            />
          )}

          {/* Deskripsi */}
          <Box>
            <Text fz="lg" fw="bold">Deskripsi</Text>
            <Box pl={20}>
              <Text
                fz="md"
                dangerouslySetInnerHTML={{ __html: data.deskripsiLengkap || '-' }}
                style={{ wordBreak: "break-word", whiteSpace: "normal" }}
              />
            </Box>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export default DetailInfoWabahPenyakitUser;
