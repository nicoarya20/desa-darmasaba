import colors from '@/con/colors';
import { Box, Center, Image, Paper, SimpleGrid, Stack, Text } from '@mantine/core';

function MaskotDesa() {
  return (
    <Box pb={70}>
      <Stack align='center' gap={0}>
        <Box pb={30}>
          <Center>
            <Image src={"/pudak-icon.png"} alt="" w={{ base: 200, md: 300 }} />
          </Center>
          <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>Maskot Desa</Text>
        </Box>
        <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
          <Text fz={{ base: "md", md: "h3" }} ta={"justify"}>
            Pudak adalah bunga dari tanaman sejenis pandan <Text span fz={{ base: "md", md: "h3" }} fs={"italic"}>(Pandanaceae)</Text>. Bentuk bunga ini tersusun dalam beberapa lapisan, terbungkus oleh kelopak warna putih <Text span fz={{ base: "md", md: "h3" }} fs={"italic"}>(semacam daun lonjong)</Text> yang ujungnya meruncing.
          </Text>
          <Text fz={{ base: "md", md: "h3" }} py={10} ta={"justify"}>
            Bunga Pudak berwarna kuning dan akan terlihat jika kelopak atau pelepahnya telah mekar. Kekhasan dari bunga pudak, yaitu mempunyai aroma wangi yang semerbak nan lembut <Text span fz={{ base: "md", md: "h3" }} fs={"italic"}>(tidak menyengat)</Text>, dan dapat menebar keharuman sepanjang pagi atau pun sore hari. Tanaman ini dapat tumbuh di sepanjang pantai, aliran sungai, di atas batu-batu karang, dan juga di tanah ladang.
          </Text>
          {/* Pohon dan Bunga Pudak */}
          <Box py={20}>
            <SimpleGrid
              cols={{
                base: 1,
                md: 2,
              }}
            >
              <Center>
                <Box>
                  <Paper p={"lg"}>
                    <Image src={"/pohonpudak.png"} alt="" w={{ base: 150, md: 250 }} />
                    <Text ta={"center"} fw={"bold"} c={colors["blue-button"]} fz={{ base: "md", md: "h3" }}>Pohon Pudak</Text>
                  </Paper>
                </Box>
              </Center>
              <Center>
                <Box>
                  <Paper p={"lg"}>
                    <Image src={"/bungapudak.png"} alt="" w={{ base: 150, md: 250 }} />
                    <Text ta={"center"} fw={"bold"} c={colors["blue-button"]} fz={{ base: "md", md: "h3" }}>Bunga Pudak</Text>
                  </Paper>
                </Box>
              </Center>
            </SimpleGrid>
          </Box>
          <Box>
            <Text fz={{ base: "md", md: "h3" }} py={10} ta={"justify"}>
              Dalam Kamus Jawa Kuna- Indonesia kata “Pudak” berarti bunga pandan atau Pandanus Moschatus (Mardiwarsito: 1981: 442). Selain itu bunga pudak juga dapat disebut ketaka atau ketaki (Mardiwarsito, 1981: 276). Sedangkan kata “Sategal” berasal dari kata dasar “Tegal” yang berarti ladang (Mardiwarsito, 1981: 593). Jadi Pudak Sategal dapat diartikan sebagai satu ladang luas yang dipenuhi bunga pudak dan menabar keharuman.
            </Text>
            <Text fz={{ base: "md", md: "h3" }} py={10} ta={"justify"}>
              Pada sebuah kesempatan, Ida Pedanda Putu Pemaron menjelaskan mengenai makna dari istilah Pudak Sategal dengan sebuah analogi bahwa, sekuntum bunga pudak memiliki aroma wangi atau keharuman yang sangat kuat, apalagi jika satu ladang penuh bunga pudak, maka dapat dipastikan aroma keharumannya akan membumbung menyebar ke segala penjuru (Wawancara, 18 Mei 2019 di Geria Putra Mandara Kenderan, Tegallalang).
              “Pudak” ialah sebuah bunga yang memiliki aroma wangi atau keharuman yang semerbak, lembut, dan khas.
            </Text>
          </Box>
          {/* Tari dan Pose Klimaks Sekar Pudak */}
          <Box py={20}>
            <SimpleGrid
              cols={{
                base: 1,
                md: 2,
              }}
            >
              <Box>
                <Center>
                  <Paper p={"lg"}>
                    <Image src={"/tarisekar.png"} alt="" w={{ base: 150, md: 250 }} />
                    <Text ta={"center"} fw={"bold"} c={colors["blue-button"]} fz={{ base: "md", md: "h3" }}>Tari Sekar Pudak</Text>
                  </Paper>
                </Center>
              </Box>
              <Box>
                <Center>
                  <Paper p={"lg"}>
                    <Image src={"/klimakstari.png"} alt="" w={{ base: 150, md: 250 }} />
                    <Text ta={"center"} fw={"bold"} c={colors["blue-button"]} fz={{ base: "md", md: "h3" }}>Pose Klimaks Tari </Text>
                    <Text ta={"center"} fw={"bold"} c={colors["blue-button"]} fz={{ base: "md", md: "h3" }}>Sekar Pudak </Text>
                  </Paper>
                </Center>
              </Box>
            </SimpleGrid>
          </Box>
          <Box>
            <Text fz={{ base: "md", md: "h3" }} py={10} ta={"justify"}>
              Garapan Tari Maskot Desa Darmasaba Sekar Pudak diwujudkan ke dalam bentuk tari kreasi yang ditarikan secara berkelompok dengan jumlah lima orang penari perempuan (putri).
            </Text>
            <Text fz={{ base: "md", md: "h3" }} py={10} ta={"justify"}>
              Pemilihan penari perempuan dimaksudkan untuk mempresentasikan keindahan, keluwesan, dan keharuman dari bunga pudak. Sedangkan penetapan jumlah penari lima orang didasarkan atas pertimbangan kebutuhan koreografi agar dapat membentuk desain-desain komposisi lantai yang menarik dan dinamis, baik ketika ditarikan di area panggung yang luas atau pun area panggung yang kecil. Penyajian tari maskot ini dirancang dengan durasi waktu 9 menit.
            </Text>
          </Box>
        </Paper>
      </Stack>
    </Box >
  );
}


export default MaskotDesa;
