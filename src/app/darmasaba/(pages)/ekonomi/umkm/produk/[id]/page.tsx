'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Stack,
  Text,
  Image,
  Skeleton,
  Group,
  Badge,
  Divider,
  Title,
  Modal,
  NumberInput,
  TextInput,
  Textarea,
  Alert,
} from '@mantine/core';
import {
  IconArrowBack,
  IconBrandWhatsapp,
  IconMapPin,
  IconUser,
  IconShoppingCart,
} from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';
import { toast } from 'react-toastify';

import colors from '@/con/colors';
import umkmState from '@/app/admin/(dashboard)/_state/ekonomi/umkm/umkm';
import ApiFetch from '@/lib/api-fetch';

interface OrderForm {
  nama: string;
  jumlah: number;
  catatan: string;
}

const DEFAULT_FORM: OrderForm = {
  nama: '',
  jumlah: 1,
  catatan: '',
};

function DetailProdukPasarUser() {
  const router = useRouter();
  const params = useParams();
  const state = useProxy(umkmState.produk.findUnique);

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<OrderForm>(DEFAULT_FORM);
  const [error, setError] = useState('');

  useShallowEffect(() => {
    state.load(params?.id as string);
  }, []);

  const data = state.data;
  const total = data ? form.jumlah * (data.harga ?? 0) : 0;

  const handleClose = () => {
    setModalOpen(false);
    setError('');
    setForm(DEFAULT_FORM);
  };

  const handleOrder = async () => {
    if (!data) return;

    if (!form.nama.trim()) {
      setError('Nama pemesan wajib diisi');
      return;
    }

    if (form.jumlah < 1) {
      setError('Jumlah minimal 1');
      return;
    }

    if (form.jumlah > data.stok) {
      setError(`Stok tersedia hanya ${data.stok}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await ApiFetch.api.ekonomi.umkm.penjualan.create.post({
        produkId: data.id,
        jumlah: form.jumlah,
        hargaSatuan: data.harga || 0,
        tanggal: new Date().toISOString(),
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Gagal membuat pesanan');
      }

      state.load(params?.id as string);
      handleClose();

      toast.success('Pesanan berhasil dicatat!');

      let kontak = data.umkm?.kontak?.replace(/[^0-9]/g, '') || '';
      if (kontak.startsWith('0')) {
        kontak = '62' + kontak.slice(1);
      }

      if (kontak) {
        const message = [
          `Halo *${data.umkm?.nama}*, saya ingin memesan:`,
          '',
          `*${data.nama}*`,
          `Jumlah: ${form.jumlah}`,
          `Harga Satuan: Rp ${data.harga?.toLocaleString('id-ID')}`,
          `*Total: Rp ${total.toLocaleString('id-ID')}*`,
          '',
          `Nama Pemesan: ${form.nama}`,
          form.catatan ? `Catatan: ${form.catatan}` : null,
        ]
          .filter(Boolean)
          .join('\n');

        window.open(
          `https://wa.me/${kontak}?text=${encodeURIComponent(message)}`,
          '_blank'
        );
      }
    } catch (e: any) {
      setError(e.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (state.loading || !data) {
    return <Skeleton h={400} />;
  }

  return (
    <Box py={20} bg={colors.Bg}>
      <Box px={{ base: 'md', md: 100 }}>
        <Button
          variant="subtle"
          leftSection={<IconArrowBack size={16} />}
          onClick={() => router.back()}
        >
          Kembali
        </Button>
      </Box>

      <Paper mt="md" mx={{ base: 'md', md: 100 }} p="lg" radius="md">
        <Stack>
          <Image
            src={data.image?.link || '/no-image.jpg'}
            alt={data.nama}
            radius="md"
          />

          <Title>{data.nama}</Title>

          <Text fw={900} c="orange">
            Rp {data.harga?.toLocaleString('id-ID')}
          </Text>

          <Badge color={data.stok > 0 ? 'green' : 'red'}>
            {data.stok > 0 ? `Stok: ${data.stok}` : 'Stok Habis'}
          </Badge>

          <Text>{data.deskripsi}</Text>

          <Button
            leftSection={<IconShoppingCart />}
            disabled={data.stok === 0}
            onClick={() => setModalOpen(true)}
          >
            Pesan Sekarang
          </Button>
        </Stack>
      </Paper>

      {/* Modal */}
      <Modal opened={modalOpen} onClose={handleClose} title="Pesanan">
        <Stack>
          <TextInput
            label="Nama"
            value={form.nama}
            onChange={(e) =>
              setForm({ ...form, nama: e.target.value })
            }
          />

          <NumberInput
            label="Jumlah"
            min={1}
            max={data.stok}
            value={form.jumlah}
            onChange={(v) =>
              setForm({ ...form, jumlah: Number(v) || 1 })
            }
          />

          <Textarea
            label="Catatan"
            value={form.catatan}
            onChange={(e) =>
              setForm({ ...form, catatan: e.target.value })
            }
          />

          {error && <Alert color="red">{error}</Alert>}

          <Button loading={loading} onClick={handleOrder}>
            Kirim via WhatsApp
          </Button>
        </Stack>
      </Modal>
    </Box>
  );
}

export default DetailProdukPasarUser;