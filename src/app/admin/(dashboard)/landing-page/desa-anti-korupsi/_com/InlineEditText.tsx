'use client';
import { ActionIcon, Box, Group, Text, TextInput, Tooltip, UnstyledButton } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { resolveInlineCommit, type InlineValidate } from '../_lib/inline-edit';

type Finish = { value?: string; message?: string; refocus: boolean };

type InputProps = {
  initial: string;
  label: string;
  placeholder?: string;
  size: 'xs' | 'sm';
  validate?: InlineValidate;
  onFinish: (result: Finish) => void;
};

/** Mode input: Enter = simpan (tetap terbuka bila tidak valid), blur = simpan / batal bila tidak valid, Esc = batal. */
function InlineEditInput({ initial, label, placeholder, size, validate, onFinish }: InputProps) {
  const [text, setText] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);
  // Input dilepas setelah selesai; blur susulan (atau Enter lalu blur) tidak boleh commit dua kali.
  const done = useRef(false);
  const error = validate?.(text.trim()) ?? null;

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  const finish = (result: Finish) => {
    if (done.current) return;
    done.current = true;
    onFinish(result);
  };

  const commit = (trigger: 'enter' | 'blur') => {
    const result = resolveInlineCommit(initial, text, validate);
    if (result.action === 'reject') {
      if (trigger === 'blur') finish({ message: `${result.message} — nilai lama dipertahankan`, refocus: false });
      return; // Enter saat tidak valid: tetap di input, pesan error sudah tampil.
    }
    finish({ value: result.action === 'save' ? result.value : undefined, refocus: trigger === 'enter' });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit('enter');
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      finish({ refocus: true });
    }
  };

  return (
    <TextInput
      ref={ref}
      size={size}
      flex={1}
      aria-label={label}
      placeholder={placeholder}
      value={text}
      onChange={(e) => setText(e.currentTarget.value)}
      onKeyDown={onKeyDown}
      onBlur={() => commit('blur')}
      error={error}
      description="Enter simpan · Esc batal"
      data-inline-edit="input"
    />
  );
}

type Props = {
  value: string;
  /** Nama aksesibel field, mis. "Judul dokumen 1" / "Nama folder 2". */
  label: string;
  placeholder?: string;
  onSave: (value: string) => void;
  validate?: InlineValidate;
  /** Error nilai saat ini (mis. nama folder bentrok) — tampil juga di mode teks. */
  error?: string | null;
  /** Mode edit terkontrol (mis. dipicu menu "Ganti nama"); tanpa prop ini state diatur sendiri. */
  editing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  size?: 'xs' | 'sm';
  /** Elemen tambahan di samping teks (mis. jumlah dokumen folder). */
  extra?: ReactNode;
};

/** Teks yang bisa diganti inline: klik teks / ikon pensil / Enter saat fokus → input; nilai disimpan ke draft. */
export function InlineEditText({ value, label, placeholder, onSave, validate, error, editing, onEditingChange, size = 'sm', extra }: Props) {
  const [internal, setInternal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const viewRef = useRef<HTMLButtonElement>(null);
  const refocus = useRef(false);
  const isEditing = editing ?? internal;

  const setEditing = (next: boolean) => {
    if (editing === undefined) setInternal(next);
    onEditingChange?.(next);
  };

  useEffect(() => {
    if (isEditing || !refocus.current) return;
    refocus.current = false;
    viewRef.current?.focus();
  }, [isEditing]);

  const start = () => {
    setMessage(null);
    setEditing(true);
  };

  if (isEditing) {
    return (
      <InlineEditInput
        initial={value}
        label={label}
        placeholder={placeholder}
        size={size}
        validate={validate}
        onFinish={(result) => {
          if (result.value !== undefined) onSave(result.value);
          setMessage(result.message ?? null);
          refocus.current = result.refocus;
          setEditing(false);
        }}
      />
    );
  }

  const shown = value.trim();
  const pesan = message ?? error ?? null;
  return (
    <Box flex={1} miw={0} data-inline-edit="view">
      <Group gap={4} wrap="nowrap">
        <Tooltip label="Klik untuk ganti nama" openDelay={500}>
          <UnstyledButton ref={viewRef} onClick={start} aria-label={`${label}: ${shown || 'kosong'}. Ganti nama`} miw={0}>
            <Text fz={size} fw={500} truncate c={shown ? undefined : 'dimmed'}>
              {shown || placeholder || '(kosong)'}
            </Text>
          </UnstyledButton>
        </Tooltip>
        <ActionIcon variant="subtle" color="gray" size="sm" aria-label={`Ganti ${label}`} onClick={start}>
          <IconPencil size={14} />
        </ActionIcon>
        {extra}
      </Group>
      {pesan && (
        <Text fz="xs" c="red" role="alert" data-inline-edit="message">
          {pesan}
        </Text>
      )}
    </Box>
  );
}

