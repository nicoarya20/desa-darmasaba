'use client'
import colors from "@/con/colors";
import { Box, Container, Stack, Text, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import BackButton from "./_com/BackButto";
import PelayananPerizinanBerusaha from "./_com/pelayananPerizinanBerusaha";
import PelayananSuratKeterangan from "./_com/pelayananSuratKeterangan";
import PelayananTelunjukSaktiDesa from "./_com/pelayananTelunjukSaktiDesa";
import PelayananPendudukNonPermanent from "./_com/pelayananPendudukNonPermanent";


export default function Page() {
    const [search, setSearch] = useState("")


    return (
        <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
            <Box px={{ base: 'md', md: 100 }}>
                <BackButton />
            </Box>
            <Container w={{ base: "100%", md: "50%" }} >
                <Stack align="center" gap={0}>
                    {/* Bagian Layanan */}
                    <Text fz={{ base: "2rem", md: "2.5rem", lg: "3rem", xl: "3.5rem" }} c={colors["blue-button"]} fw={"bold"}>
                        Layanan Desa Darmasaba
                    </Text>
                    <Text
                    >
                        Informasi dan Pelayanan Administrasi Digital
                    </Text>
                    <TextInput
                        pt={20}
                        w={{ base: "70%", md: "50%" }}
                        placeholder="Cari Layanan"
                        leftSection={<IconSearch size={20} />}
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                    />
                </Stack>
            </Container>
            <Box px={{ base: "md", md: 100 }}>
                <Stack gap={"xl"}>
                    {/* Bagian Pelayanan Surat Keterangan */}
                    <PelayananSuratKeterangan search={search} />
                    {/* Bagian Pelayanan Perizinan Berusaha */}
                    <PelayananPerizinanBerusaha />
                    {/* Bagian Pelayanan Telunjuk Sakti Desa */}
                    <PelayananTelunjukSaktiDesa />
                    {/* Bagian Pelayanan Penduduk Non Permanent */}
                    <PelayananPendudukNonPermanent />
                </Stack>
            </Box>
        </Stack>
    )
}