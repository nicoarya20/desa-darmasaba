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
    const sejarahState = useProxy(stateProfileDesa.sejarahDesa)
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
                const data = await sejarahState.findUnique.load(id);
                if (data) {
                    sejarahState.update.initialize(data);
                }
            } catch (error) {
                console.error("Error loading sejarah:", error);
                toast.error("Gagal memuat data sejarah desa");
            }
        };

        loadData();

        return () => {
            sejarahState.update.reset();
            sejarahState.findUnique.reset();
        };
    }, [params?.id, router]);

    const handleSubmit = async () => {
        if (isSubmitting || !sejarahState.update.form.judul.trim()) {
            toast.error("Judul wajib diisi");
            return;
        }

        setIsSubmitting(true);
        try {
            const success = await sejarahState.update.submit();
            if (success) {
                toast.success("Data berhasil disimpan");
                router.push("/admin/desa/profile/profile-desa");
            }
        } catch (error) {
            console.error("Error update sejarah desa:", error);
            toast.error("Terjadi kesalahan saat update sejarah desa");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => router.back();

    // Loading state
    if (sejarahState.findUnique.loading || sejarahState.update.loading) {
        return (
            <Box>
                <Center h={400}>
                    <Text>Memuat data...</Text>
                </Center>
            </Box>
        );
    }

    // Error state
    if (sejarahState.findUnique.error) {
        return (
            <Box>
                <Stack gap="md">
                    <Button variant="subtle" onClick={handleBack}>
                        <IconArrowBack color={colors['blue-button']} size={20} />
                    </Button>
                    <Alert icon={<IconAlertCircle size={16} />} color="red">
                        <Text fw="bold">Error</Text>
                        <Text>{sejarahState.findUnique.error}</Text>
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
                    <Title order={4} ml="sm" c="dark">Edit Sejarah Desa</Title>
                </Group>

                <Paper w={{ base: "100%", md: "50%" }} bg={colors['white-1']} p="md" radius="md" shadow="sm" style={{ border: '1px solid #e0e0e0' }}>
                    <Stack gap="xs">
                        <Title order={3}>Edit Sejarah Desa</Title>

                        {/* Judul */}
                        <TextInput
                            label={<Text fw="bold">Judul</Text>}
                            placeholder="Judul sejarah"
                            defaultValue={sejarahState.update.form.judul}
                            onChange={(e) => sejarahState.update.form.judul = e.currentTarget.value}
                            error={!sejarahState.update.form.judul && "Judul wajib diisi"}
                        />

                        {/* Deskripsi */}
                        <Box>
                            <Text fz={"md"} fw={"bold"}>Deskripsi</Text>
                            <EditEditor
                                value={sejarahState.update.form.deskripsi}
                                onChange={(val) => sejarahState.update.form.deskripsi = val}
                            />
                        </Box>

                        {/* Buttons */}
                        <Group>
                            <Button
                                bg={colors['blue-button']}
                                onClick={handleSubmit}
                                loading={isSubmitting || sejarahState.update.loading}
                                disabled={!sejarahState.update.form.judul}
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>

                            <Button variant="outline" onClick={handleBack} disabled={isSubmitting || sejarahState.update.loading}>
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
