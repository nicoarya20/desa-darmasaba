'use client'
import kontakDarurat from '@/app/admin/(dashboard)/_state/kesehatan/kontak-darurat/kontakDarurat';
import colors from '@/con/colors';
import { Box, Button, Group, Image, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconBrandWhatsapp } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function Page() {
  const state = useProxy(kontakDarurat);
  const router = useRouter();
  const params = useParams();

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string);
  }, []);

  if (!state.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = state.findUnique.data;

  return (
    <Box px={{ base: 'md', md: 100 }} py={10}>
      {/* Tombol Back */}
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
        style={{ lineHeight: 1.2 }}
      >
        <Text fz={{ base: 'sm', md: 'md' }} fw={500}>Kembali</Text>
      </Button>

      {/* Wrapper Detail */}
      <Paper
        withBorder
        w="100%"
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Title order={1} c={colors['blue-button']}>
            Detail Kontak Darurat
          </Title>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Title order={3}>Judul</Title>
                <Text fz={{ base: 'sm', md: 'md' }} c={data.name ? 'black' : 'dimmed'}>
                  {data.name || '-'}
                </Text>
              </Box>

              <Box>
                <Title order={3}>Whatsapp</Title>
                <Text fz={{ base: 'sm', md: 'md' }} c={data.whatsapp ? 'black' : 'dimmed'}>
                  {data.whatsapp || '-'}
                </Text>
              </Box>

              <Box>
                <Title order={3}>Deskripsi</Title>
                <Text
                  fz={{ base: 'sm', md: 'md' }}
                  c={data.deskripsi ? 'black' : 'dimmed'}
                  dangerouslySetInnerHTML={{ __html: data.deskripsi || '-' }}
                  style={{ wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: 1.5 }}
                />
              </Box>

              <Box>
                <Title order={3}>Gambar</Title>
                {data.image?.link ? (
                  <Image
                    src={data.image.link}
                    alt="gambar"
                    radius="md"
                    maw={300}
                    loading="lazy"
                  />
                ) : (
                  <Text fz={{ base: 'sm', md: 'md' }} c="dimmed">-</Text>
                )}
              </Box>

              <Group>
                <Button
                  variant="light"
                  leftSection={<IconBrandWhatsapp size={18} />}
                  component="a"
                  href={`https://wa.me/${data.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  aria-label="Hubungi WhatsApp"
                  fz={{ base: 'sm', md: 'md' }}
                >
                  WhatsApp
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Page;