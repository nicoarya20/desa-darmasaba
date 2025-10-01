// export function convertYoutubeUrlToEmbed(url: string) {
//   const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
//   return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : null;
// }

export function convertYoutubeUrlToEmbed(url: string) {
  const videoIdMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : null;
}