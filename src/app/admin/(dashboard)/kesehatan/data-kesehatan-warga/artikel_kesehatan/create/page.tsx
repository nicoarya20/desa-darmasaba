'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import artikelKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  Box,
  Button,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreateArtikelKesehatan() {
  const stateArtikelKesehatan = useProxy(artikelKesehatanState);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const resetForm = () => {
    stateArtikelKesehatan.create.form = {
      title: '',
      content: '',
      imageId: '',
      introduction: {
        content: '',
      },
      symptom: {
        title: '',
        content: '',
      },
      prevention: {
        title: '',
        content: '',
      },
      firstAid: {
        title: '',
        content: '',
      },
      mythVsFact: {
        title: '',
        mitos: '',
        fakta: '',
      },
      doctorSign: {
        content: '',
      },
    };
    setPreviewImage(null);
    setFile(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!file) {
      return toast.warn('Silakan pilih file gambar terlebih dahulu');
    }

    const res = await ApiFetch.api.fileStorage.create.post({
      file,
      name: file.name,
    });

    const uploaded = res.data?.data;
    if (!uploaded?.id) {
      return toast.error('Gagal mengunggah gambar, silakan coba lagi');
    }

    stateArtikelKesehatan.create.form.imageId = uploaded.id;
    await stateArtikelKesehatan.create.submit();
    toast.success('Data berhasil disimpan');
    resetForm();
    router.push('/admin/kesehatan/data-kesehatan-warga/artikel_kesehatan');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md" component="form" onSubmit={handleSubmit}>
      {/* Header */}
      <Group mb="md">
        <Button
          variant="subtle"
          onClick={() => router.back()}
          p="xs"
          radius="md"
        >
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Artikel Kesehatan
        </Title>
      </Group>

      {/* Form */}
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
              Gambar Artikel Kesehatan
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
              accept={{ 'image/*': [] }}
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
              <Box mt="sm" style={{ textAlign: 'center' }}>
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
              </Box>
            )}
          </Box>

          <TextInput
            label={"Judul"}
            placeholder="Masukkan judul"
            defaultValue={stateArtikelKesehatan.create.form.title}
            onChange={(e) => {
              stateArtikelKesehatan.create.form.title = e.target.value;
            }}
            required
          />
          <TextInput
            label={"Deskripsi"}
            placeholder="Masukkan deskripsi"
            defaultValue={stateArtikelKesehatan.create.form.content}
            onChange={(e) => {
              stateArtikelKesehatan.create.form.content = e.target.value;
            }}
            required
          />
          <Box>
            <Text fz="sm" fw="bold">Pendahuluan</Text>
            <CreateEditor
              value={stateArtikelKesehatan.create.form.introduction.content}
              onChange={(e) => {
                stateArtikelKesehatan.create.form.introduction.content = e;
              }}
            />
          </Box>
          {/* Gejala */}
          <Box>
            <Text fz="md" fw="bold">Gejala</Text>
            <Stack gap="sm">
              <TextInput
                label={"Judul Gejala"}
                required
                placeholder="Masukkan judul gejala penyakit"
                defaultValue={stateArtikelKesehatan.create.form.symptom.title}
                onChange={(e) => {
                  stateArtikelKesehatan.create.form.symptom.title = e.target.value;
                }}
              />
              <Box>
                <Text fz="sm" fw="bold">Deskripsi Gejala</Text>
                <CreateEditor
                  value={stateArtikelKesehatan.create.form.symptom.content}
                  onChange={(e) => {
                    stateArtikelKesehatan.create.form.symptom.content = e;
                  }}
                />
              </Box>
            </Stack>
          </Box>

          {/* Pencegahan */}
          <Stack gap="xs">
            <Text fz="md" fw="bold">Pencegahan</Text>
            <TextInput
              label={"Judul Pencegahan"}
              required
              placeholder="Masukkan judul"
              defaultValue={stateArtikelKesehatan.create.form.prevention.title}
              onChange={(e) => {
                stateArtikelKesehatan.create.form.prevention.title = e.target.value;
              }}
            />
            <Text fz="sm">Deskripsi Pencegahan</Text>
            <CreateEditor
              value={stateArtikelKesehatan.create.form.prevention.content}
              onChange={(e) => {
                stateArtikelKesehatan.create.form.prevention.content = e;
              }}
            />
          </Stack>

          {/* Pertolongan Pertama */}
          <Stack gap={"xs"}>
            <Text fz="md" fw="bold">Pertolongan Pertama</Text>
            <TextInput
              label={"Judul Pertolongan Pertama"}
              required
              placeholder="Masukkan judul"
              defaultValue={stateArtikelKesehatan.create.form.firstAid.title}
              onChange={(e) => {
                stateArtikelKesehatan.create.form.firstAid.title = e.target.value;
              }}
            />
            <Text fz="sm">Deskripsi Pertolongan Pertama</Text>
            <CreateEditor
              value={stateArtikelKesehatan.create.form.firstAid.content}
              onChange={(e) => {
                stateArtikelKesehatan.create.form.firstAid.content = e;
              }}
            />
          </Stack>

          {/* Mitos vs Fakta */}
          <Box>
            <Text fz="md" fw="bold">Mitos dan Fakta</Text>
            <TextInput
              label={"Judul Mitos dan Fakta"}
              required
              placeholder="Masukkan judul"
              defaultValue={stateArtikelKesehatan.create.form.mythVsFact.title}
              onChange={(e) => {
                stateArtikelKesehatan.create.form.mythVsFact.title = e.target.value;
              }}
            />
            <Box mt="sm">
              <Text fz="sm" fw="bold">Mitos</Text>
              <CreateEditor
                value={stateArtikelKesehatan.create.form.mythVsFact.mitos}
                onChange={(e) => {
                  stateArtikelKesehatan.create.form.mythVsFact.mitos = e;
                }}
              />
            </Box>
            <Box mt="sm">
              <Text fz="sm" fw="bold">Fakta</Text>
              <CreateEditor
                value={stateArtikelKesehatan.create.form.mythVsFact.fakta}
                onChange={(e) => {
                  stateArtikelKesehatan.create.form.mythVsFact.fakta = e;
                }}
              />
            </Box>
          </Box>

          {/* Kapan Harus ke Dokter */}
          <Box>
            <Text fz="md" fw="bold">Kapan Harus ke Dokter</Text>
            <CreateEditor
              value={stateArtikelKesehatan.create.form.doctorSign.content}
              onChange={(e) => {
                stateArtikelKesehatan.create.form.doctorSign.content = e;
              }}
            />
          </Box>

          {/* Submit Button */}
          <Group justify="right">
            <Button
              type="submit"
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

export default CreateArtikelKesehatan;
