"use client";

import colors from "@/con/colors";
import images from "@/con/images";
import { Flex, Image, Paper, Stack, Text } from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";

export default function SpashScreen() {
  useShallowEffect(() => {
    const timeout = setTimeout(() => {
      window.location.href = "/darmasaba";
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);
  return (
    <Stack
      w={"100%"}
      h={"100vh"}
      justify="center"
      align="center"
      bg={colors["blue-button"]}
    >
      <Paper p={"md"} miw={320}>
        <Flex>
          <Image
            src={images["darmasaba-icon"]}
            alt="darmasaba"
            w={100}
            h={100}
          />
          <Stack p={"md"} gap={"0"}>
            <Text>Pemerintah Desa</Text>
            <Text c={colors["blue-button"]} fz={"2rem"} fw={"bold"}>
              DARMASABA
            </Text>
          </Stack>
        </Flex>
      </Paper>
    </Stack>
  );
}
