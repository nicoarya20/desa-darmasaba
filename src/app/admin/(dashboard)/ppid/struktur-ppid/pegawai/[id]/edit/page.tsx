/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateStrukturPPID from '@/app/admin/(dashboard)/_state/ppid/struktur_ppid/struktur_PPID';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  ActionIcon,
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
  Loader
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

export default function EditPegawaiPPID() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const stateOrganisasi = useProxy(stateStrukturPPID.pegawai);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [originalData, setOriginalData] = useState({
    namaLengkap: "",
    gelarAkademik: "",
    imageId: "",
    tanggalMasuk: "",
    email: "",
    telepon: "",
    alamat: "",
    posisiId: "",
    imageUrl: "",
    isActive: true,
  });
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

  // Helper function to validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Format date for <input type="date">
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.namaLengkap?.trim() !== '' &&
      formData.gelarAkademik?.trim() !== '' &&
      formData.posisiId !== '' &&
      formData.tanggalMasuk !== '' &&
      formData.email !== '' &&
      isValidEmail(formData.email) &&
      formData.telepon !== '' &&
      formData.alamat !== ''
    );
  };

  useEffect(() => {
    const loadPegawai = async () => {
      try {
        await stateStrukturPPID.posisiOrganisasi.findManyAll.load();

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
          setOriginalData({
            namaLengkap: data.namaLengkap || '',
            gelarAkademik: data.gelarAkademik || '',
            imageId: data.imageId || '',
            tanggalMasuk: data.tanggalMasuk || '',
            email: data.email || '',
            telepon: data.telepon || '',
            alamat: data.alamat || '',
            posisiId: data.posisiId || '',
            imageUrl: data.image?.link || '',
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

  const handleResetForm = () => {
    setFormData({
      namaLengkap: originalData.namaLengkap,
      gelarAkademik: originalData.gelarAkademik,
      imageId: originalData.imageId,
      tanggalMasuk: originalData.tanggalMasuk,
      email: originalData.email,
      telepon: originalData.telepon,
      alamat: originalData.alamat,
      posisiId: originalData.posisiId,
      isActive: originalData.isActive,
    });
    setPreviewImage(originalData.imageUrl || null);
    setFile(null);
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
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
      if (success) router.push('/admin/ppid/struktur-ppid/pegawai');
    } catch (error) {
      console.error('Error updating pegawai:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui data pegawai');
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
                  <Text size="sm" c="dimmed">Maksimal 5MB, format gambar .png, .jpg, .jpeg, webp</Text>
                </Stack>
              </Group>
            </Dropzone>

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
              label="Posisi"
              placeholder="Pilih posisi"
              data={stateStrukturPPID.posisiOrganisasi.findManyAll.data?.map((item) => ({
                label: item.nama,
                value: item.id,
              })) || []}
              value={formData.posisiId || null}
              onChange={(val: string | null) => {
                if (val) {
                  const selected = stateStrukturPPID.posisiOrganisasi.findManyAll.data?.find(
                    (item) => item.id === val
                  );
                  if (selected) {
                    formData.posisiId = selected.id;
                  }
                } else {
                  formData.posisiId = '';
                }
              }}
              searchable
              clearable
              nothingFoundMessage="Tidak ditemukan"
              required
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
          <Group justify="right">
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
    </Box>
  );
}
