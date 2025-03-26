'use client'
import colors from '@/con/colors';
import { Box, Button, Combobox, Flex, Group, Image, InputBase, InputPlaceholder, Paper, SimpleGrid, Stack, Text, TextInput, useCombobox } from '@mantine/core';
import { IconArrowDown, IconMapPinFilled, IconSearch, IconShoppingCartFilled, IconStarFilled } from '@tabler/icons-react';
import { useState } from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';

const groceries = [
  'Makanan',
  'Minuman',
  'Pakaian',
  'Alat Dapur',
  'Alat Mandi',
  'Furniture',
];

const dataBarang = [
  {
    id: 1,
    image: '/api/img/semat.png',
    judul: 'Semat Bambu / Semat Banten',
    harga: 'Rp. 3000 / pcs',
    bintang: '4.9',
    alamat: 'Jl. Kecubung no.6'
  },
  {
    id: 2,
    image: '/api/img/kerupuk.png',
    judul: 'Kerupuk Babi',
    harga: 'Rp. 12000 / pcs',
    bintang: '4.9',
    alamat: 'Jl. Kenari no.7'
  },
  {
    id: 3,
    image: '/api/img/beras.png',
    judul: 'beras Merah Organik',
    harga: 'Rp. 40000 / 1 kg',
    bintang: '4.9',
    alamat: 'Jl. Mawar no.8'
  },
  {
    id: 4,
    image: '/api/img/genteng.png',
    judul: 'Genteng',
    harga: 'Rp. 3600 / pcs',
    bintang: '4.9',
    alamat: 'Jl. Kecubung no.16'
  },

]
function Page() {
  const [search, setSearch] = useState('');
  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      combobox.focusTarget();
      setSearch('');
    },

    onDropdownOpen: () => {
      combobox.focusSearchInput();
    },
  });

  const [value, setValue] = useState<string | null>(null);

  const options = groceries
    .filter((item) => item.toLowerCase().includes(search.toLowerCase().trim()))
    .map((item) => (
      <Combobox.Option value={item} key={item}>
        {item}
      </Combobox.Option>
    ));
  const router = useRouter()
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box>
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Pasar Desa
        </Text>
        <Text px={{ base: 20, md: 150 }} ta={"center"} fz={{ base: "h4", md: "h3" }} >
          Pasar Desa Online merupakan Media Promosi yang bertujuan untuk membantu warga desa dalam memasarkan dan memperkenalkan produknya kepada masyarakat.
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <SimpleGrid
            pb={30}
            cols={{
              base: 1,
              md: 2
            }}
          >
            <Box>
              <Combobox
                store={combobox}
                withinPortal={false}
                onOptionSubmit={(val) => {
                  setValue(val);
                  combobox.closeDropdown();
                }}
              >
                <Combobox.Target>
                  <InputBase
                    component="button"
                    type="button"
                    pointer
                    rightSection={<Combobox.Chevron />}
                    onClick={() => combobox.toggleDropdown()}
                    rightSectionPointerEvents="none"
                  >
                    {value || <InputPlaceholder>Kategori</InputPlaceholder>}
                  </InputBase>
                </Combobox.Target>

                <Combobox.Dropdown>
                  <Combobox.Search
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                    placeholder="Search groceries"
                  />
                  <Combobox.Options>
                    {options.length > 0 ? options : <Combobox.Empty>Nothing found</Combobox.Empty>}
                  </Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
            </Box>
            <Box>
              <TextInput
                placeholder='Cari Produk'
                leftSection={<IconSearch size={20} />}
              />
            </Box>
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, md: 4 }}>
            {dataBarang.map((v, k) => {
              return (
                <Stack key={k}>
                  <motion.div
                    onClick={() => router.push('https://www.whatsapp.com/?lang=id')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    <Paper p={'lg'}>
                      <Image radius={'lg'} src={v.image} alt='' />
                      <Text py={10} fw={'bold'} fz={'lg'}>{v.judul}</Text>
                      <Text fz={'md'}>{v.harga}</Text>
                      <Flex py={10} gap={'md'}>
                        <IconStarFilled size={20} color='#EBCB09' />
                        <Text fz={'sm'} ml={2}>{v.bintang}</Text>
                      </Flex>
                      <Flex justify={'space-between'} align={'center'}>
                        <Box>
                          <Flex gap={'md'} align={'center'}>
                            <IconMapPinFilled size={20} color='red' />
                            <Text fz={'sm'} ml={2}>{v.alamat}</Text>
                          </Flex>
                        </Box>
                        <IconShoppingCartFilled size={20} color={colors['blue-button']} />
                      </Flex>
                    </Paper>
                  </motion.div>
                </Stack>
              )
            })}
          </SimpleGrid>
          <Group justify='center'>
            <Button bg={colors['blue-button']} rightSection={<IconArrowDown size={20} color={colors['white-1']} />} fz={'md'}>Lihat Produk Lainnya</Button>
          </Group>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
