'use client'
import stateKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/kesehatan';
import { Box, Button, Text, TextInput } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';

function InformasiUmum() {
  const infromasiState = useProxy(stateKesehatan)
  return<Box>
      <Text fw={"bold"}>Informasi Umum</Text>
      <TextInput
        label="Fasilitas"
        placeholder='masukkan nama fasilitas kesehatan'
        onChange={(val) => {
          infromasiState.informasiumum.create.form.fasilitas = val.target.value
        }}
      />
      <TextInput
        label="Alamat"
        placeholder='masukkan alamat'
        onChange={(val) => {
          infromasiState.informasiumum.create.form.alamat = val.target.value
        }}
      />
      <TextInput
        mb={10}
        label="Jam Operasional"
        placeholder='masukkan jam operasional'
        onChange={(val) => {
          infromasiState.informasiumum.create.form.jamOperasional = val.target.value
        }}
      />
      <Button
        onClick={() => {
          infromasiState.informasiumum.create.create()
        }}>Simpan</Button>
    </Box>
}

export default InformasiUmum;
