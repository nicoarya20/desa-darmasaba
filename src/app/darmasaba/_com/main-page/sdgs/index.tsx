'use client'
import colors from "@/con/colors";
import { Box, Button, Center, Container, Image, Paper, SimpleGrid, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SDGS() {
    const theme = useMantineTheme();
    const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
    const [sdgsDesa, setSdgsDesa] = useState<Prisma.SDGSDesaGetPayload<{ include: { image: true } }>[] | null>(null);

    useEffect(() => {
        const fetchSdgsDesa = async () => {
            try {
                const response = await fetch('/api/landingpage/sdgsdesa/findMany');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                // Ensure the data is an array before setting it
                let data = [];
                if (Array.isArray(result.data)) {
                    data = result.data;
                } else if (Array.isArray(result)) {
                    // In case the API returns the array directly
                    data = result;
                } else {
                    console.error('Unexpected API response format:', result);
                    setSdgsDesa([]);
                    return;
                }

                // Sort by jumlah in descending order and take top 3
                const top3Sdgs = [...data]
                    .sort((a, b) => parseInt(b.jumlah) - parseInt(a.jumlah))
                    .slice(0, 3);

                setSdgsDesa(top3Sdgs);
            } catch (error) {
                console.error('Error fetching sdgs desa:', error);
                setSdgsDesa([]);
            }
        };

        fetchSdgsDesa();
    }, []);
    return (
        <Stack p={"sm"}>
            <Container w={{ base: "100%", md: "80%" }} p={"xl"}>
                <Center>
                    <Text fz={"3.4rem"}>SDGs Desa</Text>
                </Center>
                <Text fz={"1.4rem"} ta={"center"}>SDGs Desa adalah upaya menerapkan 17 Tujuan Pembangunan Berkelanjutan di tingkat desa.
                    Dengan fokus pada pengentasan kemiskinan, pendidikan, kesehatan, kesetaraan gender, dan pelestarian lingkungan, kami berkomitmen untuk menciptakan desa yang lebih baik bagi semua</Text>
                <Box py={50}>
                    <Paper p={{ base: 'md', md: 'xl' }} bg={colors.Bg} radius="lg" shadow="sm">
                        {sdgsDesa && sdgsDesa.length > 0 ? (
                            <SimpleGrid
                                cols={{ base: 1, sm: 3 }}
                                spacing="xl"
                                verticalSpacing="xl"
                            >
                                {sdgsDesa.map((item) => (
                                    <Box 
                                        key={item.id} 
                                        p="md" 
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '100%',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-5px)'
                                            }
                                        }}
                                    >
                                        <Box 
                                            p="md" 
                                            style={{
                                                backgroundColor: 'white',
                                                width: mobile ? 150 : 180,
                                                height: mobile ? 150 : 180,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '1.5rem',
                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                            }}
                                        >
                                            <Image
                                                src={item.image?.link ? item.image.link : '/placeholder-sdgs.png'}
                                                alt={item.name}
                                                width={mobile ? 100 : 120}
                                                height={mobile ? 100 : 120}
                                                style={{
                                                    objectFit: 'contain',
                                                    maxWidth: '100%',
                                                    maxHeight: '100%'
                                                }}
                                            />
                                        </Box>
                                        <Text 
                                            ta="center" 
                                            fz={{ base: 'lg', md: 'xl' }} 
                                            fw={700} 
                                            mb="xs"
                                            style={{ lineHeight: 1.2 }}
                                        >
                                            {item.name}
                                        </Text>
                                        <Title 
                                            order={2} 
                                            ta="center" 
                                            c={colors['blue-button']}
                                            style={{
                                                fontSize: mobile ? '2.5rem' : '3rem',
                                                lineHeight: 1,
                                                margin: '0.5rem 0',
                                                fontWeight: 800
                                            }}
                                        >
                                            {item.jumlah}
                                        </Title>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        ) : (
                            <Text>Tidak ada data SDGs Desa</Text>
                        )}
                    </Paper>
                    <Center>
                        <Button component={Link} href={"/darmasaba/sdgs-desa"} radius={"lg"} fz={"1.2rem"} mt={20} bg={colors["blue-button"]}>Selengkapnya</Button>
                    </Center>
                </Box>
            </Container>

        </Stack>
    );
}