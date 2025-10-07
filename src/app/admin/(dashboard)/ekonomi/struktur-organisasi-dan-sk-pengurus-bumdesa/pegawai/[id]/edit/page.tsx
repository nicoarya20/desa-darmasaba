/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import stateStrukturBumDes from '@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi/struktur-organisasi';
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
  Title,
  Tooltip
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

export default function EditPegawaiBumDes() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const stateOrganisasi = useProxy(stateStrukturBumDes.pegawai);

  const [formData, setFormData] = useState({
    namaLengkap: '',
    gelarAkademik: '',
    imageId: '',
    tanggalMasuk: '',
    email: '',
    telepon: '',
    alamat: '',
    posisiId: '',
    isActive: true,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Format date for <input type="date">
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const loadPegawai = async () => {
      try {
        await stateStrukturBumDes.posisiOrganisasi.findManyAll.load();

        const data = await stateOrganisasi.edit.load(id);
        if (data) {
          setFormData({
            namaLengkap: data.namaLengkap || '',
            gelarAkademik: data.gelarAkademik || '',
            imageId: data.imageId || '',
            tanggalMasuk: data.tanggalMasuk || '',
            email: data.email || '',
            telepon: data.telepon || '',
            alamat: data.alamat || '',
            posisiId: data.posisiId || '',
            isActive: data.isActive ?? true,
          });

          setPreviewImage(data.image?.link || null);
        }
      } catch (error) {
        console.error('Error loading pegawai:', error);
        toast.error(error instanceof Error ? error.message : 'Gagal mengambil data pegawai');
      }
    };

    loadPegawai();
  }, [id]);

  const handleSubmit = async () => {
    try {
      if (!formData.namaLengkap.trim()) {
        return toast.error('Nama lengkap tidak boleh kosong');
      }

      // Update global state only on submit
      const updatedForm = { ...formData };

      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;
        if (!uploaded?.id) return toast.error('Gagal upload gambar');
        updatedForm.imageId = uploaded.id;
      }

      stateOrganisasi.edit.form = updatedForm;
      if (id && !stateOrganisasi.edit.id) stateOrganisasi.edit.id = id;

      const success = await stateOrganisasi.edit.submit();
      if (success) router.push('/admin/ekonomi/struktur-organisasi-dan-sk-pengurus-bumdesa/pegawai');
    } catch (error) {
      console.error('Error updating pegawai:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui data pegawai');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">Edit Data Pegawai PPID</Title>
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
          {/* Nama Lengkap */}
          <TextInput
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            value={formData.namaLengkap}
            onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
            required
          />

          {/* Gelar Akademik */}
          <TextInput
            label="Gelar Akademik"
            placeholder="Contoh: S.Kom"
            value={formData.gelarAkademik}
            onChange={(e) => setFormData({ ...formData, gelarAkademik: e.target.value })}
          />

          {/* Foto Profil */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>Foto Profil</Text>
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
                <Dropzone.Accept><IconUpload size={48} color={colors['blue-button']} stroke={1.5} /></Dropzone.Accept>
                <Dropzone.Reject><IconX size={48} color="red" stroke={1.5} /></Dropzone.Reject>
                <Dropzone.Idle><IconPhoto size={48} color="#868e96" stroke={1.5} /></Dropzone.Idle>
                <Stack gap="xs" align="center">
                  <Text size="md" fw={500}>Seret gambar atau klik untuk memilih file</Text>
                  <Text size="sm" c="dimmed">Maksimal 5MB, format gambar wajib</Text>
                </Stack>
              </Group>
            </Dropzone>

            {previewImage && (
              <Box mt="sm" style={{ display: 'flex', justifyContent: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview Gambar"
                  radius="md"
                  style={{ maxHeight: 220, objectFit: 'contain', border: `1px solid ${colors['blue-button']}` }}
                  loading="lazy"
                />
              </Box>
            )}
          </Box>

          {/* Tanggal Masuk */}
          <TextInput
            label="Tanggal Masuk"
            type="date"
            placeholder="Contoh: 2022-01-01"
            value={formatDateForInput(formData.tanggalMasuk)}
            onChange={(e) => setFormData({ ...formData, tanggalMasuk: e.target.value })}
          />

          {/* Email */}
          <TextInput
            label="Email"
            type="email"
            placeholder="contoh@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          {/* Telepon */}
          <TextInput
            label="Telepon"
            placeholder="08123456789"
            value={formData.telepon}
            onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
          />

          {/* Alamat */}
          <TextInput
            label="Alamat"
            placeholder="Jl. Contoh No. 123"
            value={formData.alamat}
            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
          />

          {/* Posisi */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>Posisi</Text>
            <Select
              placeholder="Pilih posisi"
              data={stateStrukturBumDes.posisiOrganisasi.findManyAll.data?.map(p => ({ value: p.id, label: p.nama })) || []}
              value={formData.posisiId}
              onChange={(value) => value && setFormData({ ...formData, posisiId: value })}
              searchable
              clearable
            />
          </Box>

          {/* Status Pegawai */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>Status Pegawai</Text>
            <Select
              data={[
                { value: 'true', label: 'Aktif' },
                { value: 'false', label: 'Tidak Aktif' },
              ]}
              value={String(formData.isActive)}
              onChange={(val) => setFormData({ ...formData, isActive: val === 'true' })}
              clearable
            />
          </Box>

          {/* Submit Button */}
          <Group justify="flex-end" mt="md">
            <Button
              onClick={handleSubmit}
              loading={stateOrganisasi.edit.loading}
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
