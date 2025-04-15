'use client'
import colors from "@/con/colors";
import { Box, Button, Center, Container, Image, Paper, SimpleGrid, Stack, Text, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";

export default function SDGS() {
    const theme = useMantineTheme();
    const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
    return (
        <Stack p={"sm"}>
            <Container w={{ base: "100%", md: "80%" }} p={"xl"}>
                <Center>
                    <Text fz={"3.4rem"}>SDGs Desa</Text>
                </Center>
                <Text fz={"1.4rem"} ta={"center"}>SDGs Desa adalah upaya menerapkan 17 Tujuan Pembangunan Berkelanjutan di tingkat desa.
                    Dengan fokus pada pengentasan kemiskinan, pendidikan, kesehatan, kesetaraan gender, dan pelestarian lingkungan, kami berkomitmen untuk menciptakan desa yang lebih baik bagi semua</Text>
                <Box py={50}>
                    <Paper p={"lg"} bg={colors.Bg}>
                        <SimpleGrid
                            cols={{
                                base: 1,
                                sm: 3,
                            }}>
                            <Center>
                                <Image src={"/api/img/sgdesa-1.png"} alt="" w={mobile ? 250 : 200} />
                            </Center>
                            <Center>
                                <Image src={"/api/img/sgdesa-2.png"} alt="" w={mobile ? 250 : 220} />
                            </Center>
                            <Center>
                                <Image src={"/api/img/sgdesa-3.png"} alt="" w={mobile ? 250 : 190} />
                            </Center>
                        </SimpleGrid>
                    </Paper>
                    <Center>
                        <Button component={Link} href={"/darmasaba/sdgs-desa"} radius={"lg"} fz={"1.2rem"} mt={20} bg={colors["blue-button"]}>Selengkapnya</Button>
                    </Center>
                </Box>
            </Container>

        </Stack>
    );
}