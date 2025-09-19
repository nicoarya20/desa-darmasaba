import colors from "@/con/colors";
import { Container, Image, Stack, Text } from "@mantine/core";
import BackButton from "./layanan/_com/BackButto";

export default function Page() {
    return <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"42"}>
        <Container w={{ base: "100%", md: "50%" }} >
            <BackButton />
            <Stack align="center" gap={0}>
                <Text fz={"3.4rem"} c={colors["blue-button"]} fw={"bold"}>
                    Desa Darmasaba
                </Text>
                <Text
                    fw={"bold"}
                    fz={"1.8rem"}
                >
                   &quot;Dharma Temaja&quot;
                </Text>
            </Stack>
            <Image py={20} src="/api/img/darmasaba.jpeg" w={"100%"} h={"50%"} alt="" loading="lazy"/>
            <Text  fz={"sm"} ta={"justify"}>
            Desa Darmasaba adalah desa yang terletak di Kecamatan Abiansemal, Kabupaten Badung, Provinsi Bali. Desa ini merupakan wilayah paling selatan di Kecamatan Abiansemal.
            </Text>
            <Text py={20} fz={"sm"} ta={"justify"}>
            Sejarah Singkat: Nama &quot;Darmasaba&quot; memiliki kaitan dengan keturunan Danghyang Nirarta, seorang kawi-wiku asal Daha (Jawa Timur). Cucunya, Ida Pedanda Sakti Manuaba, tinggal di Desa Kendran, Tegalalang, Gianyar. 
            </Text>
            <Text  fz={"sm"} ta={"justify"}>
            Pemerintahan Desa: Perbekel (Kepala Desa) Darmasaba saat ini adalah I.B. Surya Prabhawa Manuaba, S.H.,M.H.,NL.P. Struktur pemerintahan desa terdiri dari sekretaris desa, kepala urusan, kepala seksi, dan kepala dusun yang bertugas mengelola berbagai aspek administrasi dan pelayanan masyarakat.
            </Text>
        </Container>
    </Stack>
}