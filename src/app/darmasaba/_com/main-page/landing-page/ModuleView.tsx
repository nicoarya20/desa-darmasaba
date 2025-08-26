import profileLandingPageState from "@/app/admin/(dashboard)/_state/landing-page/profile";
import { Box, Center, Image, Paper, SimpleGrid, Stack, Text, Tooltip } from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import { motion } from "framer-motion";
import { useTransitionRouter } from "next-view-transitions";
import { useProxy } from "valtio/utils";
import { Prisma } from "@prisma/client";
import { IconPhotoOff } from "@tabler/icons-react";

type ProgramInovasiItem = Prisma.ProgramInovasiGetPayload<{ include: { image: true } }>;

function ModuleItem({ data }: { data: ProgramInovasiItem }) {
  const router = useTransitionRouter();
  return (
    <motion.div whileHover={{ scale: 1.04 }}>
      <Tooltip label={`Lihat ${data.name}`} withArrow>
        <Paper
          onClick={() => router.push(`/${data.name}`)}
          p="xl"
          radius="2xl"
          bg="white"
          className="cursor-pointer transition-all shadow-md hover:shadow-xl"
        >
          <Center h={180}>
            {data.image?.link ? (
              <Image
                src={data.image.link}
                alt={data.name}
                fit="contain"
                radius="lg"
                loading="lazy"
                style={{ objectFit: "contain", objectPosition: "center" }}
              />
            ) : (
              <Stack align="center" gap="xs">
                <IconPhotoOff size={40} stroke={1.5} />
                <Text size="sm" c="dimmed">
                  Belum ada gambar
                </Text>
              </Stack>
            )}
          </Center>
          <Box mt="md">
            <Text fw={600} ta="center" size="lg" c="black">
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

  if (!listImageState.findMany.loading && !listImageState.findMany.data?.length) {
    return (
      <Center h={320}>
        <Stack align="center" gap="sm">
          <IconPhotoOff size={54} stroke={1.5} />
          <Text size="lg" fw={600} c="white">
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
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl" mt="lg">
      {listImageState.findMany.data?.map((item) => (
        <ModuleItem key={item.id} data={item} />
      ))}
    </SimpleGrid>
  );
}

export default ModuleView;
