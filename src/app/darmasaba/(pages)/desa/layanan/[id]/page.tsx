/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import { Box, Button, Center, Container, Group, Image, Modal, Paper, Select, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../_com/BackButto';
import { useDisclosure } from '@mantine/hooks';
import { toast } from 'react-toastify';

interface LayananData {
  id: string;
  name: string;
  deskripsi: string;
  imageId: string;
  image2Id: string;
  image?: {
    id: string;
    link: string;
  };
  image2?: {
    id: string;
    link: string;
  };
}

function Page() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const state = useProxy(stateLayananDesa);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LayananData | null>(null);

  const [opened, { open, close }] = useDisclosure(false);
  const stateCreate = useProxy(stateLayananDesa.ajukanPermohonan, { sync: true }); // sync: caret input controlled tak loncat

  // Tandai field yang sudah disentuh (blur) agar pesan error tidak langsung
  // merah saat modal pertama kali dibuka.
  const [touched, setTouched] = useState({
    nama: false,
    nik: false,
    alamat: false,
    nomorKk: false,
    kategori: false,
  });


  useEffect(() => {
    state.suratKeterangan.findManyAll.load()
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        await state.suratKeterangan.findUnique.load(id);
        const result = state.suratKeterangan.findUnique.data as unknown as LayananData;
        setData(result);
      } catch (error) {
        console.error('Terjadi kesalahan saat memuat data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const resetForm = () => {
    stateCreate.create.form = {
      nama: '',
      nik: '',
      alamat: '',
      nomorKk: '',
      kategoriId: '',
    }
    setTouched({ nama: false, nik: false, alamat: false, nomorKk: false, kategori: false });
  }

  // Pesan error per field (hanya tampil setelah field disentuh).
  const f = stateCreate.create.form;
  const namaError =
    touched.nama && !(f.nama || '').trim()
      ? 'Nama wajib diisi'
      : null;
  const nikError = touched.nik
    ? (f.nik || '').length === 0
      ? 'NIK wajib diisi'
      : (f.nik || '').length !== 16
        ? 'NIK harus terdiri dari 16 digit'
        : null
    : null;
  const alamatError =
    touched.alamat && !(f.alamat || '').trim()
      ? 'Alamat wajib diisi'
      : null;
  const nomorKkError = touched.nomorKk
    ? (f.nomorKk || '').length === 0
      ? 'Nomor KK wajib diisi'
      : (f.nomorKk || '').length !== 16
        ? 'Nomor KK harus terdiri dari 16 digit'
        : null
    : null;
  const kategoriError =
    touched.kategori && !f.kategoriId
      ? 'Kategori wajib dipilih'
      : null;

  // Tombol Simpan aktif hanya bila semua syarat terpenuhi.
  const isFormValid = () =>
    !!(f.nama || '').trim() &&
    (f.nik || '').length === 16 &&
    !!(f.alamat || '').trim() &&
    (f.nomorKk || '').length === 16 &&
    !!f.kategoriId;

  const handleSubmit = async () => {
    const f = stateCreate.create.form;
    if (!f.nama?.trim()) {
      toast.error('Nama wajib diisi');
      return;
    }
    // Nama tidak boleh mengandung angka (nama orang, bukan kode).
    if (/[0-9]/.test(f.nama)) {
      toast.error('Nama tidak boleh mengandung angka');
      return;
    }
    if (f.nik.length !== 16) {
      toast.error('NIK harus terdiri dari 16 digit');
      return;
    }
    if (f.nomorKk.length !== 16) {
      toast.error('Nomor KK harus terdiri dari 16 digit');
      return;
    }
    if (!f.alamat?.trim()) {
      toast.error('Alamat wajib diisi');
      return;
    }
    if (!f.kategoriId) {
      toast.error('Kategori wajib dipilih');
      return;
    }
    await stateCreate.create.create();
    resetForm();
    close();
  }

  if (loading) {
    return (
      <Center h="100vh" bg={colors.Bg}>
        <Skeleton height={500} radius="md" animate />
      </Center>
    );
  }

  if (!data) {
    return (
      <Center h="100vh" bg={colors.Bg}>
        <Text fz="xl" c="dimmed">Maaf, data layanan tidak ditemukan</Text>
      </Center>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="xl">
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container w={{ base: "100%", md: "60%" }}>
        <Text
          fz={{ base: "2rem", md: "2.5rem", lg: "3rem" }}
          ta="center"
          fw="bold"
        >
          {data.name}
        </Text>
      </Container>
      <Box px={{ base: "35", md: 100 }}>
        <Stack gap="md">
          <Text
            dangerouslySetInnerHTML={{ __html: data.deskripsi }}
            fz={{ base: "md", md: "lg" }}
            c="dark.7"
            ta="justify"
            style={{wordBreak: "break-word", whiteSpace: "normal"}}
          />
          {data.image2?.link && (
            <Center>
              <Image
                src={data.image2.link}
                alt={data.name}
                radius="md"
                maw={500}
                mx="auto"
                style={{ boxShadow: '0 0 20px rgba(28,110,164,0.2)' }}
                loading="lazy"
              />
            </Center>
          )}
          <Group justify="center" mt="md">
            <Button
              radius="xl"
              size="lg"
              variant="gradient"
              gradient={{ from: '#1C6EA4', to: '#63B3ED' }}
              onClick={open}
            >
              Ajukan Permohonan
            </Button>
          </Group>
        </Stack>
      </Box>
      <Modal
        opened={opened}
        onClose={close}
        radius={0}
        transitionProps={{ transition: 'fade', duration: 200 }}
      >
        <Paper p="md" withBorder>
          <Stack gap="xs">
            <Title order={3}>Ajukan Permohonan</Title>
            <TextInput
              label={<Text span fz="sm" fw="bold">Nama</Text>}
              placeholder="Masukkan nama"
              withAsterisk
              error={namaError}
              value={stateCreate.create.form.nama || ''}
              // Tolak angka saat mengetik — nama orang tidak memuat digit.
              onChange={(val) => (stateCreate.create.form.nama = val.target.value.replace(/[0-9]/g, ''))}
              onBlur={() => setTouched((t) => ({ ...t, nama: true }))}
            />
            <TextInput
              inputMode="numeric"
              maxLength={16}
              label={<Text span fz="sm" fw="bold">NIK</Text>}
              placeholder="Masukkan NIK"
              withAsterisk
              error={nikError}
              value={stateCreate.create.form.nik || ''}
              onChange={(val) => (stateCreate.create.form.nik = val.target.value.replace(/\D/g, '').slice(0, 16))}
              onBlur={() => setTouched((t) => ({ ...t, nik: true }))}
            />
            <TextInput
              label={<Text span fz="sm" fw="bold">Alamat</Text>}
              placeholder="Masukkan alamat"
              withAsterisk
              error={alamatError}
              value={stateCreate.create.form.alamat || ''}
              onChange={(val) => (stateCreate.create.form.alamat = val.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, alamat: true }))}
            />
            <TextInput
              inputMode="numeric"
              maxLength={16}
              label={<Text span fz="sm" fw="bold">Nomor KK</Text>}
              placeholder="Masukkan Nomor KK"
              withAsterisk
              error={nomorKkError}
              value={stateCreate.create.form.nomorKk || ''}
              onChange={(val) => (stateCreate.create.form.nomorKk = val.target.value.replace(/\D/g, '').slice(0, 16))}
              onBlur={() => setTouched((t) => ({ ...t, nomorKk: true }))}
            />
            <Select
              label="Kategori"
              placeholder="Pilih kategori"
              // Baca via snapshot `state` (bukan raw proxy `stateLayananDesa`) agar
              // komponen re-render saat findManyAll.load() selesai async — kalau baca
              // raw proxy, Select tak subscribe & tetap kosong bila modal dibuka
              // sebelum fetch kelar (race intermiten, lebih sering muncul di STG).
              data={state.suratKeterangan.findManyAll.data?.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
              value={stateCreate.create.form.kategoriId || null}
              error={kategoriError}
              onChange={(val: string | null) => {
                if (val) {
                  // Cari di findManyAll (sumber data dropdown), bukan findMany
                  // (list berpaginasi) — sebelumnya mismatch bikin item tak ketemu.
                  const selected = state.suratKeterangan.findManyAll.data?.find(
                    (item) => item.id === val
                  );
                  if (selected) {
                    stateCreate.create.form.kategoriId = selected.id;
                  }
                } else {
                  stateCreate.create.form.kategoriId = '';
                }
              }}
              onBlur={() => setTouched((t) => ({ ...t, kategori: true }))}
              // searchable
              clearable
              nothingFoundMessage="Tidak ditemukan"
              required
            />
            <Button bg={colors['blue-button']} onClick={handleSubmit} disabled={!isFormValid()}>
              Simpan
            </Button>
          </Stack>
        </Paper>
      </Modal>
    </Stack>
  );
}

export default Page;
