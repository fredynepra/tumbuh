Codex PRD — Tumbuh V1 (Prototype Tugas Kuliah)
1. Instruksi utama
Bangun prototype web Tumbuh, aplikasi habit tracker dengan metafora tanaman yang tumbuh ketika pengguna menyelesaikan kebiasaan. Target pengerjaan: 1 hari kerja untuk demo fungsional, sekitar 10 pengguna uji.
Prioritas: alur utama berfungsi, UI rapi di HP, data tersimpan, animasi ringan berjalan di client, dan tes dasar lulus. Ini bukan aplikasi production-ready.
Baca dokumen ini lalu langsung kerjakan. Codex boleh memeriksa lingkungan, mengubah kode, menjalankan aplikasi, dan menjalankan tes langsung di server yang tersedia. Jika ada hambatan atau keputusan yang berisiko, jelaskan singkat dan pilih opsi paling sederhana yang aman.
2. Aturan kerja di server
	1.	Periksa direktori kerja, proyek yang sudah ada, versi Node.js/npm/pnpm, database, port, dan proses aplikasi sebelum mengubah apa pun.
	2.	Gunakan proyek dan tool yang sudah tersedia jika sesuai. Jangan membuat ulang proyek yang sudah ada.
	3.	Jangan gunakan Docker.
	4.	Jangan menghapus data, database, file konfigurasi, atau proyek yang sudah ada. Jangan menimpa file yang tidak terkait.
	5.	Jangan melakukan upgrade global, reinstall tool, atau mengubah konfigurasi server secara luas tanpa kebutuhan yang jelas.
	6.	Jika perlu membuat proyek baru, gunakan direktori kerja yang jelas dan periksa dulu apakah direktori tersebut sudah berisi data.
	7.	Jalankan aplikasi dan tes secara langsung. Jangan mengklaim tes lulus jika belum dijalankan.
	8.	Di akhir, laporkan: fitur selesai, file/komponen penting, database yang digunakan, perintah menjalankan aplikasi, URL/port demo, hasil tes, serta masalah yang belum selesai.
3. Produk dan target pengguna
	●	Nama: Tumbuh
	●	Tagline: Start small. Grow consistently.
	●	Target: pengguna usia sekitar 16–30 tahun.
	●	Platform: web responsif, mobile-first; harus nyaman digunakan di layar HP dan desktop.
	●	Konsep: pengguna membuat kebiasaan, melakukan check-in, lalu melihat tanaman berkembang.
	●	Tujuan V1: menguji apakah visual tanaman membuat pencatatan kebiasaan lebih menarik dan mendorong pengguna kembali.
	●	Batas skala: sekitar 10 pengguna uji; tidak perlu optimasi untuk trafik besar.
4. Scope fitur V1 — wajib
A. Onboarding sederhana
	●	Tampilkan penjelasan singkat konsep Tumbuh.
	●	Arahkan pengguna untuk membuat kebiasaan pertama.
	●	Hindari alur onboarding panjang.
B. My Garden / Beranda
	●	Tampilkan daftar habit aktif sebagai kartu tanaman.
	●	Tiap kartu menampilkan nama habit, status hari ini, progres/tahap tanaman, dan streak jika tersedia.
	●	Sediakan tombol aksi yang jelas untuk check-in.
	●	Tampilkan empty state yang mengajak pengguna membuat habit pertama.
C. Membuat dan mengelola habit
	●	Buat, lihat detail, edit, dan hapus/nonaktifkan habit.
	●	Field minimum: nama habit, kategori opsional, jadwal/frekuensi, dan waktu pengingat opsional.
	●	Sediakan beberapa contoh kategori, misalnya membaca, olahraga, belajar, minum air, journaling, tidur lebih awal, meditasi, dan berjalan kaki.
	●	Validasi input dasar dan tampilkan pesan yang mudah dipahami.
D. Check-in harian
	●	Pengguna dapat menandai habit selesai untuk tanggal hari ini.
	●	Check-in harus idempotent: klik berulang tidak boleh membuat catatan ganda untuk habit dan tanggal yang sama.
	●	Perbarui status, progres, dan streak setelah check-in.
	●	Batasi alur check-in menjadi maksimal sekitar 3 tap dari beranda.
