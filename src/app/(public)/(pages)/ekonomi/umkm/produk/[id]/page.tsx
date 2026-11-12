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
  Badge,
  Divider,
  Title,
  Grid,
} from '@mantine/core';
import {
  IconArrowBack,
  IconShoppingCart,
} from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';

import colors from '@/con/colors';
import umkmState from '@/app/admin/(dashboard)/_state/ekonomi/umkm/umkm';
import ApiFetch from '@/lib/api-fetch';
import { UMKM_PESANAN_TERCATAT } from '@/lib/umkm-pesanan';
import { perSatuanSuffix, withSatuan } from '../../_lib/satuan';
import { PesananModal, type OrderForm } from '../../_com/PesananModal';
import { LinkTokoOnlineButtons } from '../../_com/LinkTokoOnlineButtons';
import { HubungiPenjualButton } from '../../_com/HubungiPenjualButton';
import {
  PESAN_KONEKSI_GAGAL,
  buildOrderMessage,
  buildWaUrl,
  isPesananBerhasil,
  normalizeWaNumber,
  pesanErrorMessage,
} from '../../_lib/pesanan';

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
  // Terisi setelah pesanan tercatat: modal berganti ke tampilan konfirmasi.
  // waUrl null = nomor WA penjual tidak valid (WhatsApp tidak dibuka).
  const [ordered, setOrdered] = useState<{ waUrl: string | null } | null>(null);

  useShallowEffect(() => {
    state.load(params?.id as string);
  }, []);

  const data = state.data;
  const total = data ? form.jumlah * (data.harga ?? 0) : 0;

  const handleClose = () => {
    const perluRefreshStok = ordered !== null;
    setModalOpen(false);
    setError('');
    setForm(DEFAULT_FORM);
    setOrdered(null);
    if (perluRefreshStok) state.load(params?.id as string);
  };

  const handleOrder = async () => {
    if (!data) return;

    if (!form.nama.trim()) {
      setError('Nama pemesan wajib diisi');
      return;
    }

    if (!Number.isInteger(form.jumlah) || form.jumlah < 1) {
      setError('Jumlah minimal 1 dan berupa bilangan bulat');
      return;
    }

    if (form.jumlah > data.stok) {
      setError(`Stok tersedia hanya ${data.stok}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Harga tidak dikirim: server mengambilnya dari DB (endpoint publik).
      const res = await ApiFetch.api.ekonomi.umkm.penjualan.pesan.post({
        produkId: data.id,
        jumlah: form.jumlah,
      });

      if (!isPesananBerhasil(res)) {
        setError(pesanErrorMessage(res));
        return;
      }

      // WhatsApp TIDAK dibuka otomatis lewat window.open setelah await: browser
      // HP memblokirnya (user-activation hilang) dan di laptop tab WhatsApp
      // menutupi status pesanan. Tautan diklik warga langsung di modal konfirmasi.
      const waNumber = normalizeWaNumber(data.umkm?.kontak);
      const message = buildOrderMessage({
        umkmNama: data.umkm?.nama,
        produkNama: data.nama,
        jumlah: form.jumlah,
        satuan: data.satuan,
        harga: data.harga ?? 0,
        total,
        pemesan: form.nama,
        catatan: form.catatan,
      });
      setOrdered({ waUrl: waNumber ? buildWaUrl(waNumber, message) : null });
    } catch {
      // Gagal jaringan (fetch melempar) — pesanan tidak sampai ke server.
      setError(PESAN_KONEKSI_GAGAL);
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
        <Grid gap="xl" align="flex-start">
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Image
              src={data.image?.link || '/no-image.jpg'}
              alt={data.nama}
              radius="md"
              h={{ base: 260, md: 360 }}
              w="100%"
              fit="cover"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="sm">
              <Title order={2}>{data.nama}</Title>

              <Text fw={900} fz="xl" c="orange">
                Rp {data.harga?.toLocaleString('id-ID')}
                <Text component="span" fz="sm" fw={500} c="dimmed">
                  {perSatuanSuffix(data.satuan)}
                </Text>
              </Text>

              <Badge size="lg" color={data.stok > 0 ? 'green' : 'red'}>
                {data.stok > 0 ? `Stok: ${withSatuan(data.stok, data.satuan)}` : 'Stok Habis'}
              </Badge>

              <Divider />

              <Text
                style={{ wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: data.deskripsi || '-' }}
              />

              {/* Selama pesanan website nonaktif (tab Penjualan admin disembunyikan), warga
                  langsung diarahkan ke WhatsApp penjual — lihat src/lib/umkm-pesanan.ts. */}
              {UMKM_PESANAN_TERCATAT ? (
                <Button
                  leftSection={<IconShoppingCart />}
                  disabled={data.stok === 0}
                  onClick={() => setModalOpen(true)}
                  mt="sm"
                >
                  Pesan Sekarang
                </Button>
              ) : (
                <HubungiPenjualButton
                  kontak={data.umkm?.kontak}
                  umkmNama={data.umkm?.nama}
                  produkNama={data.nama}
                />
              )}

              <LinkTokoOnlineButtons links={data.linkTokoOnline} withLabel />
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>

      {UMKM_PESANAN_TERCATAT && (
        <PesananModal
          opened={modalOpen}
          onClose={handleClose}
          satuan={data.satuan}
          stok={data.stok}
          form={form}
          onFormChange={setForm}
          error={error}
          loading={loading}
          onSubmit={handleOrder}
          ordered={ordered}
        />
      )}
    </Box>
  );
}

export default DetailProdukPasarUser;