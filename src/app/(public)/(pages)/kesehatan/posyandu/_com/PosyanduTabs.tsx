import { ScrollArea, SegmentedControl } from "@mantine/core";
import { POSYANDU_TABS, type PosyanduTab } from "./posyandu.meta";
import s from "./posyandu.module.css";
import { POSYANDU_TEXT as T } from "./posyandu.text";

const LABELS: Record<PosyanduTab, React.ReactNode> = {
  ringkasan: T.tabRingkasan,
  // Ponsel: cukup "Posyandu" agar 4 tab muat di 390px.
  posyandu: (
    <span>
      <span className={s.wideOnly}>Data </span>
      {T.tabPosyanduShort}
    </span>
  ),
  balita: T.tabBalita,
  "ibu-hamil": T.tabIbuHamil,
};

const DATA = POSYANDU_TABS.map((value) => ({ value, label: LABELS[value] }));

/** Pemilih bagian halaman (gaya pemilih tahun APBDes), di tengah di bawah judul. */
export function PosyanduTabs({ value, onChange }: { value: PosyanduTab; onChange: (tab: PosyanduTab) => void }) {
  return (
    <div className={s.tabs}>
      <ScrollArea type="never" className={s.tabsScroll}>
        <SegmentedControl
          aria-label={T.tabsLabel}
          radius="xl"
          size="md"
          data={DATA}
          value={value}
          onChange={(next) => onChange(next as PosyanduTab)}
          classNames={{ root: s.segRoot }}
        />
      </ScrollArea>
    </div>
  );
}
