import colors from '@/con/colors';
import { Box, Image, List, ListItem, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
        Info Wabah / Penyakit
      </Text>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <SimpleGrid
            cols={{
              base: 1,
              md: 3,
            }}
          >
            <Box>
              <Paper p={'xl'} h={'80vh'} bg={colors['white-trans-1']}>
                <Stack gap={'xs'}>
                  <Box>
                    <Text fw={"bold"} fz={'h3'} c={colors['blue-button']}>Demam Berdarah Dengue (DBD)</Text>
                    <Image pt={5} src={'/api/img/dbd.png'} alt="" />
                    <Text fz={'h4'} fw={'bold'} >
                      Apa itu DBD penyebab, gejala dan cara penanganannya?
                    </Text>
                    <Text fz={'h6'} pb={10}>
                      Diposting: 12 Februari 2025 | Dinas Kesehatan
                    </Text>
                    <Text fz={'h4'} pb={10}>
                      Yuk Kenali gelaja dan cara penanganan DBD yang efektif untuk melindungi keluarga anda selama musim hujan.
                    </Text>
                    <List>
                      <ListItem>
                        Penyebab: Virus dengue yang ditularkan oleh nyamuk Aedes aegypti.
                      </ListItem>
                      <ListItem>
                        Gejala: Demam tinggi, nyeri sendi, ruam kulit, dan pendarahan ringan.
                      </ListItem>
                      <ListItem>
                        Pencegahan: Menguras tempat air, menutup wadah air, fogging, dan menggunakan lotion anti-nyamuk.
                      </ListItem>
                    </List>
                  </Box>
                </Stack>
              </Paper>
            </Box>
            <Box>
              <Paper p={'xl'} h={'80vh'} bg={colors['white-trans-1']}>
                <Stack gap={'xs'}>
                  <Box>
                    <Text fw={"bold"} fz={'h3'} c={colors['blue-button']}>TBC (Tuberkulosis)</Text>
                    <Image pt={5} src={'/api/img/tbc-1.png'} alt="" />
                    <Text fz={'h4'} fw={'bold'} >
                      Apa itu TBC penyebab, gejala dan cara penanganannya?
                    </Text>
                    <Text fz={'h6'} pb={10}>
                      Diposting: 12 Februari 2025 | Dinas Kesehatan
                    </Text>
                    <Text fz={'h4'} pb={10}>
                      Yuk Kenali gelaja dan cara penanganan TBC yang efektif untuk melindungi keluarga anda.
                    </Text>
                    <List>
                      <ListItem>
                        Penyebab: Bakteri Mycobacterium tuberculosis yang menyebar melalui udara.
                      </ListItem>
                      <ListItem>
                        Gejala: Batuk lebih dari 2 minggu, berkeringat di malam hari, dan berat badan turun.
                      </ListItem>
                      <ListItem>
                        Pencegahan: Vaksin BCG, pola hidup sehat, dan pengobatan bagi penderita agar tidak menular.
                      </ListItem>
                    </List>
                  </Box>
                </Stack>
              </Paper>
            </Box>
            <Box>
              <Paper p={'xl'} h={'80vh'} bg={colors['white-trans-1']}>
                <Stack gap={'xs'}>
                  <Box>
                    <Text fw={"bold"} fz={'h3'} c={colors['blue-button']}>Diare dan Kolera</Text>
                    <Image pt={5} src={'/api/img/diare.png'} alt="" />
                    <Text fz={'h4'} fw={'bold'} >
                      Apa itu Diare dan Kolera penyebab, gejala dan cara penanganannya?
                    </Text>
                    <Text fz={'h6'} pb={10}>
                      Diposting: 12 Februari 2025 | Dinas Kesehatan
                    </Text>
                    <Text fz={'h4'} pb={10}>
                      Yuk Kenali gelaja dan cara penanganan Diare dan Kolera yang efektif untuk melindungi keluarga anda.
                    </Text>
                    <List>
                      <ListItem>
                        Penyebab: Bakteri Vibrio cholerae (Kolera) atau Escherichia coli (diare) akibat makanan/minuman yang terkontaminasi.
                      </ListItem>
                      <ListItem>
                        Gejala: Buang air besar cair terus-menerus, dehidrasi, dan lemas.
                      </ListItem>
                      <ListItem>
                        Pencegahan: Menjaga kebersihan makanan dan air, serta mencuci tangan dengan sabun.
                      </ListItem>
                    </List>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          </SimpleGrid>
        </Stack>
      </Box>
    </Stack>

  );
}

export default Page;
