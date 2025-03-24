import colors from "@/con/colors";
import { Stack, Box, Text, SimpleGrid, Paper, Center, Image, Flex, List, ListItem } from "@mantine/core";
import BackButton from "../../desa/layanan/_com/BackButto";

const data = [
    {
        id: 1,
        judul: 'Posyandu Banjar Bucu',
        nomor: '082345678910',
        image: '/api/img/posyandu.png'
    },
    {
        id: 2,
        judul: 'Posyandu Banjar Bucu',
        nomor: '082345678910',
        image: '/api/img/posyandu.png'
    },
    {
        id: 3,
        judul: 'Posyandu Banjar Bucu',
        nomor: '082345678910',
        image: '/api/img/posyandu.png'
    }
]
export default function Page() {
    return (
        <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
            <Box px={{ base: 'md', md: 100 }}>
                <BackButton />
            </Box>
            <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
                Posyandu Darmasaba
            </Text>
            <Box px={{ base: "md", md: 100 }}>
                <Stack gap={'lg'}>
                    <SimpleGrid
                        pb={10}
                        cols={{
                            base: 1,
                            md: 3,
                        }}>
                        {data.map((v, k) => {
                            return (
                                <Paper key={k} p={"xl"} bg={colors["white-trans-1"]}>
                                    <Stack gap={'xs'}>
                                        <Text c={colors["blue-button"]} fw={"bold"} fz={"h3"}>
                                            {v.judul}
                                        </Text>
                                        <Text fz={'h4'}>
                                            {v.nomor}
                                        </Text>
                                        <Center>
                                            <Image src={v.image} alt="" />
                                        </Center>
                                        <Text fz={'h4'}>
                                            Jadwal Pelayanan
                                        </Text>
                                        <Text fz={'h4'}>
                                            Setiap tanggal 5, Pukul 09:00 -
                                            12:00 WITA
                                        </Text>
                                        <Box>
                                            <Flex justify={'space-between'}>
                                                <Text fz={'h4'}>Balita</Text>
                                                <Box>
                                                    <Text fz={'h4'}>Selasa minggu pertama</Text>
                                                    <Text fz={'h4'}>(09:00-11:00 WITA)</Text>
                                                </Box>
                                            </Flex>
                                        </Box>
                                        <Box>
                                            <Flex justify={'space-between'}>
                                                <Text fz={'h4'}>Lansia</Text>
                                                <Box>
                                                    <Text fz={'h4'}>Selasa minggu pertama</Text>
                                                    <Text fz={'h4'}>(09:00-11:00 WITA)</Text>
                                                </Box>
                                            </Flex>
                                        </Box>
                                    </Stack>
                                </Paper>
                            )
                        })}
                    </SimpleGrid>
                    <Text fz={'h4'} fw={"bold"}>
                        Pelayanan Posyandu
                    </Text>
                    <List type="ordered">
                        <ListItem fz={'h4'}>Penimbangan bayi dan balita</ListItem>
                        <ListItem fz={'h4'}>Pemantuan status gizi</ListItem>
                        <ListItem fz={'h4'}>Imunisasi dasar lengkap</ListItem>
                        <ListItem fz={'h4'}>Konseling</ListItem>
                        <ListItem fz={'h4'}>Pemantuan kesehatan ibu hamil</ListItem>
                    </List>
                </Stack>
            </Box>
        </Stack>

    )
}