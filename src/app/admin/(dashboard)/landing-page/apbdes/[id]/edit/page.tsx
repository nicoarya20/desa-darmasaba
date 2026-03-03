/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import apbdes from '@/app/admin/(dashboard)/_state/landing-page/apbdes';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Image,
  Loader,
  NumberInput,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import {
  IconArrowBack,
  IconFile,
  IconPhoto,
  IconPlus,
  IconTrash,
  IconX
} from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

// Tipe untuk form item
type ItemForm = {
  kode: string;
  uraian: string;
  anggaran: number;
  realisasi: number;
  level: number;
  tipe: 'pendapatan' | 'belanja' | 'pembiayaan';
};

function EditAPBDes() {
  const apbdesState = useProxy(apbdes);
  const router = useRouter();
  const params = useParams();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      apbdesState.edit.form.items.length > 0
    );
  };

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);

  // Form input untuk item baru
  const [newItem, setNewItem] = useState<ItemForm>({
    kode: '',
    uraian: '',
    anggaran: 0,
    realisasi: 0,
    level: 1,
    tipe: 'pendapatan',
  });

  // Simpan data original untuk reset form
  const [originalData, setOriginalData] = useState({
    tahun: 0,
    name: '',
    deskripsi: '',
    jumlah: '',
    imageId: '',
    fileId: '',
    imageUrl: '',
    fileUrl: '',
  });

  // Load data saat pertama kali
  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;

    const loadData = async () => {
      try {
        const data = await apbdesState.edit.load(id);

        if (!data) return;

        // Set preview dari data lama
        setPreviewImage(data.image?.link || null);
        setPreviewDoc(data.file?.link || null);

        // Simpan data original untuk reset
        setOriginalData({
          tahun: data.tahun || new Date().getFullYear(),
          name: data.name || '',
          deskripsi: data.deskripsi || '',
          jumlah: data.jumlah || '',
          imageId: data.imageId || '',
          fileId: data.fileId || '',
          imageUrl: data.image?.link || '',
          fileUrl: data.file?.link || '',
        });

        // Set form dengan data lama (termasuk imageId dan fileId)
        apbdesState.edit.form = {
          tahun: data.tahun || new Date().getFullYear(),
          name: data.name || '',
          deskripsi: data.deskripsi || '',
          jumlah: data.jumlah || '',
          imageId: data.imageId || '',
          fileId: data.fileId || '',
          items: (data.items || []).map((item: any) => ({
            kode: item.kode,
            uraian: item.uraian,
            anggaran: item.anggaran,
            realisasi: item.realisasi,
            selisih: item.selisih,
            persentase: item.persentase,
            level: item.level,
            tipe: item.tipe || 'pendapatan',
          })),
        };
      } catch (error) {
        console.error('Error loading APBDes:', error);
        toast.error('Gagal memuat data APBDes');
      }
    };

    loadData();
  }, [params?.id]);

  const handleDrop = (fileType: 'image' | 'doc') => (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (fileType === 'image') {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setDocFile(file);
      setPreviewDoc(URL.createObjectURL(file));
    }
  };

  const handleAddItem = () => {
    const { kode, uraian, anggaran, realisasi, level, tipe } = newItem;
    if (!kode || !uraian) {
      return toast.warn('Kode dan uraian wajib diisi');
    }

    const finalTipe = level === 1 ? null : tipe;
    const selisih = realisasi - anggaran;
    const persentase = anggaran > 0 ? (realisasi / anggaran) * 100 : 0;

    apbdesState.edit.addItem({
      kode,
      uraian,
      anggaran,
      realisasi,
      selisih,
      persentase,
      level,
      tipe: finalTipe, // ✅ Tidak akan undefined
    });


    setNewItem({
      kode: '',
      uraian: '',
      anggaran: 0,
      realisasi: 0,
      level: 1,
      tipe: 'pendapatan',
    });
  };

  const handleRemoveItem = (index: number) => {
    apbdesState.edit.removeItem(index);
  };

  const handleSubmit = async () => {
    if (apbdesState.edit.form.items.length === 0) {
      return toast.warn('Minimal harus ada 1 item APBDes');
    }

    try {
      setIsSubmitting(true);

      // Upload file baru jika ada perubahan
      if (imageFile) {
        // Hapus file lama dari form jika ada file baru
        const res = await ApiFetch.api.fileStorage.create.post({
          file: imageFile,
          name: imageFile.name,
        });
        const imageId = res.data?.data?.id;
        if (imageId) {
          apbdesState.edit.form.imageId = imageId;
        }
      }

      if (docFile) {
        // Hapus file lama dari form jika ada file baru
        const res = await ApiFetch.api.fileStorage.create.post({
          file: docFile,
          name: docFile.name,
        });
        const fileId = res.data?.data?.id;
        if (fileId) {
          apbdesState.edit.form.fileId = fileId;
        }
      }

      // Jika tidak ada file baru, gunakan ID lama (sudah ada di form)
      // Pastikan imageId dan fileId tetap ada
      if (!apbdesState.edit.form.imageId) {
        return toast.warn('Gambar wajib diunggah');
      }
      if (!apbdesState.edit.form.fileId) {
        return toast.warn('Dokumen wajib diunggah');
      }

      const success = await apbdesState.edit.update();
      if (success) {
        router.push('/admin/landing-page/apbdes');
      }
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Gagal memperbarui APBDes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    // Reset ke data original (tahun, name, deskripsi, jumlah, imageId, fileId)
    apbdesState.edit.form = {
      tahun: originalData.tahun,
      name: originalData.name,
      deskripsi: originalData.deskripsi,
      jumlah: originalData.jumlah,
      imageId: originalData.imageId,
      fileId: originalData.fileId,
      items: [...apbdesState.edit.form.items], // keep existing items
    };

    // Reset preview ke data original
    setPreviewImage(originalData.imageUrl || null);
    setPreviewDoc(originalData.fileUrl || null);

    // Reset file uploads
    setImageFile(null);
    setDocFile(null);

    // Reset new item form
    setNewItem({
      kode: '',
      uraian: '',
      anggaran: 0,
      realisasi: 0,
      level: 1,
      tipe: 'pendapatan',
    });

    toast.info('Form dikembalikan ke data awal');
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit APBDes
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
          {/* Header Form */}
          <TextInput
            label="Nama APBDes"
            placeholder="Contoh: APBDes Tahun 2025"
            value={apbdesState.edit.form.name}
            onChange={(e) =>
              (apbdesState.edit.form.name = e.target.value)
            }
            description="Opsional - akan diisi otomatis jika kosong"
          />
          <TextInput
            label="Deskripsi"
            placeholder="Deskripsi APBDes (opsional)"
            value={apbdesState.edit.form.deskripsi}
            onChange={(e) =>
              (apbdesState.edit.form.deskripsi = e.target.value)
            }
            description="Opsional"
          />
          <TextInput
            label="Jumlah Total"
            placeholder="Contoh: Rp 1.000.000.000"
            value={apbdesState.edit.form.jumlah}
            onChange={(e) =>
              (apbdesState.edit.form.jumlah = e.target.value)
            }
            description="Opsional - total keseluruhan anggaran"
          />
          <NumberInput
            label="Tahun"
            value={apbdesState.edit.form.tahun || new Date().getFullYear()}
            onChange={(val) =>
              (apbdesState.edit.form.tahun = Number(val) || new Date().getFullYear())
            }
            min={2000}
            max={2100}
            required
          />

          {/* Gambar & Dokumen */}
          <Stack gap="xs">
            <Box>
              <Text fw="bold" fz="sm" mb={6}>
                Gambar APBDes
              </Text>
              <Dropzone
                onDrop={handleDrop('image')}
                onReject={() => toast.error('File gambar tidak valid')}
                maxSize={5 * 1024 ** 2}
                accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
                radius="md"
                p="xl"
              >
                <Group justify="center" gap="xl" mih={180}>
                  <Dropzone.Idle>
                    <IconPhoto size={48} color="#868e96" stroke={1.5} />
                  </Dropzone.Idle>
                  <Stack gap="xs" align="center">
                    <Text size="md" fw={500}>
                      {previewImage ? 'Ganti gambar' : 'Unggah gambar'}
                    </Text>
                  </Stack>
                </Group>
              </Dropzone>
              {previewImage && (
                <Box mt="sm" pos="relative" style={{ textAlign: 'center' }}>
                  <Image
                    src={previewImage}
                    alt="Preview"
                    radius="md"
                    style={{ maxHeight: 200, objectFit: 'contain', border: '1px solid #ddd' }}
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
                      setImageFile(null);
                    }}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Box>
              )}
            </Box>

            <Box>
              <Text fw="bold" fz="sm" mb={6}>
                Dokumen APBDes
              </Text>
              <Dropzone
                onDrop={handleDrop('doc')}
                onReject={() => toast.error('File dokumen tidak valid')}
                maxSize={10 * 1024 ** 2}
                accept={{
                  'application/pdf': ['.pdf'],
                  'application/msword': ['.doc'],
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                  'application/vnd.ms-excel': ['.xls'],
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                }}
                radius="md"
                p="xl"
              >
                <Group justify="center" gap="xl" mih={180}>
                  <Dropzone.Idle>
                    <IconFile size={48} color="#868e96" stroke={1.5} />
                  </Dropzone.Idle>
                  <Stack gap="xs" align="center">
                    <Text size="md" fw={500}>
                      {previewDoc ? 'Ganti dokumen' : 'Unggah dokumen'}
                    </Text>
                  </Stack>
                </Group>
              </Dropzone>
              {previewDoc && (
                <Box mt="sm">
                  <Button
                    component="a"
                    href={previewDoc}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="light"
                    size="xs"
                    leftSection={<IconFile size={14} />}
                  >
                    Lihat Dokumen
                  </Button>
                  <ActionIcon
                    variant="filled"
                    color="red"
                    radius="xl"
                    size="sm"
                    ml="sm"
                    onClick={() => {
                      setPreviewDoc(null);
                      setDocFile(null);
                    }}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Box>
              )}
            </Box>
          </Stack>

          {/* Input Item Baru */}
          <Paper withBorder p="md" radius="md">
            <Title order={6} mb="sm">
              Tambah Item Pendapatan/Belanja
            </Title>
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
                  styles={{
                    option: {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
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
                  styles={{
                    option: {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                  value={newItem.tipe}
                  onChange={(val) => setNewItem({ ...newItem, tipe: (val as any) || 'pendapatan' })}
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
          {apbdesState.edit.form.items.length > 0 && (
            <Paper withBorder p="md" radius="md">
              <Title order={6} mb="sm">
                Daftar Item ({apbdesState.edit.form.items.length})
              </Title>
              <Table striped highlightOnHover>
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Uraian</th>
                    <th>Anggaran</th>
                    <th>Realisasi</th>
                    <th>Level</th>
                    <th>Tipe</th>
                    <th style={{ width: '50px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {apbdesState.edit.form.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <Text size="sm" fw={500}>
                          {item.kode}
                        </Text>
                      </td>
                      <td>{item.uraian}</td>
                      <td>{item.anggaran.toLocaleString('id-ID')}</td>
                      <td>{item.realisasi.toLocaleString('id-ID')}</td>
                      <td>
                        <Badge size="sm" color={item.level === 1 ? 'blue' : item.level === 2 ? 'green' : 'grape'}>
                          L{item.level}
                        </Badge>
                      </td>
                      <td>
                        {item.tipe ? (
                          <Badge color={item.tipe === 'pendapatan' ? 'teal' : 'red'} size="sm">
                            {item.tipe}
                          </Badge>
                        ) : (
                          '-'
                        )}
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
            <Button variant="outline" color="gray" radius="md" onClick={handleReset}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              radius="md"
              disabled={!isFormValid() || isSubmitting || apbdesState.edit.loading}
              style={{
                background: !isFormValid() || isSubmitting || apbdesState.edit.loading
                  ? 'linear-gradient(135deg, #cccccc, #999999)'
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
              }}
            >
              {isSubmitting ? <Loader size="sm" color="white" /> : 'Simpan Perubahan'}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditAPBDes;