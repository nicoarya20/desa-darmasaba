'use client';
import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';
import colors from '@/con/colors';
import {
  DESKRIPSI_MAX,
  NAMA_PLATFORM_MAX,
  perpustakaanWebsiteSchema,
  type PerpustakaanWebsite,
} from '@/lib/perpustakaan-website';
import { Anchor, Box, Button, Group, Paper, Skeleton, Stack, Text, Textarea, TextInput, Title } from '@mantine/core';
import { IconDeviceFloppy, IconExternalLink, IconRefresh } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';

const EMPTY: PerpustakaanWebsite = { namaPlatform: '', deskripsi: '', websiteUrl: '' };
type FieldErrors = Partial<Record<keyof PerpustakaanWebsite, string>>;

/** Pesan galat per bidang dari skema bersama (sama dengan validasi server). */
function validate(values: PerpustakaanWebsite): FieldErrors {
  const parsed = perpustakaanWebsiteSchema.safeParse(values);
  if (parsed.success) return {};
  const errors: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof PerpustakaanWebsite;
    errors[key] ??= issue.message;
  }
  return errors;
}

/** Admin: atur nama, deskripsi, dan URL website perpustakaan yang ditautkan halaman publik. */
export default function WebsitePerpustakaanPage() {
  const state = perpustakaanDigitalState.websitePerpustakaan;
  const snap = useSnapshot(state);
  const [form, setForm] = useState<PerpustakaanWebsite>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    void state.load();
  }, [state]);

  useEffect(() => {
    setForm(snap.data ? { ...snap.data } : EMPTY);
  }, [snap.data]);

  const change = (key: keyof PerpustakaanWebsite, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSave = async () => {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    await state.save(perpustakaanWebsiteSchema.parse(form));
  };

  return (
    <Stack gap="lg">
      <Box>
        <Title order={4} fw={700} c="#1A1B1E">Website Perpustakaan</Title>
        <Text size="sm" c="dimmed" mt={2}>
          Halaman publik Perpustakaan Digital menampilkan informasi ini beserta tombol menuju website perpustakaan desa.
        </Text>
      </Box>

      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="sm" radius="md">
        {snap.loading && !snap.data ? (
          <Stack gap="sm">
            <Skeleton height={56} radius="md" />
            <Skeleton height={120} radius="md" />
            <Skeleton height={56} radius="md" />
          </Stack>
        ) : (
          <Stack gap="md">
            {snap.failed ? (
              <Text size="sm" c="red" role="alert">Pengaturan gagal dimuat. Muat ulang halaman sebelum menyimpan.</Text>
            ) : null}
            <TextInput
              label="Nama platform"
              placeholder="Contoh: Pustaka Ananta Loka"
              value={form.namaPlatform}
              onChange={(e) => change('namaPlatform', e.currentTarget.value)}
              error={errors.namaPlatform}
              maxLength={NAMA_PLATFORM_MAX}
              radius="md"
              withAsterisk
            />
            <Textarea
              label="Deskripsi"
              description={`Teks polos, maksimal ${DESKRIPSI_MAX} karakter.`}
              value={form.deskripsi}
              onChange={(e) => change('deskripsi', e.currentTarget.value)}
              error={errors.deskripsi}
              maxLength={DESKRIPSI_MAX}
              autosize
              minRows={4}
              radius="md"
              withAsterisk
            />
            <TextInput
              label="Alamat website"
              placeholder="https://..."
              description="Wajib diawali https://. Dibuka di tab baru dari halaman publik."
              value={form.websiteUrl}
              onChange={(e) => change('websiteUrl', e.currentTarget.value)}
              error={errors.websiteUrl}
              radius="md"
              withAsterisk
            />
            {snap.data?.websiteUrl ? (
              <Anchor href={snap.data.websiteUrl} target="_blank" rel="noopener noreferrer" size="sm">
                <Group gap={4} component="span">
                  Buka website tersimpan <IconExternalLink size={14} />
                </Group>
              </Anchor>
            ) : null}
            <Group justify="flex-end" mt="xs" gap="sm">
              <Button
                variant="default"
                radius="md"
                leftSection={<IconRefresh size={16} />}
                onClick={() => {
                  setForm(snap.data ? { ...snap.data } : EMPTY);
                  setErrors({});
                }}
              >
                Reset
              </Button>
              <Button
                radius="md"
                leftSection={<IconDeviceFloppy size={16} />}
                loading={snap.saving}
                disabled={snap.failed}
                onClick={handleSave}
                style={{ background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)` }}
              >
                Simpan
              </Button>
            </Group>
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
