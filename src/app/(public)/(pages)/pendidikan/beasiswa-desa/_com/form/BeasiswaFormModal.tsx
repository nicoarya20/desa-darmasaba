'use client';
import { Modal } from '@mantine/core';
import { toast } from 'react-toastify';
import s from './beasiswa-form.module.css';
import { BEASISWA_FORM_TEXT as T } from './beasiswa-form.text';
import { BeasiswaFormContent } from './BeasiswaFormContent';
import { useBeasiswaForm } from './use-beasiswa-form';

type Props = { opened: boolean; onClose: () => void };

/**
 * Modal pendaftaran beasiswa (satu-satunya formulir; dulu disalin di dua halaman). Isian bertahan saat modal
 * ditutup tanpa kirim; berhasil → isian dikosongkan, toast, modal ditutup; gagal → pesan di modal.
 */
export function BeasiswaFormModal({ opened, onClose }: Props) {
  const api = useBeasiswaForm();

  const submit = async () => {
    if (await api.submit()) {
      toast.success(T.sent);
      onClose();
    } else {
      // Bawa isian tidak valid pertama ke layar (galat sudah tampil di bawah isian).
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(`.${s.form} [aria-invalid="true"]`)?.focus();
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={T.title}
      size="lg"
      radius={18}
      padding="xl"
      classNames={{ title: s.modalTitle, header: s.modalHeader }}
      overlayProps={{ backgroundOpacity: 0.4, blur: 8 }}
    >
      <BeasiswaFormContent api={api} onCancel={onClose} onSubmit={submit} brandColor="var(--c-brand-fill)" />
    </Modal>
  );
}
