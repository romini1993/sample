// Konfigurasi Sheet (satu aplikasi, banyak Sheet).
// Tiap profil = satu Google Sheet / Apps Script. Profil PERTAMA di daftar ini yang kebuka kalau belum pernah memilih.
//
// Baris `password` = sandi untuk masuk ke profil itu (hapus barisnya kalau tidak mau dikunci).
// Baris `color`    = warna bulatan profil (opsional, kalau tidak diisi dipilihkan otomatis).
// Baris `photo`    = alamat gambar untuk foto profil (opsional). Foto dari galeri HP diatur lewat menu di aplikasi.
// CATATAN: file ini bisa dibaca siapa saja yang tahu alamatnya, jadi jangan pakai sandi yang sama
// dengan akun penting (email, Binance, dll).

window.APP_CONFIG = {
  PROFILES: [
    {
      id: 'akun1',
      name: 'romini',
      API_URL: 'https://script.google.com/macros/s/AKfycbxXyZd1pekC0tZRdwuY-aQzJb7veINYpp_sheoxMemO9sSrduj26QRhR4kHokR5iqJq/exec',
      password: 'satria'
      // , color: '#34d399'
    },
    {
      id: 'akun2',
      name: 'weni',
      API_URL: 'https://script.google.com/macros/s/AKfycbwA8VVlMuCwAIztJo3AI8Sgld1NMR0twHaQG2EdhjTohRRpTcqIt3ciNmY-1YMKwA3-/exec',
      password: 'weni'
      // , color: '#60a5fa'
    },
    {
      id: 'akun3',
      name: 'antoni',
      API_URL: 'https://script.google.com/macros/s/AKfycbx-4oLgbBltmYD4jnx7UzMsBGMoSRSXL00qJc4VeX7uhP0N0mZQwCvQsit46gWQUOzC/exec',
      password: 'antoni'
      // , color: '#f59e0b'
    }
  ]
};
