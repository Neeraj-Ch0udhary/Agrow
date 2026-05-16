import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

// Base screen size (iPhone 11 — most common)
const BASE_WIDTH  = 390;
const BASE_HEIGHT = 844;

// Scale functions
export const wp = (percent: number) => (width * percent) / 100;
export const hp = (percent: number) => (height * percent) / 100;

// Scale a size from base screen to current screen
export const scale      = (size: number) => (width / BASE_WIDTH) * size;
export const vertScale  = (size: number) => (height / BASE_HEIGHT) * size;
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const fs = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel(moderateScale(size)));