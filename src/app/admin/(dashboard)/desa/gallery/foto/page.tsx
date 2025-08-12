"use client";
import colors from "@/con/colors";
import stateFileStorage from "@/state/state-list-image";
import {
  ActionIcon,
  Box,
  Flex,
  Group,
  Image,
  Pagination,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title
} from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import { IconSearch, IconTrash, IconX } from "@tabler/icons-react";
import { motion } from "framer-motion";
import toast from "react-simple-toasts";
import { useSnapshot } from "valtio";

export default function ListImage() {
  const { list, total } = useSnapshot(stateFileStorage);

  useShallowEffect(() => {
    stateFileStorage.load();
  }, []);

  let timeOut: NodeJS.Timer;
  return (
    <Stack p={"lg"}>
      <Flex justify="space-between">
        <Title order={3}>List Foto</Title>
        <TextInput
          radius={"lg"}
          leftSection={<IconSearch />}
          rightSection={
            <ActionIcon
              variant="transparent"
              onClick={() => {
                stateFileStorage.load();
              }}
            >
              <IconX />
            </ActionIcon>
          }
          placeholder="Pencarian"
          onChange={(e) => {
            if (timeOut) clearTimeout(timeOut);
            timeOut = setTimeout(() => {
              stateFileStorage.load({ search: e.target.value });
            }, 200);
          }}
        />
      </Flex>
      <Paper bg={colors['white-1']} p={'md'}>
        <SimpleGrid
          cols={{
            base: 3,
            md: 5,
            lg: 10,
          }}
        >
          {list &&
            list.map((v, k) => {
              return (
                <Paper key={k} shadow="sm">
                  <Stack pos={"relative"} gap={0} justify="space-between">
                    <motion.div
                      onClick={() => {
                        // copy to clipboard
                        navigator.clipboard.writeText(v.url);
                        toast("Berhasil disalin");
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.8 }}
                    >
                      <Image
                        h={100}
                        src={v.url + "?size=100"}
                        alt={v.name}
                        fit="cover"
                        loading="lazy"
                        style={{
                          objectFit: "cover",
                          objectPosition: "center",
                        }}
                      />
                    </motion.div>
                    <Box p={"md"} h={54}>
                      <Text lineClamp={2} fz={"xs"}>
                        {v.name}
                      </Text>
                    </Box>
                    <Group justify="end">
                        <IconTrash
                        color="red"
                          onClick={() => {
                            stateFileStorage.del({ name: v.name }).finally(() => {
                              toast("Berhasil dihapus");
                            });
                          }}
                        />
                    </Group>
                  </Stack>
                </Paper>
              );
            })}
        </SimpleGrid>
      </Paper>
      {total && (
        <Pagination
          total={total}
          onChange={(e) => {
            stateFileStorage.page = e;
            stateFileStorage.load();
          }}
        />
      )}
    </Stack>
  );
}
