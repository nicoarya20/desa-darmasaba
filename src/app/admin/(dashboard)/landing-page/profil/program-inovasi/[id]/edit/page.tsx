/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import profileLandingPageState from '@/app/admin/(dashboard)/_state/landing-page/profile';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Loader
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditProgramInovasi() {
  const stateProgramInovasi = useProxy(profileLandingPageState.programInovasi)
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageId: "",
    link: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.name?.trim() !== '' &&
      formData.description?.trim() !== '' &&
      formData.link?.trim() !== '' &&
      (formData.imageId?.trim() !== '' || file !== null)
    );
  };

  const [originalData, setOriginalData] = useState({
    name: "",
    description: "",
    imageId: "",
    link: "",
    imageUrl: "",
  });

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;

    const loadProgramInovasi = async () => {
      try {
        const data = await stateProgramInovasi.update.load(id);
        if (data) {
          // isi form awal
          const newForm = {
            name: data.name || "",
            description: data.description || "",
            imageId: data.imageId || "",
            link: data.link || "",
          };
          setFormData(newForm);

          // simpan juga versi original
          setOriginalData({
            ...newForm,
            imageUrl: data.image?.link || "",
          });

          setPreviewImage(data.image?.link || null);
        }
      } catch (error) {
        console.error("Error loading program inovasi:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengambil data program inovasi"
        );
      }
    };
    loadProgramInovasi();
  }, [params?.id]);

  // ✅ Tombol Batal → balikin ke data original
  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      description: originalData.description,
      imageId: originalData.imageId,
      link: originalData.link,
    });
    setPreviewImage(originalData.imageUrl || null);
    setFile(null);
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // Upload file kalau ada file baru
      let imageId = formData.imageId;
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;
        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }
        imageId = uploaded.id;
      }

      // Update global state form (baru di sini)
      stateProgramInovasi.update.form = {
        ...stateProgramInovasi.update.form,
        name: formData.name,
        description: formData.description,
        imageId,
        link: formData.link,
      }

      await stateProgramInovasi.update.update();
      toast.success("Program Inovasi berhasil diperbarui!");
      router.push("/admin/landing-page/profil/program-inovasi");
    } catch (error) {
      console.error("Error updating program inovasi:", error);
      toast.error("Terjadi kesalahan saat memperbarui program inovasi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Program Inovasi
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
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Program Inovasi
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewImage(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() => toast.error('File tidak valid, gunakan format gambar')}
              maxSize={5 * 1024 ** 2}
              accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={180}>
                <Dropzone.Accept>
                  <IconUpload size={48} color={colors['blue-button']} stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={48} color="red" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={48} color="#868e96" stroke={1.5} />
                </Dropzone.Idle>
                <Stack gap="xs" align="center">
                  <Text size="md" fw={500}>
                    Seret gambar atau klik untuk memilih file
                  </Text>
                  <Text size="sm" c="dimmed">
                  Maksimal 5MB, format gambar .png, .jpg, .jpeg, webp
                  </Text>
                </Stack>
              </Group>
            </Dropzone>

            {/* ✅ Preview gambar + tombol X */}
            {previewImage && (
              <Box mt="sm" pos="relative" style={{ textAlign: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview Gambar"
                  radius="md"
                  style={{
                    maxHeight: 200,
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                  }}
                  loading="lazy"
                />

                {/* Tombol hapus (pojok kanan atas) */}
                <ActionIcon
                  variant="filled"
                  color="red"
                  radius="xl"
                  size="sm"
                  pos="absolute"
                  top={5}
                  right={5}
                  onClick={() => {
                    setPreviewImage(null);
                    setFile(null);
                  }}
                  style={{
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Box>
            )}
          </Box>

          <TextInput
            key={String(params.id)} // Convert to string to ensure valid key
            label="Nama Program Inovasi"
            placeholder="Masukkan nama program inovasi"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Box>
            <Text fz="sm" fw="bold">Deskripsi</Text>
            <EditEditor
              value={formData.description}
              onChange={(htmlContent) =>
                setFormData((prev) => ({ ...prev, description: htmlContent }))
              }
            />
          </Box>

          <TextInput
            key={`${params.id}-link`}
            label="Link Program Inovasi"
            placeholder="Masukkan link program inovasi (opsional)"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          />

          {/* ======= Tombol Aksi ======= */}
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
                  ? 'linear-gradient(135deg, #cccccc, #999999)' 
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
    </Box>
  );
}

export default EditProgramInovasi;
