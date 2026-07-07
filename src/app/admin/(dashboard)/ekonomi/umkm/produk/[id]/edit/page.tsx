"use client";

import EditEditor from "@/app/admin/(dashboard)/_com/editEditor";
import colors from "@/con/colors";
import ApiFetch from "@/lib/api-fetch";
import {
  ActionIcon,
  Autocomplete,
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
  NumberInput,
  Center,
} from "@mantine/core";
import { SATUAN_PRESETS } from "@/app/darmasaba/(pages)/ekonomi/umkm/_lib/satuan";
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

interface ProdukData {
  id: string;
  nama: string;
  harga: number;
  stok: number;
  satuan: string | null;
  umkmId: string | null;
  deskripsi: string | null;
  imageId: string | null;
  kategoriProdukId: string | null;
  image?: { link: string } | null;
}

interface ProdukForm {
  nama: string;
  harga: number;
  stok: number;
  satuan: string;
  umkmId: string;
  deskripsi: string;
  imageId: string | null;
  kategoriId: string;
}

function EditProdukUmkm() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [formData, setFormData] = useState<ProdukForm>({
    nama: "",
    harga: 0,
    stok: 0,
    satuan: "",
    umkmId: "",
    deskripsi: "",
    imageId: null,
    kategoriId: "",
  });

  const [originalData, setOriginalData] = useState<ProdukForm & { imageUrl: string }>({
    nama: "",
    harga: 0,
    stok: 0,
    satuan: "",
    umkmId: "",
    deskripsi: "",
    imageId: null,
    kategoriId: "",
    imageUrl: ""
  });

  const isFormValid = () => {
    return (
      formData.nama?.trim() !== '' &&
      formData.umkmId !== '' &&
      formData.kategoriId !== '' &&
      formData.harga >= 0 &&
      formData.stok >= 0
    );
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        umkmState.umkm.findMany.load(),
        umkmState.kategoriProduk.findManyAll.load(),
        umkmState.produk.findUnique.load(id)
      ]);

      const data = umkmState.produk.findUnique.data as ProdukData | null;
      if (data) {
        const initialForm: ProdukForm = {
          nama: data.nama || "",
          harga: data.harga || 0,
          stok: data.stok || 0,
          satuan: data.satuan || "",
          umkmId: data.umkmId || "",
          deskripsi: data.deskripsi || "",
          imageId: data.imageId || "",
          kategoriId: data.kategoriProdukId || "",
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

  const handleChange = (field: keyof ProdukForm, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!formData.nama?.trim()) return toast.error("Nama produk wajib diisi");
    if (!formData.umkmId) return toast.error("UMKM pemilik wajib dipilih");
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
          return toast.error("Gagal mengunggah foto produk");
        }
      }

      // Update proxy state
      umkmState.produk.update.form = {
        ...umkmState.produk.update.form,
        ...formData,
        imageId: uploadedImageId
      };

      const success = await umkmState.produk.update.submit(id);
      if (success) {
        router.push('/admin/ekonomi/umkm/produk');
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
      harga: originalData.harga,
      stok: originalData.stok,
      satuan: originalData.satuan,
      umkmId: originalData.umkmId,
      deskripsi: originalData.deskripsi,
      imageId: originalData.imageId,
      kategoriId: originalData.kategoriId,
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
          Edit Produk UMKM
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
          {/* Foto Produk */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Foto Produk
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
                  alt="Preview Produk"
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

          {/* UMKM Pemilik */}
          <Select
            label="Pilih UMKM Pemilik"
            placeholder="Siapa pemilik produk ini?"
            required
            searchable
            data={umkmState.umkm.findMany.data?.map((v: any) => ({
              value: v.id, label: v.nama
            })) || []}
            value={formData.umkmId}
            onChange={(val) => handleChange("umkmId", val || "")}
          />

          {/* Nama Produk */}
          <TextInput
            label="Nama Produk"
            placeholder="Masukkan nama produk"
            value={formData.nama}
            onChange={(e) => handleChange("nama", e.target.value)}
            required
          />

          {/* Harga & Stok */}
          <Group grow>
            <NumberInput
              label="Harga Produk (Rp)"
              placeholder="0"
              required
              min={0}
              thousandSeparator="."
              decimalSeparator=","
              value={formData.harga}
              onChange={(val) => handleChange("harga", Number(val))}
            />
            <NumberInput
              label="Stok"
              placeholder="0"
              required
              min={0}
              value={formData.stok}
              onChange={(val) => handleChange("stok", Number(val))}
            />
            <Autocomplete
              label="Satuan"
              placeholder="kg / ekor / pcs"
              data={[...SATUAN_PRESETS]}
              value={formData.satuan}
              onChange={(val) => handleChange("satuan", val)}
            />
          </Group>

          {/* Kategori */}
          <Select
            label="Kategori Produk"
            placeholder="Pilih kategori produk"
            required
            data={umkmState.kategoriProduk.findManyAll.data?.map((v: any) => ({
              value: v.id, label: v.nama
            })) || []}
            value={formData.kategoriId}
            onChange={(val) => handleChange("kategoriId", val || "")}
          />

          {/* Deskripsi */}
          <Box>
            <Text fz="sm" fw="bold" mb={4}>
              Deskripsi Produk
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

export default EditProdukUmkm;
