import colors from '@/con/colors';
import { Box, Paper, Stack, Title } from '@mantine/core';

function DetailDataPengangguran() {
  return (
    <Box>
      <Box py={15}>
        <Paper bg={colors['white-1']} p={'md'}>
          <Stack gap={"xs"}>
            <Title order={3}>Detail Data Pengangguran</Title>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default DetailDataPengangguran;
