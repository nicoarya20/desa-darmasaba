'use client';
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import posyandustate from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu';
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
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import ringkasanKesehatanState from '../../../../_state/kesehatan/ringkasan-kesehatan/ringkasanKesehatan';



function CreatePosyandu() {
  const statePosyandu = useProxy(posyandustate, { sync: true }); // sync: cegah caret jump di controlled input
  const stateBanjar = useProxy(ringkasanKesehatanState);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { ringkasanKesehatanState.findBanjar.load(); }, []);

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      statePosyandu.create.form.name?.trim() !== '' &&
      statePosyandu.create.form.nomor?.trim() !== '' &&
      !isHtmlEmpty(statePosyandu.create.form.deskripsi) &&
      !isHtmlEmpty(statePosyandu.create.form.jadwalPelayanan) &&
      file !== null
    );
  };

  const resetForm = () => {
    statePosyandu.create.form = {
      name: '',
      nomor: '',
      deskripsi: '',
      imageId: '',
      jadwalPelayanan: '',
      banjarId: '',
    };
    setFile(null);
    setPreviewImage(null);
  };


  const handleSubmit = async () => {
    if (!statePosyandu.create.form.name?.trim()) {
      toast.error('Nama posyandu wajib diisi');
      return;
    }

    if (!statePosyandu.create.form.nomor?.trim()) {
      toast.error('Nomor telepon wajib diisi');
      return;
    }

    if (isHtmlEmpty(statePosyandu.create.form.deskripsi)) {
      toast.error('Deskripsi wajib diisi');
      return;
    }

    if (isHtmlEmpty(statePosyandu.create.form.jadwalPelayanan)) {
      toast.error('Jadwal pelayanan wajib diisi');
      return;
    }

    if (!file) {
      toast.error('Gambar wajib dipilih');
      return;
    }

    try {
      setIsSubmitting(true);
      if (!file) {
        return toast.warn('Silakan pilih file gambar terlebih dahulu');
      }
      // Upload gambar dulu
      const res = await ApiFetch.api.fileStorage.create.post({
        file,
        name: file.name,
      });
      const uploaded = res.data?.data;
      if (!uploaded?.id) {
        return toast.error('Gagal upload gambar');
      }
      statePosyandu.create.form.imageId = uploaded.id;
      await statePosyandu.create.create();
      resetForm();
      router.push('/admin/kesehatan/posyandu/list-posyandu');
    } catch (error) {
      console.error('Error creating posyandu:', error);
      toast.error('Gagal menambahkan posyandu');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Posyandu
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
                  <IconUpload size={48} color="var(--mantine-color-blue-6)" stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={48} color="var(--mantine-color-red-6)" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={48} color="var(--mantine-color-dimmed)" stroke={1.5} />
                </Dropzone.Idle>
              </Group>
              <Text ta="center" mt="sm" size="sm" color="dimmed">
                Seret gambar atau klik untuk memilih file (maks 5MB)
              </Text>
            </Dropzone>


            {previewImage && (
              <Box pos={"relative"} mt="sm" style={{ textAlign: 'center' }}>
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
            value={statePosyandu.create.form.name || ''}
            onChange={(e) => (statePosyandu.create.form.name = e.target.value)}
            required
          />
          <TextInput
            label="Telepon Posyandu"
            placeholder="Masukkan telepon posyandu"
            inputMode="numeric"
            maxLength={13}
            value={statePosyandu.create.form.nomor || ''}
            onChange={(e) =>
              (statePosyandu.create.form.nomor = e.target.value.replace(/\D/g, '').slice(0, 13))
            }
            required
          />
          <Select
            label="Banjar"
            placeholder="Pilih banjar"
            clearable
            data={stateBanjar.findBanjar.data.map((b) => ({ value: b.id, label: b.name }))}
            value={statePosyandu.create.form.banjarId || null}
            onChange={(val) => { statePosyandu.create.form.banjarId = val ?? ''; }}
          />
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi Posyandu
            </Text>
            <CreateEditor
              value={statePosyandu.create.form.deskripsi}
              onChange={(htmlContent) => {
                statePosyandu.create.form.deskripsi = htmlContent;
              }}
            />
          </Box>
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Jadwal Pelayanan
            </Text>
            <CreateEditor
              value={statePosyandu.create.form.jadwalPelayanan}
              onChange={(htmlContent) => {
                statePosyandu.create.form.jadwalPelayanan = htmlContent;
              }}
            />
          </Box>


          {/* Button */}
          <Group justify="right">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={resetForm}
            >
              Reset
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


export default CreatePosyandu;