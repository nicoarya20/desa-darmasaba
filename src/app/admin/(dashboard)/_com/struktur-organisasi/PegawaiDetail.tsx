import { Box, Image, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { StatusBadge } from './StatusBadge';
import { formatTanggal, tampil, type PegawaiRow } from './struktur-admin.logic';
import { STRUKTUR_ADMIN_TEXT as T } from './struktur-admin.text';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text fz="sm" fw={700}>{label}</Text>
      <Text fz="md" c="dimmed" style={{ wordBreak: 'break-word' }}>{value}</Text>
    </Box>
  );
}

/** Rincian satu pegawai (tanpa tombol aksi). Field kosong tampil "—". */
export function PegawaiDetail({ data }: { data: PegawaiRow }) {
  return (
    <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Stack gap="md">
          <Row label={T.pegawai.namaLengkap} value={data.namaLengkap} />
          <Row label={T.pegawai.gelarAkademik} value={tampil(data.gelarAkademik)} />
          <Row label={T.pegawai.jabatan} value={tampil(data.posisi?.nama)} />
          <Row label={T.pegawai.tanggalMasuk} value={formatTanggal(data.tanggalMasuk)} />
          <Row label={T.pegawai.email} value={tampil(data.email)} />
          <Row label={T.pegawai.telepon} value={tampil(data.telepon)} />
          <Row label={T.pegawai.alamat} value={tampil(data.alamat)} />
          <Box>
            <Text fz="sm" fw={700} mb={4}>{T.pegawai.status}</Text>
            <StatusBadge isActive={data.isActive} />
          </Box>
        </Stack>
        <Box>
          <Text fz="sm" fw={700} mb={4}>{T.pegawai.foto}</Text>
          {data.image?.link ? (
            <Image src={data.image.link} alt={data.namaLengkap} w={200} h={200} radius="md" fit="cover" loading="lazy" />
          ) : (
            <Text fz="md" c="dimmed">{T.pegawai.fotoKosong}</Text>
          )}
        </Box>
      </SimpleGrid>
    </Paper>
  );
}
