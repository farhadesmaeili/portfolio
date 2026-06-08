/**
 * @file commitlint.config.js
 * @description
 * فایل تنظیمات Commitlint برای پروژه، مطابق با استاندارد Conventional Commits.
 * این تنظیمات برای پروژه‌هایی مناسب است که به دنبال نظم، خوانایی، و قابلیت اتوماتیک‌سازی
 * در تاریخچه Git خود هستند.
 */

module.exports = {
  /**
   * @property {string[]} extends
   * @description
   * ارث‌بری از تنظیمات استاندارد Conventional Commits.
   * این کانفیگ پایه شامل قوانین رایج برای type، scope، subject، body و footer است.
   */
  extends: ['@commitlint/config-conventional'],

  /**
   * @property {object} rules
   * @description
   * مجموعه قوانین سفارشی و تعدیل شده ما.
   * هر قانون شامل severity، زمان بررسی (when)، و مقدار (value) است.
   * severity: 0=off, 1=warning, 2=error
   * when: 'always' | 'never'
   */
  rules: {
    // -------------------------------------------------------------------------
    // Header Rules
    // -------------------------------------------------------------------------

    /**
     * @rule header-max-length
     * @description حداکثر طول header (شامل type, scope, summary) را 100 کاراکتر تعیین می‌کند.
     * severity: 2 (error) | when: 'always' | value: 100
     */
    'header-max-length': [2, 'always', 100],

    // -------------------------------------------------------------------------
    // Type Rules
    // -------------------------------------------------------------------------

    /**
     * @rule type-enum
     * @description لیست انواع (types) مجاز برای commit.
     * severity: 2 (error) | when: 'always'
     */
    'type-enum': [
      2,
      'always',
      [
        'feat', // Feature: ویژگی جدید
        'fix', // Fix: رفع باگ
        'docs', // Docs: تغییرات در مستندات
        'style', // Style: تغییرات ظاهری کد (formatting) بدون تغییر منطق
        'refactor', // Refactor: بازسازی کد بدون تغییر عملکرد
        'perf', // Performance: بهبود عملکرد
        'test', // Test: افزودن یا ویرایش تست‌ها
        'build', // Build: تغییرات در سیستم build یا وابستگی‌ها
        'ci', // CI: تغییرات در فایل‌های CI/CD
        'chore', // Chore: سایر کارهای نگهداشت
        'revert', // Revert: بازگرداندن commit قبلی
      ],
    ],

    /**
     * @rule type-case
     * @description type باید همیشه با حروف کوچک نوشته شود (مثلاً: feat, fix).
     * severity: 2 (error) | when: 'always' | value: 'lowercase'
     */
    'type-case': [2, 'always', 'lowercase'],

    // -------------------------------------------------------------------------
    // Scope Rules
    // -------------------------------------------------------------------------

    /**
     * @rule scope-enum
     * @description لیستی از scopeهای مجاز.
     * severity: 1 (warning) — هشدار می‌دهد ولی commit را متوقف نمی‌کند.
     */
    'scope-enum': [
      1,
      'always',
      ['api', 'ui', 'auth', 'core', 'config', 'deps', 'docs', 'tests', 'global'],
    ],

    /**
     * @rule scope-empty
     * @description اگر scope خالی باشد هشدار می‌دهد.
     * severity: 1 (warning)
     */
    'scope-empty': [1, 'always', 'never'],

    /**
     * @rule scope-case
     * @description scope باید با حروف کوچک نوشته شود.
     * severity: 1 (warning)
     */
    'scope-case': [1, 'always', 'lower-case'],

    // -------------------------------------------------------------------------
    // Subject Rules
    // -------------------------------------------------------------------------

    /**
     * @rule subject-full-stop
     * @description subject نباید با نقطه (.) تمام شود.
     * severity: 2 (error)
     */
    'subject-full-stop': [2, 'never', '.'],

    /**
     * @rule subject-case
     * @description subject باید با حرف اول بزرگ نوشته شود (Sentence case).
     * مثال صحیح: "Add new feature"
     * severity: 2 (error)
     */
    'subject-case': [2, 'always', 'sentence-case'],

    // -------------------------------------------------------------------------
    // Body Rules
    // -------------------------------------------------------------------------

    /**
     * @rule body-leading-blank
     * @description باید یک خط خالی بین header و body وجود داشته باشد.
     * severity: 2 (error)
     */
    'body-leading-blank': [2, 'always'],

    /**
     * @rule body-empty
     * @description اگر body خالی باشد هشدار می‌دهد.
     * severity: 1 (warning)
     * نکته: برای commit های کوچک که نیاز به توضیح ندارند می‌توانید این rule را حذف کنید.
     */
    'body-empty': [1, 'always', 'never'],

    // -------------------------------------------------------------------------
    // Footer Rules
    // -------------------------------------------------------------------------

    /**
     * @rule footer-leading-blank
     * @description باید یک خط خالی بین body و footer وجود داشته باشد.
     * severity: 2 (error)
     */
    'footer-leading-blank': [2, 'always'],

    /**
     * نکته: قوانین footer مانند "BREAKING CHANGE:" و "Closes #123"
     * به صورت خودکار توسط @commitlint/config-conventional پشتیبانی می‌شوند
     * و نیازی به تعریف rule اضافه ندارند.
     *
     * مثال‌های معتبر:
     *   BREAKING CHANGE: old API removed
     *   Closes #123
     *   Fixes #456
     */
  },
};

/**
=================================================================================
***                          ساختار Commit Message                           ***
=================================================================================

    <type>[optional scope]: <Subject sentence case> [optional reference]

    [optional body]

    [optional footer]

=================================================================================

مثال ۱ — feat با BREAKING CHANGE:

    feat(auth): Implement JWT refresh token mechanism [AUTH-456]

    This commit introduces the JWT refresh token flow to improve session management.
    - A dedicated endpoint for refreshing tokens
    - Secure storage using HttpOnly cookies

    BREAKING CHANGE: Previous session management approach has been deprecated.
    Closes #123

─────────────────────────────────────────────────────────────────────────────────

مثال ۲ — fix ساده:

    fix(api): Correct user data retrieval endpoint bug

    The /api/users/:id endpoint was returning all users instead of one.

    Closes #789

─────────────────────────────────────────────────────────────────────────────────

مثال ۳ — style بدون body:

    style(ui): Format code according to project guidelines

=================================================================================
*/
