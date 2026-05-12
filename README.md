# StoryShelf

StoryShelf is a bilingual reading tracker for comics, manga, manhwa, and web novels. It is designed as a polished Expo portfolio project that combines mobile-first UX, local persistence, bulk import workflows, and optional OTA delivery in one app.

## Overview

StoryShelf helps readers keep their personal library organized, track the latest chapter or episode, save reading links, and manage large collections with spreadsheet and ZIP imports.

## Features

- Bilingual interface in Thai and English
- Add, edit, delete, and search reading entries
- Track latest chapter or episode progress
- Store reading links and cover images
- Import entries from Excel workbooks
- Import exported ZIP bundles with matched cover images
- Mobile-friendly layout with quick actions and scroll-to-top navigation
- Optional OTA update support through Expo EAS Update

## Tech Stack

- Expo
- React Native
- TypeScript
- AsyncStorage
- Expo Document Picker
- Expo Image Picker
- Expo Updates
- XLSX
- JSZip

## Local Development

Install dependencies:

```powershell
npm install
```

Run on PC:

```powershell
npm run run:pc
```

Default URL:

```text
http://127.0.0.1:19006
```

## OTA Publishing

This branch is intentionally not linked to the original author's Expo account. Before publishing OTA updates, connect the project to your own Expo account and EAS project first.

Preview channel:

```powershell
npm run ota:preview
```

Production channel:

```powershell
npm run ota:production
```

More details are available in [docs/expo-run-and-ota.md](./docs/expo-run-and-ota.md).

## Project Structure

- [App.tsx](./App.tsx): main app shell and screen composition
- [src/components](./src/components): reusable UI components
- [src/constants/localization.ts](./src/constants/localization.ts): bilingual UI copy
- [src/hooks/useEntries.ts](./src/hooks/useEntries.ts): entry state management
- [src/services/entryStorage.ts](./src/services/entryStorage.ts): persistence layer
- [src/utils/importWorkbook.ts](./src/utils/importWorkbook.ts): workbook import parsing
- [src/utils/importArchive.ts](./src/utils/importArchive.ts): ZIP import parsing

## Portfolio Positioning

StoryShelf is more than a CRUD demo. It showcases:

- thoughtful bilingual UX
- practical mobile product design
- local-first data persistence
- structured import tooling for real user workflows
- reusable OTA-ready deployment setup for continuous delivery

## Suggested GitHub Description

StoryShelf is a bilingual Expo reading tracker for comics and web novels with local persistence, Excel and ZIP import flows, and reusable OTA-ready deployment.
