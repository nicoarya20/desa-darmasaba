"use client";
import { PESAN_BERKAS_KE_SAMPAH } from "@/lib/file-storage-delete.client";
import stateListImage from "@/state/state-list-image";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  Pagination,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import { IconSearch, IconX } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-simple-toasts";
import { useSnapshot } from "valtio";

export default function ListImage() {
  const { list, total } = useSnapshot(stateListImage);
  const [loading, setLoading] = useState(false);

  useShallowEffect(() => {
    stateListImage.load();
  }, []);

  let timeOut: NodeJS.Timer;
  return (
    <Stack p={"lg"}>
      <Group justify="end">
        <TextInput
          leftSection={<IconSearch />}
          rightSection={
            <ActionIcon
              variant="transparent"
              onClick={() => {
                stateListImage.load();
              }}
            >
              <IconX />
            </ActionIcon>
          }
          placeholder="Cari"
          onChange={(e) => {
            if (timeOut) clearTimeout(timeOut);
            timeOut = setTimeout(() => {
              stateListImage.load({ search: e.target.value });
            }, 200);
          }}
        />
      </Group>
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
                    <Button.Group>
                      <Button
                        onClick={() => {
                          // copy to clipboard
                          navigator.clipboard.writeText(v.url);
                          toast("Berhasil disalin");
                        }}
                        variant="subtle"
                        size="compact-xs"
                      >
                        Copy
                      </Button>
                      <Button
                        variant="subtle"
                        loading={loading}
                        size="compact-xs"
                        onClick={() => {
                          stateListImage
                            .del({ id: v.id })
                            .then(() => toast(PESAN_BERKAS_KE_SAMPAH))
                            .catch((err: unknown) => toast(err instanceof Error ? err.message : String(err)))
                            .finally(() => {
                              setLoading(false);
                            });
                        }}
                      >
                        delete
                      </Button>
                    </Button.Group>
                  </Group>
                </Stack>
              </Paper>
            );
          })}
      </SimpleGrid>
      {total && (
        <Pagination
          total={total}
          onChange={(e) => {
            stateListImage.page = e;
            stateListImage.load();
          }}
        />
      )}
    </Stack>
  );
}
