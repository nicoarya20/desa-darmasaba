import colors from '@/con/colors';
import { Stack, Container, Text } from '@mantine/core';
import React from 'react';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.grey[1]} py={"xl"} gap={"42"}>
      <Container w={{ base: "100%", md: "50%" }} p={"xl"}>
        <Stack gap={0}>
          <Text>
              
            </Text>
        </Stack>
      </Container>
    </Stack>
  );
}

export default Page;
