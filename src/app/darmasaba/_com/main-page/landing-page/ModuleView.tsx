"use client";

import profileLandingPageState from "@/app/admin/(dashboard)/_state/landing-page/profile";
import {
  Box,
  Center,
  Image,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  Skeleton,
  useMantineColorScheme,
  ScrollArea,
} from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import { motion } from "framer-motion";
import { useTransitionRouter } from "next-view-transitions";
import { useProxy } from "valtio/utils";
import { Prisma } from "@prisma/client";
import { IconPhotoOff } from "@tabler/icons-react";

type ProgramInovasiItem = Prisma.ProgramInovasiGetPayload<{ include: { image: true } }>;

function ModuleItem({ data }: { data: ProgramInovasiItem }) {
  const router = useTransitionRouter();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <motion.div whileHover={{ scale: 1.03 }}>
      <Tooltip label={`Lihat ${data.name}`} withArrow>
        <Paper
          onClick={() => router.push(`/darmasaba/program-inovasi/${data.id}`)}
          p="lg"
          radius="xl"
          shadow="sm"
          role="button"
          tabIndex={0}
          className="cursor-pointer transition-all"
          bg={isDark ? "dark.6" : "white"}
        >
          <Center h={160}>
            {data.image?.link ? (
              <Image
                src={data.image.link}
                alt={data.name}
                radius="md"
                fit="cover"
                h={140}
                w="100%"
                loading="lazy"
              />
            ) : (
              <Stack align="center" gap="xs">
                <IconPhotoOff size={38} stroke={1.5} />
                <Text size="sm" c="dimmed">
                  Belum ada gambar
                </Text>
              </Stack>
            )}
          </Center>
          <Box mt="md">
            <Text fw={600} ta="center" size="md">
              {data.name}
            </Text>
          </Box>
        </Paper>
      </Tooltip>
    </motion.div>
  );
}

function ModuleView() {
  const listImageState = useProxy(profileLandingPageState.programInovasi);

  useShallowEffect(() => {
    listImageState.findMany.load();
  }, []);

  if (listImageState.findMany.loading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" mt="lg">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={220} radius="xl" />
        ))}
      </SimpleGrid>
    );
  }

  if (!listImageState.findMany.data?.length) {
    return (
      <Center h={320}>
        <Stack align="center" gap="sm">
          <IconPhotoOff size={54} stroke={1.5} />
          <Text size="lg" fw={600}>
            Belum ada program inovasi
          </Text>
          <Text size="sm" c="dimmed">
            Tambahkan program inovasi untuk ditampilkan di sini
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <ScrollArea h={280} // ✅ tinggi fixed, bisa disesuaikan
      scrollbarSize={8}
      offsetScrollbars
      type="never"
      styles={{
        viewport: { paddingRight: 8 }, // kasih jarak biar scroll nggak dempet
      }}
    >
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" mt="lg">
      {listImageState.findMany.data?.map((item) => (
        <ModuleItem key={item.id} data={item} />
      ))}
    </SimpleGrid>
    </ScrollArea>
  );
}

export default ModuleView;
