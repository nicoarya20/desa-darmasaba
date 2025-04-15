import colors from '@/con/colors';
import { Box, Container, Grid, GridCol, Group, Stack, Tabs, TabsList, TabsPanel, TabsTab, Text, TextInput } from '@mantine/core';
import { IconPhoto, IconSearch, IconVideo } from '@tabler/icons-react';
import BackButton from '../layanan/_com/BackButto';
import Foto from './(tabs)/foto';
import Video from './(tabs)/video';


function Page() {
  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="md">
      {/* Header */}
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container size="lg" px="md">
        <Stack align="center" gap="xs" mb="xl">
          <Text fz={{ base: "2rem", md: "3.4rem" }} c={colors["blue-button"]} fw="bold" ta="center">
            Galeri Kegiatan Desa Darmasaba
          </Text>
        </Stack>
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Tabs color={colors['blue-button']} defaultValue="foto">
          <Grid>
            <GridCol span={{ base: 12, md: 9, lg: 8, xl: 9 }}>
              <Group>
                <TabsList>
                  <TabsTab style={{ color: colors['blue-button'] }} fz={"xl"} value="foto" leftSection={<IconPhoto color={colors['blue-button']} size={45} />}>
                    Foto
                  </TabsTab>
                  <TabsTab style={{ color: colors['blue-button'] }} fz={"xl"} value="video" leftSection={<IconVideo color={colors['blue-button']} size={45} />}>
                    Video
                  </TabsTab>
                </TabsList>
              </Group>
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

          <TabsPanel value="foto">
            <Foto />
          </TabsPanel>

          <TabsPanel value="video">
            <Video />
          </TabsPanel>

        </Tabs>

      </Box>
    </Stack>
  );
}

export default Page;
