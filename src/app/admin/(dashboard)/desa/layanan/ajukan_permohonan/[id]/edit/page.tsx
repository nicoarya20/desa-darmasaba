'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import {
    Box,
    Button,
    Group,
    Paper,
    Select,
    Stack,
    TextInput,
    Title,
    Tooltip
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditAjukanPermohonan() {
    const router = useRouter();
    const params = useParams();
    const stateAjukan = useProxy(stateLayananDesa.ajukanPermohonan);

    const [formData, setFormData] = useState({
        nama: stateAjukan.edit.form.nama,
        nik: stateAjukan.edit.form.nik,
        alamat: stateAjukan.edit.form.alamat,
        nomorKk: stateAjukan.edit.form.nomorKk,
        kategoriId: stateAjukan.edit.form.kategoriId,
    });

    useEffect(() => {
        stateLayananDesa.suratKeterangan.findManyAll.load();
        const loadAjukan = async () => {
            const id = params?.id as string;
            if (!id) return;

            try {
                const data = await stateAjukan.edit.load(id);
                if (data) {
                    setFormData({
                        nama: data.nama || '',
                        nik: data.nik || '',
                        alamat: data.alamat || '',
                        nomorKk: data.nomorKk || '',
                        kategoriId: data.kategoriId || '',
                    });
                }
            } catch (error) {
                console.error('Error loading ajukan:', error);
                toast.error('Gagal memuat data ajukan');
            }
        };

        loadAjukan();
    }, [params?.id]);

    const handleSubmit = async () => {
        try {
            stateAjukan.edit.form = {
                ...stateAjukan.edit.form,
                ...formData,
            };
            toast.success('Ajukan berhasil diperbarui!');
            router.push('/admin/desa/layanan/ajukan_permohonan');
        } catch (error) {
            console.error('Error updating ajukan:', error);
            toast.error('Terjadi kesalahan saat memperbarui ajukan');
        }
    };

    return (
        <Box px={{ base: 'sm', md: 'lg' }} py="md">
            {/* Back Button */}
            <Group mb="md">
                <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
                    <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
                        <IconArrowBack color={colors['blue-button']} size={24} />
                    </Button>
                </Tooltip>
                <Title order={4} ml="sm" c="dark">
                    Edit Ajukan Permohonan
                </Title>
            </Group>

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
                        label="Nama"
                        placeholder="Masukkan nama"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        required
                    />

                    <TextInput
                        type="number"
                        label="NIK"
                        placeholder="Masukkan NIK"
                        value={formData.nik}
                        onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                        required
                    />

                    <TextInput
                        label="Alamat"
                        placeholder="Masukkan alamat"
                        value={formData.alamat}
                        onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                        required
                    />

                    <TextInput
                        type="number"
                        label="Nomor KK"
                        placeholder="Masukkan nomor KK"
                        value={formData.nomorKk}
                        onChange={(e) => setFormData({ ...formData, nomorKk: e.target.value })}
                        required
                    />

                    <Select
                        label="Kategori"
                        placeholder="Pilih kategori"
                        data={stateLayananDesa.suratKeterangan.findManyAll.data?.map((item) => ({
                            label: item.name,
                            value: item.id,
                        }))}
                        value={formData.kategoriId || null}
                        onChange={(val: string | null) => {
                            if (val) {
                                const selected = stateLayananDesa.suratKeterangan.findMany.data?.find(
                                    (item) => item.id === val
                                );
                                if (selected) {
                                    stateAjukan.edit.form.kategoriId = selected.id;
                                }
                            } else {
                                stateAjukan.edit.form.kategoriId = '';
                            }
                        }}
                        searchable
                        clearable
                        nothingFoundMessage="Tidak ditemukan"
                        required
                    />

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

export default EditAjukanPermohonan;
