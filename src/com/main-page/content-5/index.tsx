"use client";
import { Center, Container, Stack, Text } from "@mantine/core";
import { useRef } from "react";
import FlipOnScroll from "./FlipScroll";

function Content5() {
  const ref = useRef(null);

  return (
    <Stack ref={ref}>
      <Container w={{ base: "100%", md: "80%" }} p={"xl"} h={720}>
        <Center>
          <Text fz={"3.4rem"}>CONTENT 5</Text>
        </Center>
        <FlipOnScroll />
      </Container>
    </Stack>
  );
}

export default Content5;
