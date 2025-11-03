declare module 'react-exif-orientation-img' {
  import { ImgHTMLAttributes } from 'react';

  interface ExifOrientationImgProps extends ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    className?: string;
    style?: React.CSSProperties;
  }

  const ExifOrientationImg: React.FC<ExifOrientationImgProps>;
  export default ExifOrientationImg;
}
