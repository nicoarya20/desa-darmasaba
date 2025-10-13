'use client';

import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';
import colors from '@/con/colors';
import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Image,
  Modal,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  IconArrowRight,
  IconBook2,
  IconUser
} from '@tabler/icons-react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSnapshot } from 'valtio';


export interface ModalPeminjamanProps {
  opened: boolean;
  onClose: () => void;
  buku: {
    id: string;
    judul: string;
    deskripsi?: string;
    image?: { link?: string };
    kategori?: { name?: string };
  } | null;
}

export default function ModalPeminjaman({
  opened,
  onClose,
  buku,
}: ModalPeminjamanProps) {
  const snap = useSnapshot(perpustakaanDigitalState.peminjamanBuku);

  // reset form setiap modal dibuka
  useEffect(() => {
    if (opened && buku) {
      perpustakaanDigitalState.peminjamanBuku.create.form = {
        ...perpustakaanDigitalState.peminjamanBuku.create.form,
        bukuId: buku.id,
        nama: '',
        noTelp: '',
        alamat: '',
        tanggalPinjam: '',
        batasKembali: '',
        tanggalKembali: '',
        catatan: '',
      };
    }
  }, [opened, buku]);

  const handleSubmit = async () => {
    if (!buku) return toast.error('Data buku tidak ditemukan');
    await perpustakaanDigitalState.peminjamanBuku.create.create();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="lg"
      radius="xl"
      title={<Text fw={700}>Formulir Peminjaman Buku</Text>}
    >
      {buku ? (
        <Stack>
          {/* --- Info Buku --- */}
          <Group align="flex-start">
            <Image
              src={buku.image?.link || '/placeholder-book.jpg'}
              alt={buku.judul}
              w={100}
              radius="md"
            />
            <Stack gap={4}>
              <Group>
                <IconBook2 size={18} color={colors['blue-button']} />
                <Text fw={700}>{buku.judul}</Text>
              </Group>

              {buku.kategori?.name && (
                <Badge color="cyan" variant="light">
                  {buku.kategori.name}
                </Badge>
              )}

              <Text fz="sm" c="dimmed" lineClamp={3} dangerouslySetInnerHTML={{ __html: buku.deskripsi || 'Tidak ada deskripsi' }} />
            </Stack>
          </Group>

          <Divider my="sm" />

          {/* --- Form Input --- */}
          <TextInput
            label="Nama Peminjam"
            placeholder="Masukkan nama lengkap"
            leftSection={<IconUser size={16} />}
            value={snap.create.form.nama}
            onChange={(e) =>
              (perpustakaanDigitalState.peminjamanBuku.create.form.nama = e.currentTarget.value)
            }
            required
          />

          <TextInput
            label="No Telp"
            placeholder="Masukkan no telp"
            leftSection={<IconUser size={16} />}
            value={snap.create.form.noTelp}
            onChange={(e) =>
              (perpustakaanDigitalState.peminjamanBuku.create.form.noTelp = e.currentTarget.value)
            }
            required
          />

          <TextInput
            label="Alamat"
            placeholder="Masukkan alamat"
            leftSection={<IconUser size={16} />}
            value={snap.create.form.alamat}
            onChange={(e) =>
              (perpustakaanDigitalState.peminjamanBuku.create.form.alamat = e.currentTarget.value)
            }
            required
          />

          <DateInput
            label="Tanggal Pinjam"
            placeholder="Pilih tanggal pinjam"
            value={
              snap.create.form.tanggalPinjam
                ? new Date(snap.create.form.tanggalPinjam)
                : null
            }
            onChange={(date) => {
              perpustakaanDigitalState.peminjamanBuku.create.form.tanggalPinjam = 
                date ? new Date(date).toISOString() : '';
            }}
            required
          />

          <Box>
            <Text>Catatan</Text>
            <CreateEditor
              value={snap.create.form.catatan}
              onChange={(e) =>
                (perpustakaanDigitalState.peminjamanBuku.create.form.catatan = e)
              }
            />
          </Box>

          <DateInput
            label="Tanggal Kembali"
            placeholder="Pilih tanggal kembali"
            value={
              snap.create.form.tanggalKembali
                ? new Date(snap.create.form.tanggalKembali)
                : null
            }
            onChange={(date) => {
              perpustakaanDigitalState.peminjamanBuku.create.form.tanggalKembali = 
                date ? new Date(date).toISOString() : '';
            }}
            required
          />
          
          <DateInput
            label="Batas Pengembalian"
            placeholder="Pilih tanggal kembali"
            value={
              snap.create.form.batasKembali
                ? new Date(snap.create.form.batasKembali)
                : null
            }
            onChange={(date) => {
              perpustakaanDigitalState.peminjamanBuku.create.form.batasKembali = 
                date ? new Date(date).toISOString() : '';
            }}
            required
          />


          <Button
            onClick={handleSubmit}
            loading={snap.create.loading}
            disabled={
              !snap.create.form.nama || 
              !snap.create.form.tanggalPinjam || 
              !snap.create.form.batasKembali ||
              !snap.create.form.tanggalKembali
            }
            rightSection={<IconArrowRight size={16} />}
            radius="xl"
          >
            Pinjam Buku
          </Button>
        </Stack>
      ) : (
        <Text c="dimmed" ta="center">
          Tidak ada data buku yang dipilih
        </Text>
      )}
    </Modal>
  );
}
