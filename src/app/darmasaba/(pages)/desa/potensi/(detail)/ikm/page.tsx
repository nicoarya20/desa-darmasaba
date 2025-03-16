import colors from '@/con/colors';
import { Stack, Container, Box, List, ListItem, Text, Image } from '@mantine/core';
import React from 'react';
import BackButton from '../../../layanan/_com/BackButto';

function Page() {
    return (
        <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"42"} px={{ base: "md", md: 0 }}>
            <Container w={{ base: "100%", md: "50%" }} >
                <BackButton />
                <Box pb={20}>
                    <Text ta={"center"} fz={"3.4rem"} c={colors["blue-button"]} fw={"bold"}>
                        IKM Berbasis Pengolahan Pangan
                    </Text>
                    <Text
                        ta={"center"}
                        fw={"bold"}
                        fz={"1.4rem"}
                    >
                        Informasi dan Pelayanan Administrasi Digital
                    </Text>
                </Box>
                <Image src="/api/img/ikm.png" alt='' w={"100%"} />
                <Text py={20} fz={{base: "sm", md: "lg"}} ta={"justify"}>
                    Desa Darmasaba, yang terletak di Kecamatan Abiansemal, Kabupaten Badung, memiliki potensi besar dalam Industri Kecil dan Menengah (IKM) berbasis pengolahan pangan. Dengan sumber daya alam yang melimpah dan warisan kuliner khas Bali, Darmasaba dapat mengembangkan sektor ini untuk meningkatkan kesejahteraan masyarakat dan menciptakan lapangan kerja baru.
                </Text>
                <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>
                    Potensi dan Peran IKM Berbasis Pengolahan Pangan:
                </Text>
                <List py={20} type='ordered'>
                    <ListItem fz={{base: "sm", md: "lg"}} ta={"justify"}>
                        <Text fz={{base: "sm", md: "lg"}} fw={"bold"}>Produk Unggulan Pengolahan Pangan</Text>
                        <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>Beberapa produk olahan pangan yang potensial dikembangkan di Darmasaba meliputi:</Text>
                        <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Keripik dan Snack Tradisional : Seperti keripik pisang, keripik singkong, dan rengginang.</Text>
                        <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Sambal Khas Bali : Seperti sambal matah dan sambal embe yang banyak diminati pasar lokal dan nasional.</Text>
                        <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Minuman Herbal dan Jamu : Berbasis rempah seperti kunyit asam, beras kencur, dan wedang jahe.</Text>
                        <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Olahan Makanan Berbasis Kelapa : Seperti virgin coconut oil (VCO), serundeng, dan gula aren.</Text>
                        <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Kue Tradisional Bali : Seperti jaje laklak, jaje uli, dan klepon yang dapat dikemas secara modern.</Text>
                    </ListItem>
                    <ListItem fz={{base: "sm", md: "lg"}} ta={"justify"}>
                        <Text fz={{base: "sm", md: "lg"}} fw={"bold"}>Peluang Ekonomi dan Pemberdayaan UMKM:</Text>IKM berbasis pengolahan pangan dapat membuka peluang bagi masyarakat, terutama ibu rumah tangga dan pemuda desa, untuk berwirausaha. Dengan dukungan modal dan pelatihan dari pemerintah desa atau BUMDes Pudak Mesari, usaha kecil ini dapat berkembang menjadi industri yang lebih besar.
                    </ListItem>
                    <ListItem fz={{base: "sm", md: "lg"}} ta={"justify"}>
                        <Text fz={{base: "sm", md: "lg"}} fw={"bold"}>Digitalisasi dan Pemasaran Online:</Text>Darmasaba dapat mengembangkan kawasan sentra IKM sebagai pusat produksi, pelatihan, dan pemasaran produk olahan pangan. Dengan adanya fasilitas ini, para pelaku usaha dapat lebih mudah berkolaborasi, meningkatkan kualitas produk, serta mendapatkan akses ke permodalan dan distribusi yang lebih luas.
                    </ListItem>
                    <ListItem fz={{base: "sm", md: "lg"}} ta={"justify"}>
                        <Text fz={{base: "sm", md: "lg"}} fw={"bold"}>Pengembangan Kawasan Sentra IKM:</Text>Dengan berkembangnya sektor kuliner, banyak pelaku UMKM di Darmasaba mulai merintis usaha makanan, baik dalam bentuk warung makan, katering, hingga produksi makanan ringan seperti keripik, sambal, dan minuman tradisional. Potensi ini dapat terus dikembangkan dengan dukungan pemerintah desa dan promosi melalui media sosial.
                    </ListItem>
                    <ListItem fz={{base: "sm", md: "lg"}} ta={"justify"}>
                        <Text fz={{base: "sm", md: "lg"}} fw={"bold"}>Sinergi dengan Pariwisata dan Agrowisata:</Text>Dengan berkembangnya sektor wisata di Darmasaba, produk olahan pangan dapat dijadikan suvenir khas desa. Pengunjung dapat membeli oleh-oleh seperti sambal kemasan, jajanan khas, atau minuman herbal sebagai bagian dari pengalaman wisata mereka.
                    </ListItem>
                </List>
                <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>
                    IKM berbasis pengolahan pangan memiliki potensi besar untuk menjadi sektor unggulan di Desa Darmasaba. Dengan inovasi, dukungan teknologi, serta pemasaran yang baik, produk-produk lokal dapat bersaing di pasar yang lebih luas, meningkatkan kesejahteraan masyarakat, dan menjadikan Darmasaba sebagai pusat industri pangan kreatif di Kabupaten Badung.
                </Text>
            </Container>
        </Stack>
    );
}

export default Page;
