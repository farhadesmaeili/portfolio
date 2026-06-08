# CLAUDE.md — Personal Portfolio

> این فایل راهنمای کامل پروژه است.
> هر بار که با Claude کار می‌کنی، این فایل را اول بخوان.

---

## 📌 وضعیت پروژه

| بخش                                       | وضعیت                  |
| ----------------------------------------- | ---------------------- |
| Next.js 15 + TypeScript + Tailwind CSS v4 | ✅ نصب شده             |
| Husky + commitlint + lint-staged          | ✅ راه‌اندازی شده      |
| Prettier + prettier-plugin-tailwindcss    | ✅ نصب شده             |
| GitHub Actions — CI (Lint + Type Check)   | ✅ فعال و سبز          |
| GitHub Actions — Deploy (Vercel)          | ✅ فعال و سبز          |
| GitHub Actions — Issue Sync               | ✅ فعال                |
| Vercel                                    | ✅ متصل و آنلاین       |
| Issue Templates (bug, feature, task)      | ✅ ساخته شده           |
| PR Template                               | ✅ ساخته شده           |
| Dependabot                                | ✅ فعال                |
| Branch Protection (main + develop)        | ✅ تنظیم شده           |
| Branch develop                            | ✅ ساخته شده و default |
| ساختار پوشه‌های src/                      | ⏳ در انتظار           |
| کدنویسی پروژه                             | ⏳ در انتظار           |

---

## 📌 Project Overview

- **Type**: Personal Portfolio Website
- **Stack**: Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- **Package Manager**: `npm`
- **Node Version**: `>=20.x`
- **Hosting**: Vercel
- **Repo**: https://github.com/farhadesmaeili/portfolio
- **Vercel Dashboard**: https://vercel.com/farhadesmaeilis-projects/portfolio

---

## 📁 ساختار پوشه‌ها (هدف)

```
portfolio/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml            # Lint + Type Check روی هر push/PR
│   │   ├── deploy.yml        # Auto deploy به Vercel روی main
│   │   └── issue-sync.yml    # لیبل‌گذاری خودکار issue ها
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   ├── feature_request.yml
│   │   ├── internal_task.yml
│   │   └── config.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── dependabot.yml
│
├── .husky/
│   ├── commit-msg            # commitlint validation
│   └── pre-commit            # lint-staged
│
├── public/
│   ├── images/
│   │   └── avatar.webp
│   ├── icons/
│   └── fonts/
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (root)/
│   │   │   ├── page.tsx      # Home / Hero
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
│   │   ├── layout.tsx        # Root layout
│   │   ├── not-found.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/               # Button, Badge, Card, Input و ...
│   │   ├── layout/           # Header, Footer, Navbar, ThemeToggle
│   │   ├── sections/         # Hero, About, Projects, Skills, Contact
│   │   └── shared/           # SEO, AnimatedWrapper و ...
│   │
│   ├── content/              # MDX files
│   │   ├── blog/
│   │   └── projects/
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useScrollProgress.ts
│   │   ├── useTheme.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── lib/                  # Utility functions
│   │   ├── mdx.ts
│   │   ├── metadata.ts
│   │   └── utils.ts
│   │
│   ├── config/               # Static config
│   │   ├── site.ts
│   │   ├── navigation.ts
│   │   └── socials.ts
│   │
│   ├── types/                # TypeScript types
│   │   ├── index.ts
│   │   ├── project.ts
│   │   └── blog.ts
│   │
│   └── styles/
│       └── themes.css
│
├── .env.example
├── .env.local                # ⚠️ هرگز commit نشود
├── .gitignore
├── .prettierrc
├── commitlint.config.js
├── lint-staged.config.js
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── CLAUDE.md
```

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Framework | Next.js 15 (App Router)           |
| Language  | TypeScript (strict mode)          |
| Styling   | Tailwind CSS v4                   |
| Animation | Framer Motion                     |
| Icons     | Lucide React                      |
| Linting   | ESLint + Prettier                 |
| Git Hooks | Husky + lint-staged               |
| Commits   | Commitlint (Conventional Commits) |
| CI/CD     | GitHub Actions + Vercel           |

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

