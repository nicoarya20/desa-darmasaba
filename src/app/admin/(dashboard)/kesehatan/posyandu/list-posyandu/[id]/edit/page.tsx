'use client';
import posyandustate from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu';
import { formDariPosyandu, type PosyanduForm } from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu.form';
import { hapusUnggahanYatim, unggahGambar } from '@/app/admin/(dashboard)/_state/konten-bersama/unggah-gambar';
import { Alert, Skeleton, Stack } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PosyanduGaleriAdmin from '../../../_com/posyandu.galeri-admin';
import PosyanduFormPage from '../../../_com/posyandu.form-page';

type Detail = { id: string; imageId: string | null; image?: { link: string } | null } & Parameters<typeof formDariPosyandu>[0];
type Muat = { status: 'loading' } | { status: 'gagal' } | { status: 'ready'; data: Detail };

/** Halaman admin edit posyandu banjar: form detail + galeri foto lokasi & kader. */
function EditPosyandu() {
  const id = useParams()?.id as string;
  const [muat, setMuat] = useState<Muat>({ status: 'loading' });

  useEffect(() => {
    if (!id) return;
    let batal = false;
    void posyandustate.edit.load(id).then((data: Detail | null) => {
      if (!batal) setMuat(data ? { status: 'ready', data } : { status: 'gagal' });
    });
    return () => {
      batal = true;
    };
  }, [id]);

  if (muat.status === 'gagal') return <Alert color="red" m="md">Data posyandu tidak ditemukan atau gagal dimuat.</Alert>;
  if (muat.status === 'loading' || muat.data.id !== id) {
    return (
      <Stack p="md">
        <Skeleton h={500} radius="md" />
      </Stack>
    );
  }

  const { data } = muat;
  /** Unggah gambar pengganti (bila ada) lalu simpan; gambar baru dibersihkan bila penyimpanan gagal. */
  const simpan = async (form: PosyanduForm, gambarBaru: File | null): Promise<boolean> => {
    let imageBaru: string | null = null;
    try {
      if (gambarBaru) imageBaru = await unggahGambar(gambarBaru);
      posyandustate.edit.form = { ...form, imageId: imageBaru ?? data.imageId ?? '' };
      if (await posyandustate.edit.update()) return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui posyandu');
    }
    if (imageBaru) await hapusUnggahanYatim([imageBaru], 'edit posyandu');
    return false;
  };

  return (
    <PosyanduFormPage
      key={id}
      judul="Edit Posyandu"
      awal={formDariPosyandu(data)}
      gambarUrl={data.image?.link ?? null}
      onSimpan={simpan}
    >
      <PosyanduGaleriAdmin posyanduId={id} />
    </PosyanduFormPage>
  );
}

export default EditPosyandu;
