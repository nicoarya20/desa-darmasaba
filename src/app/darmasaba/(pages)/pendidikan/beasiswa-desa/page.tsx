'use client'
import beasiswaDesaState from '@/app/admin/(dashboard)/_state/pendidikan/beasiswa-desa';
import ringkasanBeasiswaState from '@/app/admin/(dashboard)/_state/pendidikan/ringkasan-beasiswa';
import colors from '@/con/colors';
import { Box, Button, Center, Divider, Group, Image, Modal, Pagination, Paper, Select, SimpleGrid, Skeleton, Stack, Stepper, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure, useShallowEffect } from '@mantine/hooks';
import { IconArrowRight, IconCoin, IconInfoCircle, IconSchool, IconUsers } from '@tabler/icons-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';
import { BEASISWA_LIMIT, isBeasiswaFormValid, stripDigits } from './_lib/beasiswaForm';

function formatDana(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(num)) return String(value);
  if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(num % 1_000_000_000_000 === 0 ? 0 : 1)}T`;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(num % 1_000_000_000 === 0 ? 0 : 1)}M`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}Jt`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}Rb`;
  return String(num);
}

function Page() {
  const beasiswaDesa = useProxy(beasiswaDesaState.beasiswaPendaftar, { sync: true })
  const ungggulanDesa = useProxy(beasiswaDesaState.keunggulanProgram)
  const statsBeasiswa = useProxy(ringkasanBeasiswaState.findStats)
  const [opened, { open, close }] = useDisclosure(false);
  const router = useTransitionRouter()

  // Tandai field yang sudah disentuh (blur) agar pesan error min/maks tidak
  // langsung merah saat modal pertama kali dibuka.
  const [touched, setTouched] = useState({
    namaLengkap: false, nis: false, kelas: false, jenisKelamin: false,
    alamatDomisili: false, tempatLahir: false, tanggalLahir: false,
    namaOrtu: false, nik: false, pekerjaanOrtu: false, penghasilan: false, noHp: false,
  });

  const resetForm = () => {
    beasiswaDesa.create.form = {
      namaLengkap: "",
      nis: "",
      kelas: "",
      jenisKelamin: "",
      alamatDomisili: "",
      tempatLahir: "",
      tanggalLahir: "",
      namaOrtu: "",
      nik: "",
      pekerjaanOrtu: "",
      penghasilan: "",
      noHp: "",
    };
    setTouched({
      namaLengkap: false, nis: false, kelas: false, jenisKelamin: false,
      alamatDomisili: false, tempatLahir: false, tanggalLahir: false,
      namaOrtu: false, nik: false, pekerjaanOrtu: false, penghasilan: false, noHp: false,
    });
  };

  // Tombol "Kirim" aktif hanya bila semua field memenuhi batas min/maks karakter.
  const isFormValid = () => isBeasiswaFormValid(beasiswaDesa.create.form);

  // Pesan error per field (hanya tampil setelah field disentuh) — hanya
  // memvisualkan batas min/maks yang sudah dipakai isBeasiswaFormValid, tidak
  // mengubah aturan validasi.
  const form = beasiswaDesa.create.form;
  const nikDigits = (form.nik || '').replace(/\D/g, '');
  const hpDigits = (form.noHp || '').replace(/\D/g, '');
  const nisDigits = (form.nis || '').replace(/\D/g, '');

  const namaLengkapError =
    touched.namaLengkap && (form.namaLengkap || '').trim().length < BEASISWA_LIMIT.nama.min
      ? `Nama minimal ${BEASISWA_LIMIT.nama.min} karakter`
      : null;
  const nisError =
    touched.nis && nisDigits.length < BEASISWA_LIMIT.nis.min
      ? `NIS minimal ${BEASISWA_LIMIT.nis.min} digit`
      : null;
  const kelasError =
    touched.kelas && (form.kelas || '').trim().length < BEASISWA_LIMIT.kelas.min
      ? 'Kelas wajib diisi'
      : null;
  const jenisKelaminError =
    touched.jenisKelamin && !(form.jenisKelamin || '').trim()
      ? 'Jenis kelamin wajib dipilih'
      : null;
  const alamatDomisiliError =
    touched.alamatDomisili && (form.alamatDomisili || '').trim().length < BEASISWA_LIMIT.alamat.min
      ? `Alamat minimal ${BEASISWA_LIMIT.alamat.min} karakter`
      : null;
  const tempatLahirError =
    touched.tempatLahir && (form.tempatLahir || '').trim().length < BEASISWA_LIMIT.tempatLahir.min
      ? `Tempat lahir minimal ${BEASISWA_LIMIT.tempatLahir.min} karakter`
      : null;
  const tanggalLahirError =
    touched.tanggalLahir && !(form.tanggalLahir || '').trim()
      ? 'Tanggal lahir wajib diisi'
      : null;
  const namaOrtuError =
    touched.namaOrtu && (form.namaOrtu || '').trim().length < BEASISWA_LIMIT.namaOrtu.min
      ? `Nama orang tua minimal ${BEASISWA_LIMIT.namaOrtu.min} karakter`
      : null;
  const nikError = touched.nik
    ? nikDigits.length === 0
      ? 'NIK wajib diisi'
      : nikDigits.length !== BEASISWA_LIMIT.nik.len
        ? `NIK harus ${BEASISWA_LIMIT.nik.len} digit`
        : null
    : null;
  const pekerjaanOrtuError =
    touched.pekerjaanOrtu && (form.pekerjaanOrtu || '').trim().length < BEASISWA_LIMIT.pekerjaanOrtu.min
      ? `Pekerjaan minimal ${BEASISWA_LIMIT.pekerjaanOrtu.min} karakter`
      : null;
  const penghasilanError =
    touched.penghasilan && (form.penghasilan || '').trim().length < BEASISWA_LIMIT.penghasilan.min
      ? 'Penghasilan wajib diisi'
      : null;
  const noHpError = touched.noHp
    ? hpDigits.length === 0
      ? 'No HP wajib diisi'
      : hpDigits.length < BEASISWA_LIMIT.noHp.min
        ? `No HP minimal ${BEASISWA_LIMIT.noHp.min} digit`
        : null
    : null;

  const { data, page, totalPages, loading, load } = ungggulanDesa.findMany;

  useShallowEffect(() => {
    load(page, 3, "");
  }, [page])

  useShallowEffect(() => {
    statsBeasiswa.load();
  }, [])

  const dataBeasiswa = [
    { id: 1, nama: 'Penerima Beasiswa', jumlah: statsBeasiswa.data?.jumlahPenerima?.toString() ?? '-', icon: IconUsers },
    { id: 2, nama: 'Peluang Kelulusan', jumlah: '90%', icon: IconSchool },
    { id: 3, nama: 'Dana Tersalurkan', jumlah: statsBeasiswa.data?.danaTersalurkan ? formatDana(statsBeasiswa.data.danaTersalurkan) : '-', icon: IconCoin },
  ];

  const handleSubmit = async () => {
    const success = await beasiswaDesa.create.create();
    if (success) {
      resetForm();
      close();
    }
  };

  const timeline = [
    { label: "1 Maret 2025", desc: "Pembukaan Pendaftaran", date: new Date("2025-03-01") },
    { label: "15 Maret 2025", desc: "Seleksi Administrasi", date: new Date("2025-03-15") },
    { label: "1 April 2025", desc: "Tes Potensi Akademik", date: new Date("2025-04-01") },
    { label: "15 April 2025", desc: "Wawancara", date: new Date("2025-04-15") },
    { label: "1 Mei 2025", desc: "Pengumuman Hasil", date: new Date("2025-05-01") },
  ];

  const [active, setActive] = useState(1);
  useShallowEffect(() => {
    const today = new Date();
    // cari berapa banyak tanggal yang sudah lewat
    const doneSteps = timeline.filter(item => today >= item.date).length;
    setActive(doneSteps); // active step diset sesuai tanggal
  }, []);

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={200} radius="md" />
      </Stack>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={40}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Box px={{ base: 'md', md: 100 }} pb={50}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Box>
            <Title fz={55} fw={900} c={colors['blue-button']}>
              Wujudkan Mimpi Pendidikanmu di Desa Darmasaba
            </Title>
            <Text fz="lg" mt="md" fw={"bold"}>
              Program beasiswa untuk mendukung pendidikan berkualitas bagi generasi muda Desa Darmasaba.
            </Text>
            <Group mt="xl">
              <Button size="lg" radius="xl" bg={colors['blue-button']} rightSection={<IconArrowRight size={20} />} onClick={open}>
                Daftar Sekarang
              </Button>
              <Button onClick={() => router.push('/darmasaba/pendidikan/beasiswa-desa/pelajari-lebih-lanjut')} size="lg" radius="xl" variant="light" color={colors['blue-button']} rightSection={<IconInfoCircle size={20} />}>
                Pelajari Lebih Lanjut
              </Button>
            </Group>
          </Box>
          <Box>
            <Image alt="Beasiswa Desa" src="/beasiswa-siswa.png" radius="lg" loading="lazy" />
          </Box>
        </SimpleGrid>

        <SimpleGrid mt={50} cols={{ base: 1, md: 3 }} spacing="lg">
          {dataBeasiswa.map((v, k) => {
            const IconComp = v.icon;
            return (
              <Paper key={k} p="xl" radius="xl" shadow="md" bg={colors['white-trans-1']} withBorder>
                <Stack align="center" gap="sm">
                  <IconComp size={45} color={colors['blue-button']} />
                  <Title fz={42} fw={900} c={colors['blue-button']}>{v.jumlah}</Title>
                  <Text fz="sm" ta="center">{v.nama}</Text>
                </Stack>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Box>

      <Box px={{ base: 'md', md: 100 }} pb={20}>
        <Title pb={20} ta="center" order={1} fw={900} c={colors['blue-button']}>
          Keunggulan Program
        </Title>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {data.map((v, k) => (
            <Paper key={k} p="xl" radius="xl" shadow="sm" bg={colors['white-trans-1']}>
              <Title order={3} fw={700} c={colors['blue-button']} mb="xs">{v.judul}</Title>
              <Text fz="sm" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: v.deskripsi }} />
            </Paper>
          ))}
        </SimpleGrid>

        <Center>
          <Pagination
            value={page}
            onChange={(newPage) => {
              load(newPage, 10);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            total={totalPages}
            mt="md"
            mb="md"
            color="blue"
            radius="md"
          />
        </Center>

        <Title py={40} ta="center" order={1} fw={900} c={colors['blue-button']}>
          Timeline Pendaftaran
        </Title>
        <Center>
          <Stepper
            mt={20}
            active={active}
            onStepClick={setActive}
            orientation="vertical"
            allowNextStepsSelect={false}
          >
            {timeline.map((item, index) => (
              <Stepper.Step
                key={index}
                label={item.label}
                description={item.desc}
              />
            ))}
          </Stepper>
        </Center>
      </Box>

      <Modal
        opened={opened}
        onClose={close}
        radius="xl"
        size="lg"
        transitionProps={{ transition: 'fade', duration: 200 }}
        title={
          <Text fz="xl" fw={800} c={colors['blue-button']}>
            Formulir Beasiswa
          </Text>
        }
      >
        <Paper p="lg" radius="xl" withBorder shadow="sm">
          <Stack gap="sm">
            <TextInput
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap"
              withAsterisk
              maxLength={BEASISWA_LIMIT.nama.max}
              error={namaLengkapError}
              value={beasiswaDesa.create.form.namaLengkap}
              onChange={(val) => { beasiswaDesa.create.form.namaLengkap = stripDigits(val.target.value) }}
              onBlur={() => setTouched((t) => ({ ...t, namaLengkap: true }))} />
            <TextInput
              label="NIS"
              placeholder="Masukkan NIS"
              withAsterisk
              inputMode="numeric"
              maxLength={BEASISWA_LIMIT.nis.max}
              error={nisError}
              value={beasiswaDesa.create.form.nis}
              onChange={(val) => { beasiswaDesa.create.form.nis = val.target.value.replace(/\D/g, '').slice(0, BEASISWA_LIMIT.nis.max) }}
              onBlur={() => setTouched((t) => ({ ...t, nis: true }))} />
            <TextInput
              label="Kelas"
              placeholder="Masukkan kelas"
              withAsterisk
              maxLength={BEASISWA_LIMIT.kelas.max}
              error={kelasError}
              value={beasiswaDesa.create.form.kelas}
              onChange={(val) => { beasiswaDesa.create.form.kelas = val.target.value }}
              onBlur={() => setTouched((t) => ({ ...t, kelas: true }))} />
            <Select
              label="Jenis Kelamin"
              placeholder="Pilih jenis kelamin"
              withAsterisk
              data={[{ value: "LAKI_LAKI", label: "Laki-laki" }, { value: "PEREMPUAN", label: "Perempuan" }]}
              error={jenisKelaminError}
              value={beasiswaDesa.create.form.jenisKelamin || null}
              onChange={(val) => { if (val) beasiswaDesa.create.form.jenisKelamin = val }}
              onBlur={() => setTouched((t) => ({ ...t, jenisKelamin: true }))} />
            <TextInput
              label="Alamat Domisili"
              placeholder="Masukkan alamat domisili"
              withAsterisk
              maxLength={BEASISWA_LIMIT.alamat.max}
              error={alamatDomisiliError}
              value={beasiswaDesa.create.form.alamatDomisili}
              onChange={(val) => { beasiswaDesa.create.form.alamatDomisili = val.target.value }}
              onBlur={() => setTouched((t) => ({ ...t, alamatDomisili: true }))} />
            <TextInput
              label="Tempat Lahir"
              placeholder="Masukkan tempat lahir"
              withAsterisk
              maxLength={BEASISWA_LIMIT.tempatLahir.max}
              error={tempatLahirError}
              value={beasiswaDesa.create.form.tempatLahir}
              onChange={(val) => { beasiswaDesa.create.form.tempatLahir = val.target.value }}
              onBlur={() => setTouched((t) => ({ ...t, tempatLahir: true }))} />
            <TextInput
              type="date"
              label="Tanggal Lahir"
              placeholder="Pilih tanggal lahir"
              withAsterisk
              error={tanggalLahirError}
              value={beasiswaDesa.create.form.tanggalLahir}
              onChange={(val) => { beasiswaDesa.create.form.tanggalLahir = val.target.value }}
              onBlur={() => setTouched((t) => ({ ...t, tanggalLahir: true }))} />
            <Box pt={15} pb={10}>
              <Divider />
            </Box>
            <TextInput
              label="Nama Orang Tua / Wali"
              placeholder="Masukkan nama orang tua / wali"
              withAsterisk
              maxLength={BEASISWA_LIMIT.namaOrtu.max}
              error={namaOrtuError}
              value={beasiswaDesa.create.form.namaOrtu}
              onChange={(val) => { beasiswaDesa.create.form.namaOrtu = stripDigits(val.target.value) }}
              onBlur={() => setTouched((t) => ({ ...t, namaOrtu: true }))} />
            <TextInput
              label="NIK Orang Tua / Wali"
              placeholder="Masukkan NIK orang tua / wali"
              withAsterisk
              inputMode="numeric"
              maxLength={BEASISWA_LIMIT.nik.len}
              error={nikError}
              value={beasiswaDesa.create.form.nik || ''}
              onChange={(val) => { beasiswaDesa.create.form.nik = val.target.value.replace(/\D/g, '').slice(0, BEASISWA_LIMIT.nik.len) }}
              onBlur={() => setTouched((t) => ({ ...t, nik: true }))} />
            <TextInput
              label="Pekerjaan Orang Tua / Wali"
              placeholder="Masukkan pekerjaan orang tua / wali"
              withAsterisk
              maxLength={BEASISWA_LIMIT.pekerjaanOrtu.max}
              error={pekerjaanOrtuError}
              value={beasiswaDesa.create.form.pekerjaanOrtu}
              onChange={(val) => { beasiswaDesa.create.form.pekerjaanOrtu = val.target.value }}
              onBlur={() => setTouched((t) => ({ ...t, pekerjaanOrtu: true }))} />
            <TextInput
              label="Penghasilan Orang Tua / Wali"
              placeholder="Masukkan penghasilan orang tua / wali"
              withAsterisk
              maxLength={BEASISWA_LIMIT.penghasilan.max}
              error={penghasilanError}
              value={beasiswaDesa.create.form.penghasilan}
              onChange={(val) => { beasiswaDesa.create.form.penghasilan = val.target.value }}
              onBlur={() => setTouched((t) => ({ ...t, penghasilan: true }))} />
            <TextInput
              label="No HP"
              placeholder="Masukkan no hp"
              withAsterisk
              inputMode="numeric"
              maxLength={BEASISWA_LIMIT.noHp.max}
              error={noHpError}
              value={beasiswaDesa.create.form.noHp}
              onChange={(val) => { beasiswaDesa.create.form.noHp = val.target.value.replace(/\D/g, '').slice(0, BEASISWA_LIMIT.noHp.max) }}
              onBlur={() => setTouched((t) => ({ ...t, noHp: true }))} />
            <Group justify="flex-end" mt="md">
              <Button variant="default" radius="xl" onClick={close}>Batal</Button>
              <Button radius="xl" bg={colors['blue-button']} onClick={handleSubmit} disabled={!isFormValid()}>Kirim</Button>
            </Group>
          </Stack>
        </Paper>
      </Modal>
    </Stack>
  );
}

export default Page;