E. Sistem pertumbuhan tanaman
Gunakan visual 2D ringan menggunakan CSS dan/atau SVG. Tidak perlu 3D.
Tahap tanaman berdasarkan total hari selesai:
	●	Seed: 0–2 hari selesai
	●	Sprout: 3–6 hari selesai
	●	Growing: 7–29 hari selesai
	●	Bloom: 30 hari atau lebih selesai
Ketentuan:
	●	Animasi/rendering dilakukan di client/browser.
	●	Backend hanya mengelola aturan bisnis dan data.
	●	Tahap tanaman berasal dari data check-in yang tersimpan, bukan sekadar animasi sementara.
	●	Hari yang terlewat tidak menghapus riwayat atau menurunkan tahap pertumbuhan tanaman.
	●	Streak boleh kembali ke nol ketika jadwal terlewat sesuai logika streak sederhana.
	●	Gunakan ilustrasi placeholder CSS/SVG yang konsisten jika aset khusus tidak tersedia.
F. Detail habit dan recovery
	●	Detail menampilkan jadwal, jumlah hari selesai, streak saat ini, dan riwayat sederhana.
	●	Jika pengguna melewatkan hari, tampilkan pesan suportif, bukan menyalahkan.
	●	Jangan menghukum pengguna atau menghapus progres historis.
G. Pengingat
	●	Simpan pengaturan pengingat per habit.
	●	Untuk prototype, jika push notification terjadwal membutuhkan infrastruktur tambahan, buat pengaturan dan UI pengingat sederhana serta jelaskan keterbatasannya.
	●	Jangan mengklaim push notification aktif jika belum benar-benar terimplementasi.
	●	Maksimal satu pengingat per habit per hari; teks harus ramah dan tidak membuat pengguna merasa bersalah.
H. Profil dan pengaturan
	●	Halaman sederhana untuk nama tampilan dan pengaturan dasar.
	●	Sediakan cara mengubah preferensi pengingat.
	●	Tidak perlu halaman admin.
5. Fitur di luar scope — jangan dikerjakan
Jangan membuat fitur tambahan berikut pada V1:
	●	Weekly Growth Report atau analitik mendalam
	●	Milestone Journey, badge, dan reward kompleks
	●	Daily Reflection/jurnal
	●	Seasonal Challenges
	●	Garden Together, teman, komunitas, atau shared garden
	●	Smart Habit Coach atau fitur AI
	●	Pembayaran, subscription, dan monetisasi
	●	Animasi 3D, Three.js, atau dunia game
	●	Gamifikasi kompleks
Jangan menambah fitur di luar daftar wajib hanya karena mudah dibuat.
6. Teknologi dan arsitektur
	●	Full-stack: Next.js dengan TypeScript; gunakan App Router jika proyek baru dan tidak ada pola proyek existing yang perlu dipertahankan.
	●	Backend: Next.js Route Handlers/Server Actions untuk operasi data dan aturan bisnis.
	●	Database: gunakan PostgreSQL jika sudah tersedia dan mudah dipakai. Jika lingkungan tidak menyediakan database, pilih penyimpanan lokal paling sederhana yang cocok untuk demo dan jelaskan konsekuensinya; jangan mengarang bahwa data persisten tersedia jika tidak.
	●	ORM: gunakan Prisma hanya jika sudah tersedia atau benar-benar mempercepat setup. Hindari menambah lapisan yang tidak diperlukan.
	●	UI: pilih pendekatan sederhana yang sudah tersedia dalam proyek. Jangan menghabiskan waktu setup design system.
	●	Animasi: CSS/SVG di client; tidak membutuhkan GPU server.
	●	Semua aturan check-in, tanggal, streak, dan pertumbuhan harus konsisten serta diuji.
	●	Gunakan zona waktu lokal yang konsisten untuk penentuan “hari ini”; hindari bug akibat UTC tengah malam.
