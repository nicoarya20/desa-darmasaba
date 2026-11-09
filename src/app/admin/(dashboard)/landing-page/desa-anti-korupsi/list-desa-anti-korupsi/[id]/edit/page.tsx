/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Loader, Box, Button, Group, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import korupsiState from '@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi';
import colors from '@/con/colors';
import { DokumenFolderEditor } from '../../../_com/DokumenFolderEditor';
import { isIsiDraftValid } from '../../../_lib/dokumen-bulk-actions';
import { uploadPendingDrafts } from '../../../_lib/dokumen-draft';
import {
  emptyIsiDraft,
  isiDraftFromDetail,
  toIsiPayload,
  type IsiDraft,
} from '../../../_lib/folder-draft';
import { uploadDokumenFile } from '../../../_lib/upload-dokumen';

interface FormDesaAntiKorupsi {
  name: string;
  deskripsi: string;
  kategoriId: string;
}

export default function EditDesaAntiKorupsi() {
  const desaAntiKorupsiState = useProxy(korupsiState.desaAntikorupsi);
  // Snapshot cabang kategoriDesaAntiKorupsi agar Select re-render saat
  // findMany.load() async selesai — JSX sebelumnya baca raw proxy (race, STG).
  const kategoriState = useProxy(korupsiState.kategoriDesaAntiKorupsi);
  const params = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState<FormDesaAntiKorupsi>({
    name: '',
    deskripsi: '',
    kategoriId: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.name?.trim() !== '' &&
      formData.kategoriId?.trim() !== '' &&
      isIsiDraftValid(isi)
    );
  };

  const [originalData, setOriginalData] = useState<FormDesaAntiKorupsi>({
    name: "",
    deskripsi: "",
    kategoriId: "",
  });

  const [isi, setIsi] = useState<IsiDraft>(emptyIsiDraft);
  const [originalIsi, setOriginalIsi] = useState<IsiDraft>(emptyIsiDraft);

  // Load kategori
  useShallowEffect(() => {
    korupsiState.kategoriDesaAntiKorupsi.findMany.load();
  }, []);

  // Load data existing
  useEffect(() => {
    const loadDesaAntiKorupsi = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await desaAntiKorupsiState.edit.load(id);
        if (!data) return;

        const loaded = {
          name: data.name,
          deskripsi: data.deskripsi,
          kategoriId: data.kategoriId,
        };
        setFormData(loaded);
        setOriginalData(loaded);

        const savedIsi = isiDraftFromDetail(data);
        setIsi(savedIsi);
        setOriginalIsi(savedIsi);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat data Desa Anti Korupsi');
      }
    };

    loadDesaAntiKorupsi();
  }, [params?.id]);

  // Generic handler input
  const handleInputChange = (key: keyof FormDesaAntiKorupsi) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string | null) => {
    const value = typeof e === 'string' ? e : e?.target?.value ?? '';
    setFormData((prev) => ({ ...prev, [key]: value || '' }));
  };

  // Special handler for Select component
  const handleSelectChange = (key: keyof FormDesaAntiKorupsi) => (value: string | null) => {
    setFormData((prev) => ({ ...prev, [key]: value || '' }));
  };

  const handleResetForm = () => {
    setFormData({ ...originalData });
    setIsi(originalIsi);
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    if (!formData.name) return toast.warn('Masukkan nama program');
    if (!formData.kategoriId) return toast.warn('Pilih kategori program');

    try {
      setIsSubmitting(true);
      // Unggah berkas baru dulu, lalu kirim set folder + dokumen final dalam satu PUT
      // (API menyinkronkan keduanya dalam satu transaksi).
      const uploaded: IsiDraft = { ...isi, dokumen: await uploadPendingDrafts(isi.dokumen, uploadDokumenFile) };
      setIsi(uploaded);
      desaAntiKorupsiState.edit.form = { ...formData, ...toIsiPayload(uploaded) };

      // update() sudah menampilkan toast error (mis. 400 validasi dokumen) → tetap di halaman.
      const ok = await desaAntiKorupsiState.edit.update();
      if (!ok) return;
      toast.success('Data berhasil diperbarui');
      router.push('/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi');
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat memperbarui data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Desa Anti Korupsi
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
          <TextInput
            label="Nama Program"
            placeholder="Masukkan nama program"
            value={formData.name}
            onChange={handleInputChange('name')}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <EditEditor value={formData.deskripsi} onChange={handleInputChange('deskripsi')} />
          </Box>

          <Select
            label="Kategori"
            placeholder="Pilih kategori"
            value={formData.kategoriId}
            onChange={handleSelectChange('kategoriId')}
            data={kategoriState.findMany.data?.map((v) => ({
              value: v.id,
              label: v.name,
            })) || []}
            required
            searchable
            clearable
          />

          <DokumenFolderEditor
            value={isi}
            onChange={setIsi}
            programId={typeof params?.id === 'string' ? params.id : undefined}
          />

          <Group justify="right">
            {/* Tombol Batal */}
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={handleResetForm}
            >
              Batal
            </Button>

            {/* Tombol Simpan */}
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? 'linear-gradient(135deg, #cccccc, #999999)'
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
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
