# NovaVid - instrucciones rápidas

## Preparar
1. Copia `.env.example` a `.env` y rellena `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
2. Instalar dependencias:
   npm install

## Desarrollo (web)
   npm run dev
Visita http://localhost:3000

## Desarrollo (Electron)
   npm run electron:dev
Esto levanta Vite y abre la app en Electron.

## Build y empaquetado Windows
   npm run dist
o
   npm run electron:build

Nota: añade tus iconos en `public/icons/` como `icon-192.png`, `icon-512.png` y `icon.ico` para Windows.
