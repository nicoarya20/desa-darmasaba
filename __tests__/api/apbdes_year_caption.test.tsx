// @vitest-environment node
// APBDes publik hanya menampilkan satu tahun: caption "Tahun X" + tanggal pembaruan,
// tanpa pemilih tahun (SegmentedControl) di beranda maupun halaman /apbdes.
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MantineProvider } from "@mantine/core";
import { ApbdesYearCaption } from "@/app/(public)/_com/main-page/apbdes/components/ApbdesYearCaption";
import { APBDES_TEXT } from "@/app/(public)/_com/main-page/apbdes/apbdes.text";

const render = (updated: Date | null) =>
  renderToStaticMarkup(
    <MantineProvider>
      <ApbdesYearCaption year={2025} updated={updated} />
    </MantineProvider>
  );

describe("ApbdesYearCaption — hanya caption tahun terbaru", () => {
  it("memuat tahun 2025 dan tanggal pembaruan, tanpa SegmentedControl", () => {
    const html = render(new Date("2026-11-03T06:45:42.617Z"));

    expect(html).toContain(APBDES_TEXT.singleYear(2025));
    expect(html).toContain("2025");
    expect(html).toContain('dateTime="2026-11-03T06:45:42.617Z"');
    expect(html).toContain(APBDES_TEXT.updatedAt("3 November 2026"));
    expect(html).not.toContain('role="radiogroup"');
    expect(html).not.toContain("mantine-SegmentedControl");
  });

  it("tanpa tanggal pembaruan → hanya caption tahun, tanpa <time>", () => {
    const html = render(null);

    expect(html).toContain(APBDES_TEXT.singleYear(2025));
    expect(html).not.toContain("<time");
  });
});
