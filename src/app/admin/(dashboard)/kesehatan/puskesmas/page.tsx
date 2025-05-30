import colors from '@/con/colors';
import { Box, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import UpdatePuskesmas from './ui/Edit-Puskesmas/updatePuskesmas';
import CreatePuskesmas from './ui/Tambah-Puskesmas/createPuskesmas';

function Puskesmas() {
  return (
    <Stack gap={"xs"}>
      <Box>
        <Title order={3}>Puskesmas</Title>
        <Tabs defaultValue="create" color={colors['blue-button']} variant='pills'>
          <TabsList mb={10} bg={colors['BG-trans']} p={'xs'}>
            <TabsTab value="create" >
              Tambah Puskesmas
            </TabsTab>
            <TabsTab value="update" >
              Edit Puskesmas
            </TabsTab>
          </TabsList>

          <TabsPanel value="create">
            <CreatePuskesmas />
          </TabsPanel>

          <TabsPanel value="update">
            <UpdatePuskesmas />
          </TabsPanel>
        </Tabs>
      </Box>
    </Stack>
  );
}

export default Puskesmas;
