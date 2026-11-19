'use client'
import colors from '@/con/colors';
import {
  ALAMAT_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  NAMA_KANTOR_MAX_LENGTH,
  TELEPON_MAX_LENGTH,
  type KontakDesaFormValues,
} from '@/lib/kontak-desa';
import { Button, Group, Paper, Stack, Text, Textarea, TextInput, Title } from '@mantine/core';
import { useSnapshot } from 'valtio';
import { KONTAK_DESA_ADMIN_TEXT as T } from './kontak-desa.text';

type Props = {
  /** Proxy Valtio isi form (state.form); ditulis langsung, dibaca lewat snapshot sinkron. */
  form: KontakDesaFormValues;
  loading: boolean;
  onSubmit: () => void;
};

/** Form Kontak Desa: nama kantor, alamat, telepon, email. */
export default function KontakDesaForm({ form, loading, onSubmit }: Props) {
  // sync: true agar input terkontrol tidak loncat caret (snapshot Valtio default dibatch async).
  const snap = useSnapshot(form, { sync: true });

  return (
    <Paper withBorder bg={colors['white-1']} p="xl" radius="md" shadow="sm" w={{ base: '100%', md: '60%' }}>
      <Stack gap="md">
        <div>
          <Title order={3} mb={4}>{T.title}</Title>
          <Text size="sm" c="dimmed">{T.lead}</Text>
        </div>
        <TextInput
          label={T.namaKantor}
          maxLength={NAMA_KANTOR_MAX_LENGTH}
          value={snap.namaKantor}
          onChange={(e) => (form.namaKantor = e.currentTarget.value)}
          required
        />
        <Textarea
          label={T.alamat}
          autosize
          minRows={2}
          maxLength={ALAMAT_MAX_LENGTH}
          value={snap.alamat}
          onChange={(e) => (form.alamat = e.currentTarget.value)}
          required
        />
        <TextInput
          label={T.telepon}
          description={T.teleponHint}
          inputMode="tel"
          maxLength={TELEPON_MAX_LENGTH}
          value={snap.telepon}
          onChange={(e) => (form.telepon = e.currentTarget.value)}
          required
        />
        <TextInput
          label={T.email}
          type="email"
          maxLength={EMAIL_MAX_LENGTH}
          value={snap.email}
          onChange={(e) => (form.email = e.currentTarget.value)}
          required
        />
        <Group justify="flex-end">
          <Button bg={colors['blue-button']} loading={loading} onClick={onSubmit}>
            {T.submit}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
