import colors from '@/con/colors';
import { Calendar } from '@mantine/dates';
import { Stack, Box, Container, Text, Grid, Paper, GridCol, Center, SimpleGrid } from '@mantine/core';
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
            Jadwal Rapat
          </Text>
        </Stack>
      </Container>
      <Box px={{ base: 'md', md: 100 }}>
        <Grid>
          <GridCol span={{ base: 12, md: 6, lg: 5, xl: 4 }} >
            <Paper bg={colors['white-1']} p={'md'}>
              <Center>
                <Calendar size='xl' />
              </Center>
            </Paper>
          </GridCol>
          <GridCol span={{ base: 12, md: 6, lg: 7, xl: 8 }} >
            <Paper bg={colors['white-1']} p={'md'}>
              <SimpleGrid
                cols={{
                  base: 1,
                  xl: 3,
              }}
              >
                <Box>
                  <Text fz={'lg'} fw={'bold'} c={colors['blue-button']}>Hari Ini</Text>
                  <Text fz={'lg'} >Senin, 13 Februari 2023</Text>
                  <Text fz={'lg'} >09:00 - 12:00</Text>
                  <Text fz={'lg'} >12:00 - 15:00</Text>
                </Box>
                <Box>
                  <Text fz={'lg'} fw={'bold'} c={colors['blue-button']}>Besok</Text>
                  <Text fz={'lg'} >Selasa, 14 Februari 2023</Text>
                  <Text fz={'lg'} >09:00 - 12:00</Text>
                  <Text fz={'lg'} >12:00 - 15:00</Text>
                </Box>
                <Box>
                  <Text fz={'lg'} fw={'bold'} c={colors['blue-button']}>Minggu Depan</Text>
                  <Text fz={'lg'} >Senin, 20 Februari 2023</Text>
                  <Text fz={'lg'} >09:00 - 12:00</Text>
                  <Text fz={'lg'} >12:00 - 15:00</Text>
                </Box>
              </SimpleGrid>
            </Paper>
          </GridCol>
        </Grid>
      </Box>
    </Stack>
  );
}

export default Page;
