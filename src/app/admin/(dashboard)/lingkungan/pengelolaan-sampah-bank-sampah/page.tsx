import { Box, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';

import colors from '@/con/colors';
import ListPengelolaanSampahBankSampah from './list_pengelolaan_sampah_bank_sampah/page';
import KeteranganBankSampahTerdekat from './keterangan_bank_sampah_terdekat/page';


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
              Keterangan Bank Sampah Terdekat
            </TabsTab>
          </TabsList>

          <TabsPanel value="list">
            <ListPengelolaanSampahBankSampah />
          </TabsPanel>

          <TabsPanel value="maps">
            <KeteranganBankSampahTerdekat />
          </TabsPanel>
        </Tabs>
      </Stack>
    </Box>
  )
}

export default PengelolaanSampahBankSampah;
