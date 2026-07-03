export const matAspectRatios = {
  small: 36 / 24,
  medium: 48 / 36,
  large: 60 / 48
};

export const matPrintDimensions = {
  small: { width: 36, height: 24 },
  medium: { width: 48, height: 36 },
  large: { width: 60, height: 48 }
};

export const PRINT_PREVIEW_DPI = 200;
export const PRINT_PREVIEW_MAX_LONG_EDGE = 8192;

export const getMatAspectRatio = (matSize) => {
  return matAspectRatios[matSize] || matAspectRatios.medium;
};

export const getPrintPreviewPixelSize = (matSize, {
  dpi = PRINT_PREVIEW_DPI,
  maxLongEdge = PRINT_PREVIEW_MAX_LONG_EDGE
} = {}) => {
  const dimensions = matPrintDimensions[matSize] || matPrintDimensions.medium;
  const rawWidth = dimensions.width * dpi;
  const rawHeight = dimensions.height * dpi;
  const scale = Math.min(1, maxLongEdge / Math.max(rawWidth, rawHeight));

  return {
    width: Math.round(rawWidth * scale),
    height: Math.round(rawHeight * scale),
    dpi,
    scale
  };
};
