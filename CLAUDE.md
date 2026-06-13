# CLAUDE.md — Farhad Esmaeili Portfolio

> این فایل راهنمای کامل پروژه است.
> اول این فایل رو کامل بخوان، بعد شروع به کد نوشتن کن.

---

## ⚠️ قوانین اجباری قبل از هر کاری

**قبل از شروع هر کاری، این سه قانون رو چک کن:**

1. ما روی branch `feature/xxx` هستیم — اول `git branch` بزن و مطمئن شو
2. **هیچ‌وقت** مستقیم روی `develop` یا `main` commit نکن
3. همه commit ها باید روی feature branch فعلی باشن

---

## 👤 درباره صاحب پروژه

- **نام**: Farhad Esmaeili — فرهاد اسماعیلی
- **حوزه کاری**: Full Stack Developer + Bug Bounty Hunter
- **تکنولوژی‌ها**:
  - Frontend: Next.js, React, Flutter, Dart, HTML, CSS, Sass, Tailwind
  - Backend: NestJS, Python, WordPress
  - DevOps: Docker, Kubernetes, Linux
  - Other: Git, GitHub, Bug Bounty

---

## 📌 وضعیت پروژه

| بخش                                       | وضعیت             |
| ----------------------------------------- | ----------------- |
| Next.js 15 + TypeScript + Tailwind CSS v4 | ✅ نصب شده        |
| Husky + commitlint + lint-staged          | ✅ راه‌اندازی شده |
| Prettier + prettier-plugin-tailwindcss    | ✅ نصب شده        |
| GitHub Actions CI + Deploy                | ✅ فعال           |
| Vercel                                    | ✅ متصل و آنلاین  |
| Branch Protection (main + develop)        | ✅ تنظیم شده      |
| ساختار پوشه‌های src/                      | ⏳ در انتظار      |
| کدنویسی پروژه                             | ⏳ در انتظار      |

---

## 📌 Project Overview

- **Type**: Personal Portfolio Website
- **Stack**: Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- **Package Manager**: `npm`
- **Node Version**: `>=20.x`
- **Hosting**: Vercel
- **Repo**: https://github.com/farhadesmaeili/portfolio
- **Vercel**: https://vercel.com/farhadesmaeilis-projects/portfolio

---

## 🎨 Design Direction

### استایل کلی

- **تم**: Dark theme اصلی با اکسنت‌های نئون (سبز یا آبی الکتریکی)
- **فیل**: Futuristic + Hacker aesthetic — مناسب برای یه developer که bug bounty هم کار میکنه
- **انیمیشن**: فوق حرفه‌ای — از Framer Motion برای همه چیز استفاده کن
- **تایپوگرافی**: فونت monospace برای کدها + فونت مدرن برای متن

### انیمیشن‌های مورد نیاز

- Typing effect روی hero section
- Scroll-triggered animations روی همه section ها
- Particle یا glitch effect روی background
- Smooth page transitions
- Hover effects روی کارت‌ها و لینک‌ها
- Counter animation روی آمارها
- Parallax scrolling

---

## 📁 ساختار پوشه‌ها (هدف)

```
portfolio/
├── .github/                  ✅ ساخته شده
├── .husky/                   ✅ ساخته شده
├── public/
│   ├── images/
│   │   └── avatar.webp
│   ├── icons/
│   └── fonts/
│
├── src/
│   ├── app/
│   │   ├── (root)/
│   │   │   ├── page.tsx          # Home — همه sections
│   │   │   └── layout.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── layout.tsx            # Root layout
│   │   ├── not-found.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Input.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── MobileMenu.tsx
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   ├── SkillsSection.tsx
│   │   │   ├── ProjectsSection.tsx
│   │   │   ├── BlogSection.tsx
│   │   │   └── ContactSection.tsx
│   │   └── shared/
│   │       ├── AnimatedWrapper.tsx
│   │       ├── TypewriterEffect.tsx
│   │       ├── ParticleBackground.tsx
│   │       └── ScrollProgress.tsx
│   │
│   ├── content/
│   │   ├── blog/
│   │   └── projects/
│   │
│   ├── hooks/
│   │   ├── useScrollProgress.ts
│   │   ├── useTypingEffect.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── lib/
│   │   ├── mdx.ts
│   │   ├── metadata.ts
│   │   └── utils.ts
│   │
│   ├── config/
│   │   ├── site.ts               # اطلاعات اصلی سایت
│   │   ├── navigation.ts         # لینک‌های navbar
│   │   ├── socials.ts            # لینک‌های شبکه اجتماعی
│   │   └── skills.ts             # لیست مهارت‌ها
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── project.ts
│   │   └── blog.ts
│   │
│   └── styles/
│       └── themes.css
│
├── .env.example
├── .env.local
├── .prettierrc
├── commitlint.config.js
├── lint-staged.config.js
├── next.config.ts
├── package.json
└── CLAUDE.md
```

