import { Box, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import ListPage from './ui/list_page/listPage';
import colors from '@/con/colors';

function PengelolaanSampahBankSampah() {
  return (
    <Box>
      <Stack>
        <Title order={3}>Pengelolaan Sampah Bank Sampah</Title>
        <Tabs defaultValue="list" color={colors['blue-button']} variant="pills">
          <TabsList p={"xs"} bg={"#BBC8E7FF"}>
            <TabsTab value="list">
              List Pengelolaan Sampah Bank Sampah
            </TabsTab>
            <TabsTab value="maps">
              Maps
            </TabsTab>
          </TabsList> 

          <TabsPanel value="list">
            <ListPage />
          </TabsPanel>

          <TabsPanel value="maps">
            Maps
          </TabsPanel>
        </Tabs>
      </Stack>
    </Box>
  )
}

export default PengelolaanSampahBankSampah;
