/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import colors from '@/con/colors';
import { ActionIcon, Box, Button, Group, Loader, Paper, Stack, TextInput, Title } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { IconArrowBack, IconClock } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function CreateDokter() {
  const createState = useProxy(fasilitasKesehatanState.dokter)
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      createState.create.create.form.name?.trim() !== '' &&
      createState.create.create.form.specialist?.trim() !== '' &&
      createState.create.create.form.jadwal?.trim() !== '' &&
      createState.create.create.form.jadwalLibur?.trim() !== '' &&
      createState.create.create.form.jamBukaOperasional !== '' &&
      createState.create.create.form.jamTutupOperasional !== '' &&
      createState.create.create.form.jamBukaLibur !== '' &&
      createState.create.create.form.jamTutupLibur !== ''
    );
  };

  const resetForm = () => {
    createState.create.create.form = {
      name: "",
      specialist: "",
      jadwal: "",
      jadwalLibur: "",
      jamBukaOperasional: "",
      jamTutupOperasional: "",
      jamBukaLibur: "",
      jamTutupLibur: "",
    };
  };

  const refBuka = useRef<HTMLInputElement>(null);
  const refTutup = useRef<HTMLInputElement>(null);
  const refBukaLibur = useRef<HTMLInputElement>(null);
  const refTutupLibur = useRef<HTMLInputElement>(null);

  const picker = (ref: any) => (
    <ActionIcon variant="subtle" color="gray" onClick={() => ref.current?.showPicker()}>
      <IconClock size={16} stroke={1.5} />
    </ActionIcon>
  );


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    
    if (!createState.create.create.form.name?.trim()) {
      toast.error('Nama dokter wajib diisi');
      return;
    }

    if (!createState.create.create.form.specialist?.trim()) {
      toast.error('Specialist wajib diisi');
      return;
    }

    if (!createState.create.create.form.jadwal?.trim()) {
      toast.error('Jadwal wajib diisi');
      return;
    }

    if (!createState.create.create.form.jadwalLibur?.trim()) {
      toast.error('Jadwal libur wajib diisi');
      return;
    }

    if (!createState.create.create.form.jamBukaOperasional) {
      toast.error('Jam buka operasional wajib diisi');
      return;
    }

    if (!createState.create.create.form.jamTutupOperasional) {
      toast.error('Jam tutup operasional wajib diisi');
      return;
    }

    if (!createState.create.create.form.jamBukaLibur) {
      toast.error('Jam buka hari libur wajib diisi');
      return;
    }

    if (!createState.create.create.form.jamTutupLibur) {
      toast.error('Jam tutup hari libur wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      await createState.create.create.create();
      toast.success('Data berhasil disimpan');
      resetForm();
      router.push(`/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/dokter-tenaga-medis`)
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs" component="form" onSubmit={handleSubmit}>
      {/* Header */}
      <Group mb="md">
        <Button
          variant="subtle"
          onClick={() => router.back()}
          p="xs"
          radius="md"
        >
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Data Dokter & Tenaga Medis
        </Title>
      </Group>

      {/* Form */}
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
            label={"Nama Dokter"}
            placeholder="Masukkan nama dokter"
            value={createState.create.create.form.name}
            onChange={(e) => (createState.create.create.form.name = e.target.value)}
            required
          />

          {/* Informasi Umum */}

          <TextInput
            label="Specialist"
            placeholder="Masukkan specialist"
            value={createState.create.create.form.specialist}
            onChange={(e) => (createState.create.create.form.specialist = e.target.value)}
            required
          />

          <TextInput
            label="Jadwal"
            placeholder="Masukkan jadwal"
            value={createState.create.create.form.jadwal}
            onChange={(e) => (createState.create.create.form.jadwal = e.target.value)}
            required
          />

          <TextInput
            label="Jadwal Libur"
            placeholder="Masukkan jadwal libur"
            value={createState.create.create.form.jadwalLibur}
            onChange={(e) => (createState.create.create.form.jadwalLibur = e.target.value)}
            required
          />

          <TimeInput
            label="Jam Buka Operasional"
            ref={refBuka}
            rightSection={picker(refBuka)}
            value={createState.create.create.form.jamBukaOperasional}
            onChange={(e) => (createState.create.create.form.jamBukaOperasional = e.target.value)}
            required
          />

          <TimeInput
            label="Jam Tutup Operasional"
            ref={refTutup}
            rightSection={picker(refTutup)}
            value={createState.create.create.form.jamTutupOperasional}
            onChange={(e) => (createState.create.create.form.jamTutupOperasional = e.target.value)}
            required
          />

          <TimeInput
            label="Jam Buka Hari Libur"
            ref={refBukaLibur}
            rightSection={picker(refBukaLibur)}
            value={createState.create.create.form.jamBukaLibur}
            onChange={(e) => (createState.create.create.form.jamBukaLibur = e.target.value)}
            required
          />

          <TimeInput
            label="Jam Tutup Hari Libur"
            ref={refTutupLibur}
            rightSection={picker(refTutupLibur)}
            value={createState.create.create.form.jamTutupLibur}
            onChange={(e) => (createState.create.create.form.jamTutupLibur = e.target.value)}
            required
          />

          {/* Submit */}
          <Group justify="right">
            {/* Tombol Batal */}
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
                  ? `linear-gradient(135deg, #cccccc, #eeeeee)`
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

export default CreateDokter;
