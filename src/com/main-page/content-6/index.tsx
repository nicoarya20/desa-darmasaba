"use client";
import { Stack, Container, Center, Text } from "@mantine/core";
import Count from "./Count";

function Content6() {
  return (
    <Stack>
      <Container w={{ base: "100%", md: "80%" }} p={"xl"} h={720}>
        <Center>
          <Text fz={"3.4rem"}>CONTENT 6</Text>
        </Center>
        <Count />
      </Container>
    </Stack>
  );
}

export default Content6;
