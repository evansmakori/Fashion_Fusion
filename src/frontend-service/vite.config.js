import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

// Plugin to copy images to dist
const copyImagesPlugin = () => {
  return {
    name: 'copy-images',
    closeBundle() {
      const images = [
        'Background.mp4',
        'Professional.jpg',
        'Casual.jpg',
        'Streetwear.jpg',
        'Dinner.jpg',
        'Logo.png'
      ];
      
      const distDir = resolve(__dirname, 'dist');
      if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true });
      }
      
      images.forEach(img => {
        const src = resolve(__dirname, img);
        const dest = resolve(distDir, img);
        if (existsSync(src)) {
          copyFileSync(src, dest);
          console.log(`Copied ${img} to dist`);
        }
      });
    }
  };
};

export default defineConfig({
  plugins: [react(), copyImagesPlugin()],
  root: './components',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
