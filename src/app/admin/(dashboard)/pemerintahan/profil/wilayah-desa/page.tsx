'use client';

import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import {
  toWilayahFormValues,
  type WilayahDesaFormValues,
} from '@/app/admin/(dashboard)/_state/desa/profile/wilayah-desa';
import colors from '@/con/colors';
import {
  Alert,
  Box,
  Button,
  Center,
  Group,
  Loader,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useSnapshot } from 'valtio';

const state = stateProfileDesa.wilayahDesa;
const EMPTY_FORM = toWilayahFormValues(null);
const REQUIRED_KEYS = ['batasUtara', 'batasSelatan', 'batasTimur', 'batasBarat'] as const;

/** Form admin "Letak & Batas Wilayah" (singleton: simpan = upsert satu baris). */
function Page() {
  const snap = useSnapshot(state);
  const [form, setForm] = useState<WilayahDesaFormValues>(EMPTY_FORM);
  const [original, setOriginal] = useState<WilayahDesaFormValues>(EMPTY_FORM);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    state.findUnique.load().then((data) => {
      if (!active) return;
      const initial = toWilayahFormValues(data);
      setForm(initial);
      setOriginal(initial);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const setField = <K extends keyof WilayahDesaFormValues>(
    key: K,
    value: WilayahDesaFormValues[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const isValid = REQUIRED_KEYS.every((key) => form[key].trim() !== '');
  const submitting = snap.update.loading;

  const handleSubmit = async () => {
    const success = await state.update.submit(form);
    if (success) setOriginal(form);
  };

  const handleCancel = () => {
    setForm(original);
    toast.info('Form dikembalikan ke data awal');
  };

  if (!ready) {
    return (
      <Center h={300}>
        <Loader color={colors['blue-button']} />
      </Center>
    );
  }

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Stack gap="md">
        {snap.findUnique.error && (
          <Alert icon={<IconAlertCircle size={20} />} color="red" title="Gagal memuat data" radius="md">
            {snap.findUnique.error}
          </Alert>
        )}
        <Paper
          w={{ base: '100%', md: '60%' }}
          bg={colors['white-1']}
          p="xl"
          radius="md"
          shadow="sm"
          style={{ border: '1px solid #e0e0e0' }}
        >
          <Stack gap="lg">
            <Box>
              <Title order={3} mb={4}>Letak & Batas Wilayah</Title>
              <Text size="sm" c="dimmed">
                Ditampilkan di halaman Profil Desa. Kosongkan peta/keterangan bila belum ada.
              </Text>
            </Box>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <TextInput label="Batas Utara" placeholder="Contoh: nama desa/wilayah di utara" required
                value={form.batasUtara} onChange={(e) => setField('batasUtara', e.currentTarget.value)} />
              <TextInput label="Batas Selatan" placeholder="Contoh: nama desa/wilayah di selatan" required
                value={form.batasSelatan} onChange={(e) => setField('batasSelatan', e.currentTarget.value)} />
              <TextInput label="Batas Timur" placeholder="Contoh: nama desa/wilayah di timur" required
                value={form.batasTimur} onChange={(e) => setField('batasTimur', e.currentTarget.value)} />
              <TextInput label="Batas Barat" placeholder="Contoh: nama desa/wilayah di barat" required
                value={form.batasBarat} onChange={(e) => setField('batasBarat', e.currentTarget.value)} />
            </SimpleGrid>

            <NumberInput
              label="Luas Wilayah"
              description="Dalam hektar (ha)"
              placeholder="Isi angka luas"
              min={0}
              decimalScale={2}
              rightSection={<Text size="sm" c="dimmed" pr="xs">ha</Text>}
              rightSectionWidth={40}
              value={form.luasWilayah}
              onChange={(value) => setField('luasWilayah', value)}
            />

            <Textarea
              label="Keterangan"
              placeholder="Catatan tambahan tentang letak & batas wilayah"
              autosize
              minRows={3}
              value={form.keterangan}
              onChange={(e) => setField('keterangan', e.currentTarget.value)}
            />

            <TextInput
              label="URL Peta (Embed)"
              description="Isi hanya alamat src dari kode embed peta, harus diawali https://"
              placeholder="https://www.google.com/maps/embed?pb=..."
              value={form.petaEmbedUrl}
              onChange={(e) => setField('petaEmbedUrl', e.currentTarget.value)}
            />

            <Group justify="right">
              <Button variant="outline" color="gray" radius="md" size="md" onClick={handleCancel}>
                Batal
              </Button>
              <Button
                onClick={handleSubmit}
                radius="md"
                size="md"
                disabled={!isValid || submitting}
                style={{
                  background: !isValid || submitting
                    ? 'linear-gradient(135deg, #cccccc, #eeeeee)'
                    : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                  color: '#fff',
                  boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
                }}
              >
                {submitting ? <Loader size="sm" color="white" /> : 'Simpan'}
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default Page;
