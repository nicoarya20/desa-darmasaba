import { Skeleton } from "@mantine/core";
import { APBDES_TEXT } from "../apbdes.text";
import s from "../apbdes.module.css";

/** Placeholder bentuk konten (kartu ringkasan + grafik) selama data APBDes dimuat. */
export function ApbdesSkeleton() {
  return (
    <div className={s.content} role="status" aria-label={APBDES_TEXT.loading}>
      <div className={s.summary}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} h={232} radius={18} />
        ))}
      </div>
      <Skeleton h={360} radius={18} />
    </div>
  );
}
