'use client';

import { Alert, Button, Modal, NumberInput, Stack, Text, TextInput, Textarea } from '@mantine/core';
import { IconBrandWhatsapp } from '@tabler/icons-react';

import { WA_PENJUAL_TIDAK_VALID } from '../_lib/pesanan';
import { jumlahLabel } from '../_lib/satuan';

export interface OrderForm {
  nama: string;
  jumlah: number;
  catatan: string;
}

interface PesananModalProps {
  opened: boolean;
  onClose: () => void;
  satuan?: string | null;
  stok: number;
  form: OrderForm;
  onFormChange: (form: OrderForm) => void;
  error: string;
  loading: boolean;
  onSubmit: () => void;
  /** Terisi setelah pesanan tercatat; waUrl null = nomor WA penjual tidak valid. */
  ordered: { waUrl: string | null } | null;
}

/** Modal pesanan produk UMKM: form pesanan, lalu konfirmasi + tautan WhatsApp penjual. */
export function PesananModal({
  opened,
  onClose,
  satuan,
  stok,
  form,
  onFormChange,
  error,
  loading,
  onSubmit,
  ordered,
}: PesananModalProps) {
  if (ordered) {
    return (
      <Modal opened={opened} onClose={onClose} title="Pesanan Dibuat">
        <Stack>
          <Alert color="green">
            Pesanan Anda sudah tercatat. Hubungi penjual lewat WhatsApp untuk konfirmasi.
          </Alert>

          {ordered.waUrl ? (
            <>
              <Button
                component="a"
                href={ordered.waUrl}
                target="_blank"
                rel="noopener noreferrer"
                color="green"
                leftSection={<IconBrandWhatsapp size={18} />}
              >
                Lanjutkan ke WhatsApp
              </Button>
              <Text fz="xs" c="dimmed">
                Jika WhatsApp menyatakan nomor tidak terdaftar, pesanan Anda tetap sudah tercatat.
              </Text>
            </>
          ) : (
            <Alert color="yellow">
              {WA_PENJUAL_TIDAK_VALID}, sehingga pesan tidak dapat dikirim otomatis. Pesanan Anda
              tetap sudah tercatat.
            </Alert>
          )}

          <Button variant="default" onClick={onClose}>
            Tutup
          </Button>
        </Stack>
      </Modal>
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Pesanan">
      <Stack>
        <TextInput
          label="Nama"
          value={form.nama}
          onChange={(e) => onFormChange({ ...form, nama: e.target.value })}
        />

        <NumberInput
          label={jumlahLabel(satuan)}
          min={1}
          max={stok}
          allowDecimal={false}
          value={form.jumlah}
          onChange={(v) => onFormChange({ ...form, jumlah: Number(v) || 1 })}
        />

        <Textarea
          label="Catatan"
          value={form.catatan}
          onChange={(e) => onFormChange({ ...form, catatan: e.target.value })}
        />

        {error && <Alert color="red">{error}</Alert>}

        <Button loading={loading} onClick={onSubmit}>
          Buat Pesanan
        </Button>
      </Stack>
    </Modal>
  );
}
