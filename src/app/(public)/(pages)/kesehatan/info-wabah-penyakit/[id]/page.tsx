'use client'
import infoWabahPenyakit from '@/app/admin/(dashboard)/_state/kesehatan/info-wabah-penyakit/infoWabahPenyakit';
import t from '@/app/(public)/(pages)/kesehatan/_com/kesehatan-tema.module.css';
import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';
import { Box, Button, Image, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
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
    <Box className={t.tema} py={10} px={{ base: 'md', md: 100 }}>
      {/* Tombol Back */}
      <Box>
        <Button
          variant="subtle"
          onClick={() => router.back()}
          leftSection={<IconArrowBack size={22} color="var(--c-brand)" />}
          mb={15}
        >
          Kembali
        </Button>
      </Box>

      {/* Wrapper Detail */}
      <Paper
        withBorder
        w="100%"
        bg="var(--kt-panel)"
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="lg">
          {/* Judul — H1 */}
          <Title
            order={1}
            fw="bold"
            c="var(--c-brand)"
            ta="center"
          >
            {data.name || 'Kontak Darurat'}
          </Title>

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
          <Stack gap={"xs"}>
            {/* Section Title — H2 */}
            <Title order={3} fw="bold" ta="left">
              Deskripsi
            </Title>
            <Box pl={20}>
              <Text
                fz={{ base: 'sm', md: 'md' }}
                lh={{ base: '1.5', md: '1.6' }}
                c="var(--kt-ink-dark)"
                ta="justify"
                className={rt.root} dangerouslySetInnerHTML={{ __html: data.deskripsiLengkap || '-' }}
                style={{ wordBreak: "break-word", whiteSpace: "normal" }}
              />
            </Box>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

export default DetailInfoWabahPenyakitUser;