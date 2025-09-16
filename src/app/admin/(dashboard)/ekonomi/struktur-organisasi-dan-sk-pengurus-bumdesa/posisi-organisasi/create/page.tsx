/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import strukturorganisasiState from '@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi/struktur-organisasi';
import colors from '@/con/colors';
import {
    Box,
    Button,
    Group,
    Paper,
    Stack,
    Text,
    TextInput,
    Title,
    Tooltip,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function CreatePosisiOrganisasi() {
    const router = useRouter();
    const stateOrganisasi = useProxy(strukturorganisasiState.posisiOrganisasi);

    useEffect(() => {
        stateOrganisasi.findMany.load();
    }, []);

    const resetForm = () => {
        stateOrganisasi.create.form = {
            nama: '',
            deskripsi: '',
            hierarki: 0,
        };
    };

    const handleSubmit = async () => {
        await stateOrganisasi.create.submit();
        resetForm();
        router.push(
            '/admin/ekonomi/struktur-organisasi-dan-sk-pengurus-bumdesa/posisi-organisasi'
        );
    };

    return (
        <Box px={{ base: 'sm', md: 'lg' }} py="md">
            {/* Header Back + Title */}
            <Group mb="md">
                <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
                    <Button
                        variant="subtle"
                        onClick={() => router.back()}
                        p="xs"
                        radius="md"
                    >
                        <IconArrowBack color={colors['blue-button']} size={24} />
                    </Button>
                </Tooltip>
                <Title order={4} ml="sm" c="dark">
                    Tambah Posisi Organisasi
                </Title>
            </Group>

            {/* Form Card */}
            <Paper
                w={{ base: '100%', md: '50%' }}
                bg={colors['white-1']}
                p="lg"
                radius="md"
                shadow="sm"
                style={{ border: '1px solid #e0e0e0' }}
            >
                <Stack gap="md">
                    <TextInput
                        label="Nama Posisi"
                        placeholder="Contoh: Kepala Desa"
                        value={stateOrganisasi.create.form.nama}
                        onChange={(e) => (stateOrganisasi.create.form.nama = e.currentTarget.value)}
                        required
                    />

                    <Box>
                        <Text fz={"sm"} mb={6}>Deskripsi</Text>
                        <CreateEditor
                            value={stateOrganisasi.create.form.deskripsi}
                            onChange={(htmlContent) => {
                                stateOrganisasi.create.form.deskripsi = htmlContent;
                            }}
                        />
                    </Box>

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
                        required
                    />

                    {/* Action Button */}
                    <Group justify="right">
                        <Button
                            onClick={handleSubmit}
                            radius="md"
                            size="md"
                            style={{
                                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                                color: '#fff',
                                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
                            }}
                        >
                            Simpan
                        </Button>
                    </Group>
                </Stack>
            </Paper>
        </Box>
    );
}

export default CreatePosisiOrganisasi;
