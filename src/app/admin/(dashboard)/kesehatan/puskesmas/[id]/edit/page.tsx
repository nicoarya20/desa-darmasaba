/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import puskesmasState from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/puskesmas';
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
import { useParams, useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

interface PuskesmasFormBase {
  name: string;
  alamat: string;
  jam: {
    workDays: string;
    weekDays: string;
    holiday: string;
  };
  kontak: {
    kontakPuskesmas: string;
    email: string;
    facebook: string;
    kontakUGD: string;
  };
  imageId: string;
}

interface PuskesmasFormData extends PuskesmasFormBase {
  image?: {
    link: string;
  };
}

function EditPuskesmas() {
  const statePuskesmas = useProxy(puskesmasState);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PuskesmasFormData>({
    name: '',
    alamat: '',
    jam: { workDays: '', weekDays: '', holiday: '' },
    kontak: { kontakPuskesmas: '', email: '', facebook: '', kontakUGD: '' },
    imageId: '',
  });
  const [originalData, setOriginalData] = useState({
    name: '',
    alamat: '',
    jam: { workDays: '', weekDays: '', holiday: '' },
    kontak: { kontakPuskesmas: '', email: '', facebook: '', kontakUGD: '' },
    imageId: '',
    imageUrl: ''
  });

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.name?.trim() !== '' &&
      formData.alamat?.trim() !== '' &&
      formData.jam.workDays?.trim() !== '' &&
      formData.jam.weekDays?.trim() !== '' &&
      formData.jam.holiday?.trim() !== ''
    );
  };

  useEffect(() => {
    const loadPuskesmas = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        await statePuskesmas.edit.load(id);
        const { form } = statePuskesmas.edit;
        if (form) {
          setFormData({
            name: form.name,
            alamat: form.alamat,
            jam: {
              workDays: form.jam.workDays,
              weekDays: form.jam.weekDays,
              holiday: form.jam.holiday,
            },
            kontak: {
              kontakPuskesmas: form.kontak.kontakPuskesmas,
              email: form.kontak.email,
              facebook: form.kontak.facebook,
              kontakUGD: form.kontak.kontakUGD,
            },
            imageId: form.imageId,
          });
          setOriginalData({
            name: form.name,
            alamat: form.alamat,
            jam: {
              workDays: form.jam.workDays,
              weekDays: form.jam.weekDays,
              holiday: form.jam.holiday,
            },
            kontak: {
              kontakPuskesmas: form.kontak.kontakPuskesmas,
              email: form.kontak.email,
              facebook: form.kontak.facebook,
              kontakUGD: form.kontak.kontakUGD,
            },
            imageId: form.imageId,
            imageUrl: (form as any).image?.link

          });

          const formWithImage = form as PuskesmasFormData;
          if (formWithImage.image?.link) {
            setPreviewImage(formWithImage.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading puskesmas:", error);
        toast.error("Gagal memuat data puskesmas");
      }
    };
    loadPuskesmas();
  }, [params?.id]);

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      alamat: originalData.alamat,
      jam: {
        workDays: originalData.jam.workDays,
        weekDays: originalData.jam.weekDays,
        holiday: originalData.jam.holiday,
      },
      kontak: {
        kontakPuskesmas: originalData.kontak.kontakPuskesmas,
        email: originalData.kontak.email,
        facebook: originalData.kontak.facebook,
        kontakUGD: originalData.kontak.kontakUGD,
      },
      imageId: originalData.imageId,
    });
    setPreviewImage(originalData.imageUrl || null);
    setFile(null);
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      statePuskesmas.edit.form = {
        ...statePuskesmas.edit.form,
        name: formData.name,
        alamat: formData.alamat,
        jam: { ...formData.jam },
        kontak: { ...formData.kontak },
        imageId: formData.imageId,
      };

      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          toast.error("Gagal upload gambar");
          return;
        }

        statePuskesmas.edit.form.imageId = uploaded.id;
      }

      const success = await statePuskesmas.edit.submit();
      if (success) {
        toast.success("Puskesmas berhasil diperbarui!");
        router.push("/admin/kesehatan/puskesmas");
      }
    } catch (error) {
      console.error("Error updating puskesmas:", error);
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui data puskesmas");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (section: 'jam' | 'kontak', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header dengan tombol back */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Puskesmas
        </Title>
      </Group>

      {/* Card Form */}
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
            label="Nama Puskesmas"
            placeholder="Masukkan nama puskesmas"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <TextInput
            label="Alamat"
            placeholder="Masukkan alamat"
            name="alamat"
            value={formData.alamat}
            onChange={handleInputChange}
            required
          />

          <TextInput
            label="Jam Buka"
            placeholder="Masukkan jam buka"
            value={formData.jam.workDays}
            onChange={(e) => handleNestedChange('jam', 'workDays', e.target.value)}
            required
          />

          <TextInput
            label="Jam Tutup"
            placeholder="Masukkan jam tutup"
            value={formData.jam.weekDays}
            onChange={(e) => handleNestedChange('jam', 'weekDays', e.target.value)}
            required
          />

          <TextInput
            label="Jam Libur"
            placeholder="Masukkan jam libur"
            value={formData.jam.holiday}
            onChange={(e) => handleNestedChange('jam', 'holiday', e.target.value)}
            required
          />

          <TextInput
            label="Kontak Puskesmas"
            placeholder="Masukkan kontak puskesmas"
            inputMode="numeric"
            maxLength={13}
            value={formData.kontak.kontakPuskesmas}
            onChange={(e) =>
              handleNestedChange(
                'kontak',
                'kontakPuskesmas',
                e.target.value.replace(/\D/g, '').slice(0, 13)
              )
            }
          />

          <TextInput
            label="Email"
            placeholder="Masukkan email"
            value={formData.kontak.email}
            onChange={(e) => handleNestedChange('kontak', 'email', e.target.value)}
          />

          <TextInput
            label="Facebook"
            placeholder="Masukkan facebook"
            value={formData.kontak.facebook}
            onChange={(e) => handleNestedChange('kontak', 'facebook', e.target.value)}
          />

          <TextInput
            label="Kontak UGD"
            placeholder="Masukkan kontak UGD"
            inputMode="numeric"
            maxLength={13}
            value={formData.kontak.kontakUGD}
            onChange={(e) =>
              handleNestedChange(
                'kontak',
                'kontakUGD',
                e.target.value.replace(/\D/g, '').slice(0, 13)
              )
            }
          />

          {/* Upload Gambar */}
          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Gambar
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewImage(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() => toast.error('File tidak valid.')}
              maxSize={5 * 1024 ** 2}
              accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
            >
              <Group justify="center" gap="xl" mih={200} style={{ pointerEvents: 'none' }}>
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

            {previewImage && (
              <Box mt="sm" pos={"relative"}>
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

export default EditPuskesmas;
