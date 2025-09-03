/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import { Alert, Box, Button, Center, Group, Paper, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconAlertCircle, IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function Page() {
    const visiMisiState = useProxy(stateProfileDesa.visiMisiDesa)
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
                const data = await visiMisiState.findUnique.load(id);
                visiMisiState.update.initialize(data);
            } catch (error) {
                console.error("Error loading visi misi:", error);
                toast.error("Gagal memuat data visi misi desa");
            }
        };

        loadData();

        return () => {
            visiMisiState.update.reset();
            visiMisiState.findUnique.reset();
        };
    }, [params?.id, router]);

    const handleSubmit = async () => {
        if (isSubmitting || !visiMisiState.update.form.visi.trim()) {
            toast.error("Visi wajib diisi");
            return;
        }

        setIsSubmitting(true);

        try {
            const success = await visiMisiState.update.submit();

            if (success) {
                toast.success("Data berhasil disimpan");
                router.push("/admin/desa/profile/profile-desa");
            }
        } catch (error) {
            console.error("Error update visi misi desa:", error);
            toast.error("Terjadi kesalahan saat update visi misi desa");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => router.back();

    // Loading state
    if (visiMisiState.findUnique.loading || visiMisiState.update.loading) {
        return (
            <Box>
                <Center h={400}>
                    <Text>Memuat data...</Text>
                </Center>
            </Box>
        );
    }

    // Error state
    if (visiMisiState.findUnique.error) {
        return (
            <Box>
                <Stack gap="md">
                    <Button variant="subtle" onClick={handleBack}>
                        <IconArrowBack color={colors['blue-button']} size={20} />
                    </Button>
                    <Alert icon={<IconAlertCircle size={16} />} color="red">
                        <Text fw="bold">Error</Text>
                        <Text>{visiMisiState.findUnique.error}</Text>
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
                    <Title order={4} ml="sm" c="dark">Edit Visi Misi Desa</Title>
                </Group>

                <Paper w={{ base: "100%", md: "50%" }} bg={colors['white-1']} p="md" radius="md" shadow="sm" style={{ border: '1px solid #e0e0e0' }}>
                    <Stack gap="xs">
                        <Title order={3}>Edit Visi Misi Desa</Title>

                        {/* Visi */}
                        <Box>
                            <Text fz={"md"} fw={"bold"}>Visi</Text>
                            <EditEditor
                                value={visiMisiState.update.form.visi}
                                onChange={(val) => visiMisiState.update.form.visi = val}
                            />
                        </Box>

                        {/* Misi */}
                        <Box>
                            <Text fz={"md"} fw={"bold"}>Misi</Text>
                            <EditEditor
                                value={visiMisiState.update.form.misi}
                                onChange={(val) => visiMisiState.update.form.misi = val}
                            />
                        </Box>

                        {/* Buttons */}
                        <Group>
                            <Button
                                bg={colors['blue-button']}
                                onClick={handleSubmit}
                                loading={isSubmitting || visiMisiState.update.loading}
                                disabled={!visiMisiState.update.form.visi}
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>

                            <Button variant="outline" onClick={handleBack} disabled={isSubmitting || visiMisiState.update.loading}>
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
