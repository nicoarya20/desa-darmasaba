import colors from '@/con/colors';
import { Box, Paper, Stack } from '@mantine/core';

function Page() {
  return (
    <Paper bg={colors['white-1']} p={'md'} radius={10}>
      <Stack gap={"22"}>
        <Box>
          <Stack gap={'lg'}>
            <Paper p={"xl"} bg={colors['BG-trans']}>
              {/* <Box px={{ base: 0, md: 30 }}>
                <Text ta={"center"} fz={{ base: "h3", md: "h2" }} fw={"bold"} dangerouslySetInnerHTML={{ __html: listDasarHukum.findById.data.judul }} />
              </Box>
              <Box px={{ base: 0, md: 30 }}>
                <Text fz={{ base: "md", md: "h3" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: listDasarHukum.findById.data.content }} />
              </Box> */}
            </Paper>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

export default Page;
