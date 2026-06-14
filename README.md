# 🎮 MOJO GAMES — Mini Olympic KKN 2026

Platform kompetisi mini-game untuk 27 peserta KKN NR 11 UNTAG Surabaya.
Lima game berurutan, skor terakumulasi, papan peringkat real-time.

## Tentang

**Mojo Games** adalah web app multiplayer yang dirancang untuk acara kompetisi antar anggota KKN
di Kelurahan Mojo 2, Kecamatan Gubeng, Surabaya. Semua peserta bermain 5 game secara bersamaan
melalui HP masing-masing.

## 5 Game

| # | Nama | Tipe | Durasi |
|---|------|------|--------|
| 1 | Balapan Gerobak UMKM | Endless Runner | 60s |
| 2 | Ketik Cepat Data Warga | Typing Race | 90s |
| 3 | Puzzle Peta RW | Sliding Puzzle | 120s |
| 4 | Tangkap Produk UMKM | Catch Game | 60s |
| 5 | Kuis Pengetahuan KKN | Quiz Battle | ~160s |

## Tech Stack

- **Frontend**: React 18 + Phaser 3 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Socket.io
- **Deploy**: Railway (single service)

## Local Development

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Terminal 1: Server
npm run dev:server

# Terminal 2: Client
npm run dev:client
```

Buka `http://localhost:5173` untuk client, `http://localhost:3000` untuk server.

## Deploy ke Railway

1. Push ke GitHub repository
2. Buka [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Pilih repository → Railway otomatis detect Node.js
4. Set environment: `NODE_ENV=production`
5. Deploy — Railway kasih URL publik

## Admin Panel

- Buka: `https://[domain-anda]/admin`
- Password: `kkn2026`
- Fitur: Mulai kompetisi, Reset, Skip Game, Kick Player, Monitor skor

## Cara Main

1. Buka URL yang diberikan host di HP
2. Masukkan nama + kode kelompok (misal: KKN-A)
3. Tunggu di lobby sampai host memulai
4. Selesaikan 5 game berurutan
5. Lihat peringkat akhir!

## Kredit

KKN Non Reguler 11 · Universitas 17 Agustus 1945 Surabaya · 2026
Kelurahan Mojo 2, Kecamatan Gubeng, Kota Surabaya
# mojo-games
