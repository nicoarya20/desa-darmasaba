/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import { Alert, Box, Button, Center, Group, Paper, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { IconAlertCircle, IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function Page() {
    const lambangState = useProxy(stateProfileDesa.lambangDesa)
    const router = useRouter()
    const params = useParams()
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Load data
    useEffect(() => {
        const loadData = async () => {
            const id = params?.id as string;
            if (!id) {
                toast.error("ID tidak valid");
                router.push("/admin/desa/profile/profile-desa");
                return;
            }

            try {
                const data = await lambangState.findUnique.load(id);
                lambangState.update.initialize(data);
            } catch (error) {
                console.error("Error loading lambang:", error);
                toast.error("Gagal memuat data lambang desa");
            }
        };

        loadData();

        return () => {
            lambangState.update.reset();
            lambangState.findUnique.reset();
        };
    }, [params?.id, router]);

    const handleSubmit = async () => {
        if (isSubmitting || !lambangState.update.form.judul.trim()) {
            toast.error("Judul wajib diisi");
            return;
        }

        setIsSubmitting(true);

        try {
            const success = await lambangState.update.submit();

            if (success) {
                toast.success("Data berhasil disimpan");
                router.push("/admin/desa/profile/profile-desa");
            }
        } catch (error) {
            console.error("Error update lambang desa:", error);
            toast.error("Terjadi kesalahan saat update lambang desa");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => router.back();

    // Loading state
    if (lambangState.findUnique.loading || lambangState.update.loading) {
        return (
            <Box>
                <Center h={400}>
                    <Text>Memuat data...</Text>
                </Center>
            </Box>
        );
    }

    // Error state
    if (lambangState.findUnique.error) {
        return (
            <Box>
                <Stack gap="md">
                    <Button variant="subtle" onClick={handleBack}>
                        <IconArrowBack color={colors['blue-button']} size={20} />
                    </Button>
                    <Alert icon={<IconAlertCircle size={16} />} color="red">
                        <Text fw="bold">Error</Text>
                        <Text>{lambangState.findUnique.error}</Text>
                    </Alert>
                </Stack>
            </Box>
        );
    }

    return (
        <Box>
            <Stack gap="xs">
                <Group mb="md">
                    <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
                        <Button variant="subtle" onClick={handleBack} p="xs" radius="md">
                            <IconArrowBack color={colors['blue-button']} size={24} />
                        </Button>
                    </Tooltip>
                    <Title order={4} ml="sm" c="dark">Edit Lambang Desa</Title>
                </Group>

                <Paper w={{ base: "100%", md: "50%" }} bg={colors['white-1']} p="md" radius="md" shadow="sm" style={{ border: '1px solid #e0e0e0' }}>
                    <Stack gap="xs">
                        <Title order={3}>Edit Lambang Desa</Title>

                        {/* Judul */}
                        <TextInput
                            label={<Text fw="bold">Judul</Text>}
                            placeholder="Judul lambang"
                            value={lambangState.update.form.judul}
                            onChange={(e) => lambangState.update.form.judul = e.currentTarget.value}
                            error={!lambangState.update.form.judul && "Judul wajib diisi"}
                        />

                        {/* Deskripsi */}
                        <Box>
                            <Text fz={"md"} fw={"bold"}>Deskripsi</Text>
                            <EditEditor
                                value={lambangState.update.form.deskripsi}
                                onChange={(val) => lambangState.update.form.deskripsi = val}
                            />
                        </Box>

                        {/* Buttons */}
                        <Group>
                            <Button
                                bg={colors['blue-button']}
                                onClick={handleSubmit}
                                loading={isSubmitting || lambangState.update.loading}
                                disabled={!lambangState.update.form.judul}
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>

                            <Button variant="outline" onClick={handleBack} disabled={isSubmitting || lambangState.update.loading}>
                                Batal
                            </Button>
                        </Group>
                    </Stack>
                </Paper>
            </Stack>
        </Box>
    );
}

export default Page;
