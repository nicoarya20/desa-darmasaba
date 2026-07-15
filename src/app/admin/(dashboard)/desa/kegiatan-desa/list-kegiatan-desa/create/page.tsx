'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import stateDashboardKegiatan from '@/app/admin/(dashboard)/_state/desa/kegiatanDesa';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  Loader,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

const isHtmlEmpty = (html: string) => html.replace(/<[^>]*>/g, '').trim() === '';

export default function CreateKegiatanDesa() {
  const kegiatanState = useProxy(stateDashboardKegiatan, { sync: true }); // sync: cegah caret jump di controlled input
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useShallowEffect(() => {
    kegiatanState.kategoriKegiatan.findMany.load();
  }, []);

  const isFormValid = () => {
    const f = kegiatanState.kegiatan.create.form;
    return (
      f.judul.trim() !== '' &&
      f.deskripsiSingkat.trim() !== '' &&
      !isHtmlEmpty(f.deskripsiLengkap) &&
      f.tanggal !== '' &&
      f.lokasi.trim() !== '' &&
      f.kategoriKegiatanId !== ''
    );
  };

  const resetForm = () => {
    kegiatanState.kegiatan.create.resetForm();
    setPreviewImage(null);
    setFile(null);
  };

  const handleSubmit = async () => {
    const f = kegiatanState.kegiatan.create.form;
    if (!f.judul.trim()) return toast.error('Judul wajib diisi');
    if (!f.deskripsiSingkat.trim()) return toast.error('Deskripsi singkat wajib diisi');
    if (isHtmlEmpty(f.deskripsiLengkap)) return toast.error('Deskripsi lengkap wajib diisi');
    if (!f.tanggal) return toast.error('Tanggal wajib diisi');
    if (!f.lokasi.trim()) return toast.error('Lokasi wajib diisi');
    if (!f.kategoriKegiatanId) return toast.error('Kategori wajib dipilih');

    try {
      setIsSubmitting(true);

      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;
        if (!uploaded?.id) return toast.error('Gagal mengunggah gambar');
        kegiatanState.kegiatan.create.form.imageId = uploaded.id;
      }

      const success = await kegiatanState.kegiatan.create.create();
      if (success) {
        resetForm();
        router.push('/admin/desa/kegiatan-desa/list-kegiatan-desa');
      }
    } catch (error) {
      console.error('Error creating kegiatan:', error);
      toast.error('Terjadi kesalahan saat membuat kegiatan');
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
        <Title order={4} ml="sm" c="dark">Tambah Kegiatan Desa</Title>
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
            label="Judul"
            placeholder="Masukkan judul kegiatan"
            value={kegiatanState.kegiatan.create.form.judul}
            onChange={(e) => (kegiatanState.kegiatan.create.form.judul = e.target.value)}
            required
          />

          <Select
            label="Kategori Kegiatan"
            placeholder="Pilih kategori"
            data={kegiatanState.kategoriKegiatan.findMany.data.map((item) => ({
              label: item.nama,
              value: item.id,
            }))}
            value={kegiatanState.kegiatan.create.form.kategoriKegiatanId || null}
            onChange={(val) => {
              kegiatanState.kegiatan.create.form.kategoriKegiatanId = val || '';
            }}
            searchable
            clearable
            nothingFoundMessage="Tidak ditemukan"
            required
          />

          <TextInput
            label="Tanggal"
            type="date"
            value={kegiatanState.kegiatan.create.form.tanggal}
            onChange={(e) => (kegiatanState.kegiatan.create.form.tanggal = e.target.value)}
            required
          />

          <TextInput
            label="Lokasi"
            placeholder="Masukkan lokasi kegiatan"
            value={kegiatanState.kegiatan.create.form.lokasi}
            onChange={(e) => (kegiatanState.kegiatan.create.form.lokasi = e.target.value)}
            required
          />

          <NumberInput
            label="Jumlah Partisipan"
            placeholder="Masukkan jumlah partisipan"
            value={kegiatanState.kegiatan.create.form.partisipan}
            onChange={(val) => (kegiatanState.kegiatan.create.form.partisipan = Number(val) || 0)}
            min={0}
          />

          <Textarea
            label="Deskripsi Singkat"
            placeholder="Masukkan deskripsi singkat kegiatan"
            value={kegiatanState.kegiatan.create.form.deskripsiSingkat}
            onChange={(e) => (kegiatanState.kegiatan.create.form.deskripsiSingkat = e.target.value)}
            minRows={3}
            autosize
            required
          />

          <Box>
            <Text fz="sm" fw="bold" mb={6}>Deskripsi Lengkap</Text>
            <CreateEditor
              value={kegiatanState.kegiatan.create.form.deskripsiLengkap}
              onChange={(html) => { kegiatanState.kegiatan.create.form.deskripsiLengkap = html; }}
            />
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>Gambar (Opsional)</Text>
            <Dropzone
              onDrop={(files) => {
                const f = files[0];
                if (f) { setFile(f); setPreviewImage(URL.createObjectURL(f)); }
              }}
              onReject={() => toast.error('File tidak valid, gunakan format gambar')}
              maxSize={5 * 1024 ** 2}
              accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={160}>
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
                Seret gambar atau klik untuk memilih (maks 5MB)
              </Text>
            </Dropzone>

            {previewImage && (
              <Box mt="sm" pos="relative" style={{ textAlign: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview"
                  radius="md"
                  style={{ maxHeight: 200, objectFit: 'contain', border: '1px solid #ddd' }}
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
                  onClick={() => { setPreviewImage(null); setFile(null); }}
                  style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Box>
            )}
          </Box>

          <Group justify="right">
            <Button variant="outline" color="gray" radius="md" size="md" onClick={resetForm}>
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              disabled={!isFormValid() || isSubmitting}
              style={{
                background:
                  !isFormValid() || isSubmitting
                    ? 'linear-gradient(135deg, #cccccc, #eeeeee)'
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
