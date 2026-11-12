/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Loader,
  ActionIcon,
  NumberInput,
  Select,
  SimpleGrid,
  Table,
  Badge,
} from '@mantine/core';
import { IconArrowBack, IconPlus, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import apbdes from '../../../_state/landing-page/apbdes';
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import { isIsiDraftValid } from '../../desa-anti-korupsi/_lib/dokumen-bulk-actions';
import { emptyIsiDraft, type IsiDraft } from '../../desa-anti-korupsi/_lib/folder-draft';
import { ApbdesDokumenSection } from '../_com/ApbdesDokumenSection';
import { prepareApbdesIsi } from '../_lib/dokumen-isi';

// Tipe item untuk form
type ItemForm = {
  kode: string;
  uraian: string;
  anggaran: number;
  level: number;
  tipe: 'pendapatan' | 'belanja' | 'pembiayaan';
};

function CreateAPBDes() {
  const router = useRouter();
  const stateAPBDes = useProxy(apbdes, { sync: true }); // sync: cegah caret jump di controlled input
  const [isi, setIsi] = useState<IsiDraft>(emptyIsiDraft); // draft dokumen + folder
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid - hanya cek items, dokumen opsional
  const isFormValid = () => {
    return stateAPBDes.create.form.items.length > 0 && isIsiDraftValid(isi);
  };

  // Form sementara untuk input item baru
  const [newItem, setNewItem] = useState<ItemForm>({
    kode: '',
    uraian: '',
    anggaran: 0,
    level: 1,
    tipe: 'pendapatan',
  });

  useEffect(() => {
    stateAPBDes.findMany.load();
  }, []);

  const resetForm = () => {
    stateAPBDes.create.reset();
    setIsi(emptyIsiDraft());
    setNewItem({
      kode: '',
      uraian: '',
      anggaran: 0,
      level: 1,
      tipe: 'pendapatan',
    });
  };

  const handleSubmit = async () => {
    if (stateAPBDes.create.form.items.length === 0) {
      return toast.warn("Minimal tambahkan 1 item APBDes");
    }

    try {
      setIsSubmitting(true);

      // Unggah berkas draft dulu; folder + dokumen dibuat bersama APBDes dalam satu transaksi di API.
      const prepared = await prepareApbdesIsi(isi);
      setIsi(prepared.isi);

      // create() menampilkan toast sukses/gagal sendiri & mengembalikan status.
      // Hanya lanjut reset + redirect kalau benar-benar sukses — mencegah toast
      // "berhasil" + "gagal" muncul bersamaan saat tahun duplikat (409).
      const ok = await stateAPBDes.create.create(prepared.payload);
      if (!ok) return;

      resetForm();
      router.push("/admin/landing-page/apbdes");
    } catch (error: any) {
      console.error("Gagal submit:", error);
      toast.error(error?.message || "Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tambahkan item ke state
  const handleAddItem = () => {
    const { kode, uraian, anggaran, level, tipe } = newItem;
    if (!kode || !uraian) {
      return toast.warn("Kode dan uraian wajib diisi");
    }

    const finalTipe = level === 1 ? null : tipe;

    stateAPBDes.create.addItem({
      kode,
      uraian,
      anggaran,
      level,
      tipe: finalTipe,
    });

    // Reset form input
    setNewItem({
      kode: '',
      uraian: '',
      anggaran: 0,
      level: 1,
      tipe: 'pendapatan',
    });
  };

  // Hapus item
  const handleRemoveItem = (index: number) => {
    stateAPBDes.create.removeItem(index);
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah APBDes
        </Title>
      </Group>

      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          <ApbdesDokumenSection value={isi} onChange={setIsi} />

          {/* Form Header */}
          <TextInput
            label="Nama APBDes"
            placeholder="Contoh: APBDes Tahun 2025"
            value={stateAPBDes.create.form.name}
            onChange={(e) => (stateAPBDes.create.form.name = e.target.value)}
            description="Opsional - akan diisi otomatis jika kosong"
          />
          <Box>
            <Text fz="sm" fw={500} mb={2}>
              Deskripsi
            </Text>
            <Text fz="xs" c="dimmed" mb={6}>
              Opsional
            </Text>
            <CreateEditor
              value={stateAPBDes.create.form.deskripsi || ''}
              onChange={(htmlContent: string) => {
                stateAPBDes.create.form.deskripsi = htmlContent;
              }}
            />
          </Box>
          <TextInput
            label="Jumlah Total"
            placeholder="Contoh: Rp 1.000.000.000"
            value={stateAPBDes.create.form.jumlah}
            onChange={(e) => (stateAPBDes.create.form.jumlah = e.target.value)}
            description="Opsional - total keseluruhan anggaran"
          />
          <NumberInput
            label="Tahun"
            value={stateAPBDes.create.form.tahun || new Date().getFullYear()}
            onChange={(val) => (stateAPBDes.create.form.tahun = Number(val) || new Date().getFullYear())}
            min={2000}
            max={2100}
            required
          />

          {/* Input Item Baru */}
          <Paper withBorder p="md" radius="md">
            <Title order={6} mb="sm">Tambah Item Pendapatan/Belanja</Title>
            <Stack gap="xs">
              {/* SimpleGrid: stack 1 kolom di mobile agar Select tidak sempit
                  (sebelumnya Group grow membagi rata 3 kolom di semua layar,
                  bikin label Level/Tipe ketutup di mobile). */}
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xs">
                <TextInput
                  label="Kode"
                  placeholder="Contoh: 4.1.2"
                  value={newItem.kode}
                  onChange={(e) => setNewItem({ ...newItem, kode: e.target.value })}
                  required
                />
                <Select
                  label="Level"
                  data={[
                    { value: '1', label: 'Level 1 (Kelompok)' },
                    { value: '2', label: 'Level 2 (Sub-kelompok)' },
                    { value: '3', label: 'Level 3 (Detail)' },
                  ]}
                  styles={{
                    option: {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                  value={String(newItem.level)}
                  onChange={(val) => setNewItem({ ...newItem, level: Number(val) || 1 })}
                />
                <Select
                  label="Tipe"
                  data={[
                    { value: 'pendapatan', label: 'Pendapatan' },
                    { value: 'belanja', label: 'Belanja' },
                    { value: 'pembiayaan', label: 'Pembiayaan' },
                  ]}
                  styles={{
                    option: {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                  value={newItem.level === 1 ? null : newItem.tipe}
                  onChange={(val) => setNewItem({ ...newItem, tipe: val as any })}
                  disabled={newItem.level === 1}
                />
              </SimpleGrid>
              <TextInput
                label="Uraian"
                placeholder="Contoh: Dana Desa"
                value={newItem.uraian}
                onChange={(e) => setNewItem({ ...newItem, uraian: e.target.value })}
                required
              />
              <Group grow>
                <NumberInput
                  label="Anggaran (Rp)"
                  value={newItem.anggaran}
                  onChange={(val) => setNewItem({ ...newItem, anggaran: Number(val) || 0 })}
                  thousandSeparator
                  min={0}
                />
              </Group>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={handleAddItem}
                disabled={!newItem.kode || !newItem.uraian}
              >
                Tambah Item
              </Button>
            </Stack>
          </Paper>

          {/* Tabel Items */}
          {stateAPBDes.create.form.items.length > 0 && (
            <Paper withBorder p="md" radius="md">
              <Title order={6} mb="sm">Daftar Item ({stateAPBDes.create.form.items.length})</Title>
              {/* ScrollContainer: tabel 6 kolom lebih lebar dari layar mobile.
                  Sebelumnya pakai tag <table> native yang tidak kebagian style
                  Mantine (border/spacing kacau) dan tidak bisa di-scroll. */}
              <Table.ScrollContainer minWidth={620}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Kode</Table.Th>
                      <Table.Th>Uraian</Table.Th>
                      <Table.Th>Anggaran</Table.Th>
                      <Table.Th>Level</Table.Th>
                      <Table.Th>Tipe</Table.Th>
                      <Table.Th style={{ width: 50 }}>Aksi</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {stateAPBDes.create.form.items.map((item: any, idx) => (
                      <Table.Tr key={idx}>
                        <Table.Td><Text size="sm" fw={500}>{item.kode}</Text></Table.Td>
                        <Table.Td>{item.uraian}</Table.Td>
                        <Table.Td>{item.anggaran.toLocaleString('id-ID')}</Table.Td>
                        <Table.Td>
                          <Badge size="sm" color={item.level === 1 ? 'blue' : item.level === 2 ? 'green' : 'grape'}>
                            L{item.level}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {item.tipe ? (
                            <Badge size="sm" color={item.tipe === 'pendapatan' ? 'teal' : 'red'}>
                              {item.tipe}
                            </Badge>
                          ) : (
                            <Text size="sm" c="dimmed">-</Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon color="red" onClick={() => handleRemoveItem(idx)}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Paper>
          )}

          {/* Tombol Aksi */}
          <Group justify="right">
            <Button variant="outline" color="gray" radius="md" onClick={resetForm}>
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              radius="md"
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? 'linear-gradient(135deg, #cccccc, #999999)'
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
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

export default CreateAPBDes;