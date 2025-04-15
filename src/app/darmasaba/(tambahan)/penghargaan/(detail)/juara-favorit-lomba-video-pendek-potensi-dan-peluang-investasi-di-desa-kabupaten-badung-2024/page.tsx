import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Stack, Container, Text, Image, ActionIcon, Box, Divider, Flex } from '@mantine/core';
import { IconBrandFacebook, IconBrandInstagram, IconBrandTwitter, IconBrandWhatsapp } from '@tabler/icons-react';
import React from 'react';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.grey[1]} py={"xl"} gap={22}>
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container w={{ base: "100%", md: "50%" }}>
        <Stack align="center" gap={0}>
          <Text fz={"3.4rem"} fw={"bold"}>
            Juara Favorit
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
          >
            Lomba Video Pendek Potensi dan Peluang Investasi di Desa Kabupaten Badung 2024
          </Text>
          <Image py={20} src={"/api/img/penghargaan-1.png"} alt='' />
        </Stack>
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Text
          pb={20}
          ta={"center"}
          fw={"bold"}
        >
          Desa Dramasaba Raih Juara Favorit dalam Lomba Video Pendek Potensi dan Peluang Investasi di Desa Kabupaten Badung 2024
        </Text>
        <Text
          ta={"justify"}
        >
          Desa Dramasaba kembali menunjukkan eksistensinya dalam memajukan potensi desa dengan meraih Juara 2 dalam ajang Lomba Video Pendek Potensi dan Peluang Investasi di Desa Kabupaten Badung 2024. Prestasi ini menjadi bukti nyata bahwa Desa Dramasaba memiliki daya tarik serta peluang investasi yang menjanjikan bagi para investor maupun masyarakat yang ingin berkontribusi dalam pengembangan desa.
        </Text>
        <Text
          py={5}
          ta={"justify"}
        >
          Dalam video pendek yang diikutsertakan dalam lomba ini, Desa Dramasaba menampilkan berbagai potensi unggulan yang dimiliki, mulai dari sektor pertanian, pariwisata berbasis budaya, hingga ekonomi kreatif yang sedang berkembang pesat. Dengan pengemasan yang menarik dan penyampaian informasi yang jelas, video tersebut berhasil memikat perhatian dewan juri serta menjadi inspirasi bagi desa-desa lain dalam mengembangkan potensi wilayahnya masing-masing.
        </Text>
        <Text
          ta={"justify"}
        >
          Keberhasilan ini tidak lepas dari kerja keras seluruh tim kreatif, pemerintah desa, serta masyarakat yang turut berpartisipasi dalam produksi video. Kepala Desa Dramasaba, [Nama Kepala Desa], mengungkapkan rasa syukur dan bangganya atas pencapaian ini. Menurutnya, kemenangan ini bukan sekadar penghargaan, tetapi juga menjadi motivasi untuk terus mengembangkan desa agar semakin dikenal luas dan menarik lebih banyak peluang investasi.
        </Text>
        <Text
          py={5}
          ta={"justify"}
        >
          Lomba Video Pendek Potensi dan Peluang Investasi di Desa Kabupaten Badung 2024 merupakan ajang yang diadakan oleh pemerintah daerah dengan tujuan untuk mendorong desa-desa dalam mengenalkan dan mempromosikan potensi investasi mereka. Dengan mengikuti lomba ini, Desa Dramasaba tidak hanya memperoleh apresiasi, tetapi juga membuka peluang lebih besar untuk berkolaborasi dengan investor maupun pihak lain yang tertarik dalam pengembangan desa.
        </Text>
        <Text
          ta={"justify"}
        >
          Ke depan, Desa Dramasaba berkomitmen untuk terus meningkatkan daya saingnya, baik dalam sektor ekonomi, budaya, maupun infrastruktur, sehingga mampu memberikan manfaat yang lebih besar bagi masyarakat serta menarik perhatian lebih banyak pihak untuk berinvestasi dan berkontribusi dalam pembangunan desa.
        </Text>
        <Text
          py={5}
          ta={"justify"}
        >
          Dengan prestasi ini, diharapkan Desa Dramasaba dapat menjadi contoh bagi desa-desa lain dalam memanfaatkan media digital sebagai sarana promosi dan pengembangan potensi lokal.
        </Text>

        <Box py={20}>
          <Divider />
          <Flex justify={"space-between"} py={20}>
            <Text fz={"sm"}>25 May 2021 . Darmasaba</Text>
            <Box>
              <Flex gap={"lg"}>
                <ActionIcon variant='transparent'>
                  <IconBrandFacebook color={"gray"} size={"30"} />
                </ActionIcon>
                <ActionIcon variant='transparent'>
                  <IconBrandInstagram color={"gray"} size={"30"} />
                </ActionIcon>
                <ActionIcon variant='transparent'>
                  <IconBrandTwitter color={"gray"} size={"30"} />
                </ActionIcon>
                <ActionIcon variant='transparent'>
                  <IconBrandWhatsapp color={"gray"} size={"30"} />
                </ActionIcon>
              </Flex>
            </Box>
          </Flex>
          <Divider pb={50} />
        </Box>
      </Box>
    </Stack>
  );
}

export default Page;
