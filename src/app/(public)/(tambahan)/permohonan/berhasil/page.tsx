'use client'
import { Box, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';
import s from './berhasil.module.css';

function Page() {
    const router = useRouter();
    return (
        <Stack pos={"relative"} bg="var(--c-bg)" py={"xl"} gap={"22"} className={s.root}>
            <Box px={{ base: 'md', md: 100 }}>
                <Stack h={'80vh'} justify='center'>
                    <Box>
                        <Paper p={"lg"} bg="var(--sukses-bg)">
                            <Text fw={"bold"} ta={"center"} fz={'h2'} c="var(--sukses-ink)">Permohonan Berhasil Dikirim</Text>
                        </Paper>
                    </Box>
                    <Box>
                        <Paper px={{ base: 'md', md: 100 }} p={"lg"} bg="var(--isi-bg)">
                            <Stack justify='space-between'>
                                <Text fw={"bold"} ta={"center"} fz={'h2'} >Terima Kasih!</Text>
                                <Text ta={"center"} fz={"h4"}>Permohonan keberatan Anda telah berhasil dikirim. Tim PPID Desa akan meninjau
                                    permohonan Anda dan memberikan tanggapan dalam waktu yang
                                    ditentukan.</Text>
                                <Text ta={"center"} fz={"h4"}>Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi kami melalui kontak
                                    yang tersedia.</Text>
                                <Group justify='center'>
                                    <Button onClick={() => router.push('/')} p={'sm'} bg="var(--c-brand-fill)" >Kembali ke Beranda</Button>
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
