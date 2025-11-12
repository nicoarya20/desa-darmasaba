/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import korupsiState from '@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  Box,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Loader,
  ActionIcon,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconFile, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

export default function CreateDesaAntiKorupsi() {
  const router = useRouter();
  const stateKorupsi = useProxy(korupsiState.desaAntikorupsi);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    stateKorupsi.findMany.load();
    korupsiState.kategoriDesaAntiKorupsi.findMany.load();
  }, []);

  const resetForm = () => {
    stateKorupsi.create.form = {
      name: '',
      deskripsi: '',
      kategoriId: '',
      fileId: '',
    };
    setFile(null);
    setPreviewFile(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      return toast.warn('Pilih file dokumen terlebih dahulu');
    }
    if (!stateKorupsi.create.form.name) {
      return toast.warn('Masukkan judul dokumen');
    }
    if (!stateKorupsi.create.form.kategoriId) {
      return toast.warn('Pilih kategori dokumen');
    }

    setIsSubmitting(true);
    try {
      const res = await ApiFetch.api.fileStorage.create.post({
        file,
        name: file.name,
      });

      const uploaded = res.data?.data;

      if (!uploaded?.id) {
        throw new Error('Gagal mengunggah dokumen');
      }

      stateKorupsi.create.form.fileId = uploaded.id;
      await stateKorupsi.create.create();

      toast.success('Data berhasil disimpan');
      resetForm();
      router.push('/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Dokumen Desa Anti Korupsi
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
              Dokumen
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewFile(URL.createObjectURL(selectedFile));
                }
              }}
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
                <iframe
                  src={previewFile}
                  width="100%"
                  height="500px"
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    maxWidth: '100%',
                  }}
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
            label="Judul Dokumen"
            placeholder="Masukkan judul dokumen"
            value={stateKorupsi.create.form.name || ''}
            onChange={(e) => (stateKorupsi.create.form.name = e.target.value)}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <CreateEditor
              value={stateKorupsi.create.form.deskripsi || ''}
              onChange={(val) => (stateKorupsi.create.form.deskripsi = val)}
            />
          </Box>

          <Select
            label="Kategori"
            placeholder="Pilih kategori"
            data={korupsiState.kategoriDesaAntiKorupsi.findMany.data?.map((item) => ({
              label: item.name,
              value: item.id,
            })) || []}
            value={stateKorupsi.create.form.kategoriId || null}
            onChange={(val: string | null) => {
              if (val) {
                const selected = korupsiState.kategoriDesaAntiKorupsi.findMany.data?.find(
                  (item) => item.id === val
                );
                if (selected) {
                  stateKorupsi.create.form.kategoriId = selected.id;
                }
              } else {
                stateKorupsi.create.form.kategoriId = '';
              }
            }}
            searchable
            clearable
            nothingFoundMessage="Tidak ditemukan"
            required
          />

          <Group justify="right">
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
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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
