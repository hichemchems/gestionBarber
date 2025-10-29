import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['express'],
  },
  build: {
    outDir: 'dist',
    lib: {
        entry: ['src/server.js'],
        formats: ['cjs'],
    },
    rollupOptions: {
        external: [
          'node:util',
          'crypto',
          'path',
          'express',
          'cookie-parser',
          'jsonwebtoken',
          'jwt-decode',
          'sequelize',
          'mysql2',
          'zod',
          'swagger-jsdoc',
          'swagger-ui-express',
          'dotenv',
          'bcryptjs',
          'cors',
          'csurf',
          'express-fileupload',
          'express-rate-limit',
          'express-validator',
          'helmet',
          'nodemailer'
        ],
        output: {
            format: 'cjs',
            entryFileNames: '[name].cjs',
        },
    },
  },
});
