'use client'
import desaDigitalState from '@/app/admin/(dashboard)/_state/inovasi/desa-digital';
import colors from '@/con/colors';
import { Box, Center, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import BackButton from '../../../pemerintahan/layanan/_com/BackButto';

function DetailDesaDigitalUser() {
  const stateDesaDigital = useProxy(desaDigitalState);
  const params = useParams();

  useShallowEffect(() => {
    stateDesaDigital.findUnique.load(params?.id as string);
  }, []);

  if (!stateDesaDigital.findUnique.data) {
    return (
      <Stack py={40} align="center">
        <Skeleton height={400} radius="md" w={{ base: "90%", md: "60%" }} />
        <Text fz="lg" c="dimmed">Memuat data...</Text>
      </Stack>
    );
  }

  const data = stateDesaDigital.findUnique.data;

  return (
    <Stack bg={colors.Bg} py="xl" align="center" px={{ base: "md", md: "lg" }}>
      {/* Tombol Back */}
      <Box w={{ base: "100%", md: "60%" }}>
        <BackButton/>
      </Box>

      {/* Card Detail */}
      <Paper
        w={{ base: "100%", md: "60%" }}
        bg={colors["white-1"]}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text ta={"center"} fz={{ base: "xl", md: "2xl" }} fw="bold" c={colors["blue-button"]}>
            {data?.name || "Desa Digital"}
          </Text>

          {/* Gambar */}
          {data?.image?.link ? (
            <Center>
              <Image
                src={data.image.link}
                alt={data.name || "Gambar Desa Digital"}
                radius="md"
                fit="cover"
                w={{ base: "100%", md: "80%" }}
                h={{ base: 250, md: 350 }}
                style={{ objectPosition: "center", borderRadius: 12 }}
              />
            </Center>
          ) : (
            <Center>
              <Text c="dimmed">Tidak ada gambar</Text>
            </Center>
          )}

          {/* Deskripsi */}
          <Box pt="md">
            <Text
              fz={{ base: "md", md: "lg" }}
              c="dimmed"
              style={{ lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: data?.deskripsi || "-" }}
            />
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}

export default DetailDesaDigitalUser;
