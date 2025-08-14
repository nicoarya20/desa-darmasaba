'use client'
import colors from "@/con/colors";
import { Box, Center, Flex, Image, List, ListItem, Pagination, Paper, SimpleGrid, Skeleton, Spoiler, Stack, Text, TextInput } from "@mantine/core";
import BackButton from "../../desa/layanan/_com/BackButto";
// import { useTransitionRouter } from "next-view-transitions";
import posyandustate from "@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu";
import { useShallowEffect } from "@mantine/hooks";
import { useProxy } from "valtio/utils";
import { useState } from "react";
import { IconSearch } from "@tabler/icons-react";

export default function Page() {
    const state = useProxy(posyandustate)
    // const router = useTransitionRouter()
    const [search, setSearch] = useState("")

    const {
        data,
        page,
        totalPages,
        loading,
        load,
    } = state.findMany;


    useShallowEffect(() => {
        load(page, 3, search)
    }, [page, search])

    if (loading || !data) {
        return (
            <Box py={10}>
                <Skeleton h={500} />
            </Box>
        )
    }

    return (
        <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
            <Box px={{ base: 'md', md: 100 }}>
                <BackButton />
                <Flex mt={10} justify={"space-between"} align={"center"}>
                    <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
                        Posyandu Darmasaba
                    </Text>
                    <TextInput
                        placeholder="Cari Posyandu"
                        radius="lg"
                        leftSection={<IconSearch size={20} />}
                        w={{ base: "25%", md: "30%" }}
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                    />
                </Flex>
            </Box>
            <Box px={{ base: "md", md: 100 }}>
                <Stack gap={'lg'}>
                    <SimpleGrid
                        pb={10}
                        cols={{
                            base: 1,
                            md: 3,
                        }}>
                        {data?.map((v, k) => {
                            return (
                                <Paper key={k} p={"xl"} bg={colors["white-trans-1"]}>
                                    <Stack gap={'xs'}>
                                        <Text c={colors["blue-button"]} fw={"bold"} fz={"h3"}>
                                            {v.name}
                                        </Text>
                                        <Center>
                                            <Image src={v.image.link} alt="" />
                                        </Center>
                                        <Text fz={'h4'}>
                                            No.Telp : {v.nomor}
                                        </Text>
                                        <Box>
                                            <Text fz={'h4'}>
                                                Jadwal Pelayanan
                                            </Text>
                                            <Text fz={'h4'} dangerouslySetInnerHTML={{ __html: v.jadwalPelayanan }} />
                                        </Box>
                                        <Spoiler
                                            maxHeight={60} // tinggi maksimum sebelum di-collapse
                                            showLabel="Read more"
                                            hideLabel="Read less"
                                        >
                                            <Text fz={'h4'} dangerouslySetInnerHTML={{ __html: v.deskripsi }} />
                                        </Spoiler>
                                    </Stack>
                                </Paper>
                            )
                        })}
                    </SimpleGrid>
                    <Center>
                        <Pagination
                            value={page}
                            onChange={(newPage) => load(newPage)} // ini penting!
                            total={totalPages}
                            mt="md"
                            mb="md"
                        />
                    </Center>
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