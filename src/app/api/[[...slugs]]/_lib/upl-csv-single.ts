export async function uplCsvSingle({
  fileName,
  file,
}: {
  fileName: string;
  file: File;
}) {
  const textFile = await file.text();
  console.log(fileName, textFile);

  return "ok";
}