7. Penyederhanaan untuk demo
	●	Keamanan lanjutan, hardening production, multi-role, audit log, dan compliance berada di luar scope tugas ini.
	●	Jangan mengekspos kredensial database atau secret ke client.
	●	Jika autentikasi penuh akan membuat target satu hari tidak realistis, buat mekanisme identitas demo yang sederhana dan jelaskan bahwa itu bukan autentikasi production. Tetap pisahkan data tiap pengguna demo jika mudah dilakukan.
	●	Jangan membuat sistem email verification, reset password, atau OAuth kecuali sudah tersedia dan mudah digunakan.
	●	Data contoh boleh disediakan untuk demo, tetapi pengguna harus bisa membuat habit sendiri.
	●	Jangan menghabiskan waktu pada deployment publik jika server hanya perlu menjalankan demo lokal/internal.
8. UI/UX minimum
	●	Mobile-first, responsif, tampilan bersih dan hangat.
	●	Garden menjadi halaman utama.
	●	Tanaman dan status habit mudah dibedakan secara visual.
	●	Gunakan bahasa Indonesia untuk antarmuka.
	●	Sediakan loading, empty, success, dan error states yang sederhana.
	●	Pastikan tombol utama terlihat jelas dan ukuran tap nyaman di layar sentuh.
	●	Hindari animasi berlebihan; hormati prefers-reduced-motion jika mudah diterapkan.
9. Kriteria penerimaan
Prototype dinyatakan selesai jika:
	1.	Aplikasi dapat dijalankan di lingkungan server yang diperiksa.
	2.	UI utama dapat digunakan di ukuran layar HP dan desktop.
	3.	Pengguna dapat membuat, melihat, mengedit, dan menonaktifkan/menghapus habit.
	4.	Pengguna dapat melakukan check-in harian.
	5.	Check-in duplikat untuk habit dan tanggal yang sama dicegah.
	6.	Jumlah hari selesai dan tahap tanaman sesuai dengan aturan di dokumen ini.
	7.	Hari yang terlewat tidak menghapus progres historis tanaman.
	8.	Streak ditampilkan dan diperbarui menggunakan aturan sederhana yang konsisten.
	9.	Data tetap tersedia setelah halaman di-refresh jika database/persistensi telah dikonfigurasi.
	10.	Pengaturan pengingat dapat disimpan; keterbatasan pengiriman notifikasi dijelaskan dengan jujur.
	11.	Tidak ada error kritis pada alur utama.
	12.	Tes dasar berhasil dijalankan atau kegagalan yang tersisa dilaporkan secara eksplisit.
10. Tes minimum yang harus dijalankan
Buat dan jalankan tes yang sesuai dengan tool proyek, setidaknya untuk:
	●	Tahap tanaman pada total hari selesai 0, 2, 3, 6, 7, 29, dan 30.
	●	Check-in berhasil dan tidak menghasilkan duplikasi.
	●	Progres historis tetap ada setelah hari terlewat.
	●	Perhitungan streak dasar.
	●	Validasi pembuatan habit.
	●	Smoke test atau pemeriksaan build aplikasi.
Jalankan lint, type-check, unit test, dan build yang memang tersedia di proyek. Jangan mengubah konfigurasi secara besar-besaran hanya untuk menghilangkan warning yang tidak kritis.
11. Urutan pengerjaan
	1.	Inspeksi server dan proyek existing.
	2.	Laporkan singkat rencana implementasi dan asumsi penting.
	3.	Implementasikan jalur utama terlebih dahulu: Garden → Create Habit → Check-in → Plant Growth.
	4.	Implementasikan detail habit, streak/recovery, pengaturan, dan pengingat sederhana.
	5.	Buat/jalankan tes minimum.
	6.	Jalankan aplikasi dan verifikasi alur utama langsung.
	7.	Perbaiki bug yang ditemukan.
	8.	Berikan ringkasan hasil dan cara menjalankan/demo aplikasi.
Prinsip keputusan: pilih solusi paling sederhana yang memenuhi PRD, bisa didemokan dalam satu hari, dan tidak merusak lingkungan server yang sudah ada. Jika waktu terbatas, prioritaskan fitur inti dan laporkan dengan jelas bagian yang belum selesai.