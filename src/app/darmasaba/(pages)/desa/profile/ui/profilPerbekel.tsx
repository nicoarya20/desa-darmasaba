import colors from '@/con/colors';
import { Box, Image, List, ListItem, Paper, SimpleGrid, Stack, Text } from '@mantine/core';

function ProfilPerbekel() {
  return (
    <Box pb={70}>
      <Stack align='center' gap={0}>
        <Box pb={30}>
          <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>Profil Perbekel</Text>
        </Box>
      </Stack>
      <SimpleGrid
        cols={{
          base: 1,
          md: 2,
        }}
        pb={50}
      >
        <Box>
          <Paper bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
            <Stack gap={0}>
              <Image pt={{ base: 0, md: 120 }} px={"lg"} src={"/api/img/perbekel.png"} sizes='100%' alt='' />
              <Paper
                bg={colors['blue-button']}
                px={"lg"}
                className="glass3"
                py={{ base: 20, md: 50 }}

              >
                <Text c={colors['white-1']} fz={{ base: "md", md: "h3" }}>Perbekel Desa Darmasaba</Text>
                <Text c={colors['white-1']} fw={"bolder"} fz={{ base: "md", md: "h2" }}>
                  I.B. Surya Prabhawa Manuaba, S.H.,M.H.,NL.P.
                </Text>
              </Paper>
            </Stack>
          </Paper>
        </Box>
        <Box>
          <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
            <Text fz={"h2"} fw={"bold"}>
              Biodata
            </Text>
            <Text fz={{ base: "md", md: "h3" }} ta={"justify"}>
              I.B Surya Prabhawa Manuaba, S.H., M.H., adalah Perbekel  Darmasaba periode 2021-2027, seorang advokat, pendiri Mantra Legal Consultants & Advocates, serta aktif di bidang musik dan akademis. Dia menempuh pendidikan hukum di Universitas Udayana dan Universitas Mahasaraswati Denpasar serta memiliki pengalaman luas di berbagai organisasi dan kepemimpinan.
            </Text>
            <Text py={10} fz={"h2"} fw={"bold"}>
              Pengalaman
            </Text>
            <List>
              <Box px={20}>
                <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>2021 - 2027: Perbekel Desa Darmasaba</ListItem>
                <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>2015 - Sekarang: Founder & Managing Director Mantra
                  Legal Consultants & Advocates</ListItem>
                <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>2020 - Sekarang: Founder Ugawa Record Music Studio</ListItem>
                <ListItem fz={{ base: "md", md: "h3" }} >2010 - 2016: Dosen Fakultas Hukum Universitas
                  Mahasaraswati Denpasar</ListItem>
              </Box>
            </List>
            <Text py={10} fz={"h2"} fw={"bold"}>
              Pengalaman Organisasi
            </Text>
            <List>
              <Box px={20}>
                <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>1996 - 1997: Ketua OSIS SMP Negeri 1 Abiansemal</ListItem>
                <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>1999 - 2000: Ketua OSIS SMA Negeri 1 Mengwi</ListItem>
                <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>2008 - 2009: Ketua BEM Universitas Mahasaraswati Denpasar</ListItem>
                <ListItem fz={{ base: "md", md: "h3" }} >2008 - 2010: Ketua Sekaa Taruna Sila Dharma, Banjar Tengah, Desa Adat Tegal, Darmasaba</ListItem>
                <ListItem fz={{ base: "md", md: "h3" }} >2020 - Sekarang: Pengurus Young Lawyer Committee Peradi Denpasar</ListItem>
                <ListItem fz={{ base: "md", md: "h3" }} >2021 - Sekarang: Dewan Kehormatan Himpunan Pengusaha Muda Indonesia (HIPMI) Badung</ListItem>
                <ListItem fz={{ base: "md", md: "h3" }} >2023 - 2028: Komite Tetap Advokasi - Bidang Hukum dan Regulasi Kamar Dagang dan Industri Badung</ListItem>
              </Box>
            </List>
          </Paper>
        </Box>

      </SimpleGrid>
      <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
        <Text py={10} fz={{ base: "md", md: "h1" }} fw={"bold"} >
          Program Kerja Unggulan
        </Text>
        <Stack>
          <Box>
            <Text fz={{ base: "md", md: "h3" }} fw={"bold"} ta={"justify"}>
              Pemberdayaan Ekonomi dan UMKM
            </Text>
            <List>
              <Box px={10}>
                <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>Pelatihan dan pendampingan UMKM lokal</ListItem>
                <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>Program bantuan modal usaha bagi pelaku usaha kecil</ListItem>
                <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>Digitalisasi UMKM untuk meningkatkan pemasaran produk lokal</ListItem>
              </Box>
            </List>
          </Box>
          <Box>
            <Text fz={{ base: "md", md: "h3" }} fw={"bold"} ta={"justify"}>
            Peningkatan Infrastruktur Desa
            </Text>
            <List>
              <Box px={10}>
                <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>Pembangunan dan perbaikan jalan desa</ListItem>
                <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>Penyediaan fasilitas umum dan ruang terbuka hijau</ListItem>
                <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>Optimalisasi layanan publik berbasis digital</ListItem>
              </Box>
            </List>
          </Box>
          <Box>
            <Text fz={{ base: "md", md: "h3" }} fw={"bold"} ta={"justify"}>
            Pendidikan dan Pengembangan SDM
            </Text>
            <List>
              <Box px={10}>
                <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>Beasiswa pendidikan bagi siswa berprestasi dari keluarga kurang mampu</ListItem>
                <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>Program kursus dan pelatihan kerja bagi pemuda desa</ListItem>
                <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>Peningkatan kualitas pendidikan melalui kerja sama dengan perguruan tinggi</ListItem>
              </Box>
            </List>
          </Box>
          <Box>
            <Text fz={{ base: "md", md: "h3" }} fw={"bold"} ta={"justify"}>
            Pelestarian Budaya dan Pariwisata
            </Text>
            <List>
              <Box px={10}>
                <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>Revitalisasi pura dan tempat bersejarah di Darmasaba</ListItem>
                <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>Pengembangan desa wisata berbasis budaya dan seni lokal</ListItem>
                <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>Festival budaya dan seni sebagai daya tarik wisata</ListItem>
              </Box>
            </List>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export default ProfilPerbekel;
