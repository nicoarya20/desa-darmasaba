import colors from "@/con/colors";
import { Box, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from "@mantine/core";
import PengangguranBerdasarkanUsia from "./pengangguran_berdasarkan_usia/page";
import PengangguranBerdasarkanPendidikan from "./pengangguran_berdasarkan_pendidikan/page";

export default function Page() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <Title order={3}>Jumlah Penduduk Usia Kerja yang Menganggur</Title>
        <Tabs color={colors['blue-button']} variant='pills' defaultValue={"Pengangguran Berdasarkan Usia"}>
          <TabsList p={"xs"} bg={"#BBC8E7FF"}>
            <TabsTab value={"Pengangguran Berdasarkan Usia"}>
              Pengangguran Berdasarkan Usia
            </TabsTab>
            <TabsTab value={"Pengangguran Berdasarkan Pendidikan"}>
              Pengangguran Berdasarkan Pendidikan
            </TabsTab>
          </TabsList>

          <TabsPanel value={"Pengangguran Berdasarkan Usia"}>
            <PengangguranBerdasarkanUsia />
          </TabsPanel>
          <TabsPanel value={"Pengangguran Berdasarkan Pendidikan"}>
            <PengangguranBerdasarkanPendidikan/>
          </TabsPanel>
        </Tabs>
      </Stack>
    </Box>
  );
}