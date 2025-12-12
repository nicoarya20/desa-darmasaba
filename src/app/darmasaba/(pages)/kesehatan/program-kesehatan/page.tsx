'use client'
import programKesehatan from "@/app/admin/(dashboard)/_state/kesehatan/program-kesehatan/programKesehatan";
import colors from "@/con/colors";
import {
  Box,
  Button,
  Center,
  Grid,
  GridCol,
  Group,
  Image,
  Pagination,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  Transition
} from "@mantine/core";
import { useDebouncedValue, useShallowEffect } from "@mantine/hooks";
import {
  IconBarbell,
  IconCalendar,
  IconOld,
  IconSearch,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProxy } from "valtio/utils";
import BackButton from "../../desa/layanan/_com/BackButto";

const manfaatProgram = [
  {
    id: 1,
    icon: <IconBarbell size={40} color="#fff" />,
    title: "Menjaga Tubuh Bugar",
    desc: "Meningkatkan kesehatan fisik masyarakat melalui olahraga rutin, pemeriksaan berkala, dan edukasi gaya hidup sehat.",
  },
  {
    id: 2,
    icon: <IconUsersGroup size={40} color="#fff" />,
    title: "Menguatkan Kebersamaan",
    desc: "Menciptakan interaksi sosial sehat, mempererat solidaritas, dan memperkuat budaya gotong royong antar warga.",
  },
  {
    id: 3,
    icon: <IconOld size={40} color="#fff" />,
    title: "Dukungan untuk Lansia",
    desc: "Membantu lansia tetap aktif, sehat, dan bahagia melalui kegiatan komunitas yang aman dan menyenangkan.",
  },
];

export default function Page() {
  const state = useProxy(programKesehatan);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const { data, page, totalPages, loading, load } = state.findMany;

  useShallowEffect(() => {
    load(page, 3, debouncedSearch);
  }, [page, debouncedSearch]);

  if (loading || !data) {
    return (
      <Box py="xl" px={{ base: "md", md: 100 }}>
        <Skeleton h={500} radius="lg" />
      </Box>
    );
  }

  return (
    <Stack bg={colors.Bg} py="xl" gap="xl">
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>

      <Grid px={{ base: "md", md: 100 }} align="center" gutter="lg">
        <GridCol span={{ base: 12, md: 8 }}>
          <Title
            order={1}
            c={colors["blue-button"]}
            fw="bold"
            fz={{ base: '28px', md: '32px' }}
          >
            Program Kesehatan Desa
          </Title>
          <Text
            fz={{ base: '14px', md: '16px' }}
            lh={{ base: '1.5', md: '1.6' }}
            mt="xs"
          >
            Temukan berbagai program kesehatan untuk mendukung kualitas hidup
            masyarakat Darmasaba.
          </Text>
        </GridCol>
        <GridCol span={{ base: 12, md: 4 }}>
          <TextInput
            placeholder="Cari program kesehatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftSection={<IconSearch size={20} />}
            radius="lg"
            size="md"
            aria-label="Pencarian program kesehatan"
          />
        </GridCol>
      </Grid>

      <Box px={{ base: "md", md: 100 }}>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" pb="xl">
          {data.map((v, k) => (
            <Transition
              key={k}
              mounted
              transition="fade-up"
              duration={400}
              timingFunction="ease"
            >
              {(styles) => (
                <Paper
                  style={styles}
                  radius="xl"
                  withBorder
                  bg="white"
                  shadow="md"
                  className="hover-scale"
                >
                  <Stack gap="md">
                    <Center>
                      <Box
                        style={{
                          width: '100%',
                          aspectRatio: '16/9',   // thumbnail landscape aman untuk portrait/landscape
                          borderRadius: 12,
                          overflow: 'hidden',
                        }}
                      >
                        <Image
                          src={v.image?.link || '/img/default.png'}
                          alt={v.name}
                          fit="cover"
                          width="100%"
                          height="100%"
                          style={{ objectFit: 'cover', objectPosition: 'center' }}
                          loading="lazy"
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        />
                      </Box>
                    </Center>

                    <Box px="lg" pb="lg">
                      <Title
                        order={3}
                        c={colors["blue-button"]}
                        fw="bold"
                        fz={{ base: '18px', md: '20px' }}
                        mb="xs"
                      >
                        {v.name}
                      </Title>
                      <Text
                        fz={{ base: '13px', md: '14px' }}
                        lh="1.6"
                        ta="justify"
                        lineClamp={3}
                        dangerouslySetInnerHTML={{ __html: v.deskripsi }}
                        style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                      />
                      <Group justify="space-between" mt="md">
                        <Group gap="xs">
                          <IconCalendar size={18} />
                          <Text
                            fz={{ base: '12px', md: '14px' }}
                            lh="1.5"
                          >
                            {v.createdAt
                              ? new Date(v.createdAt).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )
                              : "Tanggal tidak tersedia"}
                          </Text>
                        </Group>
                        <Group gap="xs">
                          <IconUser size={18} />
                          <Text
                            fz={{ base: '12px', md: '14px' }}
                            lh="1.5"
                          >
                            Admin Desa
                          </Text>
                        </Group>
                      </Group>
                      <Button
                        mt="lg"
                        fullWidth
                        radius="lg"
                        size="md"
                        fw="bold"
                        variant="gradient"
                        gradient={{ from: colors["blue-button"], to: "#4dabf7" }}
                        onClick={() =>
                          router.push(
                            `/darmasaba/kesehatan/program-kesehatan/${v.id}`
                          )
                        }
                      >
                        Lihat Detail
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              )}
            </Transition>
          ))}
        </SimpleGrid>

        {totalPages > 1 && (
          <Center>
            <Pagination
              value={page}
              onChange={(newPage) => load(newPage)}
              total={totalPages}
              mt="md"
              size="lg"
              radius="xl"
              styles={{
                control: {
                  borderRadius: "50%",
                  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                },
              }}
            />
          </Center>
        )}
      </Box>

      <Box px={{ base: "md", md: 100 }} py="xl">
        <Stack gap="sm" mb="lg">
          <Title
            order={2}
            c={colors["blue-button"]}
            fw="bold"
            fz={{ base: '24px', md: '28px' }}
          >
            Manfaat Program Kesehatan
          </Title>
          <Text
            fz={{ base: '14px', md: '16px' }}
            lh={{ base: '1.5', md: '1.6' }}
            maw={700}
          >
            Program kesehatan Desa Darmasaba berperan penting dalam meningkatkan
            kesejahteraan dan kualitas hidup warganya.
          </Text>
        </Stack>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {manfaatProgram.map((v) => (
            <Paper
              key={v.id}
              px="xl"
              py="xl"
              radius="xl"
              shadow="sm"
              withBorder
              bg="white"
              className="hover-glow"
            >
              <Stack align="center" gap="md">
                <Paper
                  p="lg"
                  radius="50%"
                  shadow="md"
                  bg={colors["blue-button"]}
                  className="pulse-icon"
                >
                  <Center>{v.icon}</Center>
                </Paper>
                <Title
                  order={3}
                  ta="center"
                  fw="bold"
                  c={colors["blue-button"]}
                  fz={{ base: '18px', md: '20px' }}
                >
                  {v.title}
                </Title>
                <Text
                  ta="center"
                  fz={{ base: '13px', md: '14px' }}
                  lh="1.5"
                >
                  {v.desc}
                </Text>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Box>
    </Stack>
  );
}