import path from 'path';
import fs from 'fs';
import { compress } from 'compress-pdf';

(async () => {
    const pdf = path.resolve("/Users/bip/Downloads", 'komoditas.pdf');
    const buffer = await compress(pdf);

    const compressedPdf = path.resolve(__dirname, 'compressed_pdf.pdf');
    await fs.promises.writeFile(compressedPdf, buffer);
})();