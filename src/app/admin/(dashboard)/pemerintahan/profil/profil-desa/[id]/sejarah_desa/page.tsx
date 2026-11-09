'use client';
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import {
    Alert,
    Box,
    Button,
    Center,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
    TextInput,
    Title
} from '@mantine/core';
import { IconAlertCircle, IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// 🔹 Types
interface FormData {
    judul: string;
    deskripsi: string;
}

// 🔹 Main Component
function Page() {
    const router = useRouter();
    const params = useParams();

    // 🧩 Local State
    const [formData, setFormData] = useState<FormData>({
        judul: '',
        deskripsi: '',
    });
    const [originalData, setOriginalData] = useState<FormData>({
        judul: '',
        deskripsi: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    // 🧭 Load Initial Data
    useEffect(() => {
        const loadData = async () => {
            const id = params?.id as string;
            if (!id) {
                toast.error('ID tidak valid');
                router.push('/admin/pemerintahan/profil/profil-desa');
                return;
            }

            setIsLoading(true);
            setLoadError(null);

            try {
                const data = await stateProfileDesa.sejarahDesa.findUnique.load(id);

                if (data) {
                    const initialData: FormData = {
                        judul: data.judul || '',
                        deskripsi: data.deskripsi || '',
                    };

                    setFormData(initialData);
                    setOriginalData(initialData);

                    stateProfileDesa.sejarahDesa.update.initialize(data);
                } else {
                    setLoadError('Data tidak ditemukan');
                }
            } catch (error) {
                console.error('Error loading sejarah:', error);
                setLoadError('Gagal memuat data sejarah desa');
                toast.error('Gagal memuat data sejarah desa');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();

        return () => {
            stateProfileDesa.sejarahDesa.update.reset();
            stateProfileDesa.sejarahDesa.findUnique.reset();
        };
    }, [params?.id, router]);

    // 🔄 Check if form has changes


    // 🔁 Reset Form to Original Data
    const handleResetForm = () => {
        setFormData(originalData);
        toast.info('Form dikembalikan ke data awal');
    };

    // Helper function to check if HTML content is empty
    const isHtmlEmpty = (html: string) => {
        // Remove all HTML tags and check if there's any text content
        const textContent = html.replace(/<[^>]*>/g, '').trim();
        return textContent === '';
    };

    // Check if form is valid
    const isFormValid = () => {
        return (
            formData.judul?.trim() !== '' &&
            !isHtmlEmpty(formData.deskripsi)
        );
    };

    // 💾 Submit Handler
    const handleSubmit = async () => {
        // Validation
        if (!formData.judul.trim()) {
            toast.error('Judul wajib diisi');
            return;
        }
        
        if (isHtmlEmpty(formData.deskripsi)) {
            toast.error('Deskripsi wajib diisi');
            return;
        }

        setIsSubmitting(true);

        try {
            // Access original state directly (not proxy)
            const originalState = stateProfileDesa.sejarahDesa;

            // Update form data
            originalState.update.form.judul = formData.judul;
            originalState.update.form.deskripsi = formData.deskripsi;

            // Submit
            const success = await originalState.update.submit();

            if (success) {
                toast.success('Data berhasil disimpan');
                router.push('/admin/pemerintahan/profil/profil-desa');
            } else {
                toast.error('Gagal menyimpan data');
            }
        } catch (error) {
            console.error('Error update sejarah desa:', error);
            toast.error('Terjadi kesalahan saat update sejarah desa');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 📝 Form Field Handlers
    const handleJudulChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, judul: e.target.value }));
    };

    const handleDeskripsiChange = (html: string) => {
        setFormData(prev => ({ ...prev, deskripsi: html }));
    };

    const handleBack = () => {
        router.back();
    };
    // 🔄 Loading State
    if (isLoading) {
        return (
            <Box px={{ base: 0, md: 'lg' }} py="xs">
                <Center h={400}>
                    <Stack align="center" gap="md">
                        <Loader size="lg" color={colors['blue-button']} />
                        <Text size="lg" fw={500} c="dimmed">
                            Memuat data...
                        </Text>
                    </Stack>
                </Center>
            </Box>
        );
    }

    // ❌ Error State
    if (loadError) {
        return (
            <Box px={{ base: 0, md: 'lg' }} py="xs">
                <Stack gap="md">
                    <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
                        <IconArrowBack color={colors['blue-button']} size={24} />
                    </Button>
                    <Alert
                        icon={<IconAlertCircle size={20} />}
                        color="red"
                        title="Terjadi Kesalahan"
                        radius="md"
                    >
                        {loadError}
                    </Alert>
                    <Button
                        onClick={() => router.push('/admin/pemerintahan/profil/profil-desa')}
                        variant="outline"
                    >
                        Kembali ke Halaman Utama
                    </Button>
                </Stack>
            </Box>
        );
    }

    return (
        <Box px={{ base: 'sm', md: 'lg' }} py="md">
            <Stack gap="md">
                {/* Header */}
                <Group mb="sm">
                    <Button variant="subtle" onClick={handleBack} p="xs" radius="md">
                        <IconArrowBack color={colors['blue-button']} size={24} />
                    </Button>
                    <Title order={4} ml="sm" c="dark">
                        Edit Sejarah Desa
                    </Title>
                </Group>

                {/* Form */}
                <Paper
                    w={{ base: '100%', md: '60%' }}
                    bg={colors['white-1']}
                    p="xl"
                    radius="md"
                    shadow="sm"
                    style={{ border: '1px solid #e0e0e0' }}
                >
                    <Stack gap="lg">
                        {/* Form Title */}
                        <Box>
                            <Title order={3} mb={4}>
                                Informasi Sejarah Desa
                            </Title>
                        </Box>
                        {/* Judul Field */}
                        <TextInput
                            label={<Text fw="bold" size="sm">Judul Sejarah</Text>}
                            placeholder="Masukkan judul sejarah desa"
                            value={formData.judul}
                            onChange={handleJudulChange}
                            error={!formData.judul.trim() && 'Judul wajib diisi'}
                            required
                            size="md"
                            radius="md"
                        />

                        {/* Deskripsi Field */}
                        <Box>
                            <Text fw="bold" size="sm" mb={8}>
                                Deskripsi Sejarah
                            </Text>
                            <EditEditor
                                value={formData.deskripsi}
                                onChange={handleDeskripsiChange}
                            />

                        </Box>

                        {/* Action Buttons */}
                        <Group justify="right">
                            {/* Tombol Batal */}
                            <Button
                                variant="outline"
                                color="gray"
                                radius="md"
                                size="md"
                                onClick={handleResetForm}
                            >
                                Batal
                            </Button>

                            {/* Tombol Simpan */}
                            <Button
                                onClick={handleSubmit}
                                radius="md"
                                size="md"
                                disabled={!isFormValid() || isSubmitting}
                                style={{
                                    background: !isFormValid() || isSubmitting
                                        ? `linear-gradient(135deg, #cccccc, #eeeeee)`
                                        : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                                    color: '#fff',
                                    boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
                                }}
                            >
                                {isSubmitting ? <Loader size="sm" color="white" /> : 'Simpan'}
                            </Button>
                        </Group>
                    </Stack>
                </Paper>
            </Stack>
        </Box>
    );
}

export default Page;