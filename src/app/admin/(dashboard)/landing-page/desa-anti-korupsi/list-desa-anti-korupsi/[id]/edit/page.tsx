/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Loader, ActionIcon, Box, Button, Group, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconFile, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import korupsiState from '@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';

interface FormDesaAntiKorupsi {
  name: string;
  deskripsi: string;
  kategoriId: string;
  fileId: string;
}

export default function EditDesaAntiKorupsi() {
  const desaAntiKorupsiState = useProxy(korupsiState.desaAntikorupsi);
  const params = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState<FormDesaAntiKorupsi>({
    name: '',
    deskripsi: '',
    kategoriId: '',
    fileId: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.name?.trim() !== '' &&
      formData.kategoriId?.trim() !== '' &&
      (formData.fileId?.trim() !== '' || file !== null)
    );
  };

  const [originalData, setOriginalData] = useState({
    name: "",
    deskripsi: "",
    kategoriId: "",
    fileId: "",
    fileUrl: ""
  });

  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Load kategori
  useShallowEffect(() => {
    korupsiState.kategoriDesaAntiKorupsi.findMany.load();
  }, []);

  // Load data existing
  useEffect(() => {
    const loadDesaAntiKorupsi = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await desaAntiKorupsiState.edit.load(id);
        if (!data) return;

        desaAntiKorupsiState.edit.id = id;
        desaAntiKorupsiState.edit.form = { ...data };

        setFormData({
          name: data.name,
          deskripsi: data.deskripsi,
          kategoriId: data.kategoriId,
          fileId: data.fileId,
        });

        setOriginalData({
          name: data.name,
          deskripsi: data.deskripsi,
          kategoriId: data.kategoriId,
          fileId: data.fileId,
          fileUrl: data.file?.link || "",
        });

        if (data.file?.link) setPreviewFile(data.file.link);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat data Desa Anti Korupsi');
      }
    };

    loadDesaAntiKorupsi();
  }, [params?.id]);

  // Generic handler input
  const handleInputChange = (key: keyof FormDesaAntiKorupsi) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string | null) => {
    const value = typeof e === 'string' ? e : e?.target?.value ?? '';
    setFormData((prev) => ({ ...prev, [key]: value || '' }));
  };

  // Special handler for Select component
  const handleSelectChange = (key: keyof FormDesaAntiKorupsi) => (value: string | null) => {
    setFormData((prev) => ({ ...prev, [key]: value || '' }));
  };

  const handleDrop = (files: File[]) => {
    if (!files.length) return;
    const selectedFile = files[0];
    setFile(selectedFile);
    setPreviewFile(URL.createObjectURL(selectedFile));
  };

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      deskripsi: originalData.deskripsi,
      kategoriId: originalData.kategoriId,
      fileId: originalData.fileId,
    });
    setPreviewFile(originalData.fileUrl || null);
    setFile(null);
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    if (!formData.name) return toast.warn('Masukkan judul dokumen');
    if (!formData.kategoriId) return toast.warn('Pilih kategori dokumen');

    try {
      setIsSubmitting(true);
      // Update global state
      desaAntiKorupsiState.edit.form = { ...desaAntiKorupsiState.edit.form, ...formData };

      // Upload file jika ada
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;
        if (!uploaded?.id) throw new Error('Gagal mengunggah dokumen');

        desaAntiKorupsiState.edit.form.fileId = uploaded.id;
      }

      await desaAntiKorupsiState.edit.update();
      toast.success('Data berhasil diperbarui');
      router.push('/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi');
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat memperbarui data');
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
        <Title order={4} ml="sm" c="dark">
          Edit Desa Anti Korupsi
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
            label="Judul Dokumen"
            placeholder="Masukkan judul dokumen"
            value={formData.name}
            onChange={handleInputChange('name')}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <EditEditor value={formData.deskripsi} onChange={handleInputChange('deskripsi')} />
          </Box>

          <Select
            label="Kategori"
            placeholder="Pilih kategori"
            value={formData.kategoriId}
            onChange={handleSelectChange('kategoriId')}
            data={korupsiState.kategoriDesaAntiKorupsi.findMany.data?.map((v) => ({
              value: v.id,
              label: v.name,
            })) || []}
            required
            searchable
            clearable
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Dokumen
            </Text>
            <Dropzone
              onDrop={handleDrop}
              onReject={() => toast.error('File tidak valid, gunakan format dokumen')}
              maxSize={5 * 1024 ** 2}
              accept={{
                'application/*': ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
              }}
              radius="md"
            >
              <Group justify="center" gap="xl" mih={180} style={{ pointerEvents: 'none' }}>
                <Dropzone.Accept>
                  <IconUpload size={48} color="var(--mantine-color-blue-6)" stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={48} color="var(--mantine-color-red-6)" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconFile size={48} color="var(--mantine-color-dimmed)" stroke={1.5} />
                </Dropzone.Idle>
                <div>
                  <Text size="lg" inline>
                    Seret dokumen ke sini atau klik untuk memilih file
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7}>
                    Maksimal 5MB (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX)
                  </Text>
                </div>
              </Group>
            </Dropzone>

            {previewFile && (
              <Box mt="sm" pos="relative" style={{ textAlign: 'center' }}>
                <Text fw="bold" fz="sm" mb={6}>
                  Pratinjau Dokumen
                </Text>
                <Box
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    height: '500px',
                    width: '100%',
                  }}
                >
                  <iframe src={previewFile} width="100%" height="100%" style={{ border: 'none' }} />
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

          <Group justify="right">
            {/* Tombol Batal */}
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
