# F1 PitWall

Single-Page Application zur Darstellung und Analyse von Formel-1-Daten.
Gebaut mit Vue 3, Vite, Pinia und Chart.js – Daten von der öffentlichen Jolpica F1 API.

## Voraussetzungen

- Node.js `^20.19.0` oder `>=22.12.0`
- npm

## Installation

```sh
npm install
```

## Lokaler Entwicklungsserver

```sh
npm run dev
```

## Build (Produktion)

```sh
npm run build
```

## Vorschau des Builds

```sh
npm run preview
```

## Tests

```sh
npm run test:unit
```

## Umgebungsvariablen

Dieses Projekt benötigt **keine Umgebungsvariablen** und keine `.env`-Datei.
Die Jolpica F1 API ist öffentlich zugänglich und erfordert keinen API-Key.

## Verwendete API

**Jolpica F1 API** – öffentliche, kostenlose Ergast-kompatible API
Basis-URL: `https://api.jolpi.ca/ergast/f1`
Dokumentation: https://github.com/jolpica/jolpica-f1

> Kein API-Key erforderlich – alle Endpunkte sind ohne Authentifizierung nutzbar.

## Features

| Route | Beschreibung |
|---|---|
| `/` | Startseite – aktuelle Saison, Top 8 Fahrerwertung |
| `/drivers` | Fahrerwertung mit Saison-Filter (2020–aktuell) |
| `/drivers/:id` | Detailseite eines Fahrers – KPIs, Rennergebnisse |
| `/seasons/:year` | Saisonansicht – Rennkalender mit Siegern |
| `/compare` | Head-to-Head Vergleich zweier Fahrer mit Chart |
| `/*` | 404-Seite |

## Tech Stack

- [Vue 3](https://vuejs.org/) – Composition API mit `<script setup>`
- [Vite](https://vitejs.dev/) – Build-Tool
- [Vue Router 4](https://router.vuejs.org/)
- [Pinia](https://pinia.vuejs.org/) – State Management
- [Chart.js](https://www.chartjs.org/) + [vue-chartjs](https://vue-chartjs.org/) – Linienchart

## Deployment (Vercel)

**Live:** https://f1-pitwall-sand.vercel.app

Das Projekt enthält eine `vercel.json` mit SPA-Redirect-Regel.
Einfach das Repository mit Vercel verbinden – kein weiterer Konfigurationsaufwand.
