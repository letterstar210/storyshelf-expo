# StoryShelf


## English

StoryShelf is a bilingual reading tracker for comics, manga, manhwa, and web novels. It is designed as a polished Expo portfolio project that combines mobile-first UX, local persistence, bulk import workflows, and optional OTA delivery in one app.

### Overview

StoryShelf helps readers keep their personal library organized, track the latest chapter or episode, save reading links, and manage large collections with spreadsheet and ZIP imports.

### Features

- Bilingual interface in Thai and English
- Add, edit, delete, and search reading entries
- Track latest chapter or episode progress
- Store reading links and cover images
- Import entries from Excel workbooks
- Import exported ZIP bundles with matched cover images
- Mobile-friendly layout with quick actions and scroll-to-top navigation
- Optional OTA update support through Expo EAS Update

### Tech Stack

- Expo
- React Native
- TypeScript
- AsyncStorage
- Expo Document Picker
- Expo Image Picker
- Expo Updates
- XLSX
- JSZip

### Local Development

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

### OTA Publishing

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

### Project Structure

- [App.tsx](./App.tsx): main app shell and screen composition
- [src/components](./src/components): reusable UI components
- [src/constants/localization.ts](./src/constants/localization.ts): bilingual UI copy
- [src/hooks/useEntries.ts](./src/hooks/useEntries.ts): entry state management
- [src/services/entryStorage.ts](./src/services/entryStorage.ts): persistence layer
- [src/utils/importWorkbook.ts](./src/utils/importWorkbook.ts): workbook import parsing
- [src/utils/importArchive.ts](./src/utils/importArchive.ts): ZIP import parsing

### Portfolio Positioning

StoryShelf is more than a CRUD demo. It showcases:

- thoughtful bilingual UX
- practical mobile product design
- local-first data persistence
- structured import tooling for real user workflows
- reusable OTA-ready deployment setup for continuous delivery

## Suggested GitHub Description

StoryShelf is a bilingual Expo reading tracker for comics and web novels with local persistence, Excel and ZIP import flows, and reusable OTA-ready deployment.

## Thai

StoryShelf คือแอพติดตามการอ่านสองภาษาสำหรับการ์ตูน มังงะ มันฮวา และเว็บโนเวล โดยออกแบบให้เป็นโปรเจ็กต์ Expo สำหรับใช้โชว์ผลงาน ที่รวมทั้ง mobile-first UX, local persistence, workflow การนำเข้าข้อมูลจำนวนมาก และ OTA แบบ optional ไว้ในแอพเดียว

### ภาพรวม

StoryShelf ช่วยให้ผู้อ่านจัดระเบียบคลังเรื่องที่ติดตาม บันทึกตอนล่าสุด เก็บลิงก์สำหรับอ่านต่อ และดูแลรายการจำนวนมากได้ผ่านการนำเข้าจากไฟล์ Excel และ ZIP

### ฟีเจอร์หลัก

- รองรับสองภาษา: ไทยและ English
- เพิ่ม แก้ไข ลบ และค้นหารายการอ่านได้
- บันทึกตอนหรือ chapter ล่าสุด
- เก็บลิงก์อ่านต่อและรูปปก
- นำเข้ารายการจาก Excel workbook
- นำเข้า ZIP export พร้อมจับคู่รูปปกอัตโนมัติ
- ออกแบบให้เหมาะกับมือถือ พร้อมปุ่ม quick actions และปุ่มลอยกลับด้านบน
- รองรับ OTA update แบบ optional ผ่าน Expo EAS Update

### Tech Stack

- Expo
- React Native
- TypeScript
- AsyncStorage
- Expo Document Picker
- Expo Image Picker
- Expo Updates
- XLSX
- JSZip

### การรันในเครื่อง

ติดตั้ง dependencies:

```powershell
npm install
```

รันบน PC:

```powershell
npm run run:pc
```

URL เริ่มต้น:

```text
http://127.0.0.1:19006
```

### การปล่อย OTA

branch นี้ไม่ได้เชื่อมกับ Expo account ของผู้สร้างเดิมไว้โดยตรง ถ้าต้องการปล่อย OTA ให้เชื่อมโปรเจ็กต์นี้กับ Expo account และ EAS project ของคุณเองก่อน

ปล่อยไปที่ preview:

```powershell
npm run ota:preview
```

ปล่อยไปที่ production:

```powershell
npm run ota:production
```

รายละเอียดเพิ่มเติมดูได้ที่ [docs/expo-run-and-ota.md](./docs/expo-run-and-ota.md)

### โครงสร้างโปรเจ็กต์

- [App.tsx](./App.tsx): app shell และโครงหน้าหลัก
- [src/components](./src/components): reusable UI components
- [src/constants/localization.ts](./src/constants/localization.ts): ข้อความสองภาษา
- [src/hooks/useEntries.ts](./src/hooks/useEntries.ts): state management ของรายการอ่าน
- [src/services/entryStorage.ts](./src/services/entryStorage.ts): persistence layer
- [src/utils/importWorkbook.ts](./src/utils/importWorkbook.ts): parser สำหรับ Excel import
- [src/utils/importArchive.ts](./src/utils/importArchive.ts): parser สำหรับ ZIP import

### มุมมองเชิง Portfolio

StoryShelf ไม่ใช่แค่ CRUD demo แต่โชว์จุดแข็งด้าน:

- bilingual UX
- mobile product thinking
- local-first persistence
- import workflow สำหรับการใช้งานจริง
- OTA-ready deployment setup ที่นำไปต่อยอดได้

