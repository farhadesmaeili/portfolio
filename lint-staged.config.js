/**
 * @file lint-staged.config.js
 * @description
 * فایل تنظیمات lint-staged برای پروژه Next.js 15 + TypeScript + Tailwind CSS.
 * این فایل مشخص می‌کند که قبل از هر commit، روی فایل‌های staged چه عملیاتی انجام شود.
 * فقط فایل‌هایی که در git stage هستند پردازش می‌شوند — نه کل پروژه.
 */

module.exports = {
  /**
   * فایل‌های TypeScript و TSX
   * 1. eslint --fix  → خطاهای ESLint را auto-fix می‌کند
   * 2. prettier --write → فرمت کد را استاندارد می‌کند
   */
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],

  /**
   * فایل‌های JavaScript
   * (برای فایل‌های config مثل همین فایل)
   */
  '*.{js,cjs,mjs}': ['eslint --fix', 'prettier --write'],

  /**
   * فایل‌های CSS
   * فقط prettier — چون ESLint روی CSS کار نمی‌کند
   */
  '*.css': ['prettier --write'],

  /**
   * فایل‌های JSON و Markdown
   * فقط prettier برای فرمت‌بندی
   */
  '*.{json,md,mdx}': ['prettier --write'],
};
