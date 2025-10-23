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