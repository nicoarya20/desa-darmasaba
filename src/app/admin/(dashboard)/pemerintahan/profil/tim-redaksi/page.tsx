'use client';

import stateTimPengelola from '@/app/admin/(dashboard)/_state/desa/timPengelola';
import colors from '@/con/colors';
import { Alert, Box, Button, Center, Loader, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import TimRedaksiForm from './_com/TimRedaksiForm';
import { TIM_REDAKSI_ADMIN_TEXT as T } from './_com/tim-redaksi.text';

const state = stateTimPengelola;

/** Halaman admin Profil Desa > Tim Redaksi (singleton: simpan = upsert satu baris beserta daftar anggotanya). */
function Page() {
  const snap = useSnapshot(state);
  const { loading: memuat, error, data } = snap.findAdmin;
  const [dicoba, setDicoba] = useState(false);

  const muat = useCallback(async () => {
    if (await state.findAdmin.load()) state.fillForm(state.findAdmin.data);
    setDicoba(true);
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  // Form tampil hanya setelah muat sukses: data yang gagal dimuat tidak boleh disimpan "buta" menimpa daftar anggota tersimpan.
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
        {siap && (
          <TimRedaksiForm
            form={state.form}
            currentFile={data?.skFile ?? null}
            loading={snap.update.loading}
            onSubmit={(pdf) => state.update.submit(pdf)}
          />
        )}
      </Stack>
    </Box>
  );
}

export default Page;
