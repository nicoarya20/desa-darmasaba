'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import artikelKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
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
  const stateArtikelKesehatan = useProxy(artikelKesehatanState, { sync: true }); // sync: cegah caret jump di controlled input
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      stateArtikelKesehatan.create.form.title?.trim() !== '' &&
      !isHtmlEmpty(stateArtikelKesehatan.create.form.content) &&
      !isHtmlEmpty(stateArtikelKesehatan.create.form.introduction.content) &&
      stateArtikelKesehatan.create.form.symptom.title?.trim() !== '' &&
      !isHtmlEmpty(stateArtikelKesehatan.create.form.symptom.content) &&
      stateArtikelKesehatan.create.form.prevention.title?.trim() !== '' &&
      !isHtmlEmpty(stateArtikelKesehatan.create.form.prevention.content) &&
      stateArtikelKesehatan.create.form.firstAid.title?.trim() !== '' &&
      !isHtmlEmpty(stateArtikelKesehatan.create.form.firstAid.content) &&
      stateArtikelKesehatan.create.form.mythVsFact.title?.trim() !== '' &&
      !isHtmlEmpty(stateArtikelKesehatan.create.form.mythVsFact.mitos) &&
      !isHtmlEmpty(stateArtikelKesehatan.create.form.mythVsFact.fakta) &&
      !isHtmlEmpty(stateArtikelKesehatan.create.form.doctorSign.content) &&
      file !== null
    );
  };

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

    if (!stateArtikelKesehatan.create.form.title?.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }

    if (isHtmlEmpty(stateArtikelKesehatan.create.form.content)) {
      toast.error('Deskripsi wajib diisi');
      return;
    }

    if (isHtmlEmpty(stateArtikelKesehatan.create.form.introduction.content)) {
      toast.error('Pendahuluan wajib diisi');
      return;
    }

    if (!stateArtikelKesehatan.create.form.symptom.title?.trim()) {
      toast.error('Judul gejala wajib diisi');
      return;
    }

    if (isHtmlEmpty(stateArtikelKesehatan.create.form.symptom.content)) {
      toast.error('Deskripsi gejala wajib diisi');
      return;
    }

    if (!stateArtikelKesehatan.create.form.prevention.title?.trim()) {
      toast.error('Judul pencegahan wajib diisi');
      return;
    }

    if (isHtmlEmpty(stateArtikelKesehatan.create.form.prevention.content)) {
      toast.error('Deskripsi pencegahan wajib diisi');
      return;
    }

    if (!stateArtikelKesehatan.create.form.firstAid.title?.trim()) {
      toast.error('Judul pertolongan pertama wajib diisi');
      return;
    }

    if (isHtmlEmpty(stateArtikelKesehatan.create.form.firstAid.content)) {
      toast.error('Deskripsi pertolongan pertama wajib diisi');
      return;
    }

    if (!stateArtikelKesehatan.create.form.mythVsFact.title?.trim()) {
      toast.error('Judul mitos vs fakta wajib diisi');
      return;
    }

    if (isHtmlEmpty(stateArtikelKesehatan.create.form.mythVsFact.mitos)) {
      toast.error('Deskripsi mitos wajib diisi');
      return;
    }

    if (isHtmlEmpty(stateArtikelKesehatan.create.form.mythVsFact.fakta)) {
      toast.error('Deskripsi fakta wajib diisi');
      return;
    }

    if (isHtmlEmpty(stateArtikelKesehatan.create.form.doctorSign.content)) {
      toast.error('Deskripsi kapan harus ke dokter wajib diisi');
      return;
    }

    if (!file) {
      toast.error('Gambar wajib dipilih');
      return;
    }

    try {
      setIsSubmitting(true);

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
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Gagal menyimpan data, silakan coba lagi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs" component="form" onSubmit={handleSubmit}>
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
              <Text ta="center" mt="sm" size="sm" c="dimmed">
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

          <TextInput
            label={"Judul"}
            placeholder="Masukkan judul"
            value={stateArtikelKesehatan.create.form.title}
            onChange={(e) => {
              stateArtikelKesehatan.create.form.title = e.target.value;
            }}
            required
          />
          <Box>
            <Text fz="sm" fw="bold">Deskripsi</Text>
            <CreateEditor
              value={stateArtikelKesehatan.create.form.content}
              onChange={(e) => {
                stateArtikelKesehatan.create.form.content = e;
              }}
            />
          </Box>
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
                value={stateArtikelKesehatan.create.form.symptom.title}
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
              value={stateArtikelKesehatan.create.form.prevention.title}
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
              value={stateArtikelKesehatan.create.form.firstAid.title}
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
              value={stateArtikelKesehatan.create.form.mythVsFact.title}
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

export default CreateArtikelKesehatan;
