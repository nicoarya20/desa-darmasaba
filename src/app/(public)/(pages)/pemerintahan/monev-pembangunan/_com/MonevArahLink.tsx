import { DOKUMEN_PERENCANAAN_PUBLIC_HREF } from "@/lib/dokumen-perencanaan";
import { IconFileText } from "@tabler/icons-react";
import { MONEV_TEXT } from "./monev.text";
import { MonevLinkCard } from "./MonevLinkCard";

/** Kartu tautan ke Arah Kebijakan Pembangunan Desa, tempat dokumen perencanaan kini berada (selalu tampil). */
export function MonevArahLink() {
  return (
    <MonevLinkCard
      icon={IconFileText}
      title={MONEV_TEXT.arahTitle}
      body={MONEV_TEXT.arahBody}
      cta={MONEV_TEXT.arahCta}
      href={DOKUMEN_PERENCANAAN_PUBLIC_HREF}
    />
  );
}
