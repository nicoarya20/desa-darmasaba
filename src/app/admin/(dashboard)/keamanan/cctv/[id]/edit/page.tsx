'use client'
import colors from '@/con/colors';
import {
  Alert,
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
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import TitikPetaInput from '../../../../_com/konten-bersama/titik-peta.input';
import { koordinatDariTeks } from '../../../../_com/konten-bersama/titik-peta.logic';
import { useAlamatTitik } from '../../../../_com/konten-bersama/use-alamat-titik';
import cctvState from '../../../../_state/keamanan/cctv';
import { statusMuatEdit } from './edit-cctv.logic';

function EditCctv() {
  const router = useRouter();
  const state = useProxy(cctvState, { sync: true }); // sync: cegah caret jump di controlled input
  const id = useParams()?.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dimuatUntuk, setDimuatUntuk] = useState<string | null>(null);
  const alamatTitik = useAlamatTitik(() => cctvState.edit.form, state.edit.form.nama);

  useEffect(() => {
    setDimuatUntuk(id);
    void cctvState.edit.load(id);
  }, [id]);

  const status = statusMuatEdit({
    dimulai: dimuatUntuk === id,
    memuat: state.edit.memuat,
    idTermuat: state.edit.id,
    idHalaman: id,
  });

  const isFormValid = () => {
    const f = state.edit.form;
    return f.kode.trim() !== '' && f.nama.trim() !== '' && f.lokasi.trim() !== '';
  };

  const koordinat = koordinatDariTeks(state.edit.form.latitude, state.edit.form.longitude);

  const handleMapChange = (pos: { lat: number; lng: number }) => {
    cctvState.edit.form.latitude = String(pos.lat);
    cctvState.edit.form.longitude = String(pos.lng);
  };

  const handleSubmit = async () => {
    if (status !== 'siap') return;
    try {
      setIsSubmitting(true);
      await cctvState.edit.update();
      router.push(`/admin/keamanan/cctv/${id}`);
    } catch (error) {
      console.error('Gagal update CCTV:', error);
      toast.error('Gagal memperbarui CCTV');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'memuat') {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  if (status === 'gagal') {
    return (
      <Stack p="md" gap="sm" maw={560}>
        <Alert color="red">Data CCTV tidak ditemukan atau gagal dimuat.</Alert>
        <Group>
          <Button variant="outline" color="gray" radius="md" onClick={() => router.push('/admin/keamanan/cctv')}>
            Kembali ke daftar CCTV
          </Button>
          <Button radius="md" onClick={() => void cctvState.edit.load(id)}>
            Coba lagi
          </Button>
        </Group>
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
            description={alamatTitik.deskripsiNama}
            required
          />

          <TextInput
            label={<Text fw="bold" fz="sm">Lokasi</Text>}
            placeholder="Contoh: Jl. Raya Darmasaba No. 1"
            value={state.edit.form.lokasi}
            onChange={(e) => { cctvState.edit.form.lokasi = e.currentTarget.value; }}
            required
          />

          <TitikPetaInput
            koordinat={koordinat}
            onKoordinatChange={handleMapChange}
            alamat={state.edit.form.lokasi}
            onAlamatTitik={alamatTitik.onAlamatTitik}
          />

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
