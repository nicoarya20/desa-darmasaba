import colors from '@/con/colors';
import { Box, Container, Grid, GridCol, Stack, Tabs, TabsList, TabsPanel, TabsTab, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import BackButton from '../layanan/_com/BackButto';
import Budaya from './(tabs)/budaya';
import Ekonomi from './(tabs)/ekonomi';
import Pemerintahan from './(tabs)/pemerintahan';
import Semua from './(tabs)/semua';
import Sosial from './(tabs)/sosial';
import Teknologi from './(tabs)/teknologi';
import Pembangunan from './(tabs)/pembangunan';


function Page() {
  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      {/* Header */}
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container size="lg" px="md">
        <Stack align="center" gap="0" >
          <Text fz={{ base: "2rem", md: "3.4rem" }} c={colors["blue-button"]} fw="bold" ta="center">
            Portal Berita Darmasaba
          </Text>
          <Text ta="center" px="md">
            Temukan berbagai potensi dan keunggulan yang dimiliki Desa Darmasaba
          </Text>
        </Stack>
      </Container>

      {/* Tabs Menu */}
      <Tabs color={colors['blue-button']} variant="pills" defaultValue="semua">
        <Box px={{ base: "md", md: 100 }} py="md" bg={colors['BG-trans']} >
          <Grid>
            <GridCol span={{ base: 12, md: 9, lg: 8, xl: 9 }}>
              <TabsList>
                <TabsTab value="semua">
                  Semua
                </TabsTab>
                <TabsTab value="pemerintahan">
                  Pemerintahan
                </TabsTab>
                <TabsTab value="pembangunan" >
                  Pembangunan
                </TabsTab>
                <TabsTab value="ekonomi" >
                  Ekonomi
                </TabsTab>
                <TabsTab value="sosial" >
                  Sosial
                </TabsTab>
                <TabsTab value="budaya" >
                  Budaya
                </TabsTab>
                <TabsTab value="teknologi" >
                  Teknologi
                </TabsTab>
              </TabsList>
            </GridCol>
            <GridCol span={{ base: 12, md: 3, lg: 4, xl: 3 }}>
              <TextInput
                w={{ base: "100%", md: "100%" }}
                radius="lg"
                placeholder="Cari Berita"
                leftSection={<IconSearch size={18} />}
              />
            </GridCol>
          </Grid>
        </Box>

        <TabsPanel value='semua'>
          <Semua />
        </TabsPanel>
        <TabsPanel value='pemerintahan'>
          <Pemerintahan />
        </TabsPanel>
        <TabsPanel value="pembangunan" >
          <Pembangunan />
        </TabsPanel>
        <TabsPanel value="ekonomi" >
          <Ekonomi />
        </TabsPanel>
        <TabsPanel value="sosial" >
          <Sosial />
        </TabsPanel>
        <TabsPanel value="budaya" >
          <Budaya />
        </TabsPanel>
        <TabsPanel value="teknologi" >
          <Teknologi />
        </TabsPanel>

      </Tabs>



    </Stack>
  );
}

export default Page;
