'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';

function Page() {
    const router = useRouter();
    return (
        <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
            <Box px={{ base: 'md', md: 100 }}>
                <Stack h={'80vh'} justify='center'>
                    <Box>
                        <Paper p={"lg"} bg={'#DEF0D8'}>
                            <Text fw={"bold"} ta={"center"} fz={'h2'} c={'#3C7745'}>Permohonan Berhasil Dikirim</Text>
                        </Paper>
                    </Box>
                    <Box>
                        <Paper px={{ base: 'md', md: 100 }} p={"lg"} bg={colors['white-trans-1']}>
                            <Stack justify='space-between'>
                                <Text fw={"bold"} ta={"center"} fz={'h2'} >Terima Kasih!</Text>
                                <Text ta={"center"} fz={"h4"}>Permohonan keberatan Anda telah berhasil dikirim. Tim PPID Desa akan meninjau
                                    permohonan Anda dan memberikan tanggapan dalam waktu yang
                                    ditentukan.</Text>
                                <Text ta={"center"} fz={"h4"}>Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi kami melalui kontak
                                    yang tersedia.</Text>
                                <Group justify='center'>
                                    <Button onClick={() => router.push('/')} p={'sm'} bg={colors['blue-button']} >Kembali ke Beranda</Button>
                                </Group>
                            </Stack>
                        </Paper>
                    </Box>
                </Stack>
            </Box>
        </Stack>
    );
}

export default Page;
