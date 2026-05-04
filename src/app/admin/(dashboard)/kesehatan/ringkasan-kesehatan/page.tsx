'use client';

import colors from '@/con/colors';
import {
  Box,
  Button,
  Divider,
  Group,
  Loader,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import ringkasanKesehatanState from '../../_state/kesehatan/ringkasan-kesehatan/ringkasanKesehatan';

export default function RingkasanKesehatanPage() {
  const router = useRouter();
  const state = useProxy(ringkasanKesehatanState);

  useEffect(() => {
    state.findUnique.load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setField = (key: keyof typeof state.update.form, value: number) => {
    state.update.form[key] = Number.isFinite(value) ? value : 0;
  };

  const handleSubmit = async () => {
    const ok = await state.update.submit();
    if (ok) router.refresh();
  };

  const handleReset = () => {
    state.update.reset();
    if (state.findUnique.data) {
      const d = state.findUnique.data;
      state.update.form = {
        ibuHamilAkh: d.ibuHamilAkh,
        balitaTerdaftar: d.balitaTerdaftar,
        alertStunting: d.alertStunting,
        imunisasiLengkapPct: d.imunisasiLengkapPct,
        pemeriksaanRutinPct: d.pemeriksaanRutinPct,
        giziBaikPct: d.giziBaikPct,
        targetStuntingPct: d.targetStuntingPct,
      };
    }
    toast.info('Form dikembalikan ke data awal');
  };

  const isLoading = state.findUnique.loading;
  const isSubmitting = state.update.loading;

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md" gap="sm">
        <Button variant="subtle" onClick={() => router.back()} radius="md">
          <IconArrowBack size={20} stroke={2} />
        </Button>
        <Title order={3} c="black">Ringkasan Kesehatan Desa</Title>
      </Group>

      <Paper
        withBorder
        w={{ base: '100%', md: '80%' }}
        p="lg"
        radius="md"
        shadow="xl"
        bg="white"
      >
        {isLoading ? (
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        ) : (
          <Stack gap="lg">
            <Box>
              <Text fw={600} mb="xs">KPI Utama</Text>
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <NumberInput
                  label="Ibu Hamil Aktif"
                  description="Jumlah ibu hamil yang aktif tercatat"
                  min={0}
                  value={state.update.form.ibuHamilAkh}
                  onChange={(v) => setField('ibuHamilAkh', Number(v))}
                  radius="md"
                />
                <NumberInput
                  label="Balita Terdaftar"
                  description="Total balita terdaftar di posyandu"
                  min={0}
                  value={state.update.form.balitaTerdaftar}
                  onChange={(v) => setField('balitaTerdaftar', Number(v))}
                  radius="md"
                />
                <NumberInput
                  label="Alert Stunting"
                  description="Jumlah balita kategori alert stunting"
                  min={0}
                  value={state.update.form.alertStunting}
                  onChange={(v) => setField('alertStunting', Number(v))}
                  radius="md"
                />
              </SimpleGrid>
            </Box>

            <Divider />

            <Box>
              <Text fw={600} mb="xs">Statistik Kesehatan (%)</Text>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <NumberInput
                  label="Imunisasi Lengkap"
                  description="Persentase balita imunisasi lengkap (0-100)"
                  min={0}
                  max={100}
                  suffix="%"
                  value={state.update.form.imunisasiLengkapPct}
                  onChange={(v) => setField('imunisasiLengkapPct', Number(v))}
                  radius="md"
                />
                <NumberInput
                  label="Pemeriksaan Rutin"
                  description="Persentase warga pemeriksaan rutin (0-100)"
                  min={0}
                  max={100}
                  suffix="%"
                  value={state.update.form.pemeriksaanRutinPct}
                  onChange={(v) => setField('pemeriksaanRutinPct', Number(v))}
                  radius="md"
                />
                <NumberInput
                  label="Gizi Baik"
                  description="Persentase balita dengan status gizi baik (0-100)"
                  min={0}
                  max={100}
                  suffix="%"
                  value={state.update.form.giziBaikPct}
                  onChange={(v) => setField('giziBaikPct', Number(v))}
                  radius="md"
                />
                <NumberInput
                  label="Target Stunting"
                  description="Target penurunan stunting (0-100)"
                  min={0}
                  max={100}
                  suffix="%"
                  value={state.update.form.targetStuntingPct}
                  onChange={(v) => setField('targetStuntingPct', Number(v))}
                  radius="md"
                />
              </SimpleGrid>
            </Box>

            <Group justify="right">
              <Button
                variant="outline"
                color="gray"
                radius="md"
                size="md"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmit}
                radius="md"
                size="md"
                disabled={isSubmitting}
                style={{
                  background: isSubmitting
                    ? 'linear-gradient(135deg, #cccccc, #eeeeee)'
                    : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                  color: '#fff',
                  boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
                }}
              >
                {isSubmitting ? <Loader size="sm" color="white" /> : 'Simpan'}
              </Button>
            </Group>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
