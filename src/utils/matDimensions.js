export const matAspectRatios = {
  small: 36 / 24,
  medium: 48 / 36,
  large: 60 / 48
};

export const getMatAspectRatio = (matSize) => {
  return matAspectRatios[matSize] || matAspectRatios.medium;
};
