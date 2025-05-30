import { Box, Stack, Title } from '@mantine/core';
import React from 'react';
import ProgramKreatifCreate from './create/page';
import ListDataProgramKreatifDesa from './listData/page';

function Page() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <Title order={3}>Program Kreatif Desa</Title>
        <ProgramKreatifCreate />
        <ListDataProgramKreatifDesa />
      </Stack>
    </Box>
  );
}

export default Page;
