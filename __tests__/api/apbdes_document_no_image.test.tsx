// @vitest-environment node
// Panel dokumen APBDes publik hanya berbasis dokumen `file`: tampil dengan tombol
// unduh bila ada file, null bila tidak ada, dan tidak pernah merender <img> dari `image`.
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MantineProvider } from "@mantine/core";
import { ApbdesDocument } from "@/app/(public)/_com/main-page/apbdes/components/ApbdesDocument";
import { APBDES_TEXT } from "@/app/(public)/_com/main-page/apbdes/apbdes.text";
import type { APBDes } from "@/app/(public)/_com/main-page/apbdes/types/apbdes";

const base: APBDes = { id: "a1", tahun: 2025, jumlah: 0, name: "APBDes 2025" };
// Data lama di DB masih bisa membawa relasi image; komponen wajib mengabaikannya.
const legacyImage = { image: { id: "img1", link: "https://cdn.test/sampul.png" } };

const render = (apbdes: APBDes) =>
  renderToStaticMarkup(
    <MantineProvider>
      <ApbdesDocument apbdes={apbdes} />
    </MantineProvider>
  );

describe("ApbdesDocument — hanya dokumen file", () => {
  it("ada file → link unduh ke dokumen, tanpa <img>", () => {
    const html = render({ ...base, ...legacyImage, file: { id: "f1", link: "https://cdn.test/apbdes.pdf" } } as APBDes);

    expect(html).toContain('href="https://cdn.test/apbdes.pdf"');
    expect(html).toContain(APBDES_TEXT.download);
    expect(html).toContain(APBDES_TEXT.documentTitle);
    expect(html).not.toContain("<img");
    expect(html).not.toContain("sampul.png");
  });

  it("tanpa file → tidak merender apa pun (walau data lama punya image)", () => {
    expect(render({ ...base, ...legacyImage } as APBDes)).not.toContain(APBDES_TEXT.documentTitle);
    expect(render({ ...base, file: null })).not.toContain("<a");
  });
});
