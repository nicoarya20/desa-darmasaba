'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  MultiSelect,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import statePolsekTerdekat from '../../../../_state/keamanan/polsek-terdekat';

function CreatePolsekTerdekat() {
  const polsekState = useProxy(statePolsekTerdekat.polsekTerdekatState);
  // Snapshot cabang layananPolsek agar Select re-render saat findManyAll.load()
  // async selesai — JSX sebelumnya baca raw proxy (race intermiten, STG).
  const layananState = useProxy(statePolsekTerdekat.layananPolsek);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      polsekState.create.form.nama?.trim() !== '' &&
      polsekState.create.form.jarakKeDesa?.trim() !== '' &&
      polsekState.create.form.alamat?.trim() !== '' &&
      polsekState.create.form.nomorTelepon?.trim() !== '' &&
      polsekState.create.form.layananPolsekId.length > 0
    );
  };

  useEffect(() => {
    statePolsekTerdekat.layananPolsek.findManyAll.load();
  }, []);

  const resetForm = () => {
    polsekState.create.form = {
      nama: "",
      jarakKeDesa: "",
      alamat: "",
      nomorTelepon: "",
      jamOperasional: "",
      embedMapUrl: "",
      namaTempatMaps: "",
      alamatMaps: "",
      linkPetunjukArah: "",
      layananPolsekId: [],
    };
  };

  const isValidGoogleMapsEmbed = (url: string): boolean => {
    try {
      const u = new URL(url);
      return (
        u.hostname === 'www.google.com' &&
        u.pathname === '/maps/embed' &&
        u.searchParams.has('pb')
      );
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    const { embedMapUrl } = polsekState.create.form;

    // ✅ Validasi Google Maps Embed URL (jika diisi)
    if (embedMapUrl && !isValidGoogleMapsEmbed(embedMapUrl)) {
      toast.error("URL embed peta tidak valid. Harap paste iframe dari Google Maps.");
      return;
    }

    try {
      setIsSubmitting(true);
      await polsekState.create.create();
      resetForm();
      router.push("/admin/keamanan/polsek-terdekat/daftar-polsek-terdekat");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menambah polsek terdekat");
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractEmbedUrl = (input: string): string => {
    // Jika sudah berupa URL embed yang valid
    if (input.startsWith('https://www.google.com/maps/embed?')) {
      return input.trim();
    }

    // Coba parse sebagai HTML string (iframe)
    const iframeRegex = /<iframe[^>]*src=["']([^"']*)["'][^>]*>/i;
    const match = input.match(iframeRegex);
    if (match && match[1]?.startsWith('https://www.google.com/maps/embed?')) {
      return match[1].trim();
    }

    // Jika tidak cocok, kembalikan input asli (atau string kosong)
    return input.trim();
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button
          variant="subtle"
          onClick={() => router.back()}
          p="xs"
          radius="md"
        >
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Polsek Terdekat
        </Title>
      </Group>

      {/* Form */}
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
            value={polsekState.create.form.nama}
            onChange={(val) => (polsekState.create.form.nama = val.target.value)}
            label={<Text fw="bold" fz="sm">Nama Polsek Terdekat</Text>}
            placeholder="Masukkan nama Polsek Terdekat"
            required
          />
          <TextInput
            value={polsekState.create.form.jarakKeDesa}
            onChange={(val) => (polsekState.create.form.jarakKeDesa = val.target.value)}
            label={<Text fw="bold" fz="sm">Jarak Polsek Terdekat</Text>}
            placeholder="Masukkan jarak Polsek Terdekat"
            required
          />
          <TextInput
            value={polsekState.create.form.alamat}
            onChange={(val) => (polsekState.create.form.alamat = val.target.value)}
            label={<Text fw="bold" fz="sm">Alamat Polsek Terdekat</Text>}
            placeholder="Masukkan alamat Polsek Terdekat"
            required
          />
          <TextInput
            value={polsekState.create.form.nomorTelepon}
            onChange={(val) => (polsekState.create.form.nomorTelepon = val.target.value)}
            label={<Text fw="bold" fz="sm">Nomor Telepon Polsek Terdekat</Text>}
            placeholder="Masukkan nomor telepon Polsek Terdekat"
            required
          />
          <TextInput
            value={polsekState.create.form.jamOperasional}
            onChange={(val) => (polsekState.create.form.jamOperasional = val.target.value)}
            label={<Text fw="bold" fz="sm">Jam Operasional Polsek Terdekat</Text>}
            placeholder="Masukkan jam operasional Polsek Terdekat"
          />
          <TextInput
            value={polsekState.create.form.embedMapUrl}
            onChange={(e) => {
              const rawValue = e.currentTarget.value;
              const cleanUrl = extractEmbedUrl(rawValue);
              polsekState.create.form.embedMapUrl = cleanUrl;
            }}
            description="Contoh: https://www.google.com/maps/embed?pb=..."
            label={<Text fw="bold" fz="sm">Embed Map URL</Text>}
            placeholder="Paste iframe dari Google Maps atau URL embed langsung"
          />
          <TextInput
            value={polsekState.create.form.namaTempatMaps}
            onChange={(val) => (polsekState.create.form.namaTempatMaps = val.target.value)}
            label={<Text fw="bold" fz="sm">Nama Tempat Maps</Text>}
            placeholder="Masukkan nama tempat maps"
          />
          <TextInput
            value={polsekState.create.form.alamatMaps}
            onChange={(val) => (polsekState.create.form.alamatMaps = val.target.value)}
            label={<Text fw="bold" fz="sm">Alamat Maps</Text>}
            placeholder="Masukkan alamat maps"
          />
          <TextInput
            value={polsekState.create.form.linkPetunjukArah}
            onChange={(val) => (polsekState.create.form.linkPetunjukArah = val.target.value)}
            label={<Text fw="bold" fz="sm">Link Petunjuk Arah</Text>}
            placeholder="Masukkan link petunjuk arah"
          />
          <MultiSelect
            label="Layanan Polsek"
            placeholder="Pilih layanan polsek (bisa lebih dari satu)"
            data={layananState.findManyAll.data?.map((v) => ({
              value: v.id,
              label: v.nama,
            })) || []}
            value={polsekState.create.form.layananPolsekId}
            onChange={(val) => {
              polsekState.create.form.layananPolsekId = val;
            }}
            searchable
            clearable
            nothingFoundMessage="Tidak ada layanan ditemukan"
            required
            error={polsekState.create.form.layananPolsekId?.length === 0 ? "Pilih minimal 1 layanan polsek" : undefined}
          />
          {/* Tombol Submit */}
          <Group justify="right">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={resetForm}
            >
              Reset
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

export default CreatePolsekTerdekat;
