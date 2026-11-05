'use client'
import { ActionIcon, Anchor, Box, Button, Center, Container, Divider, Flex, Group, Image, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconAt, IconBrandFacebook, IconBrandInstagram, IconBrandTiktok, IconBrandYoutube } from '@tabler/icons-react';
import { useRef } from 'react';
import { toast } from 'react-toastify';

const sosialMedia = [
  {
    title: "Facebook",
    link: "https://www.facebook.com/DarmasabaDesaku",
    icon: IconBrandFacebook,
  },
  {
    title: "Instagram",
    link: "https://www.instagram.com/ddarmasaba/",
    icon: IconBrandInstagram,
  },
  {
    title: "Youtube",
    link: "https://www.youtube.com/channel/UCtPw9WOQO7d2HIKzKgel4Xg",
    icon: IconBrandYoutube,
  },
  {
    title: "Tiktok",
    link: "https://www.tiktok.com/@desa.darmasaba?is_from_webapp=1&sender_device=pc",
    icon: IconBrandTiktok,
  },
]

const layanandesa = [
  {
    title: "Administrasi Kependudukan",
    link: "/darmasaba/desa/layanan/",
  },
  {
    title: "Layanan Sosial",
    link: "/darmasaba/ekonomi/program-kemiskinan",
  },
  {
    title: "Pengaduan Masyarakat",
    link: "/darmasaba/keamanan/laporan-publik",
  },
  {
    title: "Informasi Publik",
    link: "/darmasaba/ppid/daftar-informasi-publik-desa-darmasaba",
  },
]

const tautanPenting = [
  {
    title: "Portal Badung",
    link: "/darmasaba/desa/berita/semua",
  },
  {
    title: "E-Government",
    link: "/darmasaba/inovasi/desa-digital-smart-village",
  },
  {
    title: "Transparansi",
    link: "/darmasaba/ppid/daftar-informasi-publik-desa-darmasaba",
  }
]

function Footer() {

  const emailRef = useRef<HTMLInputElement>(null)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = emailRef.current?.value.trim();
    if (!email) return toast.error('Email wajib diisi!');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return toast.error('Format email tidak valid!');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Berhasil! Cek email Anda untuk konfirmasi.');
        emailRef.current!.value = '';
      } else {
        toast.error(data.message || 'Gagal berlangganan.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghubungi server. Coba lagi nanti.');
    }
  };


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
                      <Image src="/chatbot-removebg-preview.png" alt="Logo Desa" width={80} height={80} loading="lazy" />
                    </ActionIcon>
                  </Group>
                </Stack>
              </Container>
            </Box>
          </Paper>
        </Center>

        {/* Sarang padding sama dengan Paper di atas (px xl + Container lg) agar tepi footer sejajar konten */}
        <Box px="xl" pt="xl">
          <Container size="lg">
            <Divider color="white" opacity={0.2} mb="xl" />

            <SimpleGrid cols={{ base: 2, md: 4 }} spacing="xl" verticalSpacing="xl">
              <Stack gap="xs">
                <Text c="white" fz="sm" fw={600}>Layanan Desa</Text>
                {layanandesa.map((item) => (
                  <Anchor key={item.title} c="#F3F2EC" fz="xs" href={item.link}>{item.title}</Anchor>
                ))}
              </Stack>

              <Stack gap="xs">
                <Text c="white" fz="sm" fw={600}>Tautan Penting</Text>
                {tautanPenting.map((item) => (
                  <Anchor key={item.title} c="#F3F2EC" fz="xs" href={item.link}>{item.title}</Anchor>
                ))}
              </Stack>
            </SimpleGrid>

            {/* Grid 2 kolom dengan spacing sama: kolom kanan jatuh tepat di garis kolom ke-3 grid link */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" verticalSpacing="xl" mt={48}>
              <Stack gap="xs">
                <Text c="white" fz="sm" fw={600}>Tentang Darmasaba</Text>
                <Text fz="xs" c="#F3F2EC">
                  Darmasaba adalah desa budaya yang kaya akan tradisi dan nilai-nilai warisan Bali.
                </Text>
                <Flex gap="md" mt="xs" c="#F3F2EC">
                  {sosialMedia.map((item) => (
                    <ActionIcon
                      key={item.title}
                      component="a"
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="subtle"
                      color="white"
                      aria-label={item.title}
                    >
                      <item.icon size={22} />
                    </ActionIcon>
                  ))}
                </Flex>
              </Stack>

              <Stack gap="xs">
                <Text c="white" fz="sm" fw={600}>Berlangganan Info</Text>
                <Text c="#F3F2EC" fz="xs">Dapatkan kabar terbaru tentang program dan kegiatan desa langsung ke email Anda.</Text>
                <Group wrap="nowrap" gap="sm" mt="xs" maw={440}>
                  <TextInput
                    flex={1}
                    placeholder="Masukkan email Anda"
                    aria-label="Email untuk berlangganan info"
                    rightSection={<IconAt size={16} />}
                    ref={emailRef} // ini aja cukup
                  />
                  <Button onClick={handleSubmit} variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} radius="md">Daftar</Button>
                </Group>
              </Stack>
            </SimpleGrid>

            <Divider color="white" opacity={0.2} mt={48} mb="md" />
            <Text fz="xs" c="#F3F2EC">© 2025 Desa Darmasaba. Hak cipta dilindungi.</Text>
          </Container>
        </Box>
      </Box>
    </Stack>
  );
}

export default Footer;
