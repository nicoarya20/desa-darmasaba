'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import layananonlineDesa from '@/app/admin/(dashboard)/_state/inovasi/layanan-online-desa';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, Group, Image, Modal, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconImageInPicture, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

type PengaduanMasyarakatModalProps = {
  opened: boolean;
  onClose: () => void;
};

/** Modal form pengaduan masyarakat publik (validasi, upload gambar, submit) — dipakai halaman layanan online desa & footer. */
function PengaduanMasyarakatModal({ opened, onClose }: PengaduanMasyarakatModalProps) {
  const state = useProxy(layananonlineDesa, { sync: true }); // sync: caret input controlled tak loncat
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Tandai field yang sudah disentuh agar pesan error tidak langsung merah
  // saat modal pertama kali dibuka.
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    nomorTelepon: false,
    nik: false,
    judulPengaduan: false,
    lokasiKejadian: false,
    deskripsiPengaduan: false,
    jenisPengaduanId: false,
    gambar: false,
  });

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Pesan error per field — hanya muncul setelah field disentuh (touched).
  const f = state.pengaduanMasyarakat.create.form;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const nameError =
    touched.name && !(f.name || '').trim() ? 'Nama wajib diisi' : null;
  const emailError = touched.email
    ? !(f.email || '').trim()
      ? 'Email wajib diisi'
      : !emailRegex.test((f.email || '').trim())
        ? 'Format email tidak valid'
        : null
    : null;
  const nomorTeleponError =
    touched.nomorTelepon && !(f.nomorTelepon || '').trim()
      ? 'Nomor telepon wajib diisi'
      : null;
  const nikError = touched.nik
    ? (f.nik || '').length === 0
      ? 'NIK wajib diisi'
      : (f.nik || '').length !== 16
        ? 'NIK harus terdiri dari 16 digit'
        : null
    : null;
  const judulError =
    touched.judulPengaduan && !(f.judulPengaduan || '').trim()
      ? 'Judul pengaduan wajib diisi'
      : null;
  const lokasiError =
    touched.lokasiKejadian && !(f.lokasiKejadian || '').trim()
      ? 'Lokasi kejadian wajib diisi'
      : null;
  const deskripsiError =
    touched.deskripsiPengaduan && isHtmlEmpty(f.deskripsiPengaduan || '')
      ? 'Deskripsi wajib diisi'
      : null;
  const jenisError =
    touched.jenisPengaduanId && !(f.jenisPengaduanId || '').trim()
      ? 'Jenis pengaduan wajib dipilih'
      : null;
  const gambarError = touched.gambar && !file ? 'Gambar wajib diunggah' : null;

  // Tombol Simpan aktif hanya bila semua syarat terpenuhi.
  const isFormValid = () =>
    !!(f.name || '').trim() &&
    emailRegex.test((f.email || '').trim()) &&
    !!(f.nomorTelepon || '').trim() &&
    (f.nik || '').length === 16 &&
    !!(f.judulPengaduan || '').trim() &&
    !!(f.lokasiKejadian || '').trim() &&
    !isHtmlEmpty(f.deskripsiPengaduan || '') &&
    !!(f.jenisPengaduanId || '').trim() &&
    file !== null;

  useEffect(() => {
    // ✅ Panggil load data jenis layanan dari backend
    if (!state.jenisPengaduan.findMany.data) {
      state.jenisPengaduan.findMany.load();
    }
    // Sengaja hanya saat mount: state Valtio global, load ulang cukup sekali.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    state.pengaduanMasyarakat.create.form = {
      name: '',
      email: '',
      nomorTelepon: '',
      nik: '',
      judulPengaduan: '',
      lokasiKejadian: '',
      deskripsiPengaduan: '',
      jenisPengaduanId: '',
      imageId: '',
    };
  };

  const resetAll = () => {
    resetForm();
    setFile(null);
    setPreviewImage(null);
    setTouched({
      name: false,
      email: false,
      nomorTelepon: false,
      nik: false,
      judulPengaduan: false,
      lokasiKejadian: false,
      deskripsiPengaduan: false,
      jenisPengaduanId: false,
      gambar: false,
    });
  };


  const handleSubmit = async () => {
    if (!file) {
      return toast.error("Silahkan pilih file gambar terlebih dahulu")
    }

    try {
      // Upload the image first — endpoint publik khusus pengaduan (image-only,
      // tervalidasi). Bukan /fileStorage/create yang admin-only.
      const uploadRes = await ApiFetch.api.inovasi.layananonlinedesa.pengaduanmasyarakat.upload.post({
        file: file,
        name: file.name
      })

      const uploaded = uploadRes.data?.data
      if (!uploaded?.id) {
        return toast.error("Gagal upload gambar")
      }

      // Set the image ID in the form
      state.pengaduanMasyarakat.create.form.imageId = uploaded.id

      // Submit the form
      const success = await state.pengaduanMasyarakat.create.create()

      if (success) {
        resetAll()
        onClose()
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      toast.error("Terjadi kesalahan saat menyimpan data")
    }
  };
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      radius={0}
      transitionProps={{ transition: 'fade', duration: 200 }}
    >
      <Paper p="md" withBorder>
        <Stack gap="xs">
          <Title order={3}>Ajukan Pengaduan Masyarakat</Title>
          <TextInput
            label={<Text span fz="sm" fw="bold">Nama</Text>}
            placeholder="Masukkan nama"
            withAsterisk
            error={nameError}
            value={state.pengaduanMasyarakat.create.form.name || ''}
            onChange={(val) => (state.pengaduanMasyarakat.create.form.name = val.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          />
          <TextInput
            label={<Text span fz="sm" fw="bold">Email</Text>}
            placeholder="Masukkan email"
            withAsterisk
            error={emailError}
            value={state.pengaduanMasyarakat.create.form.email || ''}
            onChange={(val) => (state.pengaduanMasyarakat.create.form.email = val.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          />
          <TextInput
            inputMode="numeric"
            maxLength={13}
            label={<Text span fz="sm" fw="bold">Nomor Telepon</Text>}
            placeholder="Masukkan nomor telepon"
            withAsterisk
            error={nomorTeleponError}
            value={state.pengaduanMasyarakat.create.form.nomorTelepon || ''}
            onChange={(val) =>
              (state.pengaduanMasyarakat.create.form.nomorTelepon = val.target.value
                .replace(/\D/g, '')
                .slice(0, 13))
            }
            onBlur={() => setTouched((t) => ({ ...t, nomorTelepon: true }))}
          />
          <TextInput
            inputMode="numeric"
            maxLength={16}
            label={<Text span fz="sm" fw="bold">NIK</Text>}
            placeholder="Masukkan nik"
            withAsterisk
            error={nikError}
            value={state.pengaduanMasyarakat.create.form.nik || ''}
            onChange={(val) => (state.pengaduanMasyarakat.create.form.nik = val.target.value.replace(/\D/g, '').slice(0, 16))}
            onBlur={() => setTouched((t) => ({ ...t, nik: true }))}
          />
          <TextInput
            label={<Text span fz="sm" fw="bold">Judul Pengaduan</Text>}
            placeholder="Masukkan judul pengaduan"
            withAsterisk
            error={judulError}
            value={state.pengaduanMasyarakat.create.form.judulPengaduan || ''}
            onChange={(val) => (state.pengaduanMasyarakat.create.form.judulPengaduan = val.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, judulPengaduan: true }))}
          />
          <TextInput
            label={<Text span fz="sm" fw="bold">Lokasi Kejadian</Text>}
            placeholder="Masukkan lokasi kejadian"
            withAsterisk
            error={lokasiError}
            value={state.pengaduanMasyarakat.create.form.lokasiKejadian || ''}
            onChange={(val) => (state.pengaduanMasyarakat.create.form.lokasiKejadian = val.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, lokasiKejadian: true }))}
          />
          <Box>
            <Text span fz={"sm"} fw={"bold"}>Deskripsi <Text span c="red">*</Text></Text>
            <CreateEditor
              value={state.pengaduanMasyarakat.create.form.deskripsiPengaduan}
              onChange={(htmlContent) => {
                state.pengaduanMasyarakat.create.form.deskripsiPengaduan = htmlContent;
                setTouched((t) => ({ ...t, deskripsiPengaduan: true }));
              }}
            />
            {deskripsiError && (
              <Text fz="xs" c="red" mt={4}>{deskripsiError}</Text>
            )}
          </Box>
          <Select
            value={state.pengaduanMasyarakat.create.form.jenisPengaduanId || null}
            onChange={(val) => {
              state.pengaduanMasyarakat.create.form.jenisPengaduanId = val ?? "";
              setTouched((t) => ({ ...t, jenisPengaduanId: true }));
            }}
            onBlur={() => setTouched((t) => ({ ...t, jenisPengaduanId: true }))}
            label={<Text span fw={"bold"} fz={"sm"}>Jenis Pengaduan</Text>}
            placeholder="Pilih jenis pengaduan"
            withAsterisk
            error={jenisError}
            data={
              state.jenisPengaduan.findMany.data?.map((v) => ({
                value: v.id,
                label: v.nama,
              })) || []
            }
          />
          <Box>
            <Text span fz={"md"} fw={"bold"}>Gambar <Text span c="red">*</Text></Text>
            <Box>
              <Stack gap="xs">
                <Dropzone
                  onDrop={(files) => {
                    const selectedFile = files[0]; // Ambil file pertama
                    if (selectedFile) {
                      setFile(selectedFile);
                      setPreviewImage(URL.createObjectURL(selectedFile)); // Buat preview
                    }
                    setTouched((t) => ({ ...t, gambar: true }));
                  }}
                  onReject={() => {
                    setTouched((t) => ({ ...t, gambar: true }));
                    toast.error('File tidak valid.');
                  }}
                  maxSize={5 * 1024 ** 2} // Maks 5MB
                  accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
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
                        Drag images here or click to select files
                      </Text>
                      <Text size="sm" c="dimmed" inline mt={7}>
                        Attach as many files as you like, each file should not exceed 5mb
                      </Text>
                    </div>
                  </Group>
                </Dropzone>
                {previewImage ? (
                  <Image alt="" src={previewImage} w={200} h={200} loading="lazy" />
                ) : (
                  <Center w={200} h={200} bg={"gray"}>
                    <IconImageInPicture />
                  </Center>
                )}
                {gambarError && (
                  <Text fz="xs" c="red">{gambarError}</Text>
                )}
              </Stack>
            </Box>
          </Box>

          <Button 
            bg={colors['blue-button']} 
            onClick={handleSubmit}
            disabled={!isFormValid()}
          >
            Simpan
          </Button>
        </Stack>
      </Paper>
    </Modal>
  );
}

export default PengaduanMasyarakatModal;
