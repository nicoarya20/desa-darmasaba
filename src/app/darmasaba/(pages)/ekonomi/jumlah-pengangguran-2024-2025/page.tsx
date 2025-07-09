import colors from '@/con/colors';
import { BarChart } from '@mantine/charts';
import { Box, Button, Center, ColorSwatch, Flex, Group, Paper, SimpleGrid, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconChevronDown, IconDownload, IconSchool, IconSchoolOff, IconUserOff } from '@tabler/icons-react';
import BackButton from '../../desa/layanan/_com/BackButto';

const data1 = [
  {
    id: 1,
    icon: <IconUserOff size={35} />,
    judul: 'Total Pengangguran',
    jumlah: '140',
    persentase: <Text fz={'h4'} c={'green'}>-12.5% dari 2024</Text>
  },
  {
    id: 2,
    icon: <IconSchool size={35} />,
    judul: 'Pengangguran Terdidik',
    jumlah: '80',
    persentase: <Text fz={'h4'} c={'gray'}>57.1% dari total</Text>
  },
  {
    id: 3,
    icon: <IconSchoolOff size={35} />,
    judul: 'Pengangguran Tidak Terdidik',
    jumlah: '60',
    persentase: <Text fz={'h4'} c={'gray'}>42.9% dari total</Text>
  },
]

const dataPengangguran = [
  {
    id: 1,
    bulan: 'Jan',
    berpendidikan: 98,
    takberpendidikan: 74,
  },
  {
    id: 2,
    bulan: 'Feb',
    berpendidikan: 85,
    takberpendidikan: 74,
  },
  {
    id: 3,
    bulan: 'Mar',
    berpendidikan: 76,
    takberpendidikan: 55,
  },
  {
    id: 4,
    bulan: 'Apr',
    berpendidikan: 98,
    takberpendidikan: 74,
  },
  {
    id: 5,
    bulan: 'Mei',
    berpendidikan: 74,
    takberpendidikan: 54,
  },
  {
    id: 6,
    bulan: 'Jun',
    berpendidikan: 55,
    takberpendidikan: 50,
  },
]
const dataTable = [
  { bulan: 'Jan', total: 160, terdidik: 95, takterdidik: 65, perubahan: '-' },
  { bulan: 'Feb', total: 155, terdidik: 90, takterdidik: 65, perubahan: '-3.1%' },
  { bulan: 'Mar', total: 150, terdidik: 88, takterdidik: 62, perubahan: '-3.2%' },
  { bulan: 'Apr', total: 148, terdidik: 85, takterdidik: 63, perubahan: '-1.3%' },
  { bulan: 'Mei', total: 145, terdidik: 82, takterdidik: 63, perubahan: '-2.0%' },
  { bulan: 'Jun', total: 140, terdidik: 80, takterdidik: 60, perubahan: '-3.4%' },
]
function Page() {
  const rows = dataTable.map((element) => (
    <TableTr key={element.bulan}>
      <TableTd ta={'center'}>{element.bulan}</TableTd>
      <TableTd ta={'center'}>{element.total}</TableTd>
      <TableTd ta={'center'}>{element.terdidik}</TableTd>
      <TableTd ta={'center'}>{element.takterdidik}</TableTd>
      <TableTd ta={'center'}>{element.perubahan}</TableTd>
    </TableTr>
  ));
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Jumlah Pengangguran 2024 - 2025
        </Text>
        <Group py={20} align='center' justify='space-between'>
          <Text fz={'h4'} fw={"bold"}>DATA PENGANGGURAN DESA</Text>
          <Flex gap={'xl'}>
            <Button c={'black'} bg={colors['white-1']} rightSection={<IconChevronDown size={20} />}>2025</Button>
            <Button leftSection={<IconDownload size={20} />}>Export</Button>
          </Flex>
        </Group>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <SimpleGrid
            cols={1}
            pb={20}
          >
            {data1.map((v, k) => {
              return (
                <Paper px={25} key={k} py={'lg'} bg={colors['white-1']} shadow={'md'}>
                  <Flex justify={'space-between'} align={'center'}>
                    <Box>
                      <Stack>
                        <Text fz={'h4'}>{v.judul}</Text>
                        <Text fz={'h2'} fw={'bold'}>{v.jumlah}</Text>
                        {v.persentase}
                      </Stack>
                    </Box>
                    {v.icon}
                  </Flex>
                </Paper>
              )
            })}
          </SimpleGrid>
          <Paper p={'lg'}>
            <Flex pb={30} justify={'flex-end'} gap={'xl'} align={'center'}>
              <Box>
                <Flex gap={{ base: 0, md: 5 }} align={'center'}>
                  <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>Pengangguran Berpendidikan</Text>
                  <ColorSwatch color="#5082EE" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 0, md: 5 }} align={'center'}>
                  <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>Pengangguran Tak Berpendidikan</Text>
                  <ColorSwatch color="#DA524C" size={30} />
                </Flex>
              </Box>
            </Flex>
            <Center>
              <BarChart
                p={10}
                h={400}
                data={dataPengangguran}
                dataKey="bulan"
                series={[
                  { name: 'berpendidikan', color: '#5082EE' },
                  { name: 'takberpendidikan', color: '#DA524C' },
                ]}
                tickLine="y"
              />
            </Center>
          </Paper>
          <Paper p={'lg'}>
            <Text fw={'bold'} fz={'h4'}>Detail Data Pengangguran</Text>
            <Table striped highlightOnHover>
              <TableThead>
                <TableTr>
                  <TableTh ta={'center'}>Bulan</TableTh>
                  <TableTh ta={'center'}>Total</TableTh>
                  <TableTh ta={'center'}>Terdidik</TableTh>
                  <TableTh ta={'center'}>Tidak Terdidik</TableTh>
                  <TableTh ta={'center'}>Perubahan</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>{rows}</TableTbody>
            </Table>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
