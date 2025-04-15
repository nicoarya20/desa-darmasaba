import colors from '@/con/colors';
import { Box, Center, Container, Divider, Grid, GridCol, Group, Image, Pagination, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconCalendar, IconUser } from '@tabler/icons-react';
import React from 'react';

const dataBeritaTerbaru = [
  {
    id: 1,
    judul: 'AKSI BERSIH DESA MEMPERINGATI HARI PEDULI SAMPAH NASIONAL 2025',
    image: "/api/img/sosial-1.jpeg",
    tanggal: "Selasa, 11 Januari 2025",
  },
  {
    id: 2,
    judul: 'Sosialisasi Pengelolaan Sampah di SD No. 3 Darmasaba dalam Kolaborasi Mahasiswa KKN-PMM I Universitas Warmadewa di Desa Darmasaba',
    image: "/api/img/sosial-2.jpeg",
    tanggal: "Kamis, 13 Januari 2025",
  },
  {
    id: 3,
    judul: 'Tim Voli Darmasaba Raih Juara Turnamen Desa',
    image: "/api/img/prestasi-voli.jpeg",
    tanggal: "Kamis, 13 Januari 2025",
  },
]
function Sosial() {
  return (
    <Box py={20}>
      <Container size="xl" px={{ base: "md", md: "xl" }}>
        <Grid gutter={{ base: "md", md: "xl" }} pb={70}>
          {/* Berita Utama */}
          <GridCol span={{ base: 12, md: 8 }}>
            <Paper p="md" shadow="sm" radius="md">
              <Stack gap="md">
                <Box>
                  <Image
                    src="/api/img/sosial-1.jpeg"
                    alt="Darmasaba Smart Village"
                    radius="md"
                    fit="cover"
                    h={{ base: 450, md: 635 }}
                  />
                </Box>
                <Group>
                  <Paper px={10} py={5} radius="xl" bg={colors['BG-trans']}>
                    <Text size="sm">Sosial</Text>
                  </Paper>
                </Group>
                <Text fz={{ base: "xl", md: "2xl" }} fw="bold" lineClamp={2}>
                AKSI BERSIH DESA MEMPERINGATI HARI PEDULI SAMPAH NASIONAL 2025
                </Text>
                <Text size="md" lineClamp={3}>
                AKSI BERSIH DESA MEMPERINGATI HARI PEDULI SAMPAH NASIONAL 2025 ♻️  
Dalam semangat Hari Peduli Sampah Nasional (HPSN) 2025, Aksi Bersih Desa sukses digelar di Lombok Utara serta beberapa wilayah lain, termasuk Kabupaten Badung yang berpusat di TPS 3R Pudak Mesari, Desa Darmasaba. ?✨  

Kegiatan ini melibatkan berbagai pihak seperti Pusdal LH BN - KLH, DKLH Provinsi Bali, DLHK Kab. Badung, Pemdes Darmasaba, BPD, LPM, TPS 3R Pudak Mesari, Lembaga Kemasyarakatan Desa, serta masyarakat Darmasaba.  

Selain aksi bersih, Desa Darmasaba juga meluncurkan Pemuda Peduli Lingkungan sebagai garda terdepan dalam gerakan sadar lingkungan! 

Mengapa ini penting?  
- Pengelolaan sampah harus dimulai dari sumbernya melalui pemilahan, pemanfaatan, hingga penyelesaian residu.  
- Inovasi &quot;Galah Melah&quot; & &quot;BARES&quot; menjadi contoh nyata dalam menciptakan lingkungan yang bersih & berkelanjutan.  
- Darmasaba terpilih sebagai 1 dari 8 desa se-Indonesia untuk peringatan HPSN 2025, sebuah kebanggaan sekaligus tanggung jawab bersama! ✨  

&quot;Kami berharap aksi ini bukan sekadar seremoni, tetapi menjadi budaya masyarakat dalam memilah dan mengelola sampah dari sumbernya.&quot; - Ibu Cokorda Istri Muter Handayani, Plt. Kabid Wilayah Bali, Pusat Pengendalian LH Bali & Nusra.  

&quot;Ke depan, kami menargetkan setiap desa di Badung memiliki komunitas Pemuda Peduli Lingkungan agar pengelolaan sampah lebih optimal dan berkelanjutan.&quot; - Bapak Ida Bagus Gede Arjana, Plt. Kadis DLHK Kab. Badung.  

&quot;Darmasaba menjadi contoh desa aktif dalam pengelolaan sampah. Kami berharap inovasi ini menginspirasi desa lain.&quot; - Ida Bagus Surya Prabhawa Manuaba, Perbekel Darmasaba.  

Mari bersama wujudkan lingkungan yang lebih bersih, sehat, dan lestari!  
Jaga Bumi, Pilah Sampah dari Sekarang! ♻️
                </Text>
                <Group>
                  <Group gap="xs">
                    <IconCalendar size={18} />
                    <Text size="sm">Selasa, 11 Januari 2025</Text>
                  </Group>
                  <Group gap="xs">
                    <IconUser size={18} />
                    <Text size="sm">Admin Desa</Text>
                  </Group>
                </Group>
              </Stack>
            </Paper>
          </GridCol>

          {/* Berita Sampingan */}
          <GridCol span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              {/* Berita Sampingan 1 */}
              <Paper p="md" shadow="sm" radius="md">
                <Stack gap="sm">
                  <Image
                    radius="md"
                    src="/api/img/sosial-2.jpeg"
                    alt="Darmasaba Smart Village"
                    fit="cover"
                    h={180}
                  />
                  <Group>
                    <Paper px={10} py={5} radius="xl" bg={colors['BG-trans']}>
                      <Text size="sm">Sosial</Text>
                    </Paper>
                  </Group>
                  <Text fz="lg" fw="bold" lineClamp={2}>
                  Sosialisasi Pengelolaan Sampah di SD No. 3 Darmasaba dalam Kolaborasi Mahasiswa KKN-PMM I Universitas Warmadewa di Desa Darmasaba
                  </Text>
                  <Group>
                    <Group gap="xs">
                      <IconCalendar size={18} />
                      <Text size="sm">Selasa, 11 Januari 2025</Text>
                    </Group>
                    <Group gap="xs">
                      <IconUser size={18} />
                      <Text size="sm">Admin Desa</Text>
                    </Group>
                  </Group>
                </Stack>
              </Paper>

              {/* Berita Sampingan 2 */}
              <Paper p="md" shadow="sm" radius="md">
                <Stack gap="sm">
                  <Image
                    radius="md"
                    src="/api/img/prestasi-voli.jpeg"
                    alt="Prestasi Voli"
                    fit="cover"
                    h={180}
                  />
                  <Group>
                    <Paper px={10} py={5} radius="xl" bg={colors['BG-trans']}>
                      <Text size="sm">Sosial</Text>
                    </Paper>
                  </Group>
                  <Text fz="lg" fw="bold" lineClamp={2}>
                    Tim Voli Darmasaba Raih Juara Turnamen Desa
                  </Text>
                  <Group>
                    <Group gap="xs">
                      <IconCalendar size={18} />
                      <Text size="sm">Selasa, 11 Januari 2025</Text>
                    </Group>
                    <Group gap="xs">
                      <IconUser size={18} />
                      <Text size="sm">Admin Desa</Text>
                    </Group>
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          </GridCol>
        </Grid>
        <Box pb={30}>
          <Text fz={"h1"} fw={"bold"}>Berita Terbaru</Text>
          <Divider color={colors["blue-button"]} />
        </Box>
        <SimpleGrid cols={{ base: 1, md: 3 }}>
          {dataBeritaTerbaru.map((v, k) => {
            return (
              <Paper key={k} p="md" shadow="sm" radius="md">
                <Stack gap="sm">
                  <Image
                    radius="md"
                    src={v.image}
                    alt="Prestasi Voli"
                    fit="cover"
                    h={180}
                  />
                  <Group>
                    <Paper px={10} py={5} radius="xl" bg={colors['BG-trans']}>
                      <Text size="sm">Teknologi</Text>
                    </Paper>
                  </Group>
                  <Text fz="lg" fw="bold" lineClamp={2}>
                    {v.judul}
                  </Text>
                  <Group>
                    <Group gap="xs">
                      <IconCalendar size={18} />
                      <Text size="sm">{v.tanggal}</Text>
                    </Group>
                    <Group gap="xs">
                      <IconUser size={18} />
                      <Text size="sm">Admin Desa</Text>
                    </Group>
                  </Group>
                </Stack>
              </Paper>
            )
          })}
        </SimpleGrid>
        <Box py={"xl"}>
          <Center>
            <Pagination total={10} />
          </Center>
        </Box>
      </Container>
    </Box>
  );
}

export default Sosial;
