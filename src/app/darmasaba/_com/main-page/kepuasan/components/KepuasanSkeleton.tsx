import { Skeleton } from "@mantine/core";
import s from "../kepuasan.module.css";
import { KEPUASAN_TEXT } from "../kepuasan.text";

/** Placeholder bentuk konten (panel grafik bulanan + 3 kartu donat) selama data dimuat. */
export function KepuasanSkeleton() {
  return (
    <div className={s.content} role="status" aria-label={KEPUASAN_TEXT.loading}>
      <Skeleton h={400} radius={18} />
      <div className={s.grid}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} h={320} radius={18} />
        ))}
      </div>
    </div>
  );
}
