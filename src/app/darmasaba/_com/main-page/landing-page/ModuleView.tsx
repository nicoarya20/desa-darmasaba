"use client";

import profileLandingPageState from "@/app/admin/(dashboard)/_state/landing-page/profile";
import {
  Box,
  Center,
  Image,
  Paper,
  ScrollArea,
  SimpleGrid,
  Skeleton,
  Stack,
  Text
} from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import { Prisma } from "@prisma/client";
import { IconPhotoOff } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useTransitionRouter } from "next-view-transitions";
import { useProxy } from "valtio/utils";

type ProgramInovasiItem = Prisma.ProgramInovasiGetPayload<{ include: { image: true } }>;

function ModuleItem({ data }: { data: ProgramInovasiItem }) {
  const router = useTransitionRouter();

  return (
    <motion.div whileHover={{ scale: 1.03 }}>
      <Paper
        onClick={() => router.push(`/darmasaba/program-inovasi/${data.id}`)}
        p="lg"
        radius="xl"
        shadow="sm"
        role="button"
        tabIndex={0}
        className="cursor-pointer transition-all"
        bg="white"
      >
        <Center h={160}>
          {data.image?.link ? (
            <Image
              src={data.image.link}
              alt={data.name}
              radius="md"
              fit="contain"
              h={140}
              w="100%"
              style={{ objectPosition: "center" }}
            />
          ) : (
            <Stack align="center" gap="xs">
              <IconPhotoOff size={38} stroke={1.5} />

              {/* ❗ Caption konsisten */}
              <Text fz={{ base: 13, md: 14 }} c="dimmed">
                Belum ada gambar
              </Text>
            </Stack>
          )}
        </Center>

        <Box mt="md">
          {/* ❗ Responsive Title */}
          <Text
            fw={600}
            ta="center"
            fz={{ base: 16, md: 18 }} // mobile → desktop
            lh={1.3}
          >
            {data.name}
          </Text>
        </Box>
      </Paper>
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

          {/* ❗ Empty title lebih besar */}
          <Text fw={600} fz={{ base: 18, md: 22 }}>
            Belum ada program inovasi
          </Text>

          {/* ❗ Deskripsi kecil & lembut */}
          <Text fz={{ base: 14, md: 16 }} c="dimmed" ta="center" lh={1.4}>
            Tambahkan program inovasi untuk ditampilkan di sini
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <ScrollArea
      h={280}
      scrollbarSize={2}
      offsetScrollbars
      styles={{
        viewport: { paddingRight: 8 },
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
