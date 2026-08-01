# 🚀 NEON PULSE: Space Arcade Shooter 🎮

**NEON PULSE** adalah web game 2D bergenre *Space Arcade Shooter* bertema neon cyberpunk berbasis HTML5, CSS3, dan JavaScript murni (tanpa dependensi eksternal), lengkap dengan efek suara sintesis Web Audio API dan dukungan kontrol Desktop maupun HP (Mobile Touch).

---

## 🕹️ Cara Bermain

- **Bergerak (Desktop):** Gunakan tombol **`W` `A` `S` `D`** atau **`Panah (Arrow Keys)`** atau cukup **Drag menggunakan Mouse**.
- **Menembak:** Kapal menembak secara otomatis!
- **Kontrol (Mobile / HP):** Sentuh dan geser layar untuk memindahkan kapal, atau gunakan tombol virtual di bawah permainan.
- **Power-ups yang Bisa Dikumpulkan:**
  - `2X`: Tembakan ganda (Double Shot)
  - `RF`: Tembakan cepat (Rapid Fire)
  - `SH`: Perisai energi (Shield)
  - `+H`: Tambahan HP (Heal)

---

## 🌐 Cara Setup GitHub Pages (Mudah & Cepat!)

Ada **2 cara** mudah untuk mengaktifkan GitHub Pages agar game ini online dan bisa dimainkan oleh siapa saja:

### Cara 1: Deploy Langsung dari Branch `main` (Paling Mudah - Tanpa File Tambahan!)
Cara ini adalah yang termudah karena tidak memerlukan izin workflow tambahan:
1. Buka halaman repository kamu di GitHub:  
   👉 `https://github.com/67firehydrant/game`
2. Klik tab **Settings** (Pengaturan) di atas repository.
3. Di menu sebelah kiri, klik **Pages** (di bawah kategori *Code and automation*).
4. Pada bagian **Build and deployment -> Source**, pilih **Deploy from a branch**.
5. Pilih branch **`main`** dan folder **`/ (root)`**, lalu klik tombol **Save**.
6. Dalam 1–2 menit, web game kamu akan online di alamat:  
   👉 **`https://67firehydrant.github.io/game/`**

---

### Cara 2: Menggunakan GitHub Actions (Opsional)
Jika kamu ingin menggunakan GitHub Actions untuk proses build & deploy:
1. Salin file contoh yang sudah saya buatkan di folder `github-actions-sample/deploy-pages.yml` ke dalam folder `.github/workflows/deploy-pages.yml` di repository kamu.
2. Di **Settings -> Pages -> Source**, ubah pilihan menjadi **GitHub Actions**.
3. Setiap kali kamu melakukan *push* atau *merge* ke branch `main`, GitHub Action **"Deploy Game to GitHub Pages"** akan otomatis berjalan dan mempublikasikan game kamu.

---

## 🛠️ Struktur Kode

- **`index.html`**: Layout utama game, UI Overlay (Menu Awal & Game Over), serta HUD skor.
- **`style.css`**: Desain visual bergaya neon retro/cyberpunk yang responsif di PC maupun HP.
- **`game.js`**: Logika game utama, efek suara sintesis Web Audio API, sistem wave musuh, partikel ledakan, serta penyimpanan *High Score* di `localStorage`.
- **`github-actions-sample/deploy-pages.yml`**: Contoh template workflow GitHub Actions apabila kamu ingin deploy via Actions.

Selamat bermain dan bereksperimen dengan kodenya! 🎉
