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
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import cctvState from '../../../../_state/keamanan/cctv';

const DEFAULT_CENTER = { lat: -8.5712, lng: 115.1923 };

const LeafletMapEdit = dynamic(
  () => import('../../../../_com/leafletMapEdit'),
  { ssr: false, loading: () => <Skeleton height={300} radius="md" /> }
);

function EditCctv() {
  const router = useRouter();
  const state = useProxy(cctvState);
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    setLoaded(true);
    cctvState.edit.load(params?.id as string);
  }

  const isFormValid = () => {
    const f = state.edit.form;
    return f.kode.trim() !== '' && f.nama.trim() !== '' && f.lokasi.trim() !== '';
  };

  const mapCenter = {
    lat: state.edit.form.latitude ? Number(state.edit.form.latitude) : DEFAULT_CENTER.lat,
    lng: state.edit.form.longitude ? Number(state.edit.form.longitude) : DEFAULT_CENTER.lng,
  };

  const hasCoord = !!state.edit.form.latitude && !!state.edit.form.longitude;

  const handleMapChange = (pos: { lat: number; lng: number }) => {
    cctvState.edit.form.latitude = String(pos.lat);
    cctvState.edit.form.longitude = String(pos.lng);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      cctvState.edit.id = params?.id as string;
      await cctvState.edit.update();
      router.push(`/admin/keamanan/cctv/${params?.id}`);
    } catch (error) {
      console.error('Gagal update CCTV:', error);
      toast.error('Gagal memperbarui CCTV');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (state.edit.loading && !state.edit.form.kode) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">Edit CCTV</Title>
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
            value={state.edit.form.kode}
            onChange={(e) => { cctvState.edit.form.kode = e.currentTarget.value; }}
            required
          />

          <TextInput
            label={<Text fw="bold" fz="sm">Nama / Deskripsi</Text>}
            placeholder="Contoh: Balai Desa"
            value={state.edit.form.nama}
            onChange={(e) => { cctvState.edit.form.nama = e.currentTarget.value; }}
            required
          />

          <TextInput
            label={<Text fw="bold" fz="sm">Lokasi</Text>}
            placeholder="Contoh: Jl. Raya Darmasaba No. 1"
            value={state.edit.form.lokasi}
            onChange={(e) => { cctvState.edit.form.lokasi = e.currentTarget.value; }}
            required
          />

          <Box>
            <Group mb={6} gap={6}>
              <Text fw="bold" fz="sm">Titik Lokasi di Peta</Text>
              <Text fz="xs" c="dimmed">(klik pada peta untuk memindahkan posisi)</Text>
            </Group>
            <Box style={{ height: 300, borderRadius: 8, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
              <LeafletMapEdit
                initialPosition={mapCenter}
                onChange={handleMapChange}
              />
            </Box>
            {hasCoord && (
              <Group mt={6} gap={4}>
                <IconMapPin size={14} color="green" />
                <Text fz="xs" c="green">
                  Posisi: {Number(state.edit.form.latitude).toFixed(6)}, {Number(state.edit.form.longitude).toFixed(6)}
                </Text>
              </Group>
            )}
          </Box>

          <Select
            label={<Text fw="bold" fz="sm">Status</Text>}
            value={state.edit.form.status}
            onChange={(val) => { cctvState.edit.form.status = (val as 'Online' | 'Offline') ?? 'Online'; }}
            data={[
              { value: 'Online', label: 'Online' },
              { value: 'Offline', label: 'Offline' },
            ]}
            required
          />

          <DateTimePicker
            label={<Text fw="bold" fz="sm">Terakhir Aktif</Text>}
            value={state.edit.form.lastActive ? new Date(state.edit.form.lastActive) : new Date()}
            onChange={(val) => {
              cctvState.edit.form.lastActive = val ? new Date(val).toISOString() : new Date().toISOString();
            }}
          />

          <Group justify="right">
            <Button variant="outline" color="gray" radius="md" onClick={() => router.back()}>
              Batal
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

export default EditCctv;
