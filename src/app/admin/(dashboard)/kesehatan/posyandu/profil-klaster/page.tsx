'use client'
import profilPosyanduState from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu-profil.state';
import { formDariProfil } from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu-profil.form';
import colors from '@/con/colors';
import { Alert, Button, Paper, Skeleton } from '@mantine/core';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import ProfilKlasterForm from '../_com/profil-klaster.form';

/** Tab admin "Profil & Klaster": deskripsi umum posyandu desa + kegiatan klaster Balita/Remaja/Lansia. */
export default function ProfilKlasterPosyanduPage() {
  const snap = useSnapshot(profilPosyanduState);

  useEffect(() => {
    void profilPosyanduState.load();
  }, []);

  if (snap.gagal) {
    return (
      <Alert color="red" title="Profil posyandu gagal dimuat">
        <Button size="xs" mt="sm" variant="light" color="red" onClick={() => void profilPosyanduState.load()}>
          Coba lagi
        </Button>
      </Alert>
    );
  }
  if (snap.loading || !snap.data) return <Skeleton h={500} radius="md" />;

  return (
    <Paper bg={colors['white-1']} p="lg" radius="md" shadow="sm" withBorder>
      {/* key: form diisi ulang dari data terbaru setelah dimuat/disimpan. */}
      <ProfilKlasterForm key={JSON.stringify(profilPosyanduState.data)} awal={formDariProfil(profilPosyanduState.data)} />
    </Paper>
  );
}
