"use client";
import { Center, Container, Stack, Text } from "@mantine/core";
import { useRef } from "react";

const name = process.env.NEXT_PUBLIC_NAME;

function Content5() {
  const ref = useRef(null);

  return (
    <Stack ref={ref}>
      ini name
      {name && <Text>{name}</Text>}
      <Container w={{ base: "100%", md: "80%" }} p={"xl"} h={720}>
        <Center>
          <Text fz={"3.4rem"}>CONTENT 5</Text>
        </Center>

      </Container>
    </Stack>
  );
}

export default Content5;
