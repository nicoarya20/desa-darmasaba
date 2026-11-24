'use client'
import { Stack, Tabs } from '@mantine/core';
import { PROFIL_PERORANGAN_PPID_TAMPIL } from '@/con/profil-ppid';
import ProfilLembagaTab from './_com/lembaga/ProfilLembagaTab';
import ProfilPeroranganPreview from './_com/ProfilPeroranganPreview';

/**
 * Menu Profil PPID di admin: profil lembaga (baru) dan profil perorangan pimpinan (lama, tidak berubah).
 * Tab perorangan disembunyikan sementara (src/con/profil-ppid.ts); tanpa tab lain, profil lembaga tampil langsung.
 */
function Page() {
  if (!PROFIL_PERORANGAN_PPID_TAMPIL) return <ProfilLembagaTab />;
  return (
    <Tabs defaultValue="lembaga" keepMounted={false}>
      <Stack gap="md">
        <Tabs.List>
          <Tabs.Tab value="lembaga">Profil Lembaga</Tabs.Tab>
          <Tabs.Tab value="perorangan">Profil Perorangan</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="lembaga">
          <ProfilLembagaTab />
        </Tabs.Panel>
        <Tabs.Panel value="perorangan">
          <ProfilPeroranganPreview />
        </Tabs.Panel>
      </Stack>
    </Tabs>
  );
}

export default Page;
