export type FileFormat =
  | 'pdf'
  | 'hwp'
  | 'hwpx'
  | 'docx'
  | 'doc'
  | 'pptx'
  | 'ppt'
  | 'xlsx'
  | 'xls'
  | 'epub'
  | 'txt'
  | 'html'
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

// 텍스트로 읽을 수 있는 확장자 — 모두 'txt' 로 라우팅 (TxtViewer 가 처리)
const TEXT_EXTS = new Set([
  'txt', 'log', 'md', 'markdown', 'rst',
  'json', 'jsonc', 'yml', 'yaml', 'xml', 'plist', 'csv', 'tsv',
  'js', 'mjs', 'cjs', 'ts', 'jsx', 'tsx',
  'py', 'rb', 'go', 'rs', 'java', 'kt', 'swift',
  'c', 'cc', 'cpp', 'h', 'hpp', 'cs', 'php',
  'sh', 'bash', 'zsh', 'bat', 'cmd', 'ps1',
  'ini', 'conf', 'cfg', 'env', 'toml',
  'sql', 'graphql', 'gql',
  'css', 'scss', 'sass', 'less',
  'gitignore', 'editorconfig', 'lock', 'properties',
]);

export function getFileFormat(fileName: string): FileFormat {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'pdf':            return 'pdf';
    case 'hwp':            return 'hwp';
    case 'hwpx':           return 'hwpx';
    case 'docx':           return 'docx';
    case 'doc':            return 'doc';
    case 'pptx':           return 'pptx';
    case 'ppt':            return 'ppt';
    case 'xlsx':           return 'xlsx';
    case 'xls':            return 'xls';
    case 'epub':           return 'epub';
    case 'html': case 'htm': return 'html';
    case 'jpg':            return 'jpg';
    case 'jpeg':           return 'jpeg';
    case 'png':            return 'png';
    case 'heic': case 'heif': return 'heic';
    case 'webp':           return 'webp';
    default:
      if (TEXT_EXTS.has(ext)) return 'txt';
      return 'unknown';
  }
}

export const SUPPORTED_FORMATS: FileFormat[] = [
  'pdf', 'hwp', 'hwpx', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls',
  'epub', 'txt', 'html', 'jpg', 'jpeg', 'png', 'heic', 'webp',
];

export const IMAGE_FORMATS: FileFormat[] = ['jpg', 'jpeg', 'png', 'heic', 'webp'];
export const OFFICE_FORMATS: FileFormat[] = ['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'];
export const HWP_FORMATS: FileFormat[] = ['hwp', 'hwpx'];
