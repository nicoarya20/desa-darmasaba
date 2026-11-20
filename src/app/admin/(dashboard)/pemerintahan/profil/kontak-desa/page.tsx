'use client';

import stateKontakDesa from '@/app/admin/(dashboard)/_state/desa/kontakDesa';
import colors from '@/con/colors';
import { Alert, Box, Button, Center, Loader, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import KontakDesaForm from './_com/KontakDesaForm';
import { KONTAK_DESA_ADMIN_TEXT as T } from './_com/kontak-desa.text';

const state = stateKontakDesa;

/** Halaman admin Profil Desa > Kontak Desa (singleton: simpan = upsert satu baris). */
function Page() {
  const snap = useSnapshot(state);
  const { loading: memuat, error } = snap.findUnique;
  const [dicoba, setDicoba] = useState(false);

  const muat = useCallback(async () => {
    if (await state.findUnique.load()) state.fillForm(state.findUnique.data);
    setDicoba(true);
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  // Form tampil hanya setelah muat sukses: kontak yang gagal dimuat tidak boleh disimpan "buta" menimpa data tersimpan.
  const siap = dicoba && !memuat && !error;

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Stack gap="md">
        {error && (
          <Alert icon={<IconAlertCircle size={20} />} color="red" title={T.loadError} radius="md">
            {error}
            <Box mt="sm">
              <Button size="xs" variant="outline" color="red" onClick={() => void muat()}>
                {T.retry}
              </Button>
            </Box>
          </Alert>
        )}
        {memuat && (
          <Center h={300}>
            <Loader color={colors['blue-button']} />
          </Center>
        )}
        {siap && <KontakDesaForm form={state.form} loading={snap.update.loading} onSubmit={() => void state.update.submit()} />}
      </Stack>
    </Box>
  );
}

export default Page;
