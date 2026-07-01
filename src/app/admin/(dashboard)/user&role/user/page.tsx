'use client'
import colors from '@/con/colors';
import { Box, ScrollArea, Tabs } from '@mantine/core';
import { IconSearch, IconShieldCheck, IconUsersGroup } from '@tabler/icons-react';
import { useState } from 'react';
import HeaderSearch from '../../_com/header';
import ListUserAdmin from './_com/listUserAdmin';
import ListUserWarga from './_com/listUserWarga';

// Halaman User: dua tab. "Admin" (role 0-4) untuk kelola akun admin; "Warga"
// (role 5, login Google) untuk meng-ACC warga menjadi admin. Filter role
// dilakukan server-side (roleGroup) agar pagination tiap tab akurat.
function User() {
  const [tab, setTab] = useState<string>('admin');
  const [searchAdmin, setSearchAdmin] = useState('');
  const [searchWarga, setSearchWarga] = useState('');

  const isWarga = tab === 'warga';
  const search = isWarga ? searchWarga : searchAdmin;
  const setSearch = isWarga ? setSearchWarga : setSearchAdmin;

  return (
    <Box>
      <HeaderSearch
        title='User'
        placeholder={isWarga ? 'Cari nama / email warga...' : 'Cari nama / email admin...'}
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <Tabs
        value={tab}
        onChange={(v) => setTab(v ?? 'admin')}
        variant="pills"
        color={colors['blue-button']}
        radius="lg"
        mt="md"
      >
        <ScrollArea type="hover">
          <Tabs.List style={{ background: 'linear-gradient(135deg, #e7ebf7, #f9faff)', borderRadius: '1rem', padding: '0.25rem', flexWrap: 'nowrap' }}>
            <Tabs.Tab value="admin" leftSection={<IconShieldCheck size={16} />}>Admin</Tabs.Tab>
            <Tabs.Tab value="warga" leftSection={<IconUsersGroup size={16} />}>Warga</Tabs.Tab>
          </Tabs.List>
        </ScrollArea>

        <Tabs.Panel value="admin">
          <ListUserAdmin search={searchAdmin} />
        </Tabs.Panel>
        <Tabs.Panel value="warga">
          <ListUserWarga search={searchWarga} />
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}

export default User;
