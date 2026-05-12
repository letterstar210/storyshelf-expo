# StoryShelf: Expo Run And OTA

## Thai

เอกสารนี้สรุปวิธีรันแอพบน PC และวิธีปล่อย OTA สำหรับโปรเจ็กต์นี้แบบ generic โดยไม่ได้ผูกกับ Expo account หรือ EAS project ของผู้สร้างเดิม

### Requirements

- ติดตั้ง Node.js และ npm
- ติดตั้ง dependencies ของโปรเจ็กต์แล้วด้วย `npm install`
- ถ้าจะปล่อย OTA ต้องมี Expo account ของตัวเอง

### Run On PC

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

### Publish OTA

ก่อนปล่อย OTA ครั้งแรก ให้เชื่อมโปรเจ็กต์นี้กับ Expo account และ EAS project ของคุณเองก่อน

ตัวอย่าง flow ที่แนะนำ:

```powershell
npm install
npm exec --package=eas-cli -c "eas login"
npm exec --package=eas-cli -c "eas init"
npm exec --package=eas-cli -c "eas update:configure"
```

หลังจากนั้นให้ตรวจว่า `app.json` ของคุณถูกเติมค่าของโปรเจ็กต์ตัวเอง เช่น `updates.url`, `owner`, และ `extra.eas.projectId` เรียบร้อยแล้ว

เมื่อเชื่อมโปรเจ็กต์เสร็จแล้ว ค่อยใช้คำสั่งด้านล่าง

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

### Current Template Setup

- Public app name: `StoryShelf`
- Expo slug: `storyshelf`
- Preview build channel: `preview`
- Production build channel: `production`
- Runtime version policy: `appVersion`
- ยังไม่มี `owner`, `projectId`, หรือ `updates.url` ติดมากับ template นี้

### Notes

- ถ้าจะรับ OTA ได้ ตัวแอพที่ติดตั้งอยู่ต้องเป็น build ที่รองรับ `expo-updates`
- ถ้าอัปเดตแล้วเครื่องยังไม่ดึงเวอร์ชันใหม่ ให้เปิดแอพใหม่หรือกดปุ่ม sync OTA ในแอพ
- ในเครื่องนี้เคยมีกรณี `npx` ไม่พร้อมใช้จาก PowerShell จึงใช้ `npm exec --package=eas-cli` แทนในสคริปต์ทั้งหมด
- template นี้จงใจไม่ผูกกับ Expo account ของผู้สร้างเดิม เพื่อให้คุณนำไปเชื่อมกับโปรเจ็กต์ของตัวเองได้ทันที

## English

This document explains how to run the app on a PC and how to publish OTA updates in a generic way without being tied to the original author's Expo account or EAS project.

### Requirements

- Install Node.js and npm
- Install project dependencies with `npm install`
- Use your own Expo account if you want to publish OTA updates

### Run On PC

Run Expo web for local PC testing:

```powershell
npm run run:pc
```

Default local development URL:

```text
http://127.0.0.1:19006
```

If you want to run the script directly and change the port:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-expo-web.ps1 -Port 19007
```

### Publish OTA

Before publishing OTA for the first time, connect this project to your own Expo account and EAS project.

Recommended setup flow:

```powershell
npm install
npm exec --package=eas-cli -c "eas login"
npm exec --package=eas-cli -c "eas init"
npm exec --package=eas-cli -c "eas update:configure"
```

After that, verify that your `app.json` has been updated with your own project values such as `updates.url`, `owner`, and `extra.eas.projectId`.

Once the project is connected, you can use the commands below.

Publish OTA to the `preview` channel:

```powershell
npm run ota:preview
```

Publish OTA to the `production` channel:

```powershell
npm run ota:production
```

If you want to provide a custom channel and message:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\publish-ota-update.ps1 -Channel preview -Message "Add UI polish and localization fixes"
```

### Current Template Setup

- Public app name: `StoryShelf`
- Expo slug: `storyshelf`
- Preview build channel: `preview`
- Production build channel: `production`
- Runtime version policy: `appVersion`
- This template does not include `owner`, `projectId`, or `updates.url`

### Notes

- OTA updates only work on builds that support `expo-updates`
- If the device does not fetch the latest update immediately, reopen the app or use the in-app OTA sync action
- On this machine, `npx` was not consistently available in PowerShell, so the scripts use `npm exec --package=eas-cli` instead
- This template is intentionally not linked to the original author's Expo account, so you can connect it to your own project directly
