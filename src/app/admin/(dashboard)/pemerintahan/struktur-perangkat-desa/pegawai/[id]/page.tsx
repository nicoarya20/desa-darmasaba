'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import { ModalKonfirmasiNonAktif } from '@/app/admin/(dashboard)/_com/modalNonaktif';
import { PegawaiDetail } from '@/app/admin/(dashboard)/_com/struktur-organisasi/PegawaiDetail';
import { namaDenganGelar } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.logic';
import { STRUKTUR_ADMIN_TEXT as TA } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.text';
import { statePegawaiPerangkat } from '@/app/admin/(dashboard)/_state/desa/struktur-perangkat';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { STRUKTUR_PERANGKAT_ROUTES as R } from '../../_com/struktur-perangkat.routes';
import { STRUKTUR_PERANGKAT_ADMIN_TEXT as T } from '../../_com/struktur-perangkat.text';

/** Ubah status aktif lewat update (state tidak punya endpoint khusus): muat → balik status → kirim semua field. */
async function toggleAktif(id: string): Promise<boolean> {
  const state = statePegawaiPerangkat.update;
  if (!(await state.load(id))) return false;
  state.form.isActive = !state.form.isActive;
  const ok = await state.submit();
  state.resetForm();
  await statePegawaiPerangkat.findUnique.load(id);
  return ok;
}

/** Detail perangkat desa + edit, hapus (konfirmasi), dan aktif/nonaktifkan. */
export default function DetailPegawaiPerangkatPage() {
  const router = useRouter();
  const id = String(useParams()?.id ?? '');
  const detail = useSnapshot(statePegawaiPerangkat.findUnique);
  const { loading: hapusLoading } = useSnapshot(statePegawaiPerangkat.delete);
  const [modal, setModal] = useState<'hapus' | 'status' | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  useEffect(() => {
    void statePegawaiPerangkat.findUnique.load(id).then(() => setLoadedId(id));
  }, [id]);

  // Abaikan data pegawai lain yang masih tersisa di state selama id ini dimuat.
  const data = detail.data?.id === id ? detail.data : null;
  if (!data) {
    if (loadedId === id) return <Text c="dimmed" py="xl" ta="center">{TA.pegawai.tidakDitemukan}</Text>;
    return <Skeleton height={480} radius="md" />;
  }

  const hapus = async () => {
    if (await statePegawaiPerangkat.delete.byId(id)) router.push(R.pegawai);
    setModal(null);
  };
  const ubahStatus = async () => {
    setStatusLoading(true);
    await toggleAktif(id);
    setStatusLoading(false);
    setModal(null);
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Button variant="subtle" mb="sm" onClick={() => router.push(R.pegawai)} aria-label={TA.back}>
        <IconArrowBack color={colors['blue-button']} size={25} />
      </Button>
      <Paper withBorder w={{ base: '100%', md: '75%' }} bg={colors['white-1']} p="lg" radius="md" shadow="sm">
        <Stack gap="md">
          <Text fz="xl" fw="bold" c={colors['blue-button']}>{T.pegawai.detailTitle}</Text>
          <Text fz="lg" fw={600}>{namaDenganGelar(data.namaLengkap, data.gelarAkademik)}</Text>
          <PegawaiDetail data={data} />
          <Group gap="sm">
            <Button color="green" variant="light" leftSection={<IconEdit size={18} />} onClick={() => router.push(R.pegawaiEdit(id))}>
              {TA.edit}
            </Button>
            <Button color={data.isActive ? 'orange' : 'teal'} variant="light" onClick={() => setModal('status')}>
              {data.isActive ? TA.nonaktifkan : TA.aktifkan}
            </Button>
            <Button color="red" variant="light" leftSection={<IconTrash size={18} />} onClick={() => setModal('hapus')}>
              {TA.delete}
            </Button>
          </Group>
        </Stack>
      </Paper>

      <ModalKonfirmasiHapus
        opened={modal === 'hapus'}
        loading={hapusLoading}
        onClose={() => setModal(null)}
        onConfirm={() => void hapus()}
        text={T.pegawai.hapusKonfirmasi}
      />
      <ModalKonfirmasiNonAktif
        opened={modal === 'status'}
        loading={statusLoading}
        onClose={() => setModal(null)}
        onConfirm={() => void ubahStatus()}
        title={data.isActive ? T.pegawai.nonaktifTitle : T.pegawai.aktifTitle}
        text={data.isActive ? T.pegawai.nonaktifKonfirmasi : T.pegawai.aktifKonfirmasi}
        confirmLabel={data.isActive ? TA.nonaktifkan : TA.aktifkan}
        confirmColor={data.isActive ? 'red' : 'green'}
      />
    </Box>
  );
}
