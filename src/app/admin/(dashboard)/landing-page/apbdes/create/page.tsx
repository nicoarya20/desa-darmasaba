/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';
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
  Loader,
  ActionIcon,
  NumberInput,
  Select,
  Table,
  Badge,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconFile, IconPhoto, IconUpload, IconX, IconPlus, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import apbdes from '../../../_state/landing-page/apbdes';

// Tipe item untuk form
type ItemForm = {
  kode: string;
  uraian: string;
  anggaran: number;
  realisasi: number;
  level: number;
  tipe: 'pendapatan' | 'belanja' | 'pembiayaan';
};

function CreateAPBDes() {
  const router = useRouter();
  const stateAPBDes = useProxy(apbdes);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form sementara untuk input item baru
  const [newItem, setNewItem] = useState<ItemForm>({
    kode: '',
    uraian: '',
    anggaran: 0,
    realisasi: 0,
    level: 1,
    tipe: 'pendapatan',
  });

  useEffect(() => {
    stateAPBDes.findMany.load();
  }, []);

  const resetForm = () => {
    stateAPBDes.create.reset();
    setImageFile(null);
    setDocFile(null);
    setPreviewImage(null);
    setPreviewDoc(null);
    setNewItem({
      kode: '',
      uraian: '',
      anggaran: 0,
      realisasi: 0,
      level: 1,
      tipe: 'pendapatan',
    });
  };

  const handleSubmit = async () => {
    if (!imageFile || !docFile) {
      return toast.warn("Pilih gambar dan dokumen terlebih dahulu");
    }
    if (stateAPBDes.create.form.items.length === 0) {
      return toast.warn("Minimal tambahkan 1 item APBDes");
    }

    try {
      setIsSubmitting(true);
      const [uploadImageRes, uploadDocRes] = await Promise.all([
        ApiFetch.api.fileStorage.create.post({ file: imageFile, name: imageFile.name }),
        ApiFetch.api.fileStorage.create.post({ file: docFile, name: docFile.name }),
      ]);

      const imageId = uploadImageRes?.data?.data?.id;
      const fileId = uploadDocRes?.data?.data?.id;

      if (!imageId || !fileId) {
        return toast.error("Gagal mengupload file");
      }

      // Update form dengan ID file
      stateAPBDes.create.form.imageId = imageId;
      stateAPBDes.create.form.fileId = fileId;

      await stateAPBDes.create.create();

      toast.success("Berhasil menambahkan APBDes");
      resetForm();
      router.push("/admin/landing-page/apbdes");
    } catch (error) {
      console.error("Gagal submit:", error);
      toast.error("Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tambahkan item ke state
  const handleAddItem = () => {
    const { kode, uraian, anggaran, realisasi, level, tipe } = newItem;
    if (!kode || !uraian) {
      return toast.warn("Kode dan uraian wajib diisi");
    }

    const finalTipe = level === 1 ? null : tipe;
    const selisih = realisasi - anggaran;
    const persentase = anggaran > 0 ? (realisasi / anggaran) * 100 : 0;

    stateAPBDes.create.addItem({
      kode,
      uraian,
      anggaran,
      realisasi,
      selisih,
      persentase,
      level,
      tipe: finalTipe,
    });

    // Reset form input
    setNewItem({
      kode: '',
      uraian: '',
      anggaran: 0,
      realisasi: 0,
      level: 1,
      tipe: 'pendapatan',
    });
  };

  // Hapus item
  const handleRemoveItem = (index: number) => {
    stateAPBDes.create.removeItem(index);
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah APBDes
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
          {/* Gambar & Dokumen (dipendekkan untuk fokus pada items) */}
          <Stack gap={"xs"}>
            {/* Gambar APBDes */}
            <Box>
              <Text fw="bold" fz="sm" mb={6}>
                Gambar APBDes
              </Text>
              <Dropzone
                onDrop={(files) => {
                  const selectedFile = files[0];
                  if (selectedFile) {
                    setImageFile(selectedFile);
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
                    <IconPhoto size={48} color="#868e96" stroke={1.5} />
                  </Dropzone.Idle>
                  <Stack gap="xs" align="center">
                    <Text size="md" fw={500}>
                      Seret gambar atau klik untuk memilih
                    </Text>
                  </Stack>
                </Group>
              </Dropzone>
              {previewImage && (
                <Box mt="sm" pos="relative" style={{ textAlign: 'center' }}>
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

                  {/* Tombol hapus (pojok kanan atas) */}
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
                      setImageFile(null);
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

            {/* Dokumen APBDes */}
            <Box>
              <Text fw="bold" fz="sm" mb={6}>
                Dokumen APBDes
              </Text>
              <Dropzone
                onDrop={(files) => {
                  const selectedFile = files[0];
                  if (selectedFile) {
                    setDocFile(selectedFile);
                    setPreviewDoc(URL.createObjectURL(selectedFile));
                  }
                }}
                onReject={() => toast.error('File tidak valid')}
                maxSize={5 * 1024 ** 2}
                accept={{
                  'application/pdf': ['.pdf'],
                  'application/msword': ['.doc'],
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                }}
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
                    <IconFile size={48} color="#868e96" stroke={1.5} />
                  </Dropzone.Idle>
                  <Stack gap="xs" align="center">
                    <Text size="md" fw={500}>
                      Seret dokumen atau klik untuk memilih
                    </Text>
                  </Stack>
                </Group>
              </Dropzone>
              {previewDoc && (
                <Box mt="md" pos="relative" style={{ textAlign: 'center' }}>
                  <Text fw="bold" fz="sm" mb={6}>
                    Pratinjau Dokumen
                  </Text>
                  <iframe
                    src={previewDoc}
                    width="100%"
                    height="500px"
                    style={{ border: '1px solid #ddd', borderRadius: '8px' }}
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
                      setPreviewDoc(null);
                      setDocFile(null);
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
          </Stack>

          {/* Form Header */}
          <NumberInput
            label="Tahun"
            value={stateAPBDes.create.form.tahun || new Date().getFullYear()}
            onChange={(val) => (stateAPBDes.create.form.tahun = Number(val) || new Date().getFullYear())}
            min={2000}
            max={2100}
            required
          />

          {/* Input Item Baru */}
          <Paper withBorder p="md" radius="md">
            <Title order={6} mb="sm">Tambah Item Pendapatan/Belanja</Title>
            <Stack gap="xs">
              <Group grow>
                <TextInput
                  label="Kode"
                  placeholder="Contoh: 4.1.2"
                  value={newItem.kode}
                  onChange={(e) => setNewItem({ ...newItem, kode: e.target.value })}
                  required
                />
                <Select
                  label="Level"
                  data={[
                    { value: '1', label: 'Level 1 (Kelompok)' },
                    { value: '2', label: 'Level 2 (Sub-kelompok)' },
                    { value: '3', label: 'Level 3 (Detail)' },
                  ]}
                  value={String(newItem.level)}
                  onChange={(val) => setNewItem({ ...newItem, level: Number(val) || 1 })}
                />
                <Select
                  label="Tipe"
                  data={[
                    { value: 'pendapatan', label: 'Pendapatan' },
                    { value: 'belanja', label: 'Belanja' },
                    { value: 'pembiayaan', label: 'Pembiayaan' },
                  ]}
                  value={newItem.level === 1 ? null : newItem.tipe}
                  onChange={(val) => setNewItem({ ...newItem, tipe: val as any })}
                  disabled={newItem.level === 1}
                />
              </Group>
              <TextInput
                label="Uraian"
                placeholder="Contoh: Dana Desa"
                value={newItem.uraian}
                onChange={(e) => setNewItem({ ...newItem, uraian: e.target.value })}
                required
              />
              <Group grow>
                <NumberInput
                  label="Anggaran (Rp)"
                  value={newItem.anggaran}
                  onChange={(val) => setNewItem({ ...newItem, anggaran: Number(val) || 0 })}
                  thousandSeparator
                  min={0}
                />
                <NumberInput
                  label="Realisasi (Rp)"
                  value={newItem.realisasi}
                  onChange={(val) => setNewItem({ ...newItem, realisasi: Number(val) || 0 })}
                  thousandSeparator
                  min={0}
                />
              </Group>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={handleAddItem}
                disabled={!newItem.kode || !newItem.uraian}
              >
                Tambah Item
              </Button>
            </Stack>
          </Paper>

          {/* Tabel Items */}
          {stateAPBDes.create.form.items.length > 0 && (
            <Paper withBorder p="md" radius="md">
              <Title order={6} mb="sm">Daftar Item ({stateAPBDes.create.form.items.length})</Title>
              <Table striped highlightOnHover>
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Uraian</th>
                    <th>Anggaran</th>
                    <th>Realisasi</th>
                    <th>Level</th>
                    <th>Tipe</th>
                    <th style={{ width: 50 }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {stateAPBDes.create.form.items.map((item, idx) => (
                    <tr key={idx}>
                      <td><Text size="sm" fw={500}>{item.kode}</Text></td>
                      <td>{item.uraian}</td>
                      <td>{item.anggaran.toLocaleString('id-ID')}</td>
                      <td>{item.realisasi.toLocaleString('id-ID')}</td>
                      <td>
                        <Badge size="sm" color={item.level === 1 ? 'blue' : item.level === 2 ? 'green' : 'grape'}>
                          L{item.level}
                        </Badge>
                      </td>
                      <td>
                        <Badge size="sm" color={item.tipe === 'pendapatan' ? 'teal' : 'red'}>
                          {item.tipe}
                        </Badge>
                      </td>
                      <td>
                        <ActionIcon color="red" onClick={() => handleRemoveItem(idx)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Paper>
          )}

          {/* Tombol Aksi */}
          <Group justify="right">
            <Button variant="outline" color="gray" radius="md" onClick={resetForm}>
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              radius="md"
              disabled={stateAPBDes.create.form.items.length === 0}
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
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

export default CreateAPBDes;