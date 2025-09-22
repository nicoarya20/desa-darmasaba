import colors from '@/con/colors';
import { Stack, Box, Container, Grid, GridCol, Group, Paper, TextInput, Text, Image, Flex, Button } from '@mantine/core';
import { IconCalendar, IconMapPin, IconSearch, IconUsersGroup } from '@tabler/icons-react';
import React from 'react';

import Link from 'next/link';

function Page() {
  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="md">
      {/* Header */}
      <Container size="lg" px="md">
        <Stack align="center" gap={0} mb="xl">
          <Text fz={{ base: "2rem", md: "3.4rem" }} c={colors["blue-button"]} fw="bold" ta="center">
            Program Gotong Royong
          </Text>
          <Text fz={{ base: "2rem", md: "3.4rem" }} c={colors["blue-button"]} fw="bold" ta="center">
            Desa Darmasaba
          </Text>
        </Stack>
      </Container>

      {/* Tabs Menu */}
      <Box px={{ base: "md", md: "xl" }} py="md" bg={colors['BG-trans']} mb="md">
        <Grid align="center" justify="space-between" mb={20}>
          <GridCol span={{ base: 12, md: 8 }}>
            <Group gap="md" wrap="wrap">
              <Paper bg={colors['blue-button']} radius="xl" py={5} px={20}>
                <Text c={colors['white-1']} size="sm">
                  Semua
                </Text>
              </Paper>
              {['Kebersihan', 'Infrastruktur', 'Sosial', 'Lingkungan'].map((kategori) => (
                <Paper key={kategori} bg={colors['blue-button-trans']} radius="xl" py={5} px={20}>
                  <Text size="sm">
                    {kategori}
                  </Text>
                </Paper>
              ))}
            </Group>
          </GridCol>
          <GridCol span={{ base: 12, md: 4 }}>
            <TextInput
              radius="lg"
              placeholder="Cari Program Gotong Royong"
              leftSection={<IconSearch size={18} />}
              w="100%"
            />
          </GridCol>
        </Grid>
        <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
          <Stack gap={'xs'}>
            <Image radius={20} src={'/api/img/gotong-royong.png'} w={'100%'} alt='' />
            <Text fw={"bold"} fz={{ base: "h2", md: "h1" }}>Membangun Fasilitas Desa</Text>
            <Group>
              <Paper py={5} px={20} bg={colors['blue-button-trans']} radius={20}>
                <Text c={colors['white-1']}>Sosial</Text>
              </Paper>
            </Group>
            <Text fz={{ base: "h4", md: "h3" }}>
              Program Pembangunan Fasilitas Desa Maju, Masyarakat Sejahtera.
            </Text>
            <Flex gap={5} align={'center'}>
              <IconCalendar color={colors['blue-button-trans']} size={45} />
              <Text fz={{ base: "h4", md: "h3" }}>1 April 2025</Text>
            </Flex>
            <Flex gap={5} align={'center'}>
              <IconMapPin color={colors['blue-button-trans']} size={45} />
              <Text fz={{ base: "h4", md: "h3" }}>Banjar Desa Darmasaba</Text>
            </Flex>
            <Flex gap={5} align={'center'}>
              <IconUsersGroup color={colors['blue-button-trans']} size={45} />
              <Text fz={{ base: "h4", md: "h3" }}>30 Partisipan</Text>
            </Flex>
            <Text fw={'bold'} fz={'md'}>Deskripsi : Program pembangunan Pura sebagai pusat spiritual dan budaya desa, melibatkan gotong royong masyarakat dalam pembangunan struktur utama serta ornamen tradisional.</Text>
            <Group py={20} justify='center'>
              <Button component={Link} href={'https://www.whatsapp.com/?lang=id'} bg={colors['blue-button']} >Daftar Sebagai Relawan</Button>
            </Group>
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
}

export default Page;
