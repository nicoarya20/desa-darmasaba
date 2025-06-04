import colors from '@/con/colors';
import { Box, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import { IconPhoto, IconVideo } from '@tabler/icons-react';
import Foto from './foto/page';
import Video from './video/page';

function Gallery() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <Title order={3}>Gallery</Title>
        <Tabs color={colors['blue-button']} variant="pills" defaultValue="foto">
          <TabsList p={"xs"} bg={"#BBC8E7FF"}>
            <TabsTab value="foto" leftSection={<IconPhoto size={12} />}>
              Foto
            </TabsTab>
            <TabsTab value="video" leftSection={<IconVideo size={12} />}>
              Video
            </TabsTab>
          </TabsList>

          <TabsPanel value="foto">
            <Foto/>
          </TabsPanel>

          <TabsPanel value="video">
            <Video/>
          </TabsPanel>
        </Tabs>
      </Stack>
    </Box>
  );
}

export default Gallery;
