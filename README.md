# AI Tabanlı Çeviri Platformu 

Bu projede bir çeviri platformu geliştirilecektir. Kullanıcılar sisteme giriş (login) yaparak platformu kullanabilir. Kayıt (register) işlemi ve kullanıcı silme işlemleri yalnızca admin yetkisine sahip kullanıcılar tarafından gerçekleştirilebilir. Giriş yapan kullanıcılar, daha önce gerçekleştirdikleri çevirilere ve favori çevirilerine erişebilir. Admin, tüm kullanıcıların çeviri geçmişine erişme yetkisine sahiptir. Çeviri işlemleri sırasında, kullanıcının girdiği metin arka planda ChatGPT API'sine gönderilir ve alınan yanıt kullanıcıya sunulur.

## Özellikler

-  Kullanıcı girişi (JWT ile oturum yönetimi)
-  Sadece admin tarafından yapılabilen kayıt ve kullanıcı silme işlemleri
-  Kullanıcıya özel çeviri geçmişi ve favoriler
-  Admin yetkisiyle tüm kullanıcı geçmişine erişim
-  React.js + Tailwind CSS ile modern kullanıcı arayüzü
-  Next.js RESTful API
-  MongoDB + Mongoose ile veri yönetimi
-  RBAC (Role Based Access Control)
-  ChatGPT API entegrasyonu

## Teknolojiler
- Frontend: React.js, Tailwind CSS
- Backend: Node.js, Next.js, Mongoose, ChatGPT API
- Veritabanı: NoSQL - MongoDB
- Kimlik Doğrulama: JWT
- Rol Yönetimi: RBAC (Middleware ile)

## Branch Dağılmı
- Web-Security-Implementation (Onur Gökkaya)
- Data-Layer-ORM-/-Migrations-Using (Emre Alğan)
- Web-Service-Implementation (Emre Alğan)
- Session-/-Cookie-Management (Olgun Suluk)
- RBAC-Implementation (Onur Gökkaya)
- Business-Layer-OOP-Components (Emre Alğan)
- Presentation-Layer-UI-Framework-Using (Muhammet Fatih Şişmanoğlu)
- Extension-/-Third-Party-Library-Using (Muhammet Fatih Şişmanoğlu)
- Authorization-Implementation (Olgun Suluk)
- Cloud-Service-(AI)-Using (Emre Alğan)

## Kurulum

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/onurgokkaya/Web-programming.git
cd Web-programming
```

### 2. Ortam Değişkenlerini Ayarlayın

backend/.env dosyası oluşturun:

```bash
NEXTAUTH_URL: XXX
NEXTAUTH_SECRET: XXX
GPT4o_API_KEY: XXX
MONGO_URL: XXX
GMAIL_USER: XXX
GMAIL_PASS: XXX
```
## Çalıştırma

```bash
npm install
npm run dev
```

