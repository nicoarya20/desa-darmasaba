import colors from '@/con/colors';
import { Stack, Box, Text, Paper, Flex, Image, Divider, Center, SimpleGrid, List, ListItem } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <Text ta={"center"} fz={{ base: "2rem", md: "2.5rem", lg: "3rem", xl: "3.4rem" }} c={colors["blue-button"]} fw={"bold"}>
          Profil Singkat PPID Desa Darmasaba
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Paper p={"xl"} bg={colors['white-trans-1']}>
          <Box px={{ base: "md", md: 100 }}>
            <Flex align={"center"} gap={50}>
              <Image src={"/api/img/darmasaba-icon.png"} h={{ base: 80, md: 150 }} alt='' />
              <Text fz={{ base: "1.4rem", md: "2rem", lg: "2.5rem", xl: "3rem" }} fw={'bold'}>PROFIL PIMPINAN BADAN PUBLIK DESA DARMASABA </Text>
            </Flex>
          </Box>
          <Divider my={"md"} />
          {/* biodata perbekel */}
          <Box px={{base: 0, md: 50}} pb={30}>
            <SimpleGrid
              cols={{
                base: 1,
                md: 1,
                lg: 1,
                xl: 2,
              }}
            >
              <Box px={{ base: 0, md: 50 }}>
                <Paper bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
                  <Stack gap={0}>
                    <Center>
                      <Image pt={{ base: 0, md: 90 }} src={"/api/img/perbekel.png"} w={{ base: 250, md: 355 }} alt='' />
                    </Center>
                    <Paper
                      bg={colors['blue-button']}
                      py={30}
                      className="glass3"
                      px={{ base: 20, md: 20 }}

                    >
                      <Text ta={"center"} c={colors['white-1']} fw={"bolder"} fz={{ base: "1.5rem", md: "2.125rem", lg: "2.25rem", xl: "1.5rem" }}>
                        I.B. Surya Prabhawa Manuaba,
                      </Text>
                      <Text ta={"center"} c={colors['white-1']} fw={"bolder"} fz={{ base: "1.5rem", md: "2.125rem", lg: "2.25rem", xl: "1.5rem" }}>
                        S.H.,M.H.,NL.P.
                      </Text>
                    </Paper>
                  </Stack>
                </Paper>
              </Box>
              <Box>
                <Box>
                  <Text fz={{ base: "1.125rem", md: "1.375rem", lg: "1.75rem", xl: "2rem" }} fw={'bold'}>Biodata</Text>
                  <Text fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} ta={"justify"}>I.B Surya Prabhawa Manuaba, S.H., M.H., adalah Perbekel  Darmasaba periode 2021-2027, seorang advokat, pendiri Mantra Legal Consultants & Advocates, serta aktif di bidang musik dan akademis.</Text>
                  <Text fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} ta={"justify"}>Dia menempuh pendidikan hukum di Universitas Udayana dan Universitas Mahasaraswati Denpasar, serta memiliki pengalaman luas di berbagai organisasi dan kepemimpinan.</Text>
                </Box>
                <Box>
                  <Text fz={{ base: "1.125rem", md: "1.375rem", lg: "1.75rem", xl: "2rem" }} fw={'bold'}>Riwayat Karir</Text>
                  <Text fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} >2021 - 2027: Perbekel Desa Darmasaba</Text>
                  <Text fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} >2015 - Sekarang: Founder & Managing Director Mantra Legal Consultants & Advocates</Text>
                  <Text fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} >2020 - Sekarang: Founder Ugawa Record Music Studio</Text>
                  <Text fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} >2010 - 2016: Dosen Fakultas Hukum Universitas Mahasaraswati Denpasar</Text>
                </Box>
              </Box>
            </SimpleGrid>
          </Box>
          <Box pb={30}>
            <Text fz={{ base: "1.125rem", md: "1.375rem", lg: "1.75rem", xl: "2rem" }} fw={'bold'}>Pengalaman Organisasi</Text>
            <List>
              <Box px={20}>
                <ListItem fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} ta={"justify"}>1996 - 1997: Ketua OSIS SMP Negeri 1 Abiansemal</ListItem>
                <ListItem fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} ta={"justify"}>1999 - 2000: Ketua OSIS SMA Negeri 1 Mengwi</ListItem>
                <ListItem fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} ta={"justify"}>2008 - 2009: Ketua BEM Universitas Mahasaraswati Denpasar</ListItem>
                <ListItem fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} >2008 - 2010: Ketua Sekaa Taruna Sila Dharma, Banjar Tengah, Desa Adat Tegal, Darmasaba</ListItem>
                <ListItem fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} >2020 - Sekarang: Pengurus Young Lawyer Committee Peradi Denpasar</ListItem>
                <ListItem fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} >2021 - Sekarang: Dewan Kehormatan Himpunan Pengusaha Muda Indonesia (HIPMI) Badung</ListItem>
                <ListItem fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} >2023 - 2028: Komite Tetap Advokasi - Bidang Hukum dan Regulasi Kamar Dagang dan Industri Badung</ListItem>
              </Box>
            </List>
          </Box>
          <Box pb={20}>
            <Text pb={20} fz={{ base: "1.125rem", md: "1.375rem", lg: "1.75rem", xl: "2rem" }} fw={'bold'}>Program Kerja Unggulan</Text>
            <Text fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} fw={'bold'}>Pemberdayaan Ekonomi dan UMKM</Text>
            <List>
              <Box px={20}>
                <ListItem fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} ta={"justify"}>Pelatihan dan pendampingan UMKM lokal</ListItem>
                <ListItem fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} ta={"justify"}>Program bantuan modal usaha bagi pelaku usaha kecil</ListItem>
                <ListItem fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} ta={"justify"}>Digitalisasi UMKM untuk meningkatkan pemasaran produk lokal</ListItem>
              </Box>
            </List>
          </Box>
          <Box>
            <Text fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} fw={'bold'}>Peningkatan Infrastruktur Desa</Text>
            <List>
              <Box px={20}>
                <ListItem fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} ta={"justify"}>Pembangunan dan perbaikan jalan desa</ListItem>
                <ListItem fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} ta={"justify"}>Penyediaan fasilitas umum dan ruang terbuka hijau</ListItem>
                <ListItem fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }} ta={"justify"}>Optimalisasi layanan publik berbasis digital</ListItem>
              </Box>
            </List>
          </Box>
        </Paper>
      </Box>
    </Stack>
  );
}

export default Page;
