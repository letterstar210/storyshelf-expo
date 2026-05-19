# Expo Run And OTA

เอกสารนี้สรุปวิธีรันแอพบน PC และวิธีปล่อย OTA สำหรับโปรเจ็กต์นี้

## Requirements

- ติดตั้ง Node.js และ npm
- ติดตั้ง dependencies ของโปรเจ็กต์แล้วด้วย `npm install`
- ล็อกอิน Expo account แล้วถ้าจะปล่อย OTA

## Run On PC

รัน Expo web สำหรับทดสอบบน PC:

```powershell
npm run run:pc
```

ค่าเริ่มต้นจะเปิด dev server ที่:

```text
http://127.0.0.1:19006
```

ถ้าต้องการรันสคริปต์ตรง ๆ และเปลี่ยนพอร์ต:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-expo-web.ps1 -Port 19007
```

## Publish OTA

ปล่อย OTA ไปที่ `preview` channel:

```powershell
npm run ota:preview
```

ปล่อย OTA ไปที่ `production` channel:

```powershell
npm run ota:production
```

ถ้าต้องการใส่ channel และ message เอง:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\publish-ota-update.ps1 -Channel preview -Message "Add UI polish and localization fixes"
```

## Current OTA Setup

- Expo owner: `letterstar`
- Expo slug: `reading-mobile-working`
- Preview build channel: `preview`
- Production build channel: `production`
- Runtime version policy: `appVersion`

## Notes

- ถ้าจะรับ OTA ได้ ตัวแอพที่ติดตั้งอยู่ต้องเป็น build ที่รองรับ `expo-updates`
- ถ้าอัปเดตแล้วเครื่องยังไม่ดึงเวอร์ชันใหม่ ให้เปิดแอพใหม่หรือกดปุ่ม sync OTA ในแอพ
- ในเครื่องนี้เคยมีกรณี `npx` ไม่พร้อมใช้จาก PowerShell จึงใช้ `npm exec --package=eas-cli` แทนในสคริปต์ทั้งหมด
