/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateStrukturPPID from '@/app/admin/(dashboard)/_state/ppid/struktur_ppid/struktur_PPID';
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


export default function EditPegawaiPPID() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const stateOrganisasi = useProxy(stateStrukturPPID.pegawai);
  const [formData, setFormData] = useState({
    namaLengkap: stateOrganisasi.edit.form.namaLengkap,
    gelarAkademik: stateOrganisasi.edit.form.gelarAkademik,
    imageId: stateOrganisasi.edit.form.imageId,
    tanggalMasuk: stateOrganisasi.edit.form.tanggalMasuk,
    email: stateOrganisasi.edit.form.email,
    telepon: stateOrganisasi.edit.form.telepon,
    alamat: stateOrganisasi.edit.form.alamat,
    posisiId: stateOrganisasi.edit.form.posisiId,
    isActive: stateOrganisasi.edit.form.isActive,
  });


  // Format date to YYYY-MM-DD for date input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const loadPegawai = async () => {
      try {
        await stateStrukturPPID.posisiOrganisasi.findMany.load(1, 0); // ambil semua data
        const data = await stateOrganisasi.edit.load(id);
        if (data) {
          setFormData({
            namaLengkap: data.namaLengkap || "",
            gelarAkademik: data.gelarAkademik || "",
            imageId: data.imageId || "",
            tanggalMasuk: data.tanggalMasuk || "",
            email: data.email || "",
            telepon: data.telepon || "",
            alamat: data.alamat || "",
            posisiId: data.posisiId || "",
            isActive: data.isActive ?? true, // pakai nullish coalescing
          });

          if (data.image?.link) {
            setPreviewImage(data.image.link);
          } else {
            setPreviewImage(null);
          }
        }
      } catch (error) {
        console.error("Error loading pegawai:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengambil data pegawai"
        );
      }
    };
    console.log('Current posisiId:', formData.posisiId);
    console.log('Available positions:', stateStrukturPPID.posisiOrganisasi.findMany.data?.map(p => p.id));

    loadPegawai();
  }, [id]);

  const handleSubmit = async () => {
    try {
      if (!formData.namaLengkap.trim()) {
        toast.error('Nama lengkap tidak boleh kosong');
        return;
      }

      stateOrganisasi.edit.form = {
        namaLengkap: formData.namaLengkap.trim(),
        gelarAkademik: formData.gelarAkademik.trim(),
        imageId: formData.imageId || "",
        tanggalMasuk: formData.tanggalMasuk.trim(),
        email: formData.email.trim(),
        telepon: formData.telepon.trim(),
        alamat: formData.alamat.trim(),
        posisiId: formData.posisiId.trim(),
        isActive: formData.isActive,
      };

      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        // Update imageId in global state
        stateOrganisasi.edit.form.imageId = uploaded.id;
      }

      if (id && !stateOrganisasi.edit.id) {
        stateOrganisasi.edit.id = id;
      }

      const success = await stateOrganisasi.edit.submit();

      if (success) {
        router.push("/admin/ppid/struktur-ppid/pegawai");
      }
    } catch (error) {
      console.error("Error updating pegawai:", error);
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui data pegawai");
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
        <Title order={4} ml="sm" c="dark">
          Edit Data Pegawai PPID
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
            <TextInput
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap"
              defaultValue={formData.namaLengkap}
              onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
              required
            />
          </Box>
          <Box>
            <TextInput
              label="Gelar Akademik"
              placeholder="Contoh: S.Kom"
              defaultValue={formData.gelarAkademik}
              onChange={(e) => setFormData({ ...formData, gelarAkademik: e.target.value })}
            />
          </Box>
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Foto Profil
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
                    Maksimal 5MB, format gambar wajib
                  </Text>
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
                  loading='lazy'
                />
              </Box>
            )}
          </Box>
          <Box>
            <TextInput
              label="Tanggal Masuk"
              type="date"
              placeholder="Contoh: 2022-01-01"
              defaultValue={formatDateForInput(formData.tanggalMasuk)}
              onChange={(e) => setFormData({ ...formData, tanggalMasuk: e.target.value })}
            />
          </Box>
          <Box>
            <TextInput
              label="Email"
              type="email"
              placeholder="contoh@email.com"
              defaultValue={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </Box>
          <Box>
            <TextInput
              label="Telepon"
              placeholder="08123456789"
              defaultValue={formData.telepon}
              onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
            />
          </Box>
          <Box>
            <TextInput
              label="Alamat"
              placeholder="Jl. Contoh No. 123"
              defaultValue={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
            />
          </Box>
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Posisi
            </Text>
            <Select
              placeholder="Pilih posisi"
              data={stateStrukturPPID.posisiOrganisasi.findMany.data?.map(p => ({
                value: p.id,
                label: p.nama
              })) || []}
              value={formData.posisiId}
              onChange={(value) => value && setFormData({ ...formData, posisiId: value })}
              searchable
              clearable
            />
          </Box>
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Status Pegawai
            </Text>
            <Select
              data={[
                { value: 'true', label: 'Aktif' },
                { value: 'false', label: 'Tidak Aktif' },
              ]}
              value={String(formData.isActive)}
              onChange={(val) => {
                setFormData({ ...formData, isActive: val === 'true' });
              }}
              clearable
            />
          </Box>

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
