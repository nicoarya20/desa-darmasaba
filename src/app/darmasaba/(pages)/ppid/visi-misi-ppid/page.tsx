import colors from '@/con/colors';
import { Stack, Box, Paper, Text, Image, Center, ListItem, List } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <Paper p={"xl"} bg={colors['white-trans-1']}>
            <Box pb={30}>
              <Center>
                <Image src={"/api/img/darmasaba-icon.png"} w={{ base: 100, md: 150 }} alt='' />
              </Center>
              <Text ta={"center"} fz={{ base: "h2", md: "2.5rem" }} fw={"bold"}>
                MOTO PPID DESA DARMASABA
              </Text>
              <Text ta={"center"} fz={{ base: "h4", md: "h3" }} >
                MEMBERIKAN INFORMASI YANG CEPAT, MUDAH, TEPAT DAN TRANSPARAN
              </Text>
            </Box>
            <Box px={{ base: 20, md: 50 }} pb={30}>
              <Text ta={"center"} fz={{ base: "h3", md: "h2" }} fw={"bold"}>
                VISI PPID
              </Text>
              <Text fz={{ base: "md", md: "h3" }} ta={"justify"}>
                Memberikan pelayanan informasi yanng transparan dan akuntabel untuk memenuhi hak pemohon informasi
                sesuai dengan ketentuan peraturan perundang-undangan yang berlaku.
              </Text>
            </Box>
            <Box px={{ base: 20, md: 50 }}>
              <Text ta={"center"} fz={{ base: "h3", md: "h2" }} fw={"bold"}>
                MISI PPID
              </Text>
              <Box px={20} >
                <List type='ordered'>
                  <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>Meningkatkan pengelolaan dan pelayanan informasi yang berkualitas, benar dan bertanggung jawab</ListItem>
                  <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>Membangun dan mengembangkan sistem penyediaan dan layanan informasi.</ListItem>
                  <ListItem fz={{ base: "md", md: "h3" }} ta={"justify"}>Meningkatkan dan mengembangkan kompetensi dan kualitas SDM dalam bidang pelayanan informasi.</ListItem>
                  <ListItem fz={{ base: "md", md: "h3" }} >Mewujudkan keterbukaan informasi Pemerintah Desa Punggul dengan proses yang cepat, tepat, mudah
                    dan sederhana.</ListItem>
                </List>
              </Box>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
