/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import posyandustate from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu';
import ringkasanKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/ringkasan-kesehatan/ringkasanKesehatan';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPosyandu() {
  const statePosyandu = useProxy(posyandustate);
  const stateBanjar = useProxy(ringkasanKesehatanState);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.name?.trim() !== '' &&
      formData.nomor?.trim() !== '' &&
      !isHtmlEmpty(formData.deskripsi) &&
      !isHtmlEmpty(formData.jadwalPelayanan) &&
      (file !== null || originalData.imageId !== '') // Either a new file is selected or an existing image exists
    );
  };

  const [formData, setFormData] = useState({
    name: '',
    nomor: '',
    deskripsi: '',
    imageId: '',
    jadwalPelayanan: '',
    banjarId: '',
  });
  const [originalData, setOriginalData] = useState({
    name: "",
    nomor: "",
    deskripsi: "",
    imageId: "",
    jadwalPelayanan: "",
    banjarId: "",
    imageUrl: ""
  });

  // Load data posyandu dan banjar
  useEffect(() => {
    ringkasanKesehatanState.findBanjar.load();
    const loadPosyandu = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await statePosyandu.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            nomor: data.nomor || '',
            deskripsi: data.deskripsi || '',
            imageId: data.imageId || '',
            jadwalPelayanan: data.jadwalPelayanan || '',
            banjarId: data.banjarId || '',
          });
          setOriginalData({
            name: data.name || '',
            nomor: data.nomor || '',
            deskripsi: data.deskripsi || '',
            imageId: data.imageId || '',
            jadwalPelayanan: data.jadwalPelayanan || '',
            banjarId: data.banjarId || '',
            imageUrl: data.image?.link || '',
          });
          if (data?.image?.link) setPreviewImage(data.image.link);
        }
      } catch (error) {
        console.error('Error loading posyandu:', error);
        toast.error('Gagal memuat data posyandu');
      }
    };
    loadPosyandu();
  }, [params?.id]);

  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      toast.error('Nama posyandu wajib diisi');
      return;
    }

    if (!formData.nomor?.trim()) {
      toast.error('Nomor telepon wajib diisi');
      return;
    }

    if (isHtmlEmpty(formData.deskripsi)) {
      toast.error('Deskripsi wajib diisi');
      return;
    }

    if (isHtmlEmpty(formData.jadwalPelayanan)) {
      toast.error('Jadwal pelayanan wajib diisi');
      return;
    }

    if (!file && !originalData.imageId) {
      toast.error('Gambar wajib dipilih');
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedForm = { ...statePosyandu.edit.form, ...formData, banjarId: formData.banjarId };

      // Upload file jika ada
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) return toast.error('Gagal upload gambar');
        updatedForm.imageId = uploaded.id;
      }

      statePosyandu.edit.form = updatedForm;
      await statePosyandu.edit.update();

      toast.success('Posyandu berhasil diperbarui!');
      router.push('/admin/kesehatan/posyandu/list-posyandu');
    } catch (error) {
      console.error('Error updating posyandu:', error);
      toast.error('Terjadi kesalahan saat memperbarui posyandu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: originalData.name,
      nomor: originalData.nomor,
      deskripsi: originalData.deskripsi,
      imageId: originalData.imageId,
      jadwalPelayanan: originalData.jadwalPelayanan,
      banjarId: originalData.banjarId,
    });
    setPreviewImage(originalData.imageUrl || null);
    setFile(null);
    toast.info("Form dikembalikan ke data awal");
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Tombol Back */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Posyandu
        </Title>
      </Group>

      {/* Card utama */}
      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          {/* Upload Gambar */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Posyandu
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

            {previewImage && (
              <Box mt="sm" pos={"relative"} style={{ display: 'flex', justifyContent: 'center' }}>
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

          {/* Input Form */}
          <TextInput
            label="Nama Posyandu"
            placeholder="Masukkan nama posyandu"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <TextInput
            label="Nomor Posyandu"
            placeholder="Masukkan nomor posyandu"
            value={formData.nomor}
            onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
            required
          />

          <Select
            label="Banjar"
            placeholder="Pilih banjar"
            clearable
            data={stateBanjar.findBanjar.data.map((b) => ({ value: b.id, label: b.name }))}
            value={formData.banjarId || null}
            onChange={(val) => setFormData({ ...formData, banjarId: val ?? '' })}
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi Posyandu
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) => setFormData({ ...formData, deskripsi: htmlContent })}
            />
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Jadwal Pelayanan
            </Text>
            <EditEditor
              value={formData.jadwalPelayanan}
              onChange={(htmlContent) =>
                setFormData({ ...formData, jadwalPelayanan: htmlContent })
              }
            />
          </Box>

          {/* Tombol Submit */}
          <Group justify="right">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={resetForm}
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
    </Box>
  );
}

export default EditPosyandu;
