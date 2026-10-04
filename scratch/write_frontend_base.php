<?php
$frontDir = 'D:/Github/Utopia_react/frontend';

// src/index.css
$css = <<<'CSS'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  }
}

.font-digital {
  font-family: 'Share Tech Mono', monospace, monospace;
}

/* Custom scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
CSS;
file_put_contents("$frontDir/src/index.css", $css);

// src/services/api.js
$api = <<<'JS'
const BASE_URL = '/api';

export async function fetchProducts(search = '', rayon = '') {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (rayon) params.append('rayon', rayon);
  const res = await fetch(`${BASE_URL}/products?${params.toString()}`);
  return res.json();
}

export async function fetchDepartments() {
  const res = await fetch(`${BASE_URL}/products/departments`);
  return res.json();
}

export async function fetchClients(search = '') {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  const res = await fetch(`${BASE_URL}/clients?${params.toString()}`);
  return res.json();
}

export async function fetchSuppliers() {
  const res = await fetch(`${BASE_URL}/suppliers`);
  return res.json();
}

export async function fetchSales() {
  const res = await fetch(`${BASE_URL}/sales`);
  return res.json();
}

export async function createCheckout(data) {
  const res = await fetch(`${BASE_URL}/sales/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchDashboardStats() {
  const res = await fetch(`${BASE_URL}/stats/dashboard`);
  return res.json();
}
JS;
file_put_contents("$frontDir/src/services/api.js", $api);

echo "Base CSS and API service written.\n";
