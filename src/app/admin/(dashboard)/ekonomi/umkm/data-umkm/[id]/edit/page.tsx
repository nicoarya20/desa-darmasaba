"use client";

import EditEditor from "@/app/admin/(dashboard)/_com/editEditor";
import colors from "@/con/colors";
import ApiFetch from "@/lib/api-fetch";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Loader,
  Center,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import {
  IconArrowBack,
  IconPhoto,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";
import umkmState from "../../../../../_state/ekonomi/umkm/umkm";

interface UmkmData {
  id: string;
  nama: string;
  pemilik: string;
  kategoriId: string | null;
  deskripsi: string | null;
  alamat: string | null;
  kontak: string | null;
  imageId: string | null;
  image?: { link: string } | null;
}

interface UmkmForm {
  nama: string;
  pemilik: string;
  kategoriId: string;
  deskripsi: string;
  alamat: string;
  kontak: string;
  imageId: string | null;
}

function EditDataUmkm() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [formData, setFormData] = useState<UmkmForm>({
    nama: "",
    pemilik: "",
    kategoriId: "",
    deskripsi: "",
    alamat: "",
    kontak: "",
    imageId: null,
  });

  const [originalData, setOriginalData] = useState<UmkmForm & { imageUrl: string }>({
    nama: "",
    pemilik: "",
    kategoriId: "",
    deskripsi: "",
    alamat: "",
    kontak: "",
    imageId: null,
    imageUrl: ""
  });

  const isFormValid = () => {
    return (
      formData.nama?.trim() !== '' &&
      formData.pemilik?.trim() !== '' &&
      formData.kategoriId !== ''
    );
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        umkmState.kategoriProduk.findManyAll.load(),
        umkmState.umkm.findUnique.load(id)
      ]);

      const data = umkmState.umkm.findUnique.data as UmkmData | null;
      if (data) {
        const initialForm: UmkmForm = {
          nama: data.nama || "",
          pemilik: data.pemilik || "",
          kategoriId: data.kategoriId || "",
          deskripsi: data.deskripsi || "",
          alamat: data.alamat || "",
          kontak: data.kontak || "",
          imageId: data.imageId || "",
        };

        setFormData(initialForm);
        setOriginalData({
          ...initialForm,
          imageUrl: data.image?.link || ""
        });

        if (data.image?.link) {
          setPreviewImage(data.image.link);
        }
      }
      setIsInitialLoading(false);
    };
    init();
  }, [id]);

  const handleChange = (field: keyof UmkmForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!formData.nama?.trim()) return toast.error("Nama UMKM wajib diisi");
    if (!formData.pemilik?.trim()) return toast.error("Nama pemilik wajib diisi");
    if (!formData.kategoriId) return toast.error("Kategori wajib dipilih");

    setIsSubmitting(true);
    try {
      let uploadedImageId = formData.imageId;
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({
          file,
          name: file.name
        });
        
        const uploaded = res.data?.data;
        if (uploaded?.id) {
          uploadedImageId = uploaded.id;
        } else {
          setIsSubmitting(false);
          return toast.error("Gagal mengunggah logo UMKM");
        }
      }

      // Update proxy state
      umkmState.umkm.update.form = {
        ...umkmState.umkm.update.form,
        ...formData,
        imageId: uploadedImageId
      };

      const success = await umkmState.umkm.update.submit(id);
      if (success) {
        router.push('/admin/ekonomi/umkm/data-umkm');
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      nama: originalData.nama,
      pemilik: originalData.pemilik,
      kategoriId: originalData.kategoriId,
      deskripsi: originalData.deskripsi,
      alamat: originalData.alamat,
      kontak: originalData.kontak,
      imageId: originalData.imageId,
    });
    setPreviewImage(originalData.imageUrl || null);
    setFile(null);
    toast.info("Form dikembalikan ke data awal");
  };

  if (isInitialLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button
          variant="subtle"
          onClick={() => router.back()}
          p="xs"
          radius="md"
        >
          <IconArrowBack color={colors["blue-button"]} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Data UMKM
        </Title>
      </Group>

      {/* Form */}
      <Paper
        w={{ base: "100%", md: "50%" }}
        bg={colors["white-1"]}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: "1px solid #e0e0e0" }}
      >
        <Stack gap="md">
          {/* Logo / Foto UMKM */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Logo / Foto UMKM
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewImage(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() =>
                toast.error("File tidak valid, gunakan format gambar")
              }
              maxSize={5 * 1024 ** 2}
              accept={IMAGE_MIME_TYPE}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={140}>
                <Dropzone.Accept>
                  <IconUpload size={48} color={colors["blue-button"]} stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={48} color="red" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={48} color="#868e96" stroke={1.5} />
                </Dropzone.Idle>
              </Group>
            </Dropzone>

            {previewImage && (
              <Box mt="sm" pos="relative" style={{ textAlign: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview Logo"
                  radius="md"
                  style={{
                    maxHeight: 220,
                    objectFit: "contain",
                    border: `1px solid ${colors["blue-button"]}`,
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
                    setFormData(prev => ({ ...prev, imageId: null }));
                  }}
                  style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Box>
            )}
          </Box>

          <Group grow>
            <TextInput
              label="Nama UMKM / Bisnis"
              placeholder="Contoh: Warung Sate Bu Komang"
              required
              value={formData.nama}
              onChange={(e) => handleChange("nama", e.target.value)}
            />
            <TextInput
              label="Nama Pemilik"
              placeholder="Masukkan nama lengkap pemilik"
              required
              value={formData.pemilik}
              onChange={(e) => handleChange("pemilik", e.target.value)}
            />
          </Group>

          <Group grow>
            <Select
              label="Kategori Bisnis"
              placeholder="Pilih kategori"
              required
              data={umkmState.kategoriProduk.findManyAll.data?.map((v: any) => ({
                value: v.id, label: v.nama
              })) || []}
              value={formData.kategoriId}
              onChange={(val) => handleChange("kategoriId", val || "")}
            />
            <TextInput
              label="Nomor WA / Kontak"
              placeholder="Contoh: 08123456789"
              value={formData.kontak}
              onChange={(e) => handleChange("kontak", e.target.value)}
            />
          </Group>

          <TextInput
            label="Alamat Lengkap"
            placeholder="Masukkan alamat fisik usaha"
            value={formData.alamat}
            onChange={(e) => handleChange("alamat", e.target.value)}
          />

          <Box>
            <Text fw="bold" fz="sm" mb={4}>
              Deskripsi UMKM
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) =>
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }))
              }
            />
          </Box>

          {/* Action Buttons */}
          <Group justify="right" mt="md">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={handleResetForm}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdate}
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

export default EditDataUmkm;
