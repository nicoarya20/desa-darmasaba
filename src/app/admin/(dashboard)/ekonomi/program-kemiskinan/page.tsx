import colors from '@/con/colors';
import { Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import ProgramKemiskinan from './ui/program/page';
import StatistikKemiskinan from './ui/statistik/page';

function Page() {
  return (
    <Stack>
      <Title order={3}>Program Kemiskinan</Title>
      <Tabs color={colors['blue-button']} variant='pills' defaultValue={"Program Kemiskinan"}>
        <TabsList p={"xs"} bg={"#BBC8E7FF"}>
          <TabsTab value="Program Kemiskinan">
            Program Kemiskinan
          </TabsTab>
          <TabsTab value="Statistik Kemiskinan">
            Statistik Kemiskinan
          </TabsTab>
        </TabsList>

        <TabsPanel value="Program Kemiskinan">
          <ProgramKemiskinan />
        </TabsPanel>
        <TabsPanel value="Statistik Kemiskinan">
          <StatistikKemiskinan />
        </TabsPanel>
      </Tabs>
    </Stack>
  );
}

export default Page;
