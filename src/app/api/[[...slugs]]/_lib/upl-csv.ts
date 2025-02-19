async function uplCsv({ files }: { files: File[] }) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("Tidak ada file yang diunggah");
  }

  for (const file of files) {
    const textFile = await file.text();
    const fileName = file.name;

    console.log(textFile, fileName);
  }

  return "ok";
}

export default uplCsv;
