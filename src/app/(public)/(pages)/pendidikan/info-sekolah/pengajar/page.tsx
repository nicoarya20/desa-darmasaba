'use client';
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import colors from '@/con/colors';
import { IconMicroscope } from '@tabler/icons-react';
import { Suspense } from 'react';
import { useSnapshot } from 'valtio';
import { InfoSekolahListPanel } from '../_com/InfoSekolahListPanel';
import { useInfoSekolahLoad, useJenjangNames } from '../_com/use-info-sekolah-data';
import { useInfoSekolahQuery } from '../_com/use-info-sekolah-query';

function PengajarList() {
  const { query, setJenjang, setSearch, setPage } = useInfoSekolahQuery();
  const state = infoSekolahPaud.pengajar.findMany;
  const list = useSnapshot(state);
  const jenjangNames = useJenjangNames();
  useInfoSekolahLoad(state, query);

  return (
    <InfoSekolahListPanel
      title="Daftar Pengajar"
      icon={<IconMicroscope size={28} stroke={1.5} color={colors['blue-button']} />}
      noun="pengajar"
      columns={[
        { header: 'Nama Pengajar', width: '30%', render: (row) => row.nama },
        { header: 'Nama Lembaga', width: '30%', render: (row) => row.lembaga.nama },
        { header: 'Mengajar Di Jenjang Pendidikan', width: '40%', render: (row) => row.lembaga.jenjangPendidikan?.nama ?? '-' },
      ]}
      rows={list.data}
      loading={list.loading}
      total={list.total}
      totalPages={list.totalPages}
      query={query}
      jenjangNames={jenjangNames}
      onJenjang={setJenjang}
      onSearch={setSearch}
      onPage={setPage}
    />
  );
}

/** Daftar pengajar; jenjang, pencarian, dan halaman dibaca dari URL. */
export default function Page() {
  // useSearchParams (hook query) → wajib di dalam Suspense.
  return (
    <Suspense>
      <PengajarList />
    </Suspense>
  );
}
