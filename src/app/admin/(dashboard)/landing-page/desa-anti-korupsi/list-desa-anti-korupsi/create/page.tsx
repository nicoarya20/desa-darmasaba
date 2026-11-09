/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import korupsiState from '@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Loader,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import { DokumenFolderEditor } from '../../_com/DokumenFolderEditor';
import {
  isDraftListValid,
  toDokumenPayload,
  uploadPendingDrafts,
  type DokumenDraft,
} from '../../_lib/dokumen-draft';
import { uploadDokumenFile } from '../../_lib/upload-dokumen';

export default function CreateDesaAntiKorupsi() {
  const router = useRouter();
  const stateKorupsi = useProxy(korupsiState.desaAntikorupsi, { sync: true }); // sync: cegah caret jump di controlled input
  // Snapshot cabang kategoriDesaAntiKorupsi agar Select re-render saat
  // findMany.load() async selesai — JSX sebelumnya baca raw proxy (race, STG).
  const kategoriState = useProxy(korupsiState.kategoriDesaAntiKorupsi);
  const [drafts, setDrafts] = useState<DokumenDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      isDraftListValid(drafts) &&
      stateKorupsi.create.form.name?.trim() !== '' &&
      stateKorupsi.create.form.kategoriId?.trim() !== ''
    );
  };

  useEffect(() => {
    stateKorupsi.findMany.load();
    korupsiState.kategoriDesaAntiKorupsi.findMany.load();
  }, []);

  const resetForm = () => {
    stateKorupsi.create.form = {
      name: '',
      deskripsi: '',
      kategoriId: '',
      dokumen: [],
    };
    setDrafts([]);
  };

  const handleSubmit = async () => {
    if (!stateKorupsi.create.form.name) {
      return toast.warn('Masukkan nama program');
    }
    if (!stateKorupsi.create.form.kategoriId) {
      return toast.warn('Pilih kategori program');
    }

    setIsSubmitting(true);
    try {
      // Berkas diunggah saat simpan (bukan saat dipilih) agar batal = tidak ada file yatim.
      const uploaded = await uploadPendingDrafts(drafts, uploadDokumenFile);
      setDrafts(uploaded);
      stateKorupsi.create.form.dokumen = toDokumenPayload(uploaded);
      await stateKorupsi.create.create();

      toast.success('Data berhasil disimpan');
      resetForm();
      router.push('/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Terjadi kesalahan saat menyimpan data');
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
        <Title order={4} c="dark">
          Tambah Program Desa Anti Korupsi
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
            value={stateKorupsi.create.form.name || ''}
            onChange={(e) => (stateKorupsi.create.form.name = e.target.value)}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <CreateEditor
              value={stateKorupsi.create.form.deskripsi || ''}
              onChange={(val) => (stateKorupsi.create.form.deskripsi = val)}
            />
          </Box>

          <Select
            label="Kategori"
            placeholder="Pilih kategori"
            data={kategoriState.findMany.data?.map((item) => ({
              label: item.name,
              value: item.id,
            })) || []}
            value={stateKorupsi.create.form.kategoriId || null}
            onChange={(val: string | null) => {
              if (val) {
                const selected = kategoriState.findMany.data?.find(
                  (item) => item.id === val
                );
                if (selected) {
                  stateKorupsi.create.form.kategoriId = selected.id;
                }
              } else {
                stateKorupsi.create.form.kategoriId = '';
              }
            }}
            searchable
            clearable
            nothingFoundMessage="Tidak ditemukan"
            required
          />

          <DokumenFolderEditor value={drafts} onChange={setDrafts} />

          <Group justify="right">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={resetForm}
            >
              Reset
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
