'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Select,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconArrowBack, IconMapPin } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import cctvState from '../../../_state/keamanan/cctv';

// Darmasaba default center
const DEFAULT_CENTER = { lat: -8.5712, lng: 115.1923 };

const LeafletMap = dynamic(
  () => import('../../../_com/leafletMapCreate'),
  { ssr: false, loading: () => <Skeleton height={300} radius="md" /> }
);

function CreateCctv() {
  const router = useRouter();
  const state = useProxy(cctvState, { sync: true }); // sync: cegah caret jump di controlled input
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [markerSet, setMarkerSet] = useState(false);

  const isFormValid = () => {
    const f = state.create.form;
    return f.kode.trim() !== '' && f.nama.trim() !== '' && f.lokasi.trim() !== '';
  };

  const handleMapSelect = (pos: { lat: number; lng: number }) => {
    cctvState.create.form.latitude = String(pos.lat);
    cctvState.create.form.longitude = String(pos.lng);
    setMarkerSet(true);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await cctvState.create.create();
      cctvState.create.resetForm();
      setMarkerSet(false);
      router.push('/admin/keamanan/cctv');
    } catch (error) {
      console.error('Gagal menambahkan CCTV:', error);
      toast.error('Gagal menambahkan CCTV');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">Tambah CCTV</Title>
      </Group>

      <Paper
        w={{ base: '100%', md: '55%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          <TextInput
            label={<Text fw="bold" fz="sm">Kode CCTV</Text>}
            placeholder="Contoh: CCTV-01"
            value={state.create.form.kode}
            onChange={(e) => { cctvState.create.form.kode = e.currentTarget.value; }}
            required
          />

          <TextInput
            label={<Text fw="bold" fz="sm">Nama / Deskripsi</Text>}
            placeholder="Contoh: Balai Desa"
            value={state.create.form.nama}
            onChange={(e) => { cctvState.create.form.nama = e.currentTarget.value; }}
            required
          />

          <TextInput
            label={<Text fw="bold" fz="sm">Lokasi</Text>}
            placeholder="Contoh: Jl. Raya Darmasaba No. 1"
            value={state.create.form.lokasi}
            onChange={(e) => { cctvState.create.form.lokasi = e.currentTarget.value; }}
            required
          />

          <Box>
            <Group mb={6} gap={6}>
              <Text fw="bold" fz="sm">Titik Lokasi di Peta</Text>
              <Text fz="xs" c="dimmed">(klik pada peta untuk menentukan posisi)</Text>
            </Group>
            <Box style={{ height: 300, borderRadius: 8, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
              <LeafletMap
                defaultCenter={DEFAULT_CENTER}
                onSelect={handleMapSelect}
              />
            </Box>
            {markerSet && (
              <Group mt={6} gap={4}>
                <IconMapPin size={14} color="green" />
                <Text fz="xs" c="green">
                  Posisi dipilih: {Number(state.create.form.latitude).toFixed(6)}, {Number(state.create.form.longitude).toFixed(6)}
                </Text>
              </Group>
            )}
          </Box>

          <Select
            label={<Text fw="bold" fz="sm">Status</Text>}
            value={state.create.form.status}
            onChange={(val) => { cctvState.create.form.status = (val as 'Online' | 'Offline') ?? 'Online'; }}
            data={[
              { value: 'Online', label: 'Online' },
              { value: 'Offline', label: 'Offline' },
            ]}
            required
          />

          <DateTimePicker
            label={<Text fw="bold" fz="sm">Terakhir Aktif</Text>}
            value={state.create.form.lastActive ? new Date(state.create.form.lastActive) : new Date()}
            onChange={(val) => {
              cctvState.create.form.lastActive = val ? new Date(val).toISOString() : new Date().toISOString();
            }}
          />

          <Group justify="right">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              onClick={() => { cctvState.create.resetForm(); setMarkerSet(false); }}
            >
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              radius="md"
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? 'linear-gradient(135deg, #cccccc, #eeeeee)'
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79,172,254,0.4)',
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

export default CreateCctv;
