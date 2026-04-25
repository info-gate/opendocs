import React from 'react';
import { ViewerProps, IMAGE_FORMATS, HWP_FORMATS, OFFICE_FORMATS } from './types';
import { PdfViewer } from './PdfViewer';
import { HwpViewer } from './HwpViewer';
import { DocxPptxViewer } from './DocxPptxViewer';
import { EpubViewer } from './EpubViewer';
import { ImageViewer } from './ImageViewer';
import { TxtViewer } from './TxtViewer';
import { ViewerError } from './ViewerError';

export function ViewerFactory(props: ViewerProps) {
  const { format } = props;

  if (format === 'pdf') {
    return <PdfViewer {...props} />;
  }

  if (HWP_FORMATS.includes(format)) {
    return <HwpViewer {...props} />;
  }

  if (OFFICE_FORMATS.includes(format) || format === 'xlsx') {
    return <DocxPptxViewer {...props} />;
  }

  if (format === 'epub') {
    return <EpubViewer {...props} />;
  }

  if (IMAGE_FORMATS.includes(format)) {
    return <ImageViewer {...props} />;
  }

  if (format === 'txt') {
    return <TxtViewer {...props} />;
  }

  return <ViewerError messageKey="error.format_unsupported" />;
}
