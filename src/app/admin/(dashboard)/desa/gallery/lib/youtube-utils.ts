export function convertYoutubeUrlToEmbed(url: string) {
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : null;
}









// (url: string): string | null {
//     const watchRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/;
//     const shortRegex = /(?:https?:\/\/)?youtu\.be\/([^?]+)/;
  
//     const matchWatch = url.match(watchRegex);
//     const matchShort = url.match(shortRegex);
  
//     if (matchWatch) {
//       return `https://www.youtube.com/embed/${matchWatch[1]}`;
//     }
  
//     if (matchShort) {
//       return `https://www.youtube.com/embed/${matchShort[1]}`;
//     }
  
//     return null;
//   }
  