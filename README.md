# Darul Nusrat — Frontend

React app for the Darul Nusrat Member Management System.

**Live:** https://dar-ul-nusrat.vercel.app

## Setup

```bash
npm install
cp .env.example .env
npm start
```

## Production API

Set in Vercel (or `.env.production`):

```
REACT_APP_API_URL=https://dar-ul-nusrat-backned.vercel.app/api
CI=false
```

## Vercel deploy

- **Root Directory:** `.` (repository root — this folder is the whole repo)
- **Framework:** Create React App
- **Output Directory:** `build`

Backend repo: https://github.com/Arbaz-arif/Arbaz-arif-Dar-Ul-Nusrat-Backned
