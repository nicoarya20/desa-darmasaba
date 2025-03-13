'use client'
import colors from "@/con/colors";
import { ActionIcon, BackgroundImage, Box, Button, Container, Divider, Flex, Group, List, ListItem, SimpleGrid, Stack, Stepper, StepperCompleted, StepperStep, Text } from "@mantine/core";
import { IconBrandFacebook, IconBrandInstagram, IconBrandTwitter, IconBrandWhatsapp } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BackButton from "./_com/BackButto";

const data = [
    {
        id: 1,
        images: "/api/img/test.png",
        name: "Surat Keterangan Domisili Organisasi",
        link: "/darmasaba/desa/layanan/domisili"
    },
    {
        id: 2,
        images: "/api/img/test-3.jpeg",
        name: "Surat Keterangan Penghasilan",
        link: "/darmasaba/desa/layanan/penghasilan"
    },
    {
        id: 3,
        images: "/api/img/domisili.jpeg",
        name: "Surat Keterangan Tidak Mampu",
        link: "/darmasaba/desa/layanan/tidakmampu"
    },
    {
        id: 4,
        images: "/api/img/kelahiran.jpeg",
        name: "Surat Keterangan Kelahiran",
        link: "/darmasaba/desa/layanan/kelahiran"
    },
    {
        id: 5,
        images: "/api/img/keterangan-usaha.jpeg",
        name: "Surat Keterangan Usaha",
        link: "/darmasaba/desa/layanan/usaha"
    },
    {
        id: 6,
        images: "/api/img/kematian.jpeg",
        name: "Surat Keterangan Kematian",
        link: "/darmasaba/desa/layanan/kematian"
    },
    {
        id: 7,
        images: "/api/img/tempatusaha.jpeg",
        name: "Surat Keterangan Tempat Usaha",
        link: "/darmasaba/desa/layanan/tempatusaha"
    },
    {
        id: 8,
        images: "/api/img/belumkawin.jpeg",
        name: "Surat Keterangan Belum Kawin",
        link: "/darmasaba/desa/layanan/belumkawin"
    },
    {
        id: 9,
        images: "/api/img/berkelakuan-baik.jpeg",
        name: "Surat Keterangan Kelakuan Baik",
        link: "/darmasaba/desa/layanan/skck"
    },
    {
        id: 10,
        images: "/api/img/biodata.jpeg",
        name: "Surat Keterangan Beda Biodata Diri",
        link: "/darmasaba/desa/layanan/biodata"
    },
    {
        id: 11,
        images: "/api/img/yatim.jpeg",
        name: "Surat Keterangan Yatim Piatu",
        link: "/darmasaba/desa/layanan/yatim"
    }

]
export default function Page() {
    const router = useRouter()
    const [active, setActive] = useState(1);
    const nextStep = () => setActive((current) => (current < 6 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));
    return (
        <Stack pos={"relative"} bg={colors.grey[1]} py={"xl"} gap={"42"}>
            <Container w={{ base: "100%", md: "50%" }} >
                <BackButton/>
                <Stack align="center" gap={0}>
                    {/* Bagian Layanan */}
                    <Text fz={"3.4rem"} fw={"bold"}>
                        Layanan
                    </Text>
                    <Text
                    >
                        Adapun berbagai layanan yang telah tersedia dan dapat diakses dengan mudah oleh masyarakat di Desa Darmasaba :
                    </Text>
                </Stack>
                {/* Bagian Pelayanan Surat Keterangan */}
                <Box py={10}>
                    <Text fz={"h4"} fw={"bold"}>Pelayanan Surat Keterangan</Text>
                </Box>
                <SimpleGrid
                    py={20}
                    cols={{
                        base: 1,
                        sm: 3
                    }}
                >
                    {data.map((v, k) => {
                        return (
                            <BackgroundImage
                                key={k}
                                src={v.images}
                                h={350}
                                radius={16}
                                pos={"relative"}
                            >
                                <Box
                                    style={{
                                        borderRadius: 16,
                                        zIndex: 0
                                    }}
                                    pos={"absolute"}
                                    w={"100%"}
                                    h={"100%"}
                                    bg={colors.trans.dark[2]}
                                />
                                <Stack justify='space-between' h={"100%"} gap={0} p={"lg"} pos={"relative"}>
                                    <Box p={"lg"}>
                                        <Text
                                            c={"white"}
                                            size={"1.5rem"}
                                            style={{
                                                textAlign: "center",
                                            }}>{v.name}</Text>
                                    </Box>
                                    <Group justify="center">
                                        <Button px={20} radius={"100"} size="md" bg={colors["blue-button"]}
                                            onClick={() => router.push(v.link)}>
                                            Detail
                                        </Button>
                                    </Group>
                                </Stack>
                            </BackgroundImage>
                        )
                    })}
                </SimpleGrid>
                {/* Bagian Pelayanan Perizinan Berusaha */}
                <Box py={15}>
                    <Text fz={"h4"} fw={"bold"}>Pelayanan Perizinan Berusaha Berbasis Risiko Melalui Sistem ONLINE SINGLE SUBMISSION (OSS)</Text>
                </Box>
                <Text py={10} ta={"justify"} fz={"sm"}>Penyelenggaraan Perizinan Berusaha Berbasis Risiko melalui Sistem Online Single Submission (OSS)
                    merupakan pelaksanaan Undang-Undang Nomor 11 Tahun 2020 Tentang Cipta Kerja. OSS Berbasis Risiko wajib digunakan oleh Pelaku Usaha,
                    Kementerian/Lembaga, Pemerintah Daerah, Administrator Kawasan Ekonomi Khusus (KEK), dan Badan Pengusahaan Kawasan Perdagangan Bebas
                    Pelabuhan Bebas (KPBPB).Berdasarkan Peraturan Pemerintah Nomor 5 Tahun 2021 terdapat 1.702 kegiatan usaha yang terdiri atas 1.349
                    Klasifikasi Baku Lapangan Usaha Indonesia (KBLI) yang sudah diimplementasikan dalam Sistem OSS Berbasis Risiko.</Text>
                <Text py={10} fz={"sm"}>Proses pendaftaran NIB melalui OSS mencakup beberapa langkah umum, seperti:</Text>
                <Box p={"xl"} w={{ base: "100%", md: "100%" }} >
                    <Stepper active={active} onStepClick={setActive} orientation="vertical"
                        styles={{
                            separator: {
                                marginLeft: 25
                            },

                            step: {
                                padding: '12px 0'
                            }
                        }}>
                        <StepperStep label="Langkah Pertama" description="Pendaftaran Akun">
                            Pendaftaran akun pada portal OSS
                        </StepperStep>
                        <StepperStep label="Langkah Kedua" description="Pengisian Data Perusahaan">
                            Mengisi informasi perusahaan, termasuk data pemegang saham, alamat perusahaan, dan lainnya
                        </StepperStep>
                        <StepperStep label="Langkah Ketiga" description="Pemilihan KBLI ">
                            Memilih KBLI dengan jenis usaha yang akan didaftarkan
                        </StepperStep>
                        <StepperStep label="Langkah Keempat" description="Pengunggahan Dokumen">
                            Mengunggah dokumen-dokumen yang diperlukan, seperti akta pendirian perusahaan, surat izin usaha, dan dokumen lainnya sesuai dengan ketentuan yang berlaku
                        </StepperStep>
                        <StepperStep label="Langkah Kelima" description="Verifikasi dan Persetujuan">
                            Proses verifikasi dan persetujuan oleh instansi terkait
                        </StepperStep>
                        <StepperStep label="Langkah Keenam" description="Penerimaan NIB">
                            Jika proses sebelumnya berhasil, perusahaan akan menerima NIB sebagai identitas resmi usaha anda
                        </StepperStep>
                        <StepperCompleted>
                            Selesai, anda telah mengikuti proses pendaftaran NIB melalui OSS
                        </StepperCompleted>
                    </Stepper>

                    <Group justify="center" mt="xl">
                        <Button variant="default" onClick={prevStep}>Back</Button>
                        <Button onClick={nextStep}>Next step</Button>
                    </Group>
                    <Text py={35} ta={"justify"} fz={"sm"}>Penting untuk diingat bahwa prosedur dan persyaratan dapat berubah
                        seiring waktu. Untuk informasi yang lebih akurat dan terkini, saya sarankan untuk mengunjungi situs
                        resmi OSS <a href={"https://oss.go.id/"}>(https://oss.go.id/)</a> atau menghubungi instansi terkait di pemerintah Indonesia yang bertanggung jawab atas urusan perizinan usaha.</Text>
                </Box>
                {/* Bagian Pelayanan Telunjuk Sakti Desa */}
                <Box py={15}>
                    <Text fz={"h4"} fw={"bold"}>Pelayanan Telunjuk Sakti Desa</Text>
                </Box>
                <Text fz={"sm"} py={10}>Terwujudnya Layanan umum bertajuk Sistim administrasi Kependudukan Terintegrasi di Desa berbasi Elektronik, Smart dan Aman. layanan telunjuk sakti Desa meliputi :</Text>
                <List type="ordered" pb={20}>
                    <ListItem fz={"sm"}>Telunjuk Sakti Desa Akta Kelahiran (Petunjuk Pengajuan pada link berikut : Download <a href="https://darmasaba.desa.id/storage/files/PERSYARATAN%20DAN%20ALUR%20PENGAJUAN%20AKTA%20KELAHIRAN_(dengan%20contoh%20Formulir).pdf">Akta Kelahiran</a>)</ListItem>
                    <ListItem fz={"sm"}>Telunjuk Sakti Desa Akta Perkawinan (Petunjuk Pengajuan pada link berikut : Download <a href="https://darmasaba.desa.id/storage/files/PERSYARATAN%20DAN%20ALUR%20PENGAJUAN%20AKTA%20PERKAWINAN_(dengan%20contoh%20Formulir).pdf">Akta Perkawinan</a>)</ListItem>
                    <ListItem fz={"sm"}>Telunjuk Sakti Desa Akta Kematian (Petunjuk Pengajuan pada link berikut : Download <a href="https://darmasaba.desa.id/storage/files/PERSYARATAN%20DAN%20ALUR%20PENGAJUAN%20AKTA%20KEMATIAN_(dengan%20contoh%20Formulir).pdf">Akata Kematian</a>)</ListItem>
                </List>
                {/* Bagian Pelayanan Telunjuk Sakti Desa */}
                <Box py={15}>
                    <Text fz={"h4"} fw={"bold"}>Pelayanan Penduduk Non-Permanent</Text>
                </Box>
                <Text pb={20} fz={"sm"} ta={"justify"}>Surat Keterangan Penduduk Non-Permanent adalah dokumen yang dikeluarkan oleh pihak berwenang untuk memberikan keterangan bahwa seseorang atau kelompok orang memiliki status penduduk non-permanent di suatu wilayah. Dokumen ini biasanya digunakan untuk keperluan administratif atau legal, seperti mendapatkan akses ke layanan kesehatan, pendidikan, atau pelayanan publik lainnya.</Text>
                <Divider />
                <Flex justify={"space-between"} py={20}>
                    <Text fz={"sm"}>25 May 2021 . Darmasaba</Text>
                    <Box>
                        <Flex gap={"lg"}>
                            <ActionIcon variant='transparent'>
                                <IconBrandFacebook color={"gray"} size={"30"} />
                            </ActionIcon>
                            <ActionIcon variant='transparent'>
                                <IconBrandInstagram color={"gray"} size={"30"} />
                            </ActionIcon>
                            <ActionIcon variant='transparent'>
                                <IconBrandTwitter color={"gray"} size={"30"} />
                            </ActionIcon>
                            <ActionIcon variant='transparent'>
                                <IconBrandWhatsapp color={"gray"} size={"30"} />
                            </ActionIcon>
                        </Flex>
                    </Box>
                </Flex>
                <Divider pb={50} />
            </Container>
        </Stack>
    )
}