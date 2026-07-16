# Deploy Scorecard

## 1. GitHub

Repo: [https://github.com/sidmsmith/scorecard](https://github.com/sidmsmith/scorecard)

```powershell
cd "C:\Users\ssmith\OneDrive - Manhattan Associates\Documents\Solutions Consulting\Scripts\Web\scorecard"
git init
git add .
git commit -m "Initial scorecard app"
git branch -M main
git remote add origin https://github.com/sidmsmith/scorecard.git
git push -u origin main
```

## 2. Vercel

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new) (or use the project already linked to this repo).
2. Framework preset: **Other** (static).
3. Root directory: `.` (default).
4. No environment variables required.
5. Production branch: `main`.

## Local dev

```powershell
cd scorecard
npx vercel dev
```

Open `/scorecard`.