### فرمت

```
<type>(<scope>): <Subject sentence case>

[optional body]

[optional footer]
```

### انواع مجاز

| Type       | کاربرد            |
| ---------- | ----------------- |
| `feat`     | ویژگی جدید        |
| `fix`      | رفع باگ           |
| `docs`     | مستندات           |
| `style`    | تغییرات ظاهری کد  |
| `refactor` | بازسازی کد        |
| `perf`     | بهبود عملکرد      |
| `test`     | تست‌ها            |
| `build`    | سیستم build       |
| `ci`       | فایل‌های CI/CD    |
| `chore`    | نگهداری           |
| `revert`   | بازگرداندن commit |

### Scope های مجاز

`api` `ui` `auth` `core` `config` `deps` `docs` `tests` `global`

### مثال‌های درست

```bash
feat(ui): Add hero section with animated headline
fix(core): Correct metadata generation for blog posts
chore(deps): Upgrade next.js to 16.3.0
ci(config): Add type-check step to workflow
docs(global): Update README with setup instructions
```

### مثال‌های غلط

```bash
update stuff           # ❌ بدون type
feat: update           # ❌ توضیح مبهم
FIX(UI): button        # ❌ type با حرف بزرگ
feat(unknown): xyz     # ❌ scope نامعتبر
```

---

## 🌿 Branching Strategy

```
main        → Production (protected — فقط از develop merge میشه)
develop     → Integration (default branch — همه feature ها اینجا merge میشن)
feature/*   → ویژگی جدید
fix/*       → رفع باگ
chore/*     → نگهداری
```

### Flow کار روزانه

```
git checkout develop && git pull
git checkout -b feature/xxx
# کد بنویس
git add . && git commit -m "feat(ui): ..."
git push -u origin feature/xxx
# روی GitHub: PR بساز feature/xxx → develop
# CI باید pass بشه
# merge کن
```

### مثال نام branch

```bash
feature/hero-section
feature/blog-page
fix/mobile-navbar
chore/upgrade-dependencies
```

---

## 🔐 Environment Variables

```bash
# .env.example

NEXT_PUBLIC_SITE_URL=https://yourportfolio.vercel.app

# Contact Form
RESEND_API_KEY=
```

> ⚠️ هرگز `.env.local` را commit نکن — فقط `.env.example` در git باشد.

---

## 🤖 راهنمای Claude

### قوانین کد

1. **هیچ `any` نباشد** — از type های دقیق یا `unknown` استفاده کن
2. **هر component یک Props interface داشته باشد**
3. **`'use client'` فقط وقتی ضرورت داره** — در غیر این صورت Server Component باشه
4. **از `@/` alias استفاده کن** — نه `../../../`
5. **هر function باید return type داشته باشد**
6. **از `next/image` برای همه تصاویر استفاده کن**
7. **هر page باید `generateMetadata` داشته باشد**
8. **هیچ `console.log` در کد نهایی نباشد**
9. **named export برای همه — فقط page components default export باشند**

### ساختار component

```tsx
// ✅ درست
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps): JSX.Element {
  return <button onClick={onClick}>{label}</button>;
}
```

### ساختار page

```tsx
// ✅ درست
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Portfolio',
  description: '...',
};

export default function AboutPage(): JSX.Element {
  return <main>...</main>;
}
```

---

## 📋 Definition of Done

قبل از هر commit:

- [ ] بدون TypeScript error — `npm run type-check`
- [ ] بدون ESLint error — `npm run lint`
- [ ] Prettier اعمال شده — `npm run format`
- [ ] Commit message استاندارده
- [ ] روی موبایل تست شده

---

## 🔒 Branch Protection Rules

### main

- فقط از `develop` merge میشه
- CI باید pass بشه
- Force push ممنوع
- Linear history اجباری

### develop

- همه feature ها اینجا merge میشن
- Force push ممنوع
- Default branch

---

## 🚀 Deployment

- هر push به `main` → auto deploy به Vercel
- هر PR → preview deploy خودکار
- Vercel Dashboard: https://vercel.com/farhadesmaeilis-projects/portfolio

---

_Last updated: June 2026_
