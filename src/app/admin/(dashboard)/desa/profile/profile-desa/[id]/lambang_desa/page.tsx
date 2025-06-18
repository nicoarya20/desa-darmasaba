/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import { Box, Button, Center, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function Page() {
    const lambangState = useProxy(stateProfileDesa.lambangDesa)
    const router = useRouter()
    const params = useParams()
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const id = params?.id as string;
            if (!id) {
                toast.error("ID tidak valid");
                router.push("/admin/desa/profile/profile-desa");
                return;
            }

            const data = await lambangState.findUnique.load(id);
            if (data) {
                lambangState.update.initialize(data);
            }
        };

        loadData();

        return () => {
            lambangState.update.reset();
            lambangState.findUnique.reset(); // opsional: reset juga data lama
        };
    }, [params?.id, router]);


    const handleSubmit = async () => {
        if (isSubmitting || !lambangState.update.form.judul.trim()) {
            toast.error("Judul wajib diisi");
            return;
        }
        setIsSubmitting(true)
        try {
            const success = await lambangState.update.submit()
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
    }

    const handleBack = () => {
        router.back()
    }

    if (
        lambangState.findUnique.loading ||
        !lambangState.findUnique.data ||
        lambangState.update.loading
    ) {
        return (
            <Box>
                <Center h={400}>
                    <Text>Memuat data...</Text>
                </Center>
            </Box>
        );
    }
    return (
        <Box>
            <Stack gap={'xs'}>
                <Group>
                    <Button variant="subtle" onClick={handleBack}>
                        <IconArrowBack color={colors['blue-button']} size={20} />
                    </Button>
                </Group>
                <Paper bg={colors['white-1']} p={'xs'} w={{ base: '100%', md: '50%' }}>
                    <Stack gap={'xs'}>
                        <Box>
                            <Box>
                                <Stack>
                                    <Title order={4}>Edit Lambang Desa</Title>
                                    <TextInput
                                        label={<Text fz={"md"} fw={"bold"}>Judul</Text>}
                                        placeholder="Judul"
                                        value={lambangState.update.form.judul}
                                        onChange={(e) => lambangState.update.form.judul = e.currentTarget.value}
                                        error={!lambangState.update.form.judul && "Judul wajib diisi"}
                                    />
                                    <Box>
                                        <Text fz={"md"} fw={"bold"}>Deskripsi</Text>
                                        <EditEditor
                                            value={lambangState.update.form.deskripsi}
                                            onChange={(val) => lambangState.update.form.deskripsi = val}
                                        />
                                    </Box>
                                    <Group>
                                        <Button
                                            onClick={handleSubmit}
                                            bg={colors['blue-button']}
                                        >
                                            Submit
                                        </Button>
                                    </Group>
                                </Stack>
                            </Box>
                        </Box>
                    </Stack>
                </Paper>
            </Stack>
        </Box>
    );
}

export default Page;
