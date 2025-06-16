export function convertYoutubeUrlToEmbed(url: string): string | null {
    const watchRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/;
    const shortRegex = /(?:https?:\/\/)?youtu\.be\/([^?]+)/;
  
    const matchWatch = url.match(watchRegex);
    const matchShort = url.match(shortRegex);
  
    if (matchWatch) {
      return `https://www.youtube.com/embed/${matchWatch[1]}`;
    }
  
    if (matchShort) {
      return `https://www.youtube.com/embed/${matchShort[1]}`;
    }
  
    return null;
  }
  