import colors from '@/con/colors';
import { Box, Center, Image, Paper, Stack, Text } from '@mantine/core';

function SejarahDesa() {
  return (
    <>
      <Box pb={70}>
        <Stack align='center' gap={0}>
          <Box pb={30}>
            <Center>
              <Image src={"/api/img/darmasaba-icon.png"} alt="" w={{ base: 200, md: 300 }} />
            </Center>
            <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>Sejarah Desa</Text>
          </Box>
          <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
            <Text fz={{ base: "md", md: "h3" }} ta={"justify"}>
              Asal –usul nama Darmasaba tertuang dalam lontar Usada Bali. Seperti di tulis dalam monografi Desa Darmasaba tahun 1980 silam, nama Darmasaba berkaitan dengan keturunan Danghyang Nirarta diceritakan, Sang kawi-wiku asal Daha (Jawa Timur) itu memiliki cucu bernama Ida Pedanda Sakti Manuaba yang tigggal di Desa Kendran Tegalalang Gianyar.
            </Text>
            <Text fz={{ base: "md", md: "h3" }} py={10} ta={"justify"}>
              Merasa tidak disenangi sang ayah, Ida Pedanda Sakti Manuaba pergi mengembara bersama dua orang pengiringnya. Pengembaraan sang pendeta sampai di pura Sarin Buana di Jimbaran. Saat mengadakan semedi di tempat ini sang pendeta melihat sinar api. Yang sangat jauh di utara. Timbul keinginan Ida Pedanda Manuaba untuk mengunjungi tempat itu.
            </Text>
            <Text fz={{ base: "md", md: "h3" }} ta={"justify"}>
              Sampailah sang Pedanda di pura Batan Bila Peguyangan. Disini Ida Pedanda Manuaba singgah menghadap Ida Pedanda Budha yang tinggal disana. Selanjutnya, kedua pendeta bersama-sama menuju arah utara dan singgah di Taman Cang Ana, sebuah taman milik Arya Lanang Blusung. Di tempat ini kedua pendeta bersama-sama melaksanakan semedi dan menetap untuk sementara waktu.
            </Text>
          </Paper>

        </Stack>
      </Box >
    </>
  );
}

export default SejarahDesa;
