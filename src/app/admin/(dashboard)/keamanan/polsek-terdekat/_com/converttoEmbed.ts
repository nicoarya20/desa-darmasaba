function convertGoogleMapsToEmbed(url: string): string | null {
    const match = url.match(/https:\/\/www\.google\.com\/maps\/place\/([^/]+)/);
  
    if (!match) return null;
  
    const place = match[1]; // misal: Polsek+Denpasar+Selatan
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${place}`;
  }
export default convertGoogleMapsToEmbed