/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import { Box, Card, Center, Group, Image, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function MaskotDesa() {
  const state = useProxy(stateProfileDesa.maskotDesa);

  useEffect(() => {
    state.findUnique.load('edit');
  }, []);

  const { data, loading } = state.findUnique;

  if (loading || !data) {
    return (
      <Center mih={500}>
        <Stack align="center" gap="sm">
          <Loader size="lg" color="blue" />
          <Text c="dimmed" fz={{ base: 'xs', md: 'sm' }}>
            Sedang memuat data maskot desa...
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box>
      <Stack align="center" gap="xl">
        <Stack align="center" gap={10}>
          <Image
            src="/pudak-icon.png"
            alt="Ikon Desa"
            w={{ base: 160, md: 240 }}
            loading="lazy"
          />

          {/* Page Title */}
          <Title
            order={1}
            ta="center"
            c={colors['blue-button']}
          >
            Maskot Desa
          </Title>
        </Stack>

        <Paper
          p={{ base: 'md', md: 'xl' }}
          radius="lg"
          shadow="sm"
          withBorder
          style={{ background: 'linear-gradient(145deg, #ffffff, #f8f9fa)' }}
        >
          {/* Body Description */}
          <Text
            fz={{ base: 'sm', md: 'lg' }}
            lh={1.7}
            ta="justify"
            c="dark"
            dangerouslySetInnerHTML={{ __html: data.deskripsi }}
            style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
          />

          <Group justify="center" gap="lg" mt="lg">
            {data.images.length > 0 ? (
              data.images.map((img, index) => (
                <Card
                  key={index}
                  radius="lg"
                  shadow="md"
                  withBorder
                  w={220}
                  p="sm"
                  style={{
                    transition: 'transform 200ms ease, box-shadow 200ms ease',
                  }}
                  className="hover:scale-105 hover:shadow-lg"
                >
                  <Image
                    src={img.image?.link || '/no-image.jpg'}
                    alt={img.label}
                    w="100%"
                    h={200}
                    fit="cover"
                    radius="md"
                    loading="lazy"
                  />

                  {/* Image Label */}
                  <Text
                    ta="center"
                    mt="sm"
                    fw={600}
                    fz={{ base: 'xs', md: 'sm' }}
                    c="dark"
                  >
                    {img.label}
                  </Text>
                </Card>
              ))
            ) : (
              <Stack align="center" gap="xs" mt="lg">
                <IconPhoto size={48} stroke={1.5} color="gray" />
                
                <Text c="dimmed" fz={{ base: 'xs', md: 'sm' }}>
                  Belum ada gambar maskot yang ditambahkan
                </Text>
              </Stack>
            )}
          </Group>
        </Paper>
      </Stack>
    </Box>
  );
}

export default MaskotDesa;
