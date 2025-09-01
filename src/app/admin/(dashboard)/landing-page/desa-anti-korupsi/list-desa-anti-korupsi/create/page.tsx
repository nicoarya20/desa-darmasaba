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
  Tooltip,
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
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
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
      setIsLoading(false);
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
              <Box mt="md" style={{ textAlign: 'center' }}>
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
            value={stateKorupsi.create.form.kategoriId || ''}
            onChange={(val) => (stateKorupsi.create.form.kategoriId = val || '')}
            data={
              korupsiState.kategoriDesaAntiKorupsi.findMany.data?.map((v) => ({
                value: v.id,
                label: v.name,
              })) || []
            }
            required
            searchable
            clearable
          />

          <Group justify="right" mt="xl">
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              loading={isLoading}
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
