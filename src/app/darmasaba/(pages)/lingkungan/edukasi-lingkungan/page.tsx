import colors from '@/con/colors';
import { Box, List, ListItem, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import BackButton from '../../desa/layanan/_com/BackButto';

const data = [
  {
    id: 1,
    title: 'Tujuan Edukasi Lingkungan',
    listDeskripsi: <List fz={'h4'} pr={20} ta={'justify'}>
      <ListItem>
        Meningkatkan kesadaran masyarakat tentang pentingnya lingkungan bersih dan sehat
      </ListItem>
      <ListItem>
        Mendorong partisipasi warga dalam kegiatan pengelolaan sampah, penghijauan, dan konservasi
      </ListItem>
      <ListItem>
        Mengurangi dampak negatif terhadap lingkungan dari kegiatan manusia
      </ListItem>
      <ListItem>
        Membentuk generasi muda yang peduli terhadap isu-isu lingkungan
      </ListItem>
    </List>
  },
  {
    id: 2,
    title: 'Materi Edukasi yang Diberikan',
    listDeskripsi: <List fz={'h4'} pr={20} ta={'justify'}>
      <ListItem>
        Pengelolaan Sampah (Pilah sampah organik dan anorganik)
      </ListItem>
      <ListItem>
        Pencegahan pencemaran lingkungan (air, udara, dan tanah)
      </ListItem>
      <ListItem>
        Pemanfaatan lahan hijau dan penghijauan desa
      </ListItem>
      <ListItem>
        Daur ulang dan kreatifitas dari sampah
      </ListItem>
      <ListItem>
        Bahaya pembakaran sampah sembarangan
      </ListItem>
    </List>
  },
  {
    id: 3,
    title: 'Contoh Kegiatan di Desa Darmasaba',
    listDeskripsi: <List fz={'h4'} pr={20} ta={'justify'}>
      <ListItem>
        Pelatihan membuat kompos dari sampah rumah tangga
      </ListItem>
      <ListItem>
        Gerakan &quot;Jumat Bersih&quot; rutin
      </ListItem>
      <ListItem>
        Workshop membuat ecobrick
      </ListItem>
      <ListItem>
        Lomba kebersihan antar banjar
      </ListItem>
      <ListItem>
        Sosialisasi lingkungan di sekolah dan posyandu
      </ListItem>
    </List>
  },
]
function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} pb={20}>
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Edukasi Lingkungan
        </Text>
        <Text px={20} ta={'center'} fz={'h4'}>
          Edukasi Lingkungan adalah bagian penting dalam membentuk perilaku masyarakat yang peduli dan bertanggung jawab terhadap kelestarian alam. Melalui program ini, masyarakat diajak untuk memahami pentingnya menjaga lingkungan demi kesehatan, kenyamanan, dan keberlanjutan hidup bersama.
        </Text>
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <SimpleGrid
          cols={{
            base: 1,
            md: 3,
          }}>
          {data.map((v, k) => {
            return (
              <Box key={k}>
                <Paper h={{base: 0, md: 350}} p={20} bg={colors['white-trans-1']}>
                  <Text  fz={'h3'} fw={'bold'} c={colors['blue-button']}>{v.title}</Text>
                  {v.listDeskripsi}
                </Paper>
              </Box>
            )
          })}
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

export default Page;
