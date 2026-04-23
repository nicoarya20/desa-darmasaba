'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, Image, Skeleton, Group, Badge, Divider, Title, Modal, NumberInput, TextInput, Textarea, Alert } from '@mantine/core';
import { IconArrowBack, IconBrandWhatsapp, IconMapPin, IconUser, IconShoppingCart } from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import React, { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';
import umkmState from '@/app/admin/(dashboard)/_state/ekonomi/umkm/umkm';
import { toast } from 'react-toastify';
import ApiFetch from '@/lib/api-fetch';

interface OrderForm {
  nama: string;
  jumlah: number;
  catatan: string;
}

const DEFAULT_FORM: OrderForm = { nama: '', jumlah: 1, catatan: '' };

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

  function handleClose() {
    setModalOpen(false);
    setError('');
    setForm(DEFAULT_FORM);
  }

  async function handleOrder() {
    if (!data) return;
    if (!form.nama.trim()) { setError('Nama pemesan wajib diisi'); return; }
    if (form.jumlah < 1) { setError('Jumlah minimal 1'); return; }
    if (form.jumlah > data.stok) { setError(`Stok tersedia hanya ${data.stok}`); return; }

    setLoading(true);
    setError('');

    try {
      const res = await ApiFetch.api.ekonomi.umkm.penjualan.create.post({
        produkId: data.id,
        jumlah: form.jumlah,
        hargaSatuan: data.harga || 0,
        tanggal: new Date().toISOString(),
      });

      if (!res.data?.success) throw new Error(res.data?.message || 'Gagal membuat pesanan');

      // Reload produk agar stok terupdate
      state.load(params?.id as string);
      handleClose();
      toast.success('Pesanan berhasil dicatat!');

      // Arahkan ke WhatsApp dengan pesan terformat
      let kontak = data.umkm?.kontak?.replace(/[^0-9]/g, '') || '';
      if (kontak.startsWith('0')) {
        kontak = '62' + kontak.slice(1);
      }

      if (kontak) {
        const lines = [
          `Halo *${data.umkm?.nama}*, saya ingin memesan:`,
          ``,
          `*${data.nama}*`,
          `Jumlah: ${form.jumlah}`,
          `Harga Satuan: Rp ${data.harga?.toLocaleString('id-ID')}`,
          `*Total: Rp ${total.toLocaleString('id-ID')}*`,
          ``,
          `Nama Pemesan: ${form.nama}`,
          form.catatan.trim() ? `Catatan: ${form.catatan.trim()}` : null,
        ].filter((l) => l !== null).join('\n');

        window.open(`https://wa.me/${kontak}?text=${encodeURIComponent(lines)}`, '_blank');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan, coba lagi');
    } finally {
      setLoading(false);
    }
  }

  if (state.loading || !data) {
    return (
      <Stack py={10} px={{ base: 'md', md: 100 }}>
        <Skeleton height={400} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={20} bg={colors.Bg}>
      <Box px={{ base: 'md', md: 100 }}>
        <Button
          variant="subtle"
          onClick={() => router.push('/darmasaba/ekonomi/umkm')}
          leftSection={<IconArrowBack size={20} color={colors['blue-button']} />}
          mb={15}
        >
          <Text fz={{ base: 'md', md: 'lg' }} lh={1.5}>
            Kembali ke Katalog
          </Text>
        </Button>
      </Box>

      <Paper
        w={{ base: '90%', md: '70%' }}
        mx="auto"
        p="lg"
        radius="md"
        shadow="sm"
        bg="white"
      >
        <Stack gap="lg">
          <Image
            src={data.image?.link || '/no-image.jpg'}
            alt={data.nama}
            radius="md"
            h={{ base: 250, md: 400 }}
            w="100%"
            fit="cover"
            fallbackSrc="/no-image.jpg"
          />

          <Stack gap="xs">
            <Group justify="space-between" align="flex-start">
              <Stack gap={5}>
                <Badge color="blue" variant="light">{data.kategoriProduk?.nama}</Badge>
                <Title order={1} fw={800} c={colors['blue-button']}>
                  {data.nama}
                </Title>
              </Stack>
              <Badge color={data.stok > 0 ? 'green' : 'red'} size="lg">
                {data.stok > 0 ? `Stok: ${data.stok}` : 'Stok Habis'}
              </Badge>
            </Group>

            <Text fz="2rem" fw={900} c="orange">
              Rp {data.harga?.toLocaleString('id-ID')}
            </Text>

            <Divider my="sm" />

            <Stack gap="md">
              <Box>
                <Title order={3} mb="xs">Informasi Penjual</Title>
                <Paper withBorder p="md" radius="md" bg="gray.0">
                  <Group justify="space-between">
                    <Stack gap={4}>
                      <Text
                        fw={700} fz="lg" c="blue"
                        style={{ cursor: 'pointer' }}
                        onClick={() => router.push(`/darmasaba/ekonomi/umkm/${data.umkmId}`)}
                      >
                        {data.umkm?.nama}
                      </Text>
                      <Group gap="xs">
                        <IconUser size={16} color="gray" />
                        <Text size="sm" c="dimmed">{data.umkm?.pemilik}</Text>
                      </Group>
                      <Group gap="xs">
                        <IconMapPin size={16} color="red" />
                        <Text size="sm" c="dimmed">{data.umkm?.alamat || 'Darmasaba'}</Text>
                      </Group>
                    </Stack>
                    {data.umkm?.kontak && (
                      <Button
                        color="green"
                        radius="md"
                        component="a"
                        href={`https://wa.me/${data.umkm.kontak.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                        target="_blank"
                        leftSection={<IconBrandWhatsapp size={20} />}
                      >
                        WhatsApp
                      </Button>
                    )}
                  </Group>
                </Paper>
              </Box>

              <Box>
                <Title order={3} mb="xs">Deskripsi Produk</Title>
                <Text fz="md" lh={1.6} c="dark">
                  {data.deskripsi || 'Tidak ada deskripsi tersedia untuk produk ini.'}
                </Text>
              </Box>

              <Button
                size="lg"
                color={colors['blue-button']}
                radius="md"
                leftSection={<IconShoppingCart size={22} />}
                disabled={data.stok === 0}
                onClick={() => setModalOpen(true)}
              >
                {data.stok > 0 ? 'Pesan Sekarang' : 'Stok Habis'}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <Modal
        opened={modalOpen}
        onClose={handleClose}
        title={<Text fw={700} fz="lg">Buat Pesanan</Text>}
        centered
        radius="md"
      >
        <Stack gap="md">
          {/* Ringkasan produk */}
          <Paper withBorder p="sm" radius="md" bg="gray.0">
            <Group gap="sm">
              <Image
                src={data.image?.link || '/no-image.jpg'}
                alt={data.nama}
                w={60} h={60} radius="md" fit="cover"
                fallbackSrc="/no-image.jpg"
              />
              <Stack gap={2} style={{ flex: 1 }}>
                <Text fw={600} fz="sm">{data.nama}</Text>
                <Text fz="sm" c="orange" fw={700}>
                  Rp {data.harga?.toLocaleString('id-ID')} / item
                </Text>
                <Text fz="xs" c="dimmed">Stok tersedia: {data.stok}</Text>
              </Stack>
            </Group>
          </Paper>

          <TextInput
            label="Nama Pemesan"
            placeholder="Masukkan nama Anda"
            required
            value={form.nama}
            onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
          />

          <NumberInput
            label="Jumlah"
            placeholder="Jumlah pesanan"
            required
            min={1}
            max={data.stok}
            value={form.jumlah}
            onChange={(v) => setForm((f) => ({ ...f, jumlah: Number(v) || 1 }))}
          />

          <Textarea
            label="Catatan (opsional)"
            placeholder="Mis: warna, ukuran, atau instruksi khusus"
            rows={3}
            value={form.catatan}
            onChange={(e) => setForm((f) => ({ ...f, catatan: e.target.value }))}
          />

          {/* Ringkasan harga */}
          <Paper withBorder p="sm" radius="md" bg="blue.0">
            <Group justify="space-between">
              <Text fz="sm" c="dimmed">
                Rp {data.harga?.toLocaleString('id-ID')} × {form.jumlah}
              </Text>
              <Text fw={800} fz="lg" c="orange">
                Total: Rp {total.toLocaleString('id-ID')}
              </Text>
            </Group>
          </Paper>

          {error && (
            <Alert color="red" radius="md">
              {error}
            </Alert>
          )}

          <Button
            size="md"
            color="green"
            radius="md"
            fullWidth
            loading={loading}
            leftSection={<IconBrandWhatsapp size={20} />}
            onClick={handleOrder}
          >
            Konfirmasi &amp; Kirim via WhatsApp
          </Button>
        </Stack>
      </Modal>
    </Box>
  );
}

export default DetailProdukPasarUser;
