import { Text } from '@mantine/core';

type Props = {
  /** Berkas PDF baris informasi; null/undefined untuk baris lama tanpa berkas. */
  file: { link: string; realName: string } | null | undefined;
};

/** Tautan unduh berkas PDF satu baris informasi publik di admin (tab baru); tanpa berkas menampilkan "-". */
export function BerkasLink({ file }: Props) {
  if (!file) {
    return (
      <Text fz="sm" c="dimmed">
        -
      </Text>
    );
  }
  return (
    <Text fz="sm" lineClamp={1}>
      <a href={file.link} target="_blank" rel="noreferrer">
        {file.realName}
      </a>
    </Text>
  );
}
