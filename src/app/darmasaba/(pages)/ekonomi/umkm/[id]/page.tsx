'use client'
import umkmState from '@/app/admin/(dashboard)/_state/ekonomi/umkm/umkm';
import colors from '@/con/colors';
import { Box, Card, Flex, Grid, GridCol, Image, Skeleton, Stack, Text, Title, Badge, SimpleGrid, Group, Divider, Button, Center } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconBrandWhatsapp, IconMapPinFilled, IconUser } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import BackButton from '../../../pemerintahan/layanan/_com/BackButto';
import { perSatuanSuffix } from '../_lib/satuan';

function Page() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const state = useProxy(umkmState.umkm.findUnique);

  useShallowEffect(() => {
    if (id) state.load(id);
  }, [id]);

  if (state.loading || !state.data) {
    return (
      <Stack py={10} px={{ base: 'md', md: 100 }}>
        <Skeleton h={400} radius="md" />
      </Stack>
    );
  }

  const u = state.data;

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <Grid gap="xl">
          <GridCol span={{ base: 12, md: 4 }}>
            <Image
              radius="lg"
              src={u.image?.link || '/no-image.jpg'}
              alt={u.nama}
              w="100%"
              fallbackSrc="/no-image.jpg"
            />
          </GridCol>
          <GridCol span={{ base: 12, md: 8 }}>
            <Stack gap="xs">
              <Badge size="lg" variant="light" color="blue">{u.kategori?.nama}</Badge>
              <Title order={1} fw="bold" c={colors['blue-button']}>{u.nama}</Title>
              <Group gap="xl" mt="sm">
                <Flex align="center" gap="xs">
                  <IconUser size={20} color="gray" />
                  <Text fw={500}>{u.pemilik}</Text>
                </Flex>
                <Flex align="center" gap="xs">
                  <IconMapPinFilled size={20} color="red" />
                  <Text>{u.alamat || 'Desa Darmasaba'}</Text>
                </Flex>
              </Group>
              <Divider my="md" />
              <Text ta="justify" lh={1.6}>{u.deskripsi || 'Tidak ada deskripsi tersedia.'}</Text>
              {u.kontak && (
                <Button 
                  mt="md"
                  leftSection={<IconBrandWhatsapp size={20} />}
                  color="green"
                  radius="md"
                  component="a"
                  href={`https://wa.me/${u.kontak?.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                  target="_blank"
                  w="fit-content"
                >
                  Hubungi Pemilik
                </Button>
              )}
            </Stack>
          </GridCol>
        </Grid>
      </Box>

      <Box px={{ base: 'md', md: 100 }} mt={40}>
        <Title order={2} mb="xl">Katalog Produk</Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
          {u.produk?.map((p: any, k: number) => (
            <Card 
              key={k} 
              withBorder 
              padding="lg" 
              radius="md" 
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(`/darmasaba/ekonomi/umkm/produk/${p.id}`)}
            >
              <Card.Section>
                <Image
                  src={p.image?.link || '/no-image.jpg'}
                  height={160}
                  alt={p.nama}
                  fallbackSrc="/no-image.jpg"
                />
              </Card.Section>
              <Group justify="space-between" mt="md" mb="xs">
                <Text fw={700} lineClamp={1}>{p.nama}</Text>
                <Badge color={p.stok > 0 ? 'green' : 'red'}>
                  {p.stok > 0 ? 'Tersedia' : 'Habis'}
                </Badge>
              </Group>
              <Text size="lg" fw={700} c="blue">
                Rp {p.harga.toLocaleString('id-ID')}
                <Text component="span" fz="xs" fw={500} c="dimmed">
                  {perSatuanSuffix(p.satuan)}
                </Text>
              </Text>
              <Text size="sm" c="dimmed" mt="sm" lineClamp={2}>
                {p.deskripsi || 'Kualitas terbaik dari UMKM lokal.'}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
        {(!u.produk || u.produk.length === 0) && (
          <Center py={40}>
            <Text c="dimmed">Belum ada produk dari UMKM ini</Text>
          </Center>
        )}
      </Box>
    </Stack>
  );
}

export default Page;
