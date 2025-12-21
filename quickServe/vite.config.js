import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss({
      theme: {
        extend: {
          opacity: {
            15: '0.15',
            35: '0.35',
            65: '0.65',
          },
        },
      },
    }),
  ],
});
