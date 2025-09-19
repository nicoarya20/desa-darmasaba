/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import gotongRoyongState from '@/app/admin/(dashboard)/_state/lingkungan/gotong-royong';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


interface FormKegiatanDesa {
  judul: string;
  deskripsiSingkat: string;
  deskripsiLengkap: string;
  tanggal: string;
  lokasi: string;
  partisipan: number;
  imageId: string;
  kategoriKegiatanId: string;
}

function EditGotongRoyong() {
  const kegiatanDesaState = useProxy(gotongRoyongState.kegiatanDesa)
  const params = useParams()
  const router = useRouter()
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<FormKegiatanDesa>({
    judul: '',
    deskripsiSingkat: '',
    deskripsiLengkap: '',
    tanggal: '',
    lokasi: '',
    partisipan: 0,
    imageId: '',
    kategoriKegiatanId: '',
  })

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const loadKegiatanDesa = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await kegiatanDesaState.edit.load(id);
        if (data) {
          setFormData({
            judul: data.judul || '',
            deskripsiSingkat: data.deskripsiSingkat || '',
            deskripsiLengkap: data.deskripsiLengkap || '',
            tanggal: data.tanggal || '',
            lokasi: data.lokasi || '',
            partisipan: data.partisipan || 0,
            imageId: data.imageId || '',
            kategoriKegiatanId: data.kategoriKegiatanId || '',
          });
        }
      } catch (error) {
        console.error("Error loading kegiatan desa:", error);
        toast.error("Gagal memuat data kegiatan desa");
      }
    }
    gotongRoyongState.kategoriKegiatan.findMany.load()
    loadKegiatanDesa();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      kegiatanDesaState.edit.form = {
        ...kegiatanDesaState.edit.form,
        judul: formData.judul.trim(),
        deskripsiSingkat: formData.deskripsiSingkat.trim(),
        deskripsiLengkap: formData.deskripsiLengkap.trim(),
        tanggal: new Date(formData.tanggal.trim()),
        lokasi: formData.lokasi.trim(),
        partisipan: formData.partisipan,
        imageId: formData.imageId,
        kategoriKegiatanId: formData.kategoriKegiatanId,
      }
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;
        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        // Update imageId in global state
        kegiatanDesaState.edit.form.imageId = uploaded.id;
      }
      await kegiatanDesaState.edit.update()
      router.push("/admin/lingkungan/gotong-royong/kegiatan-desa");
    } catch (error) {
      console.error("Error updating kegiatan desa:", error);
      toast.error("Terjadi kesalahan saat memperbarui kegiatan desa");
    }
  }

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper bg={colors['white-1']} p="md" w={{ base: '100%', md: '50%' }}>
        <Stack gap="xs">
          <Title order={3}>Edit Kegiatan Desa</Title>
          <TextInput
            value={formData.judul}
            label={<Text fz="sm" fw="bold">Judul Kegiatan Desa</Text>}
            placeholder="masukkan judul kegiatan desa"
            onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
          />
          <TextInput
            value={formData.deskripsiSingkat}
            label={<Text fz="sm" fw="bold">Deskripsi Singkat Kegiatan Desa</Text>}
            placeholder="masukkan deskripsi singkat kegiatan desa"
            onChange={(e) => setFormData({ ...formData, deskripsiSingkat: e.target.value })}
          />
          <Select
            label="Kategori Kegiatan"
            data={gotongRoyongState.kategoriKegiatan.findMany.data?.map(k => ({
              value: k.id,
              label: k.nama
            })) ?? []}
            value={formData.kategoriKegiatanId}
            onChange={(val) => setFormData({ ...formData, kategoriKegiatanId: val ?? '' })}
          />

          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Lengkap Kegiatan Desa</Text>
            <EditEditor
              value={formData.deskripsiLengkap}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, deskripsiLengkap: htmlContent }));
                kegiatanDesaState.edit.form.deskripsiLengkap = htmlContent;
              }}
            />
          </Box>
          <TextInput
            label={<Text fz="sm" fw="bold">Tanggal Kegiatan Desa</Text>}
            placeholder="masukkan tanggal kegiatan desa"
            type="date"
            value={formatDateForInput(formData.tanggal)}
            onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
          />
          <TextInput
            value={formData.lokasi}
            label={<Text fz="sm" fw="bold">Lokasi Kegiatan Desa</Text>}
            placeholder="masukkan lokasi kegiatan desa"
            onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
          />
          <TextInput
            value={formData.partisipan}
            label={<Text fz="sm" fw="bold">Partisipan Kegiatan Desa</Text>}
            placeholder="masukkan partisipan kegiatan desa"
            onChange={(e) => {
              const val = Number(e.target.value);
              if (!isNaN(val)) {
                setFormData({ ...formData, partisipan: val });
              }
            }}
          />
          <Box>
            <Text fz={"md"} fw={"bold"}>Gambar</Text>
            <Box>
              <Dropzone
                onDrop={(files) => {
                  const selectedFile = files[0]; // Ambil file pertama
                  if (selectedFile) {
                    setFile(selectedFile);
                    setPreviewImage(URL.createObjectURL(selectedFile)); // Buat preview
                  }
                }}
                onReject={() => toast.error('File tidak valid.')}
                maxSize={5 * 1024 ** 2} // Maks 5MB
                accept={{ 'image/*': [] }}
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
                      Drag gambar ke sini atau klik untuk pilih file
                    </Text>
                    <Text size="sm" c="dimmed" inline mt={7}>
                      Maksimal 5MB dan harus format gambar
                    </Text>
                  </div>
                </Group>
              </Dropzone>

              {/* Tampilkan preview kalau ada */}
              {previewImage && (
                <Box mt="sm">
                  <Image
                    src={previewImage}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                    }}
                    loading="lazy"
                  />
                </Box>
              )}

            </Box>
          </Box>
          <Button bg={colors['blue-button']} onClick={handleSubmit} >
            Simpan
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditGotongRoyong;
