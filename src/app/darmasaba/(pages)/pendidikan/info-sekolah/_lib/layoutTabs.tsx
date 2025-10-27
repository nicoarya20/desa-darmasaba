/* eslint-disable react-hooks/exhaustive-deps */
// 'use client'
// import colors from '@/con/colors';
// import {
//   ActionIcon,
//   Box,
//   Button,
//   Container,
//   Group,
//   Paper,
//   Stack,
//   Text,
//   VisuallyHidden
// } from '@mantine/core';
// import { IconArrowLeft } from '@tabler/icons-react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import React, { useState } from 'react';

// type LayoutSekolahProps = {
//   title?: string;
//   jenjangPendidikanList?: string[];
//   children: React.ReactNode;
// };

// export default function LayoutSekolah({
//   title = 'Cari Informasi Sekolah',
//   jenjangPendidikanList = ['Semua', 'TK', 'SD', 'SMP', 'SMA'],
//   children,
// }: LayoutSekolahProps) {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const initialJenjangPendidikan = searchParams.get('jenjangPendidikan') || 'Semua';

//   const [jenjangPendidikanAktif, setJenjangPendidikanAktif] = useState(initialJenjangPendidikan);

//   // Cleanup timeout


//   // Handle jenjang pendidikan click
//   const handleJenjangPendidikanChange = (k: string) => {
//     // arahkan langsung ke route jenjang pendidikan
//     if (k.toLowerCase() === 'semua') {
//       setJenjangPendidikanAktif(k);
//       router.push(`/darmasaba/pendidikan/info-sekolah/semua`);
//     } else {
//       setJenjangPendidikanAktif(k);
//       router.push(`/darmasaba/pendidikan/info-sekolah/${encodeURIComponent(k.toLowerCase())}`);
//     }
//   };
  

//   return (
//     <Box style={{ minHeight: '100vh', background: colors.Bg, paddingBottom: 48 }}>
//       <Container size="xl" py={{ base: 'md', md: 'xl' }}>
//         <Stack gap="lg">
//           {/* Back Button */}
//           <ActionIcon onClick={() => window.history.back()} variant="light" radius="md" size="lg">
//             <IconArrowLeft size={20} />
//             <VisuallyHidden>Kembali</VisuallyHidden>
//           </ActionIcon>

//           {/* Search & Filter */}
//           <Paper radius="lg" p="xl" withBorder>
//             <Stack gap="md">
//               <Text ta="center" fw={800} fz={28}>{title}</Text>

//               <Text ta="center" fz={"md"} c="black">
//               Temukan data lengkap mengenai lembaga pendidikan, jumlah siswa terdaftar, dan tenaga pengajar berdasarkan jenjang pendidikan yang tersedia (TK, SD, SMP, SMA). Gunakan tombol di bawah untuk melihat detail sesuai kebutuhanmu.
//               </Text>
//               <Group justify="center" gap="xs" wrap="wrap">
//                 {jenjangPendidikanList.map((k) => {
//                   const aktif = k === jenjangPendidikanAktif;
//                   return (
//                     <Button
//                       key={k}
//                       onClick={() => handleJenjangPendidikanChange(k)}
//                       radius="xl"
//                       size="sm"
//                       variant={aktif ? 'filled' : 'light'}
//                     >
//                       {k}
//                     </Button>
//                   );
//                 })}
//               </Group>
//             </Stack>
//           </Paper>

//           {/* Slot konten */}
//           {children}
//         </Stack>
//       </Container>
//     </Box>
//   );
// }
'use client'
import colors from '@/con/colors';
 // pastikan path benar
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  VisuallyHidden,
  Loader,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSnapshot } from 'valtio';
import React, { useEffect, useState } from 'react';
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';

type LayoutSekolahProps = {
  title?: string;
  children: React.ReactNode;
};

export default function LayoutSekolah({
  title = 'Cari Informasi Sekolah',
  children,
}: LayoutSekolahProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const snap = useSnapshot(infoSekolahPaud.jenjangPendidikan);

  const [jenjangPendidikanAktif, setJenjangPendidikanAktif] = useState<string>(
    searchParams.get('jenjangPendidikan') || 'Semua'
  );

  // Load jenjang pendidikan dari backend
  useEffect(() => {
    if (!snap.findMany.data) infoSekolahPaud.jenjangPendidikan.findMany.load(1, 100);
  }, []);

  const handleJenjangPendidikanChange = (nama: string) => {
    setJenjangPendidikanAktif(nama);
    const path =
      nama.toLowerCase() === 'semua'
        ? `/darmasaba/pendidikan/info-sekolah/semua`
        : `/darmasaba/pendidikan/info-sekolah/${encodeURIComponent(nama.toLowerCase())}`;
    router.push(path);
  };

  // List tab dari data state
  const jenjangList = ['Semua', ...(snap.findMany.data?.map((v) => v.nama) || [])];

  return (
    <Box style={{ minHeight: '100vh', background: colors.Bg, paddingBottom: 48 }}>
      <Container size="xl" py={{ base: 'md', md: 'xl' }}>
        <Stack gap="lg">
          {/* Back Button */}
          <ActionIcon onClick={() => window.history.back()} variant="light" radius="md" size="lg">
            <IconArrowLeft size={20} />
            <VisuallyHidden>Kembali</VisuallyHidden>
          </ActionIcon>

          {/* Search & Filter */}
          <Paper radius="lg" p="xl" withBorder>
            <Stack gap="md">
              <Text ta="center" fw={800} fz={28}>
                {title}
              </Text>

              <Text ta="center" fz="md" c="black">
                Temukan data lengkap mengenai lembaga pendidikan, jumlah siswa terdaftar, dan tenaga
                pengajar berdasarkan jenjang pendidikan (TK, SD, SMP, SMA).
              </Text>

              {snap.findMany.loading ? (
                <Group justify="center" py="sm">
                  <Loader size="sm" />
                </Group>
              ) : (
                <Group justify="center" gap="xs" wrap="wrap">
                  {jenjangList.map((k) => {
                    const aktif = k === jenjangPendidikanAktif;
                    return (
                      <Button
                        key={k}
                        onClick={() => handleJenjangPendidikanChange(k)}
                        radius="xl"
                        size="sm"
                        variant={aktif ? 'filled' : 'light'}
                      >
                        {k}
                      </Button>
                    );
                  })}
                </Group>
              )}
            </Stack>
          </Paper>

          {/* Konten anak */}
          {children}
        </Stack>
      </Container>
    </Box>
  );
}
