'use client'
import permohonanKeberatanInformasi from '@/app/admin/(dashboard)/_state/ppid/permohonan_keberatan_informasi_publik/permohonanKeberatanInformasi';
import { PPIDTextEditor } from '@/app/admin/(dashboard)/ppid/_com/PPIDTextEditor';
import colors from '@/con/colors';
import { Box, Button, Center, Group, Paper, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { IconFileCheck, IconForms, IconHourglassOff, IconPhoneRinging } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

const data = [
    {
        id: 1,
        icon: <IconForms size={50} color={colors['white-1']} />,
        title: "Formulir Online",
        desc: "Isi formulir keberatan secara online.",
    },
    {
        id: 2,
        icon: <IconFileCheck size={50} color={colors['white-1']} />,
        title: "Verifikasi",
        desc: "Tim PPID akan memverifikasi permohonan Anda.",
    },
    {
        id: 3,
        icon: <IconHourglassOff size={50} color={colors['white-1']} />,
        title: "Proses Keberatan",
        desc: "Proses penyelesaian keberatan dalam waktu 30 hari kerja.",
    },
    {
        id: 4,
        icon: <IconPhoneRinging size={50} color={colors['white-1']} />,
        title: "Hasil",
        desc: "Hasil keberatan akan dikirim via email atau SMS.",
    },
]
function Page() {
    const stateKeberatan = useProxy(permohonanKeberatanInformasi)
    const submit = () => {
        if (stateKeberatan.create.form.name && stateKeberatan.create.form.email && stateKeberatan.create.form.notelp && stateKeberatan.create.form.alasan) {
            stateKeberatan.create.create()
            router.push('/darmasaba/permohonan/berhasil')
        } else {
            console.log("Validasi gagal, form tidak lengkap")
        }
    }
    const router = useRouter();
    return (
        <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
            <Box px={{ base: 'md', md: 100 }}>
                <BackButton />
            </Box>
            <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
                Permohonan Keberatan Informasi Publik
            </Text>
            <Box px={{ base: "md", md: 100 }}>
                <Stack gap={'lg'}>
                    <Paper p={"xl"} bg={colors['white-trans-1']}>
                        <Box pb={30}>
                            <Text fw={"bold"} fz={{ base: 'h4', md: 'h3' }}>Tentang Permohonan Keberatan</Text>
                            <Text ta={"justify"} fz={{ base: 'md', md: 'h4' }}>Jika Anda merasa permohonan informasi yang diajukan tidak mendapatkan tanggapan yang memadai atau ditolak, anda berhak mengajukan
                                keberatan melalui formulir di bawah ini.</Text>
                        </Box>
                        <Text pb={20} ta={"center"} fw={"bold"} fz={{ base: 'h3', md: 'h2' }}>Bagaimana Mengajukan Keberatan?</Text>
                        <SimpleGrid
                            pb={30}
                            cols={{
                                base: 1,
                                md: 4,
                            }}>
                            {data.map((v, k) => {
                                return (
                                    <Paper key={k} p={"xl"} bg={colors['blue-button']}>
                                        <Stack justify='space-between'>
                                            <Center>
                                                {v.icon}
                                            </Center>
                                            <Text ta={"center"} c={colors['white-1']} fw={"bold"} fz={"h3"}>
                                                {v.title}
                                            </Text>
                                            <Text ta={"center"} c={colors['white-1']} fz={'h4'}>
                                                {v.desc}
                                            </Text>
                                        </Stack>
                                    </Paper>
                                )
                            })}
                        </SimpleGrid>
                        <Group justify='center'>
                            <Paper p={'xl'} bg={colors['white-1']}>
                                <Stack gap={"xs"}>
                                    <Text fw={"bold"} fz={{ base: 'h4', md: 'h3' }} ta={"center"}>Formulir Permohonan Keberatan</Text>
                                    <TextInput
                                        label="Nama"
                                        placeholder="masukkan nama lengkap"
                                        onChange={(val) => {
                                            stateKeberatan.create.form.name = val.target.value
                                        }}
                                    />
                                    <TextInput
                                        label="Email"
                                        placeholder="masukkan email"
                                        onChange={(val) => {
                                            stateKeberatan.create.form.email = val.target.value
                                        }}
                                    />
                                    <TextInput
                                        label="Nomor Telepon"
                                        placeholder="masukkan nomor telepon"
                                        onChange={(val) => {
                                            stateKeberatan.create.form.notelp = val.target.value
                                        }}
                                    />
                                    <Text fz={"sm"}>Alasan Permohonan Keberatan</Text>
                                    <PPIDTextEditor
                                        showSubmit={false}
                                        onChange={(val) => {
                                            stateKeberatan.create.form.alasan = val
                                          }}
                                          
                                    />
                                    <Group>
                                        <Button onClick={submit} bg={'green'}>Kirim Permohonan</Button>
                                    </Group>
                                </Stack>
                            </Paper>
                        </Group>
                        <Text pt={20} ta={"center"} fz={'h3'} fw={"bold"}>Kontak PPID</Text>
                        <Text ta={"center"} fz={"sm"}>Email: desadarmasaba@badungkab.go.id | WhatsApp: 081-xxx-xxx-xxx</Text>
                    </Paper>
                </Stack>
            </Box>
        </Stack>
    );
}

export default Page;
