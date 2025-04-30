import colors from '@/con/colors';
import { Stack, Box, Text, SimpleGrid, Paper, List, ListItem, Flex, ActionIcon } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { IconArrowRight, IconBulbFilled } from '@tabler/icons-react';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Ajukan Ide Inovatif
        </Text>
        <Text ta={'center'} fz={'h4'}>Desa Darmasaba percaya bahwa setiap warga memiliki potensi luar biasa untuk menciptakan perubahan positif. Platform &quot;Ajukan Ide Inovatif&quot; hadir sebagai ruang inklusif bagi seluruh masyarakat untuk mengembangkan dan mengusulkan gagasan transformatif.</Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} p={'lg'}>
          <SimpleGrid
            cols={{
              base: 1,
              md: 2,
            }}
          >
            <Paper p={'xl'} >
              <Text fz={'h3'} fw={'bold'} c={colors['blue-button']}>Tujuan Ide Inovatif Ini</Text>
              <List>
                <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Mendorong partisipasi aktif masyarakat</ListItem>
                <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Memfasilitasi inovasi berbasis lokal</ListItem>
                <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Memecahkan tantangan komunal</ListItem>
                <ListItem ta={'justify'} fz={{ base: 'h4', md: 'lg' }}>Mengembangkan potensi kreativitas warga</ListItem>
              </List>
            </Paper>
            <Paper p={'xl'} >
              <Flex align={'center'} justify={'space-between'}>
                <Box>
                  <Text fz={'h4'} fw={'bold'} c={colors['blue-button']}>Apabila Anda Ingin Mengajukan Ide Inovatif Bisa Klik Pada Gambar Di Samping</Text>
                  <IconArrowRight size={30} color={colors['blue-button']} />
                </Box>
                <Box px={{ base: 5, md: 10 }} py={5}>
                  <ActionIcon variant="transparent" size={150}>
                    <IconBulbFilled size={150} color={colors['blue-button']} />
                  </ActionIcon>
                </Box>
              </Flex>
            </Paper>
          </SimpleGrid>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