---

## 📄 صفحات پروژه

### Home (/)

شامل همه section های اصلی:

1. **Hero** — اسم، تایتل با typing effect، CTA buttons
2. **About** — معرفی کوتاه فرهاد
3. **Skills** — تکنولوژی‌ها با آیکون و انیمیشن
4. **Projects** — نمونه کارها (چند تا featured)
5. **Blog** — آخرین مطالب
6. **Contact** — فرم تماس

### /about

معرفی کامل‌تر + تجربه + تحصیلات

### /projects

لیست همه پروژه‌ها با فیلتر

### /projects/[slug]

صفحه جزئیات هر پروژه

### /blog

لیست همه مطالب آموزشی

### /blog/[slug]

متن کامل هر مطلب (MDX)

### /contact

فرم تماس با Resend

---

## ⚙️ config/site.ts (محتوای پیشنهادی)

```ts
export const siteConfig = {
  name: 'Farhad Esmaeili',
  title: 'Farhad Esmaeili — Full Stack Developer',
  description: 'Full Stack Developer specializing in Next.js, NestJS, Flutter, and more.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://farhadesmaeili.dev',
  author: {
    name: 'Farhad Esmaeili',
    email: 'your@email.com',
    github: 'https://github.com/farhadesmaeili',
  },
  skills: [
    'Next.js',
    'NestJS',
    'Flutter',
    'Dart',
    'Python',
    'TypeScript',
    'Docker',
    'Kubernetes',
    'Linux',
    'Git',
    'Tailwind CSS',
    'WordPress',
    'Bug Bounty',
    'HTML',
    'CSS',
    'Sass',
  ],
};
```

---

## 🛠️ Tech Stack

| Layer     | Technology               |
| --------- | ------------------------ |
| Framework | Next.js 15 (App Router)  |
| Language  | TypeScript (strict mode) |
| Styling   | Tailwind CSS v4          |
| Animation | Framer Motion            |
| Icons     | Lucide React             |
| Content   | MDX                      |
| Email     | Resend                   |
| Linting   | ESLint + Prettier        |
| Git Hooks | Husky + lint-staged      |
| CI/CD     | GitHub Actions + Vercel  |

---

## 📜 Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint errors
npm run format       # Format all files with Prettier
npm run type-check   # Run tsc --noEmit
```

---

## ✅ Git Commit Convention

```
<type>(<scope>): <Subject sentence case>
```

### انواع مجاز

feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

### Scope های مجاز

api, ui, auth, core, config, deps, docs, tests, global

### مثال

```bash
feat(ui): Add hero section with typing animation
feat(sections): Add skills section with icon grid
fix(ui): Correct mobile navbar overflow
chore(deps): Add framer-motion package
```

---

## 🌿 Branching Strategy

```
main      → Production (auto-deploy Vercel)
develop   → Integration (default branch)
feature/* → ویژگی جدید
fix/*     → رفع باگ
```

### Flow کار

```bash
git checkout develop && git pull
git checkout -b feature/hero-section
# کد بنویس
git add . && git commit -m "feat(sections): Add hero section"
git push -u origin feature/hero-section
# PR بساز: feature/xxx → develop
# CI pass بشه → merge کن
```

---

## 🤖 قوانین کد برای Claude

1. هیچ `any` نباشد
2. هر component یک Props interface داشته باشد
3. `'use client'` فقط وقتی ضرورت داره
4. از `@/` alias استفاده کن
5. هر function باید return type داشته باشد
6. از `next/image` برای همه تصاویر
7. هر page باید `generateMetadata` داشته باشد
8. هیچ `console.log` در کد نهایی
9. named export برای همه — فقط page components default export
10. انیمیشن‌ها با Framer Motion — فوق حرفه‌ای و smooth

---

## 📋 Definition of Done

- [ ] بدون TypeScript error
- [ ] بدون ESLint error
- [ ] Prettier اعمال شده
- [ ] Commit message استاندارده
- [ ] روی موبایل تست شده
- [ ] انیمیشن‌ها smooth هستن

---

## 🚀 Deployment

- هر push به `main` → auto deploy Vercel
- هر PR → preview deploy

---

_Last updated: June 2026_
