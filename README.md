# AYO Vietnam Landing Page

Landing page chính thức của AYO Vietnam - một cộng đồng tôn vinh những con người thật, câu chuyện thật và thành công thật khắp Việt Nam.

## 🚀 Tính năng

- **Responsive Design** - Tối ưu cho mọi thiết bị
- **Video Gallery** - Hiển thị video nổi bật với autoplay
- **Contact Form** - Form liên hệ với validation
- **Modern UI** - Giao diện hiện đại với Tailwind CSS
- **Smooth Animations** - Hiệu ứng mượt mà và chuyên nghiệp

## 📁 Cấu trúc thư mục

```
├── index.html          # Trang chủ
├── logo-white.png      # Logo trắng
├── logo-red.png        # Logo đỏ
├── hero.png           # Hình ảnh hero
├── videos/            # Thư mục chứa video
│   ├── video1.mp4
│   ├── video2.mp4
│   ├── video3.mp4
│   ├── video4.mp4
│   ├── video5.mp4
│   └── video6.mp4
└── README.md          # File hướng dẫn
```

## 🛠️ Công nghệ sử dụng

- **HTML5** - Cấu trúc trang web
- **Tailwind CSS** - Framework CSS
- **JavaScript** - Tương tác và hiệu ứng
- **Video** - MP4 format cho video gallery

## 🚀 Deploy lên Vercel

### Cách 1: Deploy trực tiếp từ GitHub

1. Fork repository này về GitHub của bạn
2. Truy cập [Vercel](https://vercel.com)
3. Đăng nhập và chọn "New Project"
4. Import repository từ GitHub
5. Vercel sẽ tự động detect và deploy

### Cách 2: Deploy từ Vercel CLI

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy production
vercel --prod
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (1 cột video)
- **Tablet**: 768px - 1024px (2 cột video)
- **Desktop**: > 1024px (3 cột video)

## 🎨 Customization

### Thay đổi màu sắc
Chỉnh sửa gradient trong file `index.html`:
```css
.gradient {
  background: linear-gradient(90deg, #d53369 0%, #daae51 100%);
}
```

### Thêm video mới
1. Thêm file video vào thư mục `videos/`
2. Cập nhật HTML trong section "Video nổi bật"
3. Thêm tiêu đề tương ứng

## 📞 Liên hệ

- **Website**: [AYO Vietnam](https://www.tiktok.com/@ayo.vietnam)
- **TikTok**: [@ayo.vietnam](https://www.tiktok.com/@ayo.vietnam)

## 📄 License

© 2024 AYO Vietnam. Tất cả quyền được bảo lưu.

---

Được phát triển với ❤️ bởi AYO Vietnam Team

---

## 📧 Cấu hình gửi mail Brevo qua SMTP (AYO Vietnam)

Thêm file `.env` với nội dung sau (hoặc cập nhật `.env.example`):

```
SMTP_USER=9a469c001@smtp-brevo.com
SMTP_PASS=your-brevo-smtp-key-here
FROM_EMAIL=ayo.vietnam@yourdomain.com
ADMIN_EMAIL=your-admin@domain.com
LEADS_WEBHOOK_URL=https://your-webhook-url (optional)
```
- Lấy `SMTP_USER` là email đăng nhập Brevo của bạn
- `SMTP_PASS` là SMTP key do Brevo cung cấp (dạng `xsmtpsib-...`)
- `FROM_EMAIL` là địa chỉ sẽ hiển thị là người gửi (nên khớp Brevo verify)
- `ADMIN_EMAIL` là email nội bộ nhận thông báo lead mới
- `LEADS_WEBHOOK_URL` tuỳ chọn nếu có webhook nhận thông tin đăng ký (convert lead)

> Nếu không nhận được mail, kiểm tra lại key SMTP và email, hoặc thử gửi test ở https://www.smtper.net/ để kiểm tra cấu hình Brevo còn hoạt động.

---

## 📊 Cấu hình Google Sheets để lưu subscribers (Bắt buộc cho production)

Để lưu danh sách subscribers bền vững và hiển thị trên trang admin, bạn cần tích hợp Google Sheets:

### 1. Tạo Google Sheet
- Tạo một Google Sheet mới với header: `Name`, `Email`, `Phone`, `CreatedAt`
- Copy **Sheet ID** từ URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`

### 2. Tạo Service Account trên Google Cloud
- Vào [Google Cloud Console](https://console.cloud.google.com/)
- Tạo Service Account và tải file JSON credentials
- Share Google Sheet cho email Service Account với quyền **Editor**

### 3. Thêm biến môi trường trên Vercel

Thêm 2 biến môi trường mới:
```
GOOGLE_SHEET_ID=your-sheet-id-here
GOOGLE_SERVICE_ACCOUNT={"type":"service_account",...} (toàn bộ nội dung file JSON)
```

- `GOOGLE_SHEET_ID`: ID của Google Sheet (lấy từ URL)
- `GOOGLE_SERVICE_ACCOUNT`: Toàn bộ nội dung file JSON credentials (copy-paste nguyên văn)

> **Lưu ý bảo mật:** Không commit file JSON credentials lên GitHub!