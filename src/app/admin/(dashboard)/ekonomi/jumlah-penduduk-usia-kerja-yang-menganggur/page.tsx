import colors from "@/con/colors";
import { Box, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from "@mantine/core";
import PengangguranBerdasarkanUsia from "./ui/pengangguranBerdasarkanUsia/page";
import PengangguranBerdasarkanPendidikan from "./ui/pengangguranBerdasarkanPendidikan/page";

export default function Page() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <Title order={3}>Jumlah Penduduk Usia Kerja yang Menganggur</Title>
        <Tabs color={colors['blue-button']} variant='pills' defaultValue={"Pengangguran Bredasarkan Usia"}>
          <TabsList p={"xs"} bg={"#BBC8E7FF"}>
            <TabsTab value={"Pengangguran Bredasarkan Usia"}>
              Pengangguran Bredasarkan Usia
            </TabsTab>
            <TabsTab value={"Pengangguran Bredasarkan Pendidikan"}>
              Pengangguran Bredasarkan Pendidikan
            </TabsTab>
          </TabsList>

          <TabsPanel value={"Pengangguran Bredasarkan Usia"}>
            <PengangguranBerdasarkanUsia />
          </TabsPanel>
          <TabsPanel value={"Pengangguran Bredasarkan Pendidikan"}>
            <PengangguranBerdasarkanPendidikan/>
          </TabsPanel>
        </Tabs>
      </Stack>
    </Box>
  );
}