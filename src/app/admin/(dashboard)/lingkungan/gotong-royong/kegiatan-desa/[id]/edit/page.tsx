/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import gotongRoyongState from '@/app/admin/(dashboard)/_state/lingkungan/gotong-royong';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  Box,
  Button,
  Group,
  Image,
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

interface FormKegiatanDesa {
  judul: string;
  deskripsiSingkat: string;
  deskripsiLengkap: string;
  tanggal: string;
  lokasi: string;
  partisipan: number;
  imageId: string;
  kategoriKegiatanId: string;
}

export default function EditKegiatanDesa() {
  const kegiatanDesaState = useProxy(gotongRoyongState.kegiatanDesa);
  const params = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState<FormKegiatanDesa>({
    judul: '',
    deskripsiSingkat: '',
    deskripsiLengkap: '',
    tanggal: '',
    lokasi: '',
    partisipan: 0,
    imageId: '',
    kategoriKegiatanId: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  // Load kategori & data kegiatan
  useEffect(() => {
    const loadData = async () => {
      gotongRoyongState.kategoriKegiatan.findMany.load();
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await kegiatanDesaState.edit.load(id);
        if (data) {
          setFormData({
            judul: data.judul || '',
            deskripsiSingkat: data.deskripsiSingkat || '',
            deskripsiLengkap: data.deskripsiLengkap || '',
            tanggal: data.tanggal || '',
            lokasi: data.lokasi || '',
            partisipan: data.partisipan || 0,
            imageId: data.imageId || '',
            kategoriKegiatanId: data.kategoriKegiatanId || '',
          });
          if (data.imageId) {
            // Optional: bisa fetch URL image dari backend
            setPreviewImage(`/api/file/${data.imageId}`);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error('Gagal memuat data kegiatan desa');
      }
    };
    loadData();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      let imageId = formData.imageId;
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;
        if (!uploaded?.id) return toast.error('Gagal upload gambar');
        imageId = uploaded.id;
      }

      kegiatanDesaState.edit.form = {
        judul: formData.judul.trim(),
        deskripsiSingkat: formData.deskripsiSingkat.trim(),
        deskripsiLengkap: formData.deskripsiLengkap.trim(),
        tanggal: new Date(formData.tanggal),
        lokasi: formData.lokasi.trim(),
        partisipan: formData.partisipan,
        imageId,
        kategoriKegiatanId: formData.kategoriKegiatanId,
      };

      await kegiatanDesaState.edit.update();
      toast.success('Kegiatan desa berhasil diperbarui!');
      router.push('/admin/lingkungan/gotong-royong/kegiatan-desa');
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan saat memperbarui kegiatan desa');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Kegiatan Desa
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
          <TextInput
            value={formData.judul}
            label={<Text fz="sm" fw="bold">Judul Kegiatan Desa</Text>}
            placeholder="masukkan judul kegiatan desa"
            onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
            required
          />
          <Box>
            <Text fw="bold" fz="sm">Deskripsi Singkat Kegiatan Desa</Text>
            <EditEditor
              value={formData.deskripsiSingkat}
              onChange={(htmlContent) => setFormData(prev => ({ ...prev, deskripsiSingkat: htmlContent }))}
            />
          </Box>
          <Select
            label="Kategori Kegiatan"
            data={gotongRoyongState.kategoriKegiatan.findMany.data?.map(k => ({
              value: k.id,
              label: k.nama
            })) ?? []}
            value={formData.kategoriKegiatanId}
            onChange={(val) => setFormData({ ...formData, kategoriKegiatanId: val ?? '' })}
          />
          <Box>
            <Text fw="bold" fz="sm">Deskripsi Lengkap Kegiatan Desa</Text>
            <EditEditor
              value={formData.deskripsiLengkap}
              onChange={(htmlContent) => setFormData(prev => ({ ...prev, deskripsiLengkap: htmlContent }))}
            />
          </Box>
          <TextInput
            type="date"
            label={<Text fz="sm" fw="bold">Tanggal Kegiatan Desa</Text>}
            value={formatDateForInput(formData.tanggal)}
            onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
          />
          <TextInput
            value={formData.lokasi}
            label={<Text fz="sm" fw="bold">Lokasi Kegiatan Desa</Text>}
            placeholder="masukkan lokasi kegiatan desa"
            onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
          />
          <TextInput
            value={formData.partisipan}
            label={<Text fz="sm" fw="bold">Partisipan Kegiatan Desa</Text>}
            placeholder="masukkan partisipan kegiatan desa"
            onChange={(e) => {
              const val = Number(e.target.value);
              if (!isNaN(val)) setFormData({ ...formData, partisipan: val });
            }}
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>Gambar Kegiatan Desa</Text>
            <Dropzone
              onDrop={(files) => {
                const selected = files[0];
                if (!selected) return;
                setFile(selected);
                setPreviewImage(URL.createObjectURL(selected));
              }}
              onReject={() => toast.error('File tidak valid.')}
              maxSize={5 * 1024 ** 2}
              accept={{ 'image/*': [] }}
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
                  <Text size="md" fw={500}>Drag gambar atau klik untuk pilih file</Text>
                  <Text size="sm" c="dimmed">Maksimal 5MB, format gambar wajib</Text>
                </Stack>
              </Group>
            </Dropzone>

            {previewImage && (
              <Box mt="sm" style={{ display: 'flex', justifyContent: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview"
                  radius="md"
                  style={{ maxHeight: 220, objectFit: 'contain', border: `1px solid ${colors['blue-button']}` }}
                  loading="lazy"
                />
              </Box>
            )}
          </Box>

          <Group justify="right">
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}
