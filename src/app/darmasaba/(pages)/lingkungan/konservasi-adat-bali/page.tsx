import colors from '@/con/colors';
import { Box, List, ListItem, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import BackButton from '../../desa/layanan/_com/BackButto';

const data = [
  {
    id: 1,
    title: 'Filosofi Tri Hita Karana',
    listDeskripsi: <List fz={'h4'} pr={20} ta={'justify'}>
      <ListItem>
        Parahyangan: Hubungan manusia dengan Tuhan
      </ListItem>
      <ListItem>
        Pawongan: Hubungan antar manusia
      </ListItem>
      <ListItem>
        Palemahan: Hubungan manusia dengan alam
      </ListItem>
    </List>
  },
  {
    id: 2,
    title: 'Bentuk Konservasi Berdasarkan Adat',
    listDeskripsi: <List fz={'h4'} pr={20} ta={'justify'}>
      <ListItem>
        Pelestarian Hutan Adat seperti Alas Pala Sangeh atau Wana Kerthi
      </ListItem>
      <ListItem>
        Subak: Sistem pengelolaan irigasi tradisional yang menjunjung kebersamaan dan keberlanjutan
      </ListItem>
      <ListItem>
        Hari Raya Tumpek Uduh: Perayaan khusus untuk menghormati pohon dan tumbuhan
      </ListItem>
      <ListItem>
        Perarem dan Awig-Awig: Aturan adat desa yang mengatur larangan menebang pohon sembarangan, membuang limbah ke sungai, dll.
      </ListItem>
      <ListItem>
        Ritual penyucian alam seperti Melasti, Piodalan Segara, dan lainnya
      </ListItem>
    </List>
  },
  {
    id: 3,
    title: 'Nilai Konservasi Adat',
    listDeskripsi: <List fz={'h4'} pr={20} ta={'justify'}>
      <ListItem>
        Menjaga keseimbangan ekosistem
      </ListItem>
      <ListItem>
        Melestarikan spiritualitas lokal dan kesucian alam
      </ListItem>
      <ListItem>
        Menumbuhkan kesadaran kolektif untuk hidup selaras dengan lingkungan
      </ListItem>
      <ListItem>
        Menjaga keberlangsungan sumber daya alam untuk generasi mendatang
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
          Konservasi Adat Bali
        </Text>
        <Text px={20} ta={'center'} fz={'h4'}>
          Konservasi Adat Bali adalah upaya pelestarian lingkungan yang berpijak pada kearifan lokal masyarakat Bali, di mana alam dan budaya dianggap sebagai satu kesatuan yang harus dijaga secara harmonis.
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
                <Paper h={{ base: 0, md: 450 }} p={20} bg={colors['white-trans-1']}>
                  <Text fz={'h3'} fw={'bold'} c={colors['blue-button']}>{v.title}</Text>
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
