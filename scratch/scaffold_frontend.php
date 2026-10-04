<?php
$frontDir = 'D:/Github/Utopia_react/frontend';
@mkdir("$frontDir/src/components", 0777, true);
@mkdir("$frontDir/src/pages", 0777, true);
@mkdir("$frontDir/src/services", 0777, true);
@mkdir("$frontDir/public", 0777, true);

// package.json
$pkg = [
  "name" => "utopia-frontend",
  "private" => true,
  "version" => "1.0.0",
  "type" => "module",
  "scripts" => [
    "dev" => "vite --port 3000 --host",
    "build" => "vite build",
    "preview" => "vite preview"
  ],
  "dependencies" => [
    "lucide-react" => "^0.395.0",
    "react" => "^18.3.1",
    "react-dom" => "^18.3.1"
  ],
  "devDependencies" => [
    "@vitejs/plugin-react" => "^4.3.0",
    "autoprefixer" => "^10.4.19",
    "postcss" => "^8.4.38",
    "tailwindcss" => "^3.4.4",
    "vite" => "^5.3.1"
  ]
];
file_put_contents("$frontDir/package.json", json_encode($pkg, JSON_PRETTY_PRINT));

// vite.config.js
$viteConfig = <<<'JS'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
});
JS;
file_put_contents("$frontDir/vite.config.js", $viteConfig);

// tailwind.config.js
$tailwindConfig = <<<'JS'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        utopia: {
          sidebar: '#f1f5f9',
          border: '#cbd5e1',
          accent: '#0284c7',
          pink: '#f43f5e',
          neon: '#22c55e',
          gold: '#eab308'
        }
      }
    },
  },
  plugins: [],
}
JS;
file_put_contents("$frontDir/tailwind.config.js", $tailwindConfig);

// postcss.config.js
$postcssConfig = <<<'JS'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
JS;
file_put_contents("$frontDir/postcss.config.js", $postcssConfig);

// index.html
$indexHtml = <<<'HTML'
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Utopya V1.0 2024 - L'utopie De la gestion</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600;700;800&family=Share+Tech+Mono&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-100 text-slate-800 select-none overflow-hidden h-screen w-screen">
    <div id="root" class="h-full w-full"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
HTML;
file_put_contents("$frontDir/index.html", $indexHtml);

echo "Scaffolded frontend config successfully.\n";
