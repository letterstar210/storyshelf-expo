# Local Link Checker

This service runs on your PC and checks reading links for the mobile app. Keep the PC and phone on the same Wi-Fi network.

## First-time setup

```powershell
npm install
npx playwright install chromium
```

## Run it

```powershell
npm run link-checker
```

The terminal prints an address such as `http://192.168.1.20:4317`. In the app, tap **Check link** on any entry, paste that address, then tap **Save**. The address is stored only on that phone.

If Windows asks for permission, allow Node.js on **Private networks**. The PC must remain on while the phone checks links.

## What is saved

The app saves checker metadata separately: latest chapter found, update count, status, and check time. It never changes your manual `episode` or `updatedAt` fields.

```powershell
npm run link-checker:test
```

This runs the small parser self-test without opening a browser.
