/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import puskesmasState from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/puskesmas';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, FileInput, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
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
  const [formData, setFormData] = useState<PuskesmasFormData>({
    name: statePuskesmas.edit.form.name || '',
    alamat: statePuskesmas.edit.form.alamat || '',
    jam: {
      workDays: statePuskesmas.edit.form.jam?.workDays || '',
      weekDays: statePuskesmas.edit.form.jam?.weekDays || '',
      holiday: statePuskesmas.edit.form.jam?.holiday || '',
    },
    kontak: {
      kontakPuskesmas: statePuskesmas.edit.form.kontak?.kontakPuskesmas || '',
      email: statePuskesmas.edit.form.kontak?.email || '',
      facebook: statePuskesmas.edit.form.kontak?.facebook || '',
      kontakUGD: statePuskesmas.edit.form.kontak?.kontakUGD || '',
    },
    imageId: statePuskesmas.edit.form.imageId || '',
  });

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

          // Check if there's an existing image URL in the form data
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

  const handleSubmit = async () => {
    try {
      statePuskesmas.edit.form = {
        ...statePuskesmas.edit.form,
        name: formData.name,
        alamat: formData.alamat,
        jam: {
          workDays: formData.jam.workDays,
          weekDays: formData.jam.weekDays,
          holiday: formData.jam.holiday,
        },
        kontak: {
          kontakPuskesmas: formData.kontak.kontakPuskesmas,
          email: formData.kontak.email,
          facebook: formData.kontak.facebook,
          kontakUGD: formData.kontak.kontakUGD,
        },
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
    }
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setPreviewImage(null);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedChange = (section: 'jam' | 'kontak', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant="subtle" color="blue">
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Stack gap="xs">
        <Paper bg={colors['white-1']} p="md" w={{ base: '100%', md: '50%' }}>
          <Stack gap="xs">
            <Title order={3}>Edit Puskesmas</Title>
            
            <TextInput
              label={<Text fz="sm" fw="bold">Nama Puskesmas</Text>}
              placeholder="masukkan nama puskesmas"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />

            <TextInput
              label={<Text fz="sm" fw="bold">Alamat</Text>}
              placeholder="masukkan alamat"
              name="alamat"
              value={formData.alamat}
              onChange={handleInputChange}
            />

            <TextInput
              label={<Text fz="sm" fw="bold">Jam Buka</Text>}
              placeholder="masukkan jam buka"
              value={formData.jam.workDays}
              onChange={(e) => handleNestedChange('jam', 'workDays', e.target.value)}
            />

            <TextInput
              label={<Text fz="sm" fw="bold">Jam Tutup</Text>}
              placeholder="masukkan jam tutup"
              value={formData.jam.weekDays}
              onChange={(e) => handleNestedChange('jam', 'weekDays', e.target.value)}
            />

            <TextInput
              label={<Text fz="sm" fw="bold">Jam Libur</Text>}
              placeholder="masukkan jam libur"
              value={formData.jam.holiday}
              onChange={(e) => handleNestedChange('jam', 'holiday', e.target.value)}
            />

            <TextInput
              label={<Text fz="sm" fw="bold">Kontak Puskesmas</Text>}
              placeholder="masukkan kontak puskesmas"
              value={formData.kontak.kontakPuskesmas}
              onChange={(e) => handleNestedChange('kontak', 'kontakPuskesmas', e.target.value)}
            />

            <TextInput
              label={<Text fz="sm" fw="bold">Email</Text>}
              placeholder="masukkan email"
              value={formData.kontak.email}
              onChange={(e) => handleNestedChange('kontak', 'email', e.target.value)}
            />

            <TextInput
              label={<Text fz="sm" fw="bold">Facebook</Text>}
              placeholder="masukkan facebook"
              value={formData.kontak.facebook}
              onChange={(e) => handleNestedChange('kontak', 'facebook', e.target.value)}
            />

            <TextInput
              label={<Text fz="sm" fw="bold">Kontak UGD</Text>}
              placeholder="masukkan kontak UGD"
              value={formData.kontak.kontakUGD}
              onChange={(e) => handleNestedChange('kontak', 'kontakUGD', e.target.value)}
            />

            <FileInput
              placeholder="Pilih gambar"
              label="Gambar"
              accept="image/*"
              leftSection={<IconImageInPicture size={16} />}
              value={file}
              onChange={handleFileChange}
            />

            {previewImage ? (
              <Image alt="Preview" src={previewImage} w={200} h={200} />
            ) : (
              <Center w={200} h={200} bg="gray">
                <IconImageInPicture />
              </Center>
            )}

            <Button 
              onClick={handleSubmit} 
              bg={colors['blue-button']} 
              loading={statePuskesmas.edit.loading}
            >
              Simpan Perubahan
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default EditPuskesmas;
