/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
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
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

const isHtmlEmpty = (html: string) => html.replace(/<[^>]*>/g, '').trim() === '';

interface KegiatanData {
  id: string;
  judul: string;
  deskripsiSingkat: string;
  deskripsiLengkap: string;
  tanggal: string;
  lokasi: string;
  partisipan: number;
  kategoriKegiatanId: string | null;
  imageId: string | null;
  image?: { link: string } | null;
}

function EditKegiatanDesa() {
  const kegiatanState = useProxy(stateDashboardKegiatan);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emptyForm = {
    judul: '',
    deskripsiSingkat: '',
    deskripsiLengkap: '',
    tanggal: '',
    lokasi: '',
    partisipan: 0,
    kategoriKegiatanId: '',
    imageId: '',
  };

  const [formData, setFormData] = useState(emptyForm);
  const [originalData, setOriginalData] = useState({ ...emptyForm, imageUrl: '' });

  const isFormValid = () =>
    formData.judul.trim() !== '' &&
    formData.deskripsiSingkat.trim() !== '' &&
    !isHtmlEmpty(formData.deskripsiLengkap) &&
    formData.tanggal !== '' &&
    formData.lokasi.trim() !== '' &&
    formData.kategoriKegiatanId !== '';

  useEffect(() => {
    kegiatanState.kategoriKegiatan.findMany.load();

    const load = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateDashboardKegiatan.kegiatan.edit.load(id) as KegiatanData | null;
        if (data) {
          const tanggal = data.tanggal
            ? new Date(data.tanggal).toISOString().split('T')[0]
            : '';

          const form = {
            judul: data.judul || '',
            deskripsiSingkat: data.deskripsiSingkat || '',
            deskripsiLengkap: data.deskripsiLengkap || '',
            tanggal,
            lokasi: data.lokasi || '',
            partisipan: data.partisipan || 0,
            kategoriKegiatanId: data.kategoriKegiatanId || '',
            imageId: data.imageId || '',
          };

          setFormData(form);
          setOriginalData({ ...form, imageUrl: data.image?.link || '' });
          if (data.image?.link) setPreviewImage(data.image.link);
        }
      } catch (error) {
        console.error('Error loading kegiatan:', error);
        toast.error('Gagal memuat data kegiatan');
      }
    };

    load();
  }, [params?.id]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.judul.trim()) return toast.error('Judul wajib diisi');
    if (!formData.deskripsiSingkat.trim()) return toast.error('Deskripsi singkat wajib diisi');
    if (isHtmlEmpty(formData.deskripsiLengkap)) return toast.error('Deskripsi lengkap wajib diisi');
    if (!formData.tanggal) return toast.error('Tanggal wajib diisi');
    if (!formData.lokasi.trim()) return toast.error('Lokasi wajib diisi');
    if (!formData.kategoriKegiatanId) return toast.error('Kategori wajib dipilih');

    try {
      setIsSubmitting(true);

      kegiatanState.kegiatan.edit.form = {
        ...kegiatanState.kegiatan.edit.form,
        ...formData,
      };

      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;
        if (!uploaded?.id) return toast.error('Gagal upload gambar');
        kegiatanState.kegiatan.edit.form.imageId = uploaded.id;
      }

      const success = await kegiatanState.kegiatan.edit.update();
      if (success) {
        router.push('/admin/desa/kegiatan-desa/list-kegiatan-desa');
      }
    } catch (error) {
      console.error('Error updating kegiatan:', error);
      toast.error('Terjadi kesalahan saat memperbarui kegiatan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      judul: originalData.judul,
      deskripsiSingkat: originalData.deskripsiSingkat,
      deskripsiLengkap: originalData.deskripsiLengkap,
      tanggal: originalData.tanggal,
      lokasi: originalData.lokasi,
      partisipan: originalData.partisipan,
      kategoriKegiatanId: originalData.kategoriKegiatanId,
      imageId: originalData.imageId,
    });
    setPreviewImage(originalData.imageUrl || null);
    setFile(null);
    toast.info('Form dikembalikan ke data awal');
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">Edit Kegiatan Desa</Title>
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
            value={formData.judul}
            onChange={(e) => handleChange('judul', e.target.value)}
            required
          />

          <Select
            label="Kategori Kegiatan"
            placeholder="Pilih kategori"
            data={kegiatanState.kategoriKegiatan.findMany.data.map((item) => ({
              label: item.nama,
              value: item.id,
            }))}
            value={formData.kategoriKegiatanId || null}
            onChange={(val) => handleChange('kategoriKegiatanId', val || '')}
            searchable
            clearable
            nothingFoundMessage="Tidak ditemukan"
            required
          />

          <TextInput
            label="Tanggal"
            type="date"
            value={formData.tanggal}
            onChange={(e) => handleChange('tanggal', e.target.value)}
            required
          />

          <TextInput
            label="Lokasi"
            placeholder="Masukkan lokasi kegiatan"
            value={formData.lokasi}
            onChange={(e) => handleChange('lokasi', e.target.value)}
            required
          />

          <NumberInput
            label="Jumlah Partisipan"
            placeholder="Masukkan jumlah partisipan"
            value={formData.partisipan}
            onChange={(val) => handleChange('partisipan', Number(val) || 0)}
            min={0}
          />

          <Textarea
            label="Deskripsi Singkat"
            placeholder="Masukkan deskripsi singkat kegiatan"
            value={formData.deskripsiSingkat}
            onChange={(e) => handleChange('deskripsiSingkat', e.target.value)}
            minRows={3}
            autosize
            required
          />

          <Box>
            <Text fz="sm" fw="bold" mb={6}>Deskripsi Lengkap</Text>
            <EditEditor
              value={formData.deskripsiLengkap}
              onChange={(html) => setFormData((prev) => ({ ...prev, deskripsiLengkap: html }))}
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
                  <IconUpload size={48} color={colors['blue-button']} stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={48} color="red" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={48} color="#868e96" stroke={1.5} />
                </Dropzone.Idle>
              </Group>
            </Dropzone>

            {previewImage && (
              <Box mt="sm" pos="relative" style={{ textAlign: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview"
                  radius="md"
                  style={{
                    maxHeight: 220,
                    objectFit: 'contain',
                    border: `1px solid ${colors['blue-button']}`,
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
                  onClick={() => { setPreviewImage(null); setFile(null); }}
                  style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Box>
            )}
          </Box>

          <Group justify="right">
            <Button variant="outline" color="gray" radius="md" size="md" onClick={handleReset}>
              Batal
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

export default EditKegiatanDesa;
