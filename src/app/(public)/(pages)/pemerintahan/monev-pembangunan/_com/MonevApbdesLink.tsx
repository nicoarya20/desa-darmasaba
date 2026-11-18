import { IconChartBar } from "@tabler/icons-react";
import { APBDES_HREF } from "./monev.meta";
import { MONEV_TEXT } from "./monev.text";
import { MonevLinkCard } from "./MonevLinkCard";

/** Panel tautan ke halaman realisasi APBDes (selalu tampil, juga saat data monev kosong). */
export function MonevApbdesLink() {
  return (
    <MonevLinkCard
      icon={IconChartBar}
      title={MONEV_TEXT.apbdesTitle}
      body={MONEV_TEXT.apbdesBody}
      cta={MONEV_TEXT.apbdesCta}
      href={APBDES_HREF}
    />
  );
}
