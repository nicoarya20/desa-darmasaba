"use client";
import stateFileStorage from "@/state/state-list-image";
import {
  ActionIcon,
  Box,
  Card,
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
    <Stack p="lg" gap="lg">
      <Flex justify="space-between" align="center" wrap="wrap" gap="md">
        <Title order={2} fw={700}>
          Galeri Foto
        </Title>
        <TextInput
          radius="xl"
          size="md"
          placeholder="Cari foto berdasarkan nama..."
          leftSection={<IconSearch size={18} />}
          rightSection={
            <ActionIcon
              variant="light"
              color="gray"
              radius="xl"
              onClick={() => stateFileStorage.load()}
            >
              <IconX size={18} />
            </ActionIcon>
          }
          onChange={(e) => {
            if (timeOut) clearTimeout(timeOut);
            timeOut = setTimeout(() => {
              stateFileStorage.load({ search: e.target.value });
            }, 300);
          }}
        />
      </Flex>

      <Paper withBorder radius="lg" p="md" shadow="sm">
        {list && list.length > 0 ? (
          <SimpleGrid
            cols={{ base: 2, sm: 3, md: 5, lg: 8 }}
            spacing="md"
            verticalSpacing="md"
          >
            {list.map((v, k) => (
              <Card
                key={k}
                withBorder
                radius="md"
                shadow="sm"
                className="hover:shadow-md transition-all duration-200"
              >
                <Stack gap="xs">
                  <motion.div
                    onClick={() => {
                      navigator.clipboard.writeText(v.url);
                      toast("Tautan foto berhasil disalin");
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ cursor: "pointer" }}
                  >
                    <Image
                      src={`${v.url}?size=200`}
                      alt={v.name}
                      radius="md"
                      h={120}
                      fit="cover"
                      loading="lazy"
                    />
                  </motion.div>

                  <Box>
                    <Text size="sm" fw={500} lineClamp={2}>
                      {v.name}
                    </Text>
                  </Box>

                  <Group justify="space-between" align="center" pt="xs">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        radius="md"
                        onClick={() => {
                          stateFileStorage
                            .del({ id: v.id })
                            .finally(() => toast("Foto berhasil dihapus"));
                        }}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Stack align="center" justify="center" py="xl" gap="sm">
            <Image
              src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
              alt="Kosong"
              w={120}
              h={120}
              fit="contain"
              opacity={0.7}
              loading="lazy"
            />
            <Text c="dimmed" ta="center">
              Belum ada foto yang tersedia
            </Text>
          </Stack>
        )}
      </Paper>

      {total && total > 1 && (
        <Flex justify="center">
          <Pagination
            total={total}
            value={stateFileStorage.page}  // Changed from page to value
            size="md"
            radius="md"
            withEdges
            onChange={(page) => {
              stateFileStorage.load({ page });
            }}
          />

        </Flex>
      )}
    </Stack>
  );
}
