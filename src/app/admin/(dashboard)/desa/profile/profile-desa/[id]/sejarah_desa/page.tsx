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
    const sejarahState = useProxy(stateProfileDesa.sejarahDesa)
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

            const data = await sejarahState.findUnique.load(id);
            if (data) {
                sejarahState.update.initialize(data);
            }
        };

        loadData();

        return () => {
            sejarahState.update.reset();
            sejarahState.findUnique.reset(); // opsional: reset juga data lama
        };
    }, [params?.id, router]);


    const handleSubmit = async () => {
        if (isSubmitting || !sejarahState.update.form.judul.trim()) {
            toast.error("Judul wajib diisi");
            return;
        }
        setIsSubmitting(true)
        try {
            const success = await sejarahState.update.submit()
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
    }

    const handleBack = () => {
        router.back()
    }

    if (
        sejarahState.findUnique.loading ||
        !sejarahState.findUnique.data ||
        sejarahState.update.loading
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
                                    <Title order={4}>Edit Sejarah Desa</Title>
                                    <TextInput
                                        label={<Text fz={"md"} fw={"bold"}>Judul</Text>}
                                        placeholder="Judul"
                                        value={sejarahState.update.form.judul}
                                        onChange={(e) => sejarahState.update.form.judul = e.currentTarget.value}
                                        error={!sejarahState.update.form.judul && "Judul wajib diisi"}
                                    />
                                    <Box>
                                        <Text fz={"md"} fw={"bold"}>Deskripsi</Text>
                                        <EditEditor
                                            value={sejarahState.update.form.deskripsi}
                                            onChange={(val) => sejarahState.update.form.deskripsi = val}
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
