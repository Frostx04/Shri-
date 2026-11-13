import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Place } from '../src/data/schema.ts';

export const root = resolve(import.meta.dirname, '..');
export const dataPath = (f: string) => resolve(root, 'data', f);
export const readPlaces = (): Place[] => JSON.parse(readFileSync(dataPath('places.json'), 'utf8'));
export const writePlaces = (p: Place[]) => writeFileSync(dataPath('places.json'), JSON.stringify(p, null, 2) + '\n');
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Общий User-Agent для публичных API (Nominatim/Wikimedia требуют осмысленный UA). */
export const UA = process.env.SCRIPT_USER_AGENT ?? 'sri-lanka-2027-trip-pwa/1.0 (personal travel app; build scripts)';
export const arg = (name: string) => process.argv.includes(`--${name}`);
export const argValue = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
