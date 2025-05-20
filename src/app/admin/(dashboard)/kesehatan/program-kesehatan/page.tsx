import colors from '@/con/colors';
import { Box, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import CreateProgramKesehatan from './ui/tambah_program_kesehatan/page';
import ListProgramKesehatan from './ui/list_program_kesehatan/page';

function Page() {
  return (
    <Box>
      <Stack gap={'xs'}>
        <Title order={3}>Program Kesehatan</Title>
        <Tabs defaultValue="create" color={colors['blue-button']} variant='pills'>
          <TabsList mb={10} bg={colors['BG-trans']} p={'xs'}>
            <TabsTab value="create" >
              Tambah Program Kesehatan
            </TabsTab>
            <TabsTab value="list" >
              List Program Kesehatan
            </TabsTab>
          </TabsList>

          <TabsPanel value="create">
            <CreateProgramKesehatan />
          </TabsPanel>

          <TabsPanel value="list">
            <ListProgramKesehatan/>
          </TabsPanel>
        </Tabs>
      </Stack>
    </Box>
  );
}

export default Page;
