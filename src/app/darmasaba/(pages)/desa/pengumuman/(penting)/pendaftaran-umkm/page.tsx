import colors from '@/con/colors';
import { Stack, Box, Container, Text, Image, Grid, GridCol, Paper, TextInput, Center, Button } from '@mantine/core';
import React from 'react';
import BackButton from '../../../layanan/_com/BackButto';

function Page() {
  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="md">
      {/* Header */}
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container size="lg" px="md" >
        <Stack gap="0" >
          <Text fz={{ base: "2rem", md: "3.4rem" }} c={colors["blue-button"]} fw="bold" >
            Pendaftaran UMKM
          </Text>
        </Stack>
      </Container>
      <Box px={{ base: 'md', md: 100 }}>
        <Grid>
          <GridCol span={{ base: 12, md: 6, lg: 7, xl: 8 }}>
            <Center>
              <Image src={'/api/img/market.png'} w={{ base: 300, md: 500, lg: 530, xl: 550 }} alt='' />
            </Center>
          </GridCol>
          <GridCol span={{ base: 12, md: 6, lg: 5, xl: 4 }}>
            <Paper bg={colors['white-1']} p={'md'} h={'500'}>
              <Text ta={'center'} fz={{ base: "1.5rem", md: "2rem" }} c={colors["blue-button"]} fw="bold" >
                Pendaftaran UMKM
              </Text>
              <Stack pt={20}>
                <TextInput placeholder='Nama Lengkap' />
                <TextInput placeholder='Alamat' />
                <TextInput placeholder='No. Telepon' />
                <TextInput placeholder='Email' />
                <TextInput placeholder='Nama UMKM' />
                <Button bg={colors['blue-button']} fullWidth>Daftar Sekarang</Button>
              </Stack>
            </Paper>

          </GridCol>
        </Grid>
      </Box>
    </Stack>
  );
}

export default Page;
