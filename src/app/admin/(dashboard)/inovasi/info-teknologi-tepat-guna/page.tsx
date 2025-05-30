import { Box, Stack, Title } from '@mantine/core';
import React from 'react';
import CreateInfoTeknologiTepatGuna from './create/page';
import ListDataInfoTeknologiTepatGuna from './listData/page';

function Page() {
  return (
    <Box>
      <Stack gap={'xs'}>
        <Title order={3}>Info Teknologi Tepat Guna</Title>
        <CreateInfoTeknologiTepatGuna/>
        <ListDataInfoTeknologiTepatGuna/>
      </Stack>
    </Box>
  );
}

export default Page;
