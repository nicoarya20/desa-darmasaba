"use client";

import EditEditor from "@/app/admin/(dashboard)/_com/editEditor";
import stateKesejahteraanMasyarakat from "@/app/admin/(dashboard)/_state/ekonomi/kesejahteraan-masyarakat";
import colors from "@/con/colors";
import ApiFetch from "@/lib/api-fetch";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Loader,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import {
  IconArrowBack,
  IconPhoto,
  IconUpload,
  IconX,
  IconVideo,
  IconTrash,
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";
import { convertYoutubeUrlToEmbed } from '@/app/admin/(dashboard)/desa/gallery/lib/youtube-utils';

interface ExistingImage {
  id: string;
  link: string;
  name: string;
}

interface KesejahteraanData {
  id: string;
  judul: string;
  deskripsi: string;
  content: string;
  imageId: string | null;
  image?: { link: string } | null;
  images?: ExistingImage[];
  linkVideo?: string | null;
}

function EditKesejahteraan() {
  const state = useProxy(stateKesejahteraanMasyarakat);
  const router = useRouter();
  const params = useParams();

  // Featured image state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Gallery images state
  const [existingGalleryImages, setExistingGalleryImages] = useState<ExistingImage[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // YouTube link state
  const [youtubeLink, setYoutubeLink] = useState('');
  const [originalYoutubeLink, setOriginalYoutubeLink] = useState('');

  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    content: "",
    imageId: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [originalData, setOriginalData] = useState({
    judul: "",
    deskripsi: "",
    content: "",
    imageId: "",
    imageUrl: ""
  });

  const isHtmlEmpty = (html: string) => {
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  const isFormValid = () => {
    return (
      formData.judul?.trim() !== '' &&
      !isHtmlEmpty(formData.deskripsi) &&
      (file !== null || originalData.imageId !== '') &&
      !isHtmlEmpty(formData.content)
    );
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateKesejahteraanMasyarakat.kesejahteraan.edit.load(id) as KesejahteraanData | null;
        if (data) {
          setFormData({
            judul: data.judul || "",
            deskripsi: data.deskripsi || "",
            content: data.content || "",
            imageId: data.imageId || "",
          });

          setOriginalData({
            judul: data.judul || "",
            deskripsi: data.deskripsi || "",
            content: data.content || "",
            imageId: data.imageId || "",
            imageUrl: data.image?.link || ""
          });

          if (data?.image?.link) {
            setPreviewImage(data.image.link);
          }

          if (data?.images && data.images.length > 0) {
            setExistingGalleryImages(data.images);
          }

          if (data?.linkVideo) {
            setYoutubeLink(data.linkVideo);
            setOriginalYoutubeLink(data.linkVideo);
          }
        }
      } catch (error) {
        console.error("Error loading kesejahteraan:", error);
        toast.error("Gagal memuat data program kesejahteraan");
      }
    };

    loadData();
  }, [params?.id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGalleryDrop = (files: File[]) => {
    const maxImages = 10;
    const currentCount = existingGalleryImages.length + galleryFiles.length;
    const availableSlots = maxImages - currentCount;

    if (availableSlots <= 0) {
      toast.warn('Maksimal 10 gambar untuk galeri');
      return;
    }

    const newFiles = files.slice(0, availableSlots);

    if (newFiles.length === 0) {
      toast.warn('Tidak ada slot tersisa untuk gambar galeri');
      return;
    }

    setGalleryFiles([...galleryFiles, ...newFiles]);

    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setGalleryPreviews([...galleryPreviews, ...newPreviews]);
  };

  const removeGalleryImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      setExistingGalleryImages(existingGalleryImages.filter((_, i) => i !== index));
    } else {
      setGalleryFiles(galleryFiles.filter((_, i) => i !== index));
      setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!formData.judul?.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }

    if (isHtmlEmpty(formData.deskripsi)) {
      toast.error('Deskripsi singkat wajib diisi');
      return;
    }

    if (!file && !originalData.imageId) {
      toast.error('Gambar utama wajib dipilih');
      return;
    }

    if (isHtmlEmpty(formData.content)) {
      toast.error('Konten wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);

      // Update global state
      state.kesejahteraan.edit.form = {
        ...state.kesejahteraan.edit.form,
        ...formData,
      };

      // Upload new featured image if changed
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({
          file,
          name: file.name,
        });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar utama");
        }

        state.kesejahteraan.edit.form.imageId = uploaded.id;
      }

      // Upload new gallery images
      const newGalleryIds: string[] = [];
      for (const galleryFile of galleryFiles) {
        const galleryRes = await ApiFetch.api.fileStorage.create.post({
          file: galleryFile,
          name: galleryFile.name,
        });
        const galleryUploaded = galleryRes.data?.data;
        if (galleryUploaded?.id) {
          newGalleryIds.push(galleryUploaded.id);
        }
      }

      // Combine existing (not removed) and new gallery images
      const remainingExistingIds = existingGalleryImages.map(img => img.id);
      state.kesejahteraan.edit.form.imageIds = [...remainingExistingIds, ...newGalleryIds];

      // Set YouTube link
      const embedLink = convertYoutubeUrlToEmbed(youtubeLink);
      state.kesejahteraan.edit.form.linkVideo = embedLink || '';

      await state.kesejahteraan.edit.update();
      router.push("/admin/ekonomi/kesejahteraan-masyarakat");
    } catch (error) {
      console.error("Error updating kesejahteraan:", error);
      toast.error("Terjadi kesalahan saat memperbarui program kesejahteraan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      judul: originalData.judul,
      deskripsi: originalData.deskripsi,
      content: originalData.content,
      imageId: originalData.imageId,
    });
    setPreviewImage(originalData.imageUrl || null);
    setFile(null);
    setYoutubeLink(originalYoutubeLink);
    toast.info("Form dikembalikan ke data awal");
  };

  const embedLink = convertYoutubeUrlToEmbed(youtubeLink);

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
          Edit Program Kesejahteraan
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
          {/* Judul */}
          <TextInput
            label="Judul"
            placeholder="Masukkan judul"
            value={formData.judul}
            onChange={(e) => handleChange("judul", e.target.value)}
            required
          />

          {/* Deskripsi */}
          <Box>
            <Text fz="sm" fw="bold">
              Deskripsi Singkat
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) =>
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }))
              }
            />
          </Box>

          {/* Featured Image */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Utama (Featured)
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
              accept={{ "image/*": ['.jpeg', '.jpg', '.png', '.webp'] }}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={180}>
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
                  alt="Preview Gambar"
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
                  }}
                  style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Box>
            )}
          </Box>

          {/* Gallery Images */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Galeri Dokumentasi (Opsional - Maksimal 10)
            </Text>
            <Dropzone
              onDrop={handleGalleryDrop}
              onReject={() => toast.error("File tidak valid, gunakan format gambar")}
              maxSize={5 * 1024 ** 2}
              accept={{ "image/*": ['.jpeg', '.jpg', '.png', '.webp'] }}
              radius="md"
              p="md"
              multiple
            >
              <Group justify="center" gap="xl" mih={120}>
                <Dropzone.Accept>
                  <IconUpload size={40} color={colors["blue-button"]} stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={40} color="red" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={40} color="#868e96" stroke={1.5} />
                </Dropzone.Idle>
              </Group>
              <Text ta="center" mt="sm" size="xs" c="dimmed">
                Seret gambar untuk menambahkan ke galeri
              </Text>
            </Dropzone>

            {/* Existing Gallery Images */}
            {existingGalleryImages.length > 0 && (
              <Box mt="sm">
                <Text fz="xs" fw="bold" mb={6} c="dimmed">
                  Gambar Existing ({existingGalleryImages.length})
                </Text>
                <Grid gutter="sm">
                  {existingGalleryImages.map((img, index) => (
                    <Grid.Col span={4} key={img.id}>
                      <Card p="xs" radius="md" withBorder>
                        <Image src={img.link} alt={img.name} radius="sm" height={100} fit="cover" />
                        <ActionIcon
                          variant="filled"
                          color="red"
                          radius="xl"
                          size="sm"
                          pos="absolute"
                          top={5}
                          right={5}
                          onClick={() => removeGalleryImage(index, true)}
                          style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              </Box>
            )}

            {/* New Gallery Images */}
            {galleryPreviews.length > 0 && (
              <Box mt="sm">
                <Text fz="xs" fw="bold" mb={6} c="dimmed">
                  Gambar Baru ({galleryPreviews.length})
                </Text>
                <Grid gutter="sm">
                  {galleryPreviews.map((preview, index) => (
                    <Grid.Col span={4} key={index}>
                      <Card p="xs" radius="md" withBorder>
                        <Image src={preview} alt={`New ${index}`} radius="sm" height={100} fit="cover" />
                        <ActionIcon
                          variant="filled"
                          color="red"
                          radius="xl"
                          size="sm"
                          pos="absolute"
                          top={5}
                          right={5}
                          onClick={() => removeGalleryImage(index, false)}
                          style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>

          {/* YouTube Video */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Link Video YouTube (Opsional)
            </Text>
            <TextInput
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.currentTarget.value)}
              leftSection={<IconVideo size={18} />}
              rightSection={
                youtubeLink && (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={() => setYoutubeLink('')}
                  >
                    <IconX size={18} />
                  </ActionIcon>
                )
              }
            />
            {embedLink && (
              <Box mt="sm" pos="relative">
                <iframe
                  style={{
                    borderRadius: 10,
                    width: '100%',
                    height: 250,
                    border: '1px solid #ddd',
                  }}
                  src={embedLink}
                  title="Preview Video"
                  allowFullScreen
                />
              </Box>
            )}
          </Box>

          {/* Konten */}
          <Box>
            <Text fz="sm" fw="bold">
              Konten
            </Text>
            <EditEditor
              value={formData.content}
              onChange={(htmlContent) =>
                setFormData((prev) => ({ ...prev, content: htmlContent }))
              }
            />
          </Box>

          {/* Action Buttons */}
          <Group justify="right">
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

export default EditKesejahteraan;
