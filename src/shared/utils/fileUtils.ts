import { type FileFormat, getFileFormat, SUPPORTED_FORMATS } from '../../features/viewer/types';

export { getFileFormat };

/** URI에서 파일명 추출 */
export function getFileNameFromUri(uri: string): string {
  return decodeURIComponent(uri.split('/').pop() ?? 'document');
}

/** 파일 크기를 사람이 읽기 쉬운 형태로 변환 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 이 앱이 지원하는 포맷인지 확인 */
export function isSupportedFormat(fileName: string): boolean {
  const format = getFileFormat(fileName);
  return SUPPORTED_FORMATS.includes(format as FileFormat);
}

/** MIME 타입 → FileFormat 변환 */
export function mimeToFormat(mimeType: string): FileFormat {
  const mime = mimeType.toLowerCase();
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('hwp')) return 'hwp';
  if (mime.includes('docx') || mime.includes('wordprocessingml')) return 'docx';
  if (mime.includes('pptx') || mime.includes('presentationml')) return 'pptx';
  if (mime.includes('xlsx') || mime.includes('spreadsheetml')) return 'xlsx';
  if (mime.includes('epub')) return 'epub';
  if (mime.includes('text/plain')) return 'txt';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('heic') || mime.includes('heif')) return 'heic';
  return 'unknown';
}
