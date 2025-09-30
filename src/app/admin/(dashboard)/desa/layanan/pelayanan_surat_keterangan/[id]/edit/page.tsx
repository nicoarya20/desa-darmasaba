'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
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
  Title,
  Tooltip,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditSuratKeterangan() {
  const router = useRouter();
  const params = useParams();
  const stateSurat = useProxy(stateLayananDesa.suratKeterangan);

  // state lokal untuk form
  const [formData, setFormData] = useState({
    name: '',
    deskripsi: '',
    imageId: '',
    image2Id: '',
  });

  // state file upload
  const [file, setFile] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);

  // state preview gambar
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImage2, setPreviewImage2] = useState<string | null>(null);

  // load data awal
  useEffect(() => {
    const loadSurat = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateSurat.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
            imageId: data.imageId || '',
            image2Id: data.image2Id || '',
          });

          setPreviewImage(data.image?.link || null);
          setPreviewImage2(data.image2?.link || null);
        }
      } catch (error) {
        console.error('Error loading surat:', error);
        toast.error('Gagal memuat data surat');
      }
    };

    loadSurat();
  }, [params?.id, stateSurat.edit]);

  // handler untuk submit
  const handleSubmit = useCallback(async () => {
    try {
      // update form global hanya saat submit
      stateSurat.edit.form = { ...stateSurat.edit.form, ...formData };

      // upload file 1
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;
        if (!uploaded?.id) return toast.error('Gagal upload gambar');
        stateSurat.edit.form.imageId = uploaded.id;
      }

      // upload file 2
      if (file2) {
        const res = await ApiFetch.api.fileStorage.create.post({ file: file2, name: file2.name });
        const uploaded = res.data?.data;
        if (!uploaded?.id) return toast.error('Gagal upload gambar');
        stateSurat.edit.form.image2Id = uploaded.id;
      }

      await stateSurat.edit.update();
      toast.success('Surat berhasil diperbarui!');
      router.push('/admin/desa/layanan/pelayanan_surat_keterangan');
    } catch (error) {
      console.error('Error updating surat:', error);
      toast.error('Terjadi kesalahan saat memperbarui surat');
    }
  }, [formData, file, file2, router, stateSurat.edit]);

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Back Button */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Surat Keterangan
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
          {/* Input nama */}
          <TextInput
            label="Nama Surat Keterangan"
            placeholder="Masukkan nama surat keterangan"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />

          {/* Input deskripsi */}
          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Konten
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) =>
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }))
              }
            />
          </Box>

          {/* Upload Gambar 1 */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Konten Pelayanan
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
                  alt="Preview Gambar 1"
                  radius="md"
                  style={{
                    maxHeight: 220,
                    objectFit: 'contain',
                    border: `1px solid ${colors['blue-button']}`,
                  }}
                  loading="lazy"
                />
              </Box>
            )}
          </Box>

          {/* Upload Gambar 2 */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Alur Pelayanan Surat
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile2(selectedFile);
                  setPreviewImage2(URL.createObjectURL(selectedFile));
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

            {previewImage2 && (
              <Box mt="sm" style={{ display: 'flex', justifyContent: 'center' }}>
                <Image
                  src={previewImage2}
                  alt="Preview Gambar 2"
                  radius="md"
                  style={{
                    maxHeight: 220,
                    objectFit: 'contain',
                    border: `1px solid ${colors['blue-button']}`,
                  }}
                  loading="lazy"
                />
              </Box>
            )}
          </Box>

          <Group justify="right">
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
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditSuratKeterangan;
