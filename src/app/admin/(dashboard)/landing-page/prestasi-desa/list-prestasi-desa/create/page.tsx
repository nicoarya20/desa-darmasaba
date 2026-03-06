/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import prestasiState from '@/app/admin/(dashboard)/_state/landing-page/prestasi-desa';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { ActionIcon, Box, Button, Group, Image, Paper, Select, Stack, Text, TextInput, Title, Loader } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function CreatePrestasiDesa() {
  const router = useRouter();
  const snapPrestasi = useProxy(prestasiState.prestasiDesa); // snapshot → buat render
  const prestasi = prestasiState.prestasiDesa
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      file !== null &&
      snapPrestasi.create.form.name?.trim() !== '' &&
      snapPrestasi.create.form.kategoriId?.trim() !== ''
    );
  };

  useEffect(() => {
    prestasi.findMany.load();
    prestasiState.kategoriPrestasi.findMany.load();
  }, []);

  const resetForm = () => {
    prestasi.create.form = {
      name: "",
      deskripsi: "",
      kategoriId: "",
      imageId: "",
    };
    setFile(null);
    setPreviewFile(null);
  };
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!file) {
        return toast.warn("Pilih file image terlebih dahulu");
      }

      const res = await ApiFetch.api.fileStorage.create.post({
        file,
        name: file.name,
      })

      const uploaded = res.data?.data;

      if (!uploaded?.id) {
        return toast.error("Gagal mengupload image");
      }

      prestasi.create.form.imageId = uploaded.id;

      await prestasi.create.create();

      resetForm();
      router.push("/admin/landing-page/prestasi-desa/list-prestasi-desa")
    } catch (error) {
      console.error(error);
      toast.error("Gagal menambahkan prestasi desa");
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
     <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Prestasi Desa
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
              Gambar Prestasi
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewFile(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() => toast.error('File tidak valid. Hanya file gambar yang diperbolehkan.')}
              maxSize={5 * 1024 ** 2} // 5MB
              accept={{
                'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
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
                    Seret file gambar ke sini atau klik untuk memilih
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7}>
                  Maksimal 5MB, format gambar .png, .jpg, .jpeg, webp
                  </Text>
                </div>
              </Group>
            </Dropzone>

            {previewFile && (
              <Box mt="md" pos={"relative"}>
                <Text size="sm" fw={500} mb={4}>
                  Pratinjau Gambar:
                </Text>
                <Box style={{ maxWidth: '100%', maxHeight: '300px', overflow: 'hidden', borderRadius: '8px' }}>
                  <Image
                    src={previewFile}
                    alt="Pratinjau gambar prestasi"
                    fit="cover"
                    style={{ width: '100%', height: 'auto' }}
                    loading='lazy'
                  />
                </Box>
                <ActionIcon
                  variant="filled"
                  color="red"
                  radius="xl"
                  size="sm"
                  pos="absolute"
                  top={5}
                  right={5}
                  onClick={() => {
                    setPreviewFile(null);
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
            label="Judul Prestasi"
            placeholder="Masukkan judul prestasi"
            value={snapPrestasi.create.form.name}
            onChange={(e) => (prestasi.create.form.name = e.target.value)}
            required
          />

          <Box>
            <Text fw={500} fz="sm" mb={6}>
              Deskripsi Prestasi
            </Text>
            <CreateEditor
              value={snapPrestasi.create.form.deskripsi}
              onChange={(val) => (prestasi.create.form.deskripsi = val)}
            />
          </Box>

          <Select
            label="Kategori"
            placeholder="Pilih kategori"
            data={prestasiState.kategoriPrestasi.findMany.data?.map((item) => ({
              label: item.name,
              value: item.id,
            })) || []}
            value={snapPrestasi.create.form.kategoriId || null}
            onChange={(val: string | null) => {
              if (val) {
                const selected = prestasiState.kategoriPrestasi.findMany.data?.find(
                  (item) => item.id === val
                );
                if (selected) {
                  prestasi.create.form.kategoriId = selected.id;
                }
              } else {
                prestasi.create.form.kategoriId = '';
              }
            }}
            searchable
            clearable
            nothingFoundMessage="Tidak ditemukan"
            required
          />

          {/* ======= Tombol Aksi ======= */}
          <Group justify="right">
            {/* Tombol Batal */}
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

export default CreatePrestasiDesa;
