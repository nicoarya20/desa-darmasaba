import colors from "@/con/colors";
import { Box, Button, Group, Paper, SimpleGrid, Stack, Title } from "@mantine/core";
import CreateLaporanPublik from "./create/createLaporan";
import ListDataLaporanPublik from "./listData/page";

export default function Page() {
  return (
    <Stack gap={"xs"}>
      <SimpleGrid cols={{ base: 1, md: 2 }}>  
        <Box>
          <Paper bg={colors['white-1']} p={'md'} radius={10}>
            <Title order={3}>Laporan Publik</Title>
            <CreateLaporanPublik/>
            <Group>
              <Button
              mt={10}
              bg={colors['blue-button']}
              >
                Submit
              </Button>
            </Group>
          </Paper>
        </Box>
        <ListDataLaporanPublik/>
      </SimpleGrid>
    </Stack>
  )
}