'use client'
import colors from '@/con/colors';
import { ActionIcon, Anchor, Box, Center, Container, Divider, Flex, Group, Image, Paper, SimpleGrid, Stack, Text, TextInput, Title, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconAt, IconBrandFacebook, IconBrandInstagram, IconBrandTwitter, IconBrandWhatsapp } from '@tabler/icons-react';

function Footer() {
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  return (
    <>
      <Stack bg={colors["blue-button"]}>
        <Box w={mobile ? "100%" : "100%"} p={"xl"} h={{ base: 1850, md: 1100 }} >
          <Center>
            <Paper w={"100%"}>
              <Box component="footer" py="xl">
                <Container size="lg">
                  <Stack gap="xl">
                    <Box>
                      <Title fz={"md"} order={2} fw={700} mb="md">Komitmen Dalam Pelayanan</Title>
                      <Stack gap="sm">
                        <Group align="flex-start" gap="xs">
                          <Text fz={"sm"} fw={700}>1. Transparansi:</Text>
                          <Text fz={"sm"}>
                            Kami berkomitmen untuk mengelola dana desa secara terbuka, sehingga masyarakat dapat
                            mengetahui penggunaan anggaran secara jelas dan bertanggung jawab.
                          </Text>
                        </Group>

                        <Group align="flex-start" gap="xs">
                          <Text fz={"sm"} fw={700}>2. Profesionalisme:</Text>

                          <Text fz={"sm"}>
                            Setiap layanan desa akan dilakukan dengan profesional, cepat, dan tanpa diskriminasi,
                            demi memastikan kepuasan masyarakat.
                          </Text>
                        </Group>

                        <Group align="flex-start" gap="xs">
                          <Text fz={"sm"} fw={700}>3. Partisipatif:</Text>
                          <Text fz={"sm"}>
                            Kami percaya bahwa partisipasi aktif masyarakat adalah kunci keberhasilan pembangunan desa.
                            Oleh karena itu, kami akan terus melibatkan warga dalam setiap proses pengambilan keputusan.
                          </Text>
                        </Group>

                        <Group align="flex-start" gap="xs">
                          <Text fz={"sm"} fw={700}>4. Inovasi:</Text>
                          <Text fz={"sm"}>
                            Kami berkomitmen untuk terus berinovasi dalam memberikan solusi bagi permasalahan desa,
                            termasuk melalui pemanfaatan teknologi untuk mempermudah akses layanan.
                          </Text>
                        </Group>

                        <Group align="flex-start" gap="xs">
                          <Text fz={"sm"} fw={700}>5. Berkeadilan:</Text>
                          <Text fz={"sm"}>
                            Setiap kebijakan dan program desa akan dirancang untuk memberikan manfaat yang merata
                            bagi seluruh lapisan masyarakat, tanpa memandang status sosial atau ekonomi.
                          </Text>
                        </Group>

                        <Group align="flex-start" gap="xs">
                          <Text fz={"sm"} fw={700}>6. Pemberdayaan:</Text>
                          <Text fz={"sm"}>
                            Kami berkomitmen untuk memberdayakan masyarakat melalui pelatihan, pendampingan,
                            dan dukungan terhadap usaha-usaha lokal agar desa semakin mandiri.
                          </Text>
                        </Group>

                        <Group align="flex-start" gap="xs">
                          <Text fz={"sm"} fw={700}>7. Ramah Lingkungan:</Text>
                          <Text fz={"sm"}>
                            Seluruh kegiatan pembangunan dan pelayanan desa akan memperhatikan keberlanjutan lingkungan,
                            demi menjaga keseimbangan alam dan kenyamanan hidup warga.
                          </Text>
                        </Group>
                      </Stack>
                    </Box>

                    <Divider />

                    <Box>
                      <Title fz={"md"} order={2} fw={700} mb="md">Tujuan Akhir</Title>
                      <Text fz={"sm"} mb="sm">
                        Dengan visi, misi dan komitmen ini, kami bertekad untuk menjadikan desa sebagai tempat tinggal
                        yang nyaman, aman dan sejahtera bagi seluruh warganya.
                      </Text>
                      <Text fz={"sm"} mb="sm">
                        Kami percaya bahwa kemajuan desa dimulai dari kerjasama antara pemerintah desa dan masyarakat,
                        serta didukung oleh tata kelola yang baik dan berorientasi pada kepentingan bersama. Jika ada
                        masukan untuk lembaga desa, silahkan hubungi pada nomor pengaduan di bawah, terima kasih.
                      </Text>
                    </Box>

                    <Group justify='apart' align="center">
                      <Text ta={"center"} fz={"sm"} fw={700} size="lg" style={{ fontStyle: 'italic' }}>{"Desa Kuat, Masyarakat Sejahtera!"}</Text>
                      <Box
                        style={{
                          width: 80,
                          height: 80,
                          position: 'relative'
                        }}
                      >
                        <Image src="/api/img/chatbot-removebg-preview.png" alt="Logo Desa" width={80} height={80} />
                      </Box>
                    </Group>
                  </Stack>
                </Container>
              </Box>
            </Paper>
          </Center>
          <Box py={20}>
            <SimpleGrid
              p={20}
              cols={{
                base: 2,
                sm: 4,
              }}
              style={{
                color: "white"
              }}
            >
              <Box p={mobile ? 30 : 30}>
                <Stack justify='space-between'>
                  <Text fz={"md"} fw={"bold"}>Tentang Darmasaba</Text>
                  <Text fz={"xs"} >Desa Darmasaba adalah desa
                    budaya yang kaya akan tradisi dan
                    nilai-nilai luhur masyarakat Bali.</Text>
                  <Box>
                    <Flex gap={"md"}>
                      <ActionIcon variant='transparent'>
                        <IconBrandFacebook color='white' size={"30"} />
                      </ActionIcon>
                      <ActionIcon variant='transparent'>
                        <IconBrandInstagram color='white' size={"30"} />
                      </ActionIcon>
                      <ActionIcon variant='transparent'>
                        <IconBrandTwitter color='white' size={"30"} />
                      </ActionIcon>
                      <ActionIcon variant='transparent'>
                        <IconBrandWhatsapp color='white' size={"30"} />
                      </ActionIcon>
                    </Flex>
                  </Box>
                </Stack>
              </Box>
              <Box p={mobile ? 30 : 30}>
                <Stack justify='space-between' gap={"xs"}>
                  <Text fz={"md"} fw={"bold"}>Layanan</Text>
                  <Anchor c={"white"} variant='transparent'>
                    <Text fz={"xs"} >Administrasi Kependudukan</Text>
                  </Anchor>
                  <Anchor c={"white"} variant='transparent'>
                    <Text fz={"xs"} >Pelayanan Sosial</Text>
                  </Anchor>
                  <Anchor c={"white"} variant='transparent'>
                    <Text fz={"xs"} >Pengaduan Masyarakat</Text>
                  </Anchor>
                  <Anchor c={"white"} variant='transparent'>
                    <Text fz={"xs"} >Informasi Publik</Text>
                  </Anchor>
                </Stack>
              </Box>
              <Box p={mobile ? 30 : 30}>
                <Stack justify='space-between' gap={"xs"}>
                  <Text fz={"md"} fw={"bold"}>Tautan Penting</Text>
                  <Anchor c={"white"} variant='transparent'>
                    <Text fz={"xs"} >Portal Badung</Text>
                  </Anchor>
                  <Anchor c={"white"} variant='transparent'>
                    <Text fz={"xs"} >E-Government</Text>
                  </Anchor>
                  <Anchor c={"white"} variant='transparent'>
                    <Text fz={"xs"} >Transparansi</Text>
                  </Anchor>
                  <Anchor c={"white"} variant='transparent'>
                    <Text fz={"xs"} >Unduhan</Text>
                  </Anchor>
                </Stack>
              </Box>
              <Box p={mobile ? 30 : 30}>
                <Stack justify='space-between'>
                  <Text fz={"md"} fw={"bold"}>Newsletter</Text>
                  <Text fz={"xs"} >Dapatkan informasi terbaru
                    tentang kegiatan dan program
                    desa</Text>
                  <TextInput
                    placeholder='Alamat email anda'
                    rightSection={<IconAt color={colors["blue-button"]} />}
                  />
                </Stack>
              </Box>
            </SimpleGrid>
          </Box>
          <Divider py={15} />
          <Text ta={"center"} c={"white"} p={20}>
          © 2024 Desa Darmasaba. Hak Cipta Dilindungi.
          </Text>
        </Box>
      </Stack>
    </>
  );
}

export default Footer;
