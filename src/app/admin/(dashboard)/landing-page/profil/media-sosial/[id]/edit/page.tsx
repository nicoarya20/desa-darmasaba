/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import SelectSocialMediaEdit from '@/app/admin/(dashboard)/_com/selectSocialMediaEdit';
import profileLandingPageState from '@/app/admin/(dashboard)/_state/landing-page/profile';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  ActionIcon,
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
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

type SosmedKey =
  | 'none'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'whatsapp'
  | 'gmail'
  | 'telegram'
  | 'x'
  | 'telephone'
  | 'custom';

const sosmedMap: Record<SosmedKey, { label: string; src: string | null }> = {
  none: { label: "None", src: '/no-image.jpg' },
  facebook: { label: 'Facebook', src: '/assets/images/sosmed/facebook.png' },
  instagram: { label: 'Instagram', src: '/assets/images/sosmed/instagram.png' },
  tiktok: { label: 'Tiktok', src: '/assets/images/sosmed/tiktok.png' },
  youtube: { label: 'YouTube', src: '/assets/images/sosmed/youtube.png' },
  whatsapp: { label: 'WhatsApp', src: '/assets/images/sosmed/whatsapp.png' },
  gmail: { label: 'Gmail', src: '/assets/images/sosmed/gmail.png' },
  telegram: { label: 'Telegram', src: '/assets/images/sosmed/telegram.png' },
  x: { label: 'X (Twitter)', src: '/assets/images/sosmed/x-twitter.png' },
  telephone: { label: 'Telephone', src: '/assets/images/sosmed/telephone-call.png' },
  custom: { label: 'Custom Icon', src: null },
};

function EditMediaSosial() {
  const stateMediaSosial = useProxy(profileLandingPageState.mediaSosial);
  const router = useRouter();
  const params = useParams();

  const [selectedSosmed, setSelectedSosmed] = useState<SosmedKey>('facebook');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    iconUrl: '',
    imageId: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    const isNameValid = formData.name?.trim() !== '';
    const isIconUrlValid = formData.iconUrl?.trim() !== '';
    const isCustomIconValid = selectedSosmed !== 'custom' || file !== null;

    return isNameValid && isIconUrlValid && isCustomIconValid;
  };

  const [originalData, setOriginalData] = useState({
    name: '',
    icon: '',
    iconUrl: '',
    imageId: '',
    imageUrl: '',
  });

  // Load Data by ID
  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;

    const loadData = async () => {
      try {
        const data = await stateMediaSosial.update.load(id);

        if (!data) return;

        // Tentukan default/custom icon
        // Tentukan default/custom icon
        if (data.imageId) {
          setSelectedSosmed('custom');
        } else {
          // ✅ Gunakan langsung data.icon jika ada dan valid
          if (data.icon && sosmedMap[data.icon as SosmedKey]) {
            setSelectedSosmed(data.icon as SosmedKey);
          } else {
            setSelectedSosmed('none'); // fallback
          }
        }

        const newForm = {
          name: data.name || '',
          icon: data.icon || '',
          iconUrl: data.iconUrl || '',
          imageId: data.imageId || '',
        };

        setFormData(newForm);

        setOriginalData({
          ...newForm,
          imageUrl: data.image?.link || '',
        });

        setPreviewImage(data.image?.link || null);
      } catch {
        toast.error('Gagal mengambil data media sosial');
      }
    };

    loadData();
  }, [params?.id]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      stateMediaSosial.update.form = { ...stateMediaSosial.update.form, ...formData };

      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({
          file,
          name: file.name,
        });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          toast.error('Gagal upload gambar');
          return;
        }

        stateMediaSosial.update.form.imageId = uploaded.id;
      }

      // 🚨 Tambahkan ini untuk debugging
      console.log("Data yang akan dikirim ke backend:", stateMediaSosial.update.form);

      await stateMediaSosial.update.update();
      toast.success('Media sosial berhasil diperbarui!');
      router.push('/admin/landing-page/profil/media-sosial');
    } catch (error) {
      console.error("Error di handleSubmit:", error); // 🚨 Tambahkan ini juga
      toast.error('Terjadi kesalahan saat memperbarui media sosial');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      icon: originalData.icon,
      iconUrl: originalData.iconUrl,
      imageId: originalData.imageId,
    });
    setPreviewImage(originalData.imageUrl || null);
    setFile(null);
    toast.info('Form dikembalikan ke data awal');
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Media Sosial
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
          {/* Upload / Icon */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Icon / Gambar Media Sosial
            </Text>

            {/* Custom Upload */}
            {/* PILIH ICON */}
            <SelectSocialMediaEdit
              value={selectedSosmed}
              onChange={(key) => {
                setSelectedSosmed(key);

                if (key === 'custom') {
                  // custom → gunakan Dropzone
                  setFormData((prev) => ({
                    ...prev,
                    icon: '',
                    imageId: '',
                  }));
                  return;
                }

                // default → pakai icon bawaan
                setFormData((prev) => ({
                  ...prev,
                  icon: key, // <-- simpan 'facebook', bukan path
                  imageId: '',
                }));
              }}
            />

            {selectedSosmed === 'custom' ? (
              <>
                <Dropzone
                  onDrop={(files) => {
                    const selectedFile = files[0];
                    if (selectedFile) {
                      setFile(selectedFile);
                      setPreviewImage(URL.createObjectURL(selectedFile));
                      handleChange('imageId', '');
                    }
                  }}
                  onReject={() => toast.error('File tidak valid')}
                  maxSize={5 * 1024 ** 2}
                  accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
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

                    <Stack align="center" gap="xs">
                      <Text fw={500}>Seret gambar atau klik untuk pilih</Text>
                      <Text size="sm" c="dimmed">
                        Maksimal 5MB, format: .png, .jpg, .jpeg, .webp
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
                      style={{
                        maxHeight: 200,
                        objectFit: 'contain',
                        border: '1px solid #ddd',
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
                        setFile(null);
                        setPreviewImage(null);
                        handleChange('imageId', '');
                      }}
                      style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </Box>
                )}
              </>
            ) : (
              // Default icon
              <Box mt="xs">
                <Image
                  src={sosmedMap[selectedSosmed].src || ''}
                  alt="Icon bawaan"
                  width={40}
                  height={40}
                  radius="md"
                  style={{ border: '1px solid #ddd', padding: 4, background: '#fff' }}
                />
              </Box>
            )}
          </Box>

          {/* Nama Media Sosial */}
          <TextInput
            label="Nama Media Sosial / Kontak"
            placeholder="Masukkan nama media sosial atau kontak"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />

          {/* Link Media Sosial */}
          <TextInput
            label="Link Media Sosial / Nomor Telepon"
            placeholder="Masukkan link atau nomor telepon"
            value={formData.iconUrl}
            onChange={(e) => handleChange('iconUrl', e.target.value)}
            required
          />

          <Group justify="right">
            <Button variant="outline" color="gray" radius="md" size="md" onClick={handleResetForm}>
              Batal
            </Button>

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

export default EditMediaSosial;
