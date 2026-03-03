/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useProxy } from 'valtio/utils';
import apbdes from '@/app/admin/(dashboard)/_state/landing-page/apbdes';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  NumberInput,
  Title,
  Table,
  TableThead,
  TableTbody,
  TableTr,
  TableTh,
  TableTd,
  ActionIcon,
  Badge,
  Modal,
  Divider,
  Loader,
  Center,
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconCoin,
} from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import colors from '@/con/colors';

interface RealisasiManagerProps {
  itemId: string;
  itemKode: string;
  itemUraian: string;
  itemAnggaran: number;
  itemTotalRealisasi: number;
  itemPersentase: number;
  realisasiItems: any[];
}

export default function RealisasiManager({
  itemId,
  itemKode,
  itemUraian,
  itemAnggaran,
  itemTotalRealisasi,
  itemPersentase,
  realisasiItems,
}: RealisasiManagerProps) {
  const state = useProxy(apbdes);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    jumlah: 0,
    tanggal: new Date().toISOString().split('T')[0], // YYYY-MM-DD format for input
    keterangan: '',
  });

  const resetForm = () => {
    setFormData({
      jumlah: 0,
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: '',
    });
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpened(true);
  };

  const handleOpenEdit = (realisasi: any) => {
    const tanggal = new Date(realisasi.tanggal);
    const tanggalStr = tanggal.toISOString().split('T')[0]; // YYYY-MM-DD
    
    setFormData({
      jumlah: realisasi.jumlah,
      tanggal: tanggalStr,
      keterangan: realisasi.keterangan || '',
    });
    setEditingId(realisasi.id);
    setModalOpened(true);
  };

  const handleSubmit = async () => {
    if (formData.jumlah <= 0) {
      return toast.warn('Jumlah realisasi harus lebih dari 0');
    }

    try {
      setLoading(true);

      if (editingId) {
        // Update existing realisasi
        const success = await state.realisasi.update(editingId, {
          jumlah: formData.jumlah,
          tanggal: new Date(formData.tanggal).toISOString(),
          keterangan: formData.keterangan,
        });

        if (success) {
          toast.success('Realisasi berhasil diperbarui');
        }
      } else {
        // Create new realisasi
        const success = await state.realisasi.create(itemId, {
          jumlah: formData.jumlah,
          tanggal: new Date(formData.tanggal).toISOString(),
          keterangan: formData.keterangan,
        });

        if (success) {
          toast.success('Realisasi berhasil ditambahkan');
        }
      }

      setModalOpened(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving realisasi:', error);
      toast.error(error?.message || 'Gagal menyimpan realisasi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (realisasiId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus realisasi ini?')) {
      return;
    }

    try {
      setLoading(true);
      const success = await state.realisasi.delete(realisasiId);

      if (success) {
        toast.success('Realisasi berhasil dihapus');
      }
    } catch (error: any) {
      console.error('Error deleting realisasi:', error);
      toast.error(error?.message || 'Gagal menghapus realisasi');
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSisaAnggaran = () => {
    return itemAnggaran - itemTotalRealisasi;
  };

  const getPersentaseColor = (persen: number) => {
    if (persen >= 100) return 'teal';
    if (persen >= 80) return 'blue';
    if (persen >= 60) return 'yellow';
    return 'red';
  };

  return (
    <Paper withBorder p="md" radius="md" mt="md">
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Stack gap="xs">
          <Title order={6}>
            {itemKode} - {itemUraian}
          </Title>
          <Text fz="sm" c="dimmed">
            Kelola realisasi untuk item ini
          </Text>
        </Stack>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={handleOpenCreate}
          color="blue"
          variant="light"
          radius="md"
        >
          Tambah Realisasi
        </Button>
      </Group>

      {/* Summary Cards */}
      <Group grow mb="md">
        <Paper withBorder p="md" radius="md" bg="blue.0">
          <Text fz="xs" c="blue.9" fw={600}>
            ANGGARAN
          </Text>
          <Text fz="lg" c="blue.9" fw={700}>
            {formatRupiah(itemAnggaran)}
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="md" bg="teal.0">
          <Text fz="xs" c="teal.9" fw={600}>
            TOTAL REALISASI
          </Text>
          <Text fz="lg" c="teal.9" fw={700}>
            {formatRupiah(itemTotalRealisasi)}
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="md" bg={getSisaAnggaran() >= 0 ? 'green.0' : 'red.0'}>
          <Text fz="xs" c={getSisaAnggaran() >= 0 ? 'green.9' : 'red.9'} fw={600}>
            SISA ANGGARAN
          </Text>
          <Text fz="lg" c={getSisaAnggaran() >= 0 ? 'green.9' : 'red.9'} fw={700}>
            {formatRupiah(getSisaAnggaran())}
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="md" bg={getPersentaseColor(itemPersentase) + '.0'}>
          <Text fz="xs" c={getPersentaseColor(itemPersentase) + '.9'} fw={600}>
            PERSENTASE
          </Text>
          <Text fz="lg" c={getPersentaseColor(itemPersentase) + '.9'} fw={700}>
            {itemPersentase.toFixed(2)}%
          </Text>
        </Paper>
      </Group>

      {/* Realisasi List */}
      {realisasiItems && realisasiItems.length > 0 ? (
        <Box>
          <Text fz="sm" fw={600} mb="xs">
            Daftar Realisasi ({realisasiItems.length})
          </Text>
          <Box style={{ overflowX: 'auto' }}>
            <Table striped highlightOnHover fz="sm">
              <TableThead>
                <TableTr>
                  <TableTh>Tanggal</TableTh>
                  <TableTh>Uraian</TableTh>
                  <TableTh ta="right">Jumlah</TableTh>
                  <TableTh ta="center">Aksi</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {realisasiItems.map((realisasi) => (
                  <TableTr key={realisasi.id}>
                    <TableTd>
                      <Group gap="xs">
                        <IconCalendar size={16} />
                        <Text fz="sm">{formatDate(realisasi.tanggal)}</Text>
                      </Group>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm">{realisasi.keterangan || '-'}</Text>
                    </TableTd>
                    <TableTd ta="right">
                      <Text fz="sm" fw={600} c="blue">
                        {formatRupiah(realisasi.jumlah)}
                      </Text>
                    </TableTd>
                    <TableTd ta="center">
                      <Group gap="xs" justify="center">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          size="sm"
                          onClick={() => handleOpenEdit(realisasi)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          size="sm"
                          onClick={() => handleDelete(realisasi.id)}
                          disabled={loading}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </Box>
        </Box>
      ) : (
        <Center py="xl">
          <Stack align="center" gap="xs">
            <Text fz="sm" c="dimmed">
              Belum ada realisasi untuk item ini
            </Text>
            <Text fz="xs" c="dimmed">
              Klik tombol "Tambah Realisasi" untuk menambahkan
            </Text>
          </Stack>
        </Center>
      )}

      {/* Modal Create/Edit */}
      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          resetForm();
        }}
        title={
          <Title order={5}>
            {editingId ? 'Edit Realisasi' : 'Tambah Realisasi Baru'}
          </Title>
        }
        size="md"
        centered
      >
        <Stack gap="md">
          {/* Info Item */}
          <Paper p="sm" bg="gray.0" radius="md">
            <Text fz="xs" c="dimmed">
              Item: {itemKode} - {itemUraian}
            </Text>
            <Text fz="xs" c="dimmed">
              Anggaran: {formatRupiah(itemAnggaran)}
            </Text>
            <Text fz="xs" c="dimmed">
              Sudah terealisasi: {formatRupiah(itemTotalRealisasi)}
            </Text>
          </Paper>

          <NumberInput
            label="Jumlah Realisasi (Rp)"
            value={formData.jumlah}
            onChange={(val) => setFormData({ ...formData, jumlah: Number(val) || 0 })}
            leftSection={<IconCoin size={16} />}
            thousandSeparator
            min={0}
            step={100000}
            required
          />

          <TextInput
            label="Tanggal Realisasi"
            type="date"
            value={formData.tanggal}
            onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
            leftSection={<IconCalendar size={18} />}
            required
          />

          <TextInput
            label="Keterangan / Uraian"
            placeholder="Contoh: Penyaluran BLT Tahap 1"
            value={formData.keterangan}
            onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
            description="Deskripsi singkat tentang realisasi ini"
          />

          <Divider my="xs" />

          <Group justify="right">
            <Button
              variant="outline"
              color="gray"
              onClick={() => {
                setModalOpened(false);
                resetForm();
              }}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              loading={loading}
              color="blue"
              leftSection={editingId ? <IconEdit size={16} /> : <IconPlus size={16} />}
            >
              {editingId ? 'Perbarui' : 'Tambah'} Realisasi
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}
