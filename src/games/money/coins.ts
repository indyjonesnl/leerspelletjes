/** ECB common-side images and real diameters in millimetres. See public/coins/README.md. */
export const EURO_COINS: Record<number, { src: string; diameter: number }> = {
  1: { src: 'coins/1-cent.jpg', diameter: 16.25 },
  2: { src: 'coins/2-cent.jpg', diameter: 18.75 },
  5: { src: 'coins/5-cent.jpg', diameter: 21.25 },
  10: { src: 'coins/10-cent.png', diameter: 19.75 },
  20: { src: 'coins/20-cent.jpg', diameter: 22.25 },
  50: { src: 'coins/50-cent.jpg', diameter: 24.25 },
  100: { src: 'coins/1-euro.jpg', diameter: 23.25 },
  200: { src: 'coins/2-euro.jpg', diameter: 25.75 },
};
