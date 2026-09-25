// Copies the 4:3 flag SVGs from flag-icons into public/flags so they are served from our own site.
import { cpSync, mkdirSync } from 'node:fs';

const src = new URL('../node_modules/flag-icons/flags/4x3/', import.meta.url);
const dest = new URL('../public/flags/', import.meta.url);
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log('Copied flags to public/flags');
