/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import strukturorganisasiState from '@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi/struktur-organisasi';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function CreatePosisiOrganisasi() {
    const router = useRouter();
    const stateOrganisasi = useProxy(strukturorganisasiState.posisiOrganisasi)
    useEffect(() => {
        stateOrganisasi.findMany.load();
    }, []);

    const resetForm = () => {
        stateOrganisasi.create.form = {
            nama: "",
            deskripsi: "",
            hierarki: 0, // Initialize as 0 to allow any number input
        };
    };

    const handleSubmit = async () => {
        await stateOrganisasi.create.submit();
        resetForm();
        router.push("/admin/ekonomi/Struktur-Organisasi-dan-SK-Pengurus-BUMDesa/posisi-organisasi")
    };

    return (
        <Box>
            <Box mb={10}>
                <Button variant="subtle" onClick={() => router.back()}>
                    <IconArrowBack color={colors['blue-button']} size={25} />
                </Button>
            </Box>
            <Paper bg={colors["white-1"]} p={"md"} w={{ base: "100%", md: "50%" }}>
                <Stack gap={"xs"}>
                    <Title order={3}>Create Posisi Organisasi</Title>
                    <TextInput
                        label="Nama Posisi"
                        placeholder="Contoh: Kepala Desa"
                        value={stateOrganisasi.create.form.nama}
                        onChange={(e) => (stateOrganisasi.create.form.nama = e.currentTarget.value)}
                    />
                    <CreateEditor
                        value={stateOrganisasi.create.form.deskripsi}
                        onChange={(htmlContent) => {
                            stateOrganisasi.create.form.deskripsi = htmlContent;
                        }}
                    />
                    <TextInput
                        label="Hierarki"
                        type="number"
                        placeholder="Contoh: 1"
                        value={stateOrganisasi.create.form.hierarki}
                        onChange={(e) => {
                            const value = parseInt(e.currentTarget.value, 10);
                            if (!isNaN(value)) {
                                stateOrganisasi.create.form.hierarki = value;
                            }
                        }}
                    />
                    <Button
                        onClick={handleSubmit}
                        color="blue"
                    >
                        Simpan
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}

export default CreatePosisiOrganisasi;
