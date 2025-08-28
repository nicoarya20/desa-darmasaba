'use client'
import { ActionIcon, Anchor, Box, Button, Center, Container, Divider, Flex, Group, Image, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconAt, IconBrandFacebook, IconBrandInstagram, IconBrandTwitter, IconBrandWhatsapp } from '@tabler/icons-react';

function Footer() {
  return (
    <Stack bg="linear-gradient(180deg, #1C6EA4, #124170)" c="white">
      <Box w="100%" p="xl">
        <Center>
          <Paper w="100%" bg="transparent" shadow="md" radius="lg" p="xl">
            <Box component="footer">
              <Container size="lg">
                <Stack gap="xl">
                  <Box>
                    <Title fz="lg" order={2} fw={700} mb="md" c="white">Komitmen Layanan Kami</Title>
                    <Stack gap="sm">
                      {[
                        { title: "Transparansi", text: "Pengelolaan dana desa dilakukan secara terbuka agar masyarakat dapat memahami dan memantau penggunaan anggaran." },
                        { title: "Profesionalisme", text: "Layanan desa diberikan secara cepat, adil, dan profesional demi kepuasan masyarakat." },
                        { title: "Partisipasi", text: "Masyarakat dilibatkan aktif dalam pengambilan keputusan demi pembangunan desa yang berhasil." },
                        { title: "Inovasi", text: "Kami terus berinovasi, termasuk melalui teknologi, agar layanan semakin mudah diakses." },
                        { title: "Keadilan", text: "Kebijakan dan program disusun untuk memberi manfaat yang merata bagi seluruh warga." },
                        { title: "Pemberdayaan", text: "Masyarakat didukung melalui pelatihan, pendampingan, dan pengembangan usaha lokal." },
                        { title: "Ramah Lingkungan", text: "Seluruh kegiatan pembangunan memperhatikan keberlanjutan demi menjaga alam dan kesehatan warga." }
                      ].map((item, i) => (
                        <Group key={i} align="flex-start" gap="xs">
                          <Text fz="sm" c="#F3F2EC" fw={700}>{i + 1}. {item.title}:</Text>
                          <Text fz="sm" c="#F3F2EC">{item.text}</Text>
                        </Group>
                      ))}
                    </Stack>
                  </Box>

                  <Divider color="white" opacity={0.2} />

                  <Box>
                    <Title fz="lg" order={2} fw={700} mb="md" c="white">Visi Kami</Title>
                    <Text fz="sm" mb="sm" c="#F3F2EC">
                      Dengan visi ini, kami berkomitmen menjadikan desa sebagai tempat yang aman, sejahtera, dan nyaman bagi seluruh warga.
                    </Text>
                    <Text fz="sm" mb="sm" c="#F3F2EC">
                      Kami percaya kemajuan dimulai dari kerja sama antara pemerintah desa dan masyarakat, didukung tata kelola yang baik demi kepentingan bersama. Saran maupun keluhan dapat disampaikan melalui kontak di bawah ini.
                    </Text>
                  </Box>

                  <Group justify="apart" align="center" mt="lg">
                    <Text c="#F3F2EC" ta="center" fz="md" fw={700} style={{ fontStyle: 'italic' }}>&quot;Desa Kuat, Warga Sejahtera!&quot;</Text>
                    <ActionIcon size={80} radius="xl" variant="transparent">
                      <Image src="/api/img/chatbot-removebg-preview.png" alt="Logo Desa" width={80} height={80} />
                    </ActionIcon>
                  </Group>
                </Stack>
              </Container>
            </Box>
          </Paper>
        </Center>

        <Box py={40}>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
            <Box>
              <Stack gap="sm">
                <Text c="white" fz="md" fw={700}>Tentang Darmasaba</Text>
                <Text fz="xs" c="#F3F2EC">
                  Darmasaba adalah desa budaya yang kaya akan tradisi dan nilai-nilai warisan Bali.
                </Text>
                <Flex gap="md" mt="sm" c="#F3F2EC">
                  <ActionIcon variant="subtle" color="white"><IconBrandFacebook size={22} /></ActionIcon>
                  <ActionIcon variant="subtle" color="white"><IconBrandInstagram size={22} /></ActionIcon>
                  <ActionIcon variant="subtle" color="white"><IconBrandTwitter size={22} /></ActionIcon>
                  <ActionIcon variant="subtle" color="white"><IconBrandWhatsapp size={22} /></ActionIcon>
                </Flex>
              </Stack>
            </Box>

            <Box>
              <Stack gap="xs">
                <Text c="white" fz="md" fw={700}>Layanan Desa</Text>
                <Anchor c="#F3F2EC" fz="xs">Administrasi Kependudukan</Anchor>
                <Anchor c="#F3F2EC" fz="xs">Layanan Sosial</Anchor>
                <Anchor c="#F3F2EC" fz="xs">Pengaduan Masyarakat</Anchor>
                <Anchor c="#F3F2EC" fz="xs">Informasi Publik</Anchor>
              </Stack>
            </Box>

            <Box>
              <Stack gap="xs">
                <Text c="white" fz="md" fw={700}>Tautan Penting</Text>
                <Anchor c="#F3F2EC" fz="xs">Portal Badung</Anchor>
                <Anchor c="#F3F2EC" fz="xs">E-Government</Anchor>
                <Anchor c="#F3F2EC" fz="xs">Transparansi</Anchor>
                <Anchor c="#F3F2EC" fz="xs">Unduhan</Anchor>
              </Stack>
            </Box>

            <Box>
              <Stack gap="sm">
                <Text c="white" fz="md" fw={700}>Berlangganan Info</Text>
                <Text c="#F3F2EC" fz="xs">Dapatkan kabar terbaru tentang program dan kegiatan desa langsung ke email Anda.</Text>
                <Group wrap="nowrap">
                  <TextInput
                    w="70%"
                    placeholder="Masukkan email Anda"
                    rightSection={<IconAt size={16} />}
                  />
                  <Button variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} radius="md">Daftar</Button>
                </Group>
              </Stack>
            </Box>
          </SimpleGrid>
        </Box>

        <Divider opacity={0.2} my="md" />
        <Text ta="center" fz="xs" c="white">© 2025 Desa Darmasaba. Hak cipta dilindungi.</Text>
      </Box>
    </Stack>
  );
}

export default Footer;
