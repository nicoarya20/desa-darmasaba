/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import strukturorganisasiState from '@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi/struktur-organisasi';
import colors from '@/con/colors';
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

interface PreviewImage {
  file?: File;
  preview: string;
}

interface PegawaiFormData {
  namaLengkap: string;
  gelarAkademik: string;
  imageId: string | null;
  tanggalMasuk: string;
  email: string;
  telepon: string;
  alamat: string;
  posisiId: string;
  isActive: boolean;
}

export default function EditPegawai() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [previewImage, setPreviewImage] = useState<PreviewImage | string | null>(null);
  const stateOrganisasi = useProxy(strukturorganisasiState.pegawai);
  const [formData, setFormData] = useState<PegawaiFormData>({
    namaLengkap: "",
    gelarAkademik: "",
    imageId: "",
    tanggalMasuk: "",
    email: "",
    telepon: "",
    alamat: "",
    posisiId: "",
    isActive: true,
  });


  // Format date to YYYY-MM-DD for date input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    strukturorganisasiState.posisiOrganisasi.findMany.load();
    const loadPegawai = async () => {
      try {
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
        imageId: formData.imageId ? formData.imageId.trim() : "",
        tanggalMasuk: formData.tanggalMasuk.trim(),
        email: formData.email.trim(),
        telepon: formData.telepon.trim(),
        alamat: formData.alamat.trim(),
        posisiId: formData.posisiId.trim(),
        isActive: formData.isActive,
      };
    


      if (id && !stateOrganisasi.edit.id) {
        stateOrganisasi.edit.id = id;
      }

      const success = await stateOrganisasi.edit.submit();

      if (success) {
        router.push("/admin/ekonomi/struktur-organisasi-dan-sk-pengurus-bumdesa/pegawai");
      }
    } catch (error) {
      console.error("Error updating pegawai:", error);
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui data pegawai");
    }



  };

  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Edit Data Pegawai</Title>
          <TextInput
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            defaultValue={formData.namaLengkap}
            onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
          />
          <TextInput
            label="Gelar Akademik"
            placeholder="Contoh: S.Kom"
            defaultValue={formData.gelarAkademik}
            onChange={(e) => setFormData({ ...formData, gelarAkademik: e.target.value })}
          />
          <Box>
            <Text fz={"md"} fw={"bold"}>Gambar</Text>
            <Box >
              <Dropzone
                onDrop={(files) => {
                  const file = files[0]; // Hanya ambil file pertama
                  if (file) {
                    setPreviewImage({
                      file,
                      preview: URL.createObjectURL(file)
                    });
                  }
                }}
                maxSize={5 * 1024 ** 2} // 5MB
                accept={{
                  'image/*': ['.jpeg', '.jpg', '.png', '.webp']
                }}
              >
                <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                  <Dropzone.Accept>
                    <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <IconPhoto size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
                  </Dropzone.Idle>

                  <div>
                    <Text size="xl" inline>
                      Drag images here or click to select files
                    </Text>
                    <Text size="sm" c="dimmed" inline mt={7}>
                      Attach as many files as you like, each file should not exceed 5mb
                    </Text>
                  </div>
                </Group>
              </Dropzone>
              {previewImage && (
                <Image
                  src={typeof previewImage === 'string' ? previewImage : previewImage?.preview}
                  alt="Preview"
                  width={280}
                  height={180}
                  fit="cover"
                  radius="sm"
                  mt="md"
                  loading="lazy"
                />
              )}
            </Box>
          </Box>
          <TextInput
            label="Tanggal Masuk"
            type="date"
            placeholder="Contoh: 2022-01-01"
            defaultValue={formatDateForInput(formData.tanggalMasuk)}
            onChange={(e) => setFormData({ ...formData, tanggalMasuk: e.target.value })}
          />
          <TextInput
            label="Email"
            placeholder="Contoh: email@example.com"
            defaultValue={formData.email}
            onChange={(e) => (formData.email = e.currentTarget.value)}
          />
          <TextInput
            label="Telepon"
            placeholder="Contoh: 08123456789"
            defaultValue={formData.telepon}
            onChange={(e) => (formData.telepon = e.currentTarget.value)}
          />
          <TextInput
            label="Alamat"
            placeholder="Contoh: Jl. Contoh No. 1"
            defaultValue={formData.alamat}
            onChange={(e) => (formData.alamat = e.currentTarget.value)}
          />
          <Select
            label="Posisi"
            placeholder="Pilih posisi"
            data={
              strukturorganisasiState.posisiOrganisasi.findMany.data?.map((p) => ({
                value: p.id, // harus string
                label: p.nama,
              })) || []
            }
            value={formData.posisiId}
            onChange={(value) => {
              if (value !== null) {
                setFormData({ ...formData, posisiId: value }); // value harus string
              }
            }}
          />
          <Select
            label="Status Pegawai"
            data={[
              { value: 'true', label: 'Aktif' },
              { value: 'false', label: 'Tidak Aktif' },
            ]}
            value={String(formData.isActive)} // 'true' atau 'false'
            onChange={(val) => {
              setFormData({ ...formData, isActive: val === 'true' });
            }}
          />


          <Group>
            <Button
              onClick={handleSubmit}
              color="blue"
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box >
  );
}
