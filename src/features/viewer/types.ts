export type FileFormat =
  | 'pdf'
  | 'hwp'
  | 'hwpx'
  | 'docx'
  | 'pptx'
  | 'xlsx'
  | 'epub'
  | 'txt'
  | 'jpg'
  | 'jpeg'
  | 'png'
  | 'heic'
  | 'webp'
  | 'unknown';

export interface ViewerProps {
  fileUri: string;
  fileName: string;
  format: FileFormat;
  onError?: (error: Error) => void;
}

export function getFileFormat(fileName: string): FileFormat {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'pdf':   return 'pdf';
    case 'hwp':   return 'hwp';
    case 'hwpx':  return 'hwpx';
    case 'docx':  return 'docx';
    case 'pptx':  return 'pptx';
    case 'xlsx':  return 'xlsx';
    case 'epub':  return 'epub';
    case 'txt':   return 'txt';
    case 'jpg':   return 'jpg';
    case 'jpeg':  return 'jpeg';
    case 'png':   return 'png';
    case 'heic':  return 'heic';
    case 'webp':  return 'webp';
    default:      return 'unknown';
  }
}

export const SUPPORTED_FORMATS: FileFormat[] = [
  'pdf', 'hwp', 'hwpx', 'docx', 'pptx', 'xlsx', 'epub',
  'txt', 'jpg', 'jpeg', 'png', 'heic', 'webp',
];

export const IMAGE_FORMATS: FileFormat[] = ['jpg', 'jpeg', 'png', 'heic', 'webp'];
export const OFFICE_FORMATS: FileFormat[] = ['docx', 'pptx'];
export const HWP_FORMATS: FileFormat[] = ['hwp', 'hwpx'];
