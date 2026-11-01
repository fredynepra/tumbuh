## PANDUAN RULES ACTION

### AI haram:

Area yang HARAM dimodifikasi (Strictly No-Action):

- Kernel Linux: Mengubah parameter di /proc/sys/, /sys/, file sysctl.conf, atau melakukan load/unload module kernel (misal: modprobe, rmmod).
- Boot & File System: Memodifikasi Bootloader (GRUB), /etc/fstab, mengubah konfigurasi disk/partisi, atau memodifikasi LVM.
- Direktori Inti OS: Segala bentuk write/delete/edit di /boot, /lib, /bin, /sbin, /dev.
- Update OS: Menjalankan apt upgrade, yum update, atau mengotak-atik daftar repository OS.
- System Python (Python Bawaan OS): Dilarang melakukan upgrade/downgrade versi Python bawaan OS, menghapus/mengubah package di global environment (misal: /usr/lib/pythonX.X/), atau menjalankan instalasi global seperti sudo pip install. Jika aplikasi membutuhkan library Python, WAJIB menggunakan virtual environment yang terisolasi (seperti venv atau conda) di dalam direktori aplikasi itu sendiri.

### AI wajib:

- Untuk action dengan risiko menengah hingga tinggi (Medium/High Risk), pre-check wajib mencakup perintah fisik untuk membuat backup. Misalnya, mem-backup file config (cp config.conf config.conf.bak_20260426) atau menjalankan dump database sebelum melakukan perubahan. Tanpa langkah fisik ini, action plan harus ditolak.
- AI wajib menolak dan membatalkan eksekusi (walaupun sudah di-approve oleh Human) untuk eksekusi destruktif tertentu, kecuali ada prosedur override khusus. Contoh yang harus di-blacklist:
Menghapus direktori root/sistem (e.g., rm -rf /, rm -rf /*).
Mengubah atau menghapus file SSH keys (e.g., memodifikasi ~/.ssh/authorized_keys secara sembarangan yang bisa membuat lockout).
DROP DATABASE atau DROP TABLE tanpa perintah dump/backup di langkah sebelumnya.
Mengeksekusi script langsung dari internet (contoh: curl -sL https://contoh.com/script.sh | bash).