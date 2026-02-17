# تقرير عمل الواجهة الأمامية — 17 فبراير 2026

## ✅ ملخص اليوم
تم تنفيذ فصل واضح للبوابات (Host / Provider / Admin)، إضافة تسجيل منفصل لشركات المزودين، تجهيز توثيق Nginx للنشر، وتحسينات UI مهمة في لوحة الإدارة.

---

## 1) توحيد تصميم Sidebars عبر البوابات
**What**
- توحيد هيكل Sidebar في بوابة المضيف والمزود ليكون بنفس نمط Admin (Main Nav + Footer Actions).

**How**
- تحديث:
  - `client/components/layout/sidebar.tsx`
  - `client/components/layout/app-layout.tsx`
  - `client/components/pages/provider/provider-portal.tsx`
  - `client/components/pages/provider/provider-company-admin-dashboard.tsx`

**Impact**
- واجهة أكثر اتساقاً بين جميع الأدوار.

---

## 2) إصلاح عرض صور المستخدمين داخل Admin Users
**What**
- إظهار صورة البروفايل الفعلية في `/admin/users` بدل الاعتماد على الأحرف فقط.

**How**
- تعديل `client/components/pages/admin/admin-users.tsx` لإضافة `AvatarImage` واستخدام `profileImageUrl`.

**Impact**
- أي صورة يحدّثها المستخدم في Profile تظهر مباشرة في لوحة الإدارة.

---

## 3) استبدال alert الحذف بمودال تأكيد
**What**
- إزالة `window.confirm` عند حذف المستخدم من Admin Users.

**How**
- استخدام `AlertDialog` بمسار تأكيد واضح داخل:
  - `client/components/pages/admin/admin-users.tsx`

**Impact**
- UX أفضل ومتسق مع تصميم النظام بدل browser alert.

---

## 4) منع دخول الأدوار غير المضيف إلى إعدادات المضيف
**What**
- إصلاح مشكلة انتقال Provider/Admin إلى `/settings` الخاصة بالمضيف.

**How**
- إضافة guard على كل مسارات settings عبر:
  - `client/app/settings/layout.tsx`

**Impact**
- كل دور يبقى داخل بوابته الصحيحة.

---

## 5) فصل البوابات حسب Subdomain (جاهز لـ Nginx)
**What**
- ربط السلوك بالـ subdomain:
  - `admin.*` -> `/admin`
  - `provider.*` -> `/provider`
  - `hoster.*` -> بوابة المضيف

**How**
- إضافة middleware:
  - `client/middleware.ts`
- إضافة استثناءات عامة للمسارات العامة مثل `/provider-signup`.

**Impact**
- جاهزية تشغيل 3 بوابات منفصلة على 3 subdomains.

---

## 6) إعادة تنظيم ملفات الواجهة حسب الأدوار
**What**
- نقل صفحات المضيف والمزود إلى مجلدات مخصصة بدل تجميعها في مجلد واحد.

**How**
- نقل صفحات Host إلى: `client/components/pages/host/*`
- نقل صفحات Provider إلى: `client/components/pages/provider/*`
- تحديث كل imports في `app/*`.

**Impact**
- هيكل كود أوضح وأسهل للصيانة والتوسعة.

---

## 7) استخراج مكوّنات مشتركة
**What**
- استخراج مكوّن الإعدادات السريعة المستخدم في أكثر من Portal.

**How**
- إضافة:
  - `client/components/pages/shared/portal-settings-shortcuts.tsx`
- استخدامه في صفحات المزود والمشرف.

**Impact**
- تقليل التكرار وتوحيد سلوك/تصميم عناصر الإعدادات.

---

## 8) صفحة تسجيل منفصلة لشركات المزودين (Multi-step)
**What**
- إضافة صفحة signup مستقلة للمزودين (مشرف الشركة) بمرحلتين:
  1) بيانات الحساب
  2) بيانات الشركة

**How**
- إضافة:
  - `client/components/pages/provider/provider-company-signup.tsx`
  - `client/app/provider-signup/page.tsx`
- تعديل login في provider portal لإزالة signup الداخلي والاكتفاء برابط الصفحة الجديدة.

**Impact**
- تدفق تسجيل واضح ومتوافق مع متطلبات اعتماد شركات المزودين.

---

## 9) توثيق Nginx للبوابات الأمامية
**What**
- إضافة دليل نشر عملي لفصل البوابات عبر Nginx.

**How**
- إضافة الملف:
  - `_docs/NGINX_FRONTEND_PORTALS_SETUP.md`

**Impact**
- فريق النشر يقدر يفعّل subdomains بشكل واضح وسريع.

---

## ✅ التحقق
- `cd client && npm run build` تم بنجاح بعد التعديلات.

---

## 🔄 تحديث إضافي (نفس اليوم) — توحيد واجهات الشات

## 10) توحيد شاشة Inbox للمضيف (Guests / Providers / Support)
**What**
- تحويل Inbox ليعرض كل أنواع المحادثات في مكان واحد مع فلاتر واضحة.

**How**
- تحديث:
  - `client/components/pages/host/inbox.tsx`
- الفلاتر الجديدة أعلى الصفحة:
  - `All`
  - `Guests`
  - `Providers`
  - `Support`

**Impact**
- الوصول لكل المحادثات أصبح من تبويب واحد مع تنظيم حسب نوع الطرف.

---

## 11) إضافة صفحة محادثة مخصصة للمزود داخل بوابة المضيف
**What**
- إنشاء شاشة Chat جديدة لمحادثات المزودين القادمة من Inbox.

**How**
- إضافة:
  - `client/components/pages/host/provider-chat.tsx`
  - `client/app/chat/provider/[id]/page.tsx`
- تدعم مصدرين:
  - legacy cleaning chat
  - marketplace provider chat

**Impact**
- المضيف يمكنه بدء/متابعة محادثة المزود مباشرة من Inbox الموحد.

---

## 12) تمكين محادثات العملاء من تبويب Clients في Provider Company Admin
**What**
- إضافة UI كامل لبدء/فتح/إرسال الرسائل مع العميل من `Clients`.

**How**
- تحديث:
  - `client/components/pages/provider/provider-company-admin-dashboard.tsx`
- التبويب أصبح يحتوي:
  - زر `Start Chat` أو `Open Chat`
  - عرض آخر رسالة
  - شاشة thread داخل نفس التبويب

**Impact**
- مشرف شركة المزود يدير محادثات العملاء من نفس مكان إدارة العملاء بدون تنقلات خارجية.

---

## 13) تنبيه صوتي عند وصول إشعار جديد أثناء وجود المستخدم Online
**What**
- إضافة إشعار صوتي خفيف عند زيادة unread notifications والمستخدم على الصفحة.

**How**
- إضافة hook:
  - `client/hooks/use-notification-sound.ts`
- ربطه في layouts/portals:
  - `client/components/layout/app-layout.tsx`
  - `client/components/pages/admin/admin-layout.tsx`
  - `client/components/pages/provider/provider-portal.tsx`

**Impact**
- تجربة لحظية أفضل: المستخدم يسمع تنبيه عند وصول رسالة جديدة أثناء التواجد داخل النظام.

---

## 14) إبقاء تنسيق الواجهات متوافق مع هيكل البوابات الحالي
**What**
- إضافة الميزات الجديدة بدون كسر نمط التنقل الحالي لكل Portal.

**How**
- الحفاظ على:
  - AppLayout/Sidebar/Bottom Tabs الحالية
  - مسارات Host وProvider وAdmin كما هي
- التوسعة تمت فوق البنية الحالية بدل إعادة بناء الملاحة.

**Impact**
- الميزات الجديدة اندمجت بسرعة وبأقل مخاطر على سلوك البوابات الموجودة.

---

## ✅ التحقق (تحديث إضافي)
- `cd client && npx tsc --noEmit` تم بنجاح بعد تحديثات Inbox/Provider Chat/Notification Sound.

---

## 🔄 تحديث إضافي (نفس اليوم) — Call Support = Assigned Support Chat

## 15) ربط شاشات دعم Host/Provider بطلب دعم رسمي
**What**
- عند فتح دعم المضيف أو المزود يتم إنشاء/تأكيد support request thread تلقائياً.

**How**
- تحديث:
  - `client/components/pages/host/support-chat.tsx`
  - `client/components/pages/provider/provider-support-chat.tsx`
- استدعاء:
  - `POST /api/support/request`

**Impact**
- أي دخول إلى دعم Host/Provider يبدأ flow قابل للتعيين في لوحة Admin/Moderator.

---

## 16) تعديل زر Call Support في بوابة المزود
**What**
- تغيير سلوك `Call Support` ليبدأ محادثة الدعم داخل النظام بدل `tel:`.

**How**
- تحديث:
  - `client/components/pages/provider/provider-app-settings-page.tsx`
- الزر الآن يفتح:
  - `/provider/support-chat`

**Impact**
- سلوك متوافق مع المتطلب: الدعم يبدأ كشات قابل للالتقاط من أول Admin/Moderator.

---

## 17) إضافة منطق Accept داخل Admin Chat UI
**What**
- لا يمكن الرد على طلب الدعم قبل قبوله، وأول قبول فقط هو المعتمد.

**How**
- تحديث:
  - `client/components/pages/admin/admin-chat.tsx`
- إضافات:
  - زر `Accept` عند thread غير معيّن.
  - إظهار حالة التعيين (Unassigned / Assigned).
  - تعطيل الإرسال إذا لم يكن المشرف هو المعين.

**Impact**
- الواجهة تعكس سياسة backend بالكامل وتمنع تضارب ردود المشرفين على نفس الطلب.

---

## ✅ التحقق (تحديث إضافي 2)
- `cd client && npx tsc --noEmit` تم بنجاح بعد تحديث شاشات الدعم وAdmin Chat.

---

## 🔄 تحديث إضافي (نفس اليوم) — توحيد تصميم البروفايل/البوابات + توجيه الإشعارات + إدارة الإشعارات + تحسين الشات على الموبايل

## 18) استخراج Theme Utilities موحدة للبوابات (Spacing / Grid / Typography)
**What**
- اعتماد نفس نمط صفحة Profile النظيفة (الخط/المسافات/الكروت/العناوين) وتعميمه على بقية البوابات.

**How**
- إضافة utilities جديدة داخل:
  - `client/app/globals.css`
- classes جديدة مثل:
  - `portal-page`, `portal-page-narrow`, `portal-header`, `portal-title`, `portal-eyebrow`, `portal-card`, `portal-label`

**Impact**
- توحيد الشكل العام للصفحات عبر Admin/Provider/Host بدون تكرار className في كل صفحة.

---

## 19) توحيد UI صفحات Profile (Host/Admin/Provider)
**What**
- جعل صفحات Edit Profile متطابقة قدر الإمكان مع صفحة Host “Edit Profile” (Sections + زر الحفظ أسفل + أيقونات Labels + Grid).

**How**
- تحديث:
  - `client/components/pages/admin/admin-profile-page.tsx`
  - `client/components/pages/provider/provider-profile-info-page.tsx`
- إضافة قسم `App preferences` + اختيار `Currency` مع زر حفظ أسفل الصفحة.

**Impact**
- تجربة Profile موحدة لكل الأدوار بنفس theme والـ spacing.

---

## 20) إضافة Back Button لصفحة Provider Settings
**What**
- إضافة زر رجوع في أعلى `/provider/settings` ليعود المستخدم إلى بوابة المزود.

**How**
- تحديث:
  - `client/components/pages/provider/provider-app-settings-page.tsx`

**Impact**
- تنقل أوضح على الموبايل وتوافق مع باقي الصفحات التي تحتوي back button.

---

## 21) توجيه المستخدم عند الضغط على Notification إلى صفحة الإجراء الصحيح (Deep Linking)
**What**
- عند الضغط على notification ينتقل المستخدم مباشرة للصفحة التي “تتعامل” مع الحدث (Chat/Inbox/Requests/…).

**How**
- إضافة mapping helper:
  - `client/lib/notification-links.ts`
- ربط التنقل عند click داخل:
  - `client/components/pages/admin/admin-layout.tsx`
  - `client/components/pages/provider/provider-notification-bell.tsx`
  - `client/components/pages/host/notifications.tsx`
- دعم deep-link بالـ query params:
  - Provider portal: `?tab=...&subscriptionId=...&mode=...`
    - `client/components/pages/provider/provider-portal.tsx`
  - Provider company admin: `?tab=...&chatId=...`
    - `client/components/pages/provider/provider-company-admin-dashboard.tsx`
  - Admin providers: `?tab=requests`
    - `client/components/pages/admin/admin-providers.tsx`

**Impact**
- الإشعارات أصبحت “Actionable” وتوصل المستخدم مباشرة للواجهة المناسبة.

---

## 22) إدارة الإشعارات من الواجهة (Clear + حذف فردي X)
**What**
- إضافة زر `Clear` لمسح إشعارات المستخدم، وإضافة زر `X` لحذف إشعار واحد من القائمة (soft-delete).

**How**
- تحديث:
  - `client/components/pages/host/notifications.tsx`
  - `client/components/pages/admin/admin-layout.tsx`
  - `client/components/pages/provider/provider-notification-bell.tsx`

**Impact**
- المستخدم يقدر ينظف مركز الإشعارات بسهولة بدون فقد سجل النظام (الحذف Soft).

---

## 23) تثبيت Composer الشات فوق Bottom Tabs على الموبايل (مثل Admin Chat)
**What**
- جعل input الشات دائماً في أسفل الشاشة وفوق bottom nav في الهواتف في كل صفحات الشات.

**How**
- إضافة classes عامة:
  - `chat-composer`, `chat-scroll`, `has-bottom-nav` داخل `client/app/globals.css`
- تفعيل offset عند وجود bottom tabs عبر:
  - `client/components/layout/app-layout.tsx`
  - `client/components/pages/admin/admin-layout.tsx`
  - `client/components/pages/provider/provider-portal.tsx`
  - `client/components/pages/provider/provider-company-admin-dashboard.tsx`
- تطبيقها في صفحات الشات:
  - `client/components/pages/admin/admin-chat.tsx`
  - `client/components/pages/host/chat.tsx`
  - `client/components/pages/host/support-chat.tsx`
  - `client/components/pages/provider/provider-support-chat.tsx`
  - `client/components/pages/host/provider-chat.tsx`
  - thread داخل provider portal & company admin

**Impact**
- UX متسق في الشات على الموبايل: لا تختفي الـ input خلف bottom nav.

---

## 24) إعادة تصميم Company Data داخل Provider Company Admin لتكون صفحة إدارة كاملة (Company + Profile)
**What**
- صفحة “Company Data” كانت form بسيط وغير متوافق مع theme العام، وتم تحويلها لواجهة إدارة كاملة لمشرف الشركة (Profile card + Company data card).

**How**
- تحديث:
  - `client/components/pages/provider/provider-company-admin-dashboard.tsx`
- كما تم دمج صفحة Settings داخل نفس البوابة بشكل embedded:
  - تعديل `client/components/pages/provider/provider-app-settings-page.tsx` لدعم `embedded`.

**Impact**
- Company admin لديه صفحة واحدة واضحة لإدارة بياناته وبيانات الشركة بنفس أسلوب البوابة.

---

## 25) ضبط TypeScript في client لتجنب الاعتماد على ملفات `.next` غير الموجودة
**What**
- إصلاح مشكلة `tsc` التي كانت تبحث عن `.next/types` غير موجودة.

**How**
- تحديث:
  - `client/tsconfig.json`
- إزالة include الخاص بـ:
  - `.next/types/**/*.ts`
  - `.next/dev/types/**/*.ts`

**Impact**
- `npx tsc` يعمل بشكل ثابت، مع بقاء type-check الخاص بـ Next عبر `npm run build`.

---

## ✅ التحقق (تحديث إضافي 3)
- `cd client && npm run build` تم بنجاح بعد تحديثات theme/notifications/chat.

---

## 🔄 تحديث إضافي (نفس اليوم) — Realtime Sockets + تحسين الشات

## 26) استبدال الـ polling بسوكتات مباشرة للإشعارات والشات
**What**
- تحويل التحديثات اللحظية للشات والإشعارات إلى WebSocket بدل `refetchInterval`.

**How**
- إضافة:
  - `client/hooks/use-realtime-socket.ts`
  - `client/lib/realtime-events.ts`
- ربط السوكت في:
  - `client/components/layout/app-layout.tsx`
  - `client/components/pages/admin/admin-layout.tsx`
  - `client/components/pages/provider/provider-portal.tsx`
  - `client/app/provider/layout.tsx`
- إزالة polling من صفحات الشات والإشعارات (Query refetchInterval).

**Impact**
- تحديث لحظي فعلي بدون تأخير أو استهلاك زائد للشبكة.

---

## 27) Auto-scroll ذكي عند وصول رسالة جديدة
**What**
- تمرير تلقائي لآخر رسالة عند وصول رسالة جديدة في كل الشاشات.

**How**
- إضافة hook:
  - `client/hooks/use-chat-auto-scroll.ts`
- ربطه بكل صفحات الشات للأدوار المختلفة (Admin/Host/Provider/Support/Company Admin).

**Impact**
- المحادثة تبقى دائماً على آخر رسالة بدون حاجة Refresh أو Scroll يدوي.

---

## 28) تثبيت موضع Composer الشات في صفحات الدعم للمزود
**What**
- ضمان بقاء input الشات أسفل الصفحة بشكل ثابت ومناسب على الموبايل.

**How**
- ضبط layout في:
  - `client/components/pages/provider/provider-support-chat.tsx`

**Impact**
- تجربة شات مستقرة ومطابقة لسلوك Admin Chat.

---

## 🔄 تحديث إضافي (نفس اليوم) — فصل Auth للمزوّد + تقييد الدخول حسب البوابة + تحسين الأداء

## 29) فصل صفحات Login/Signup الخاصة بالمزوّد داخل مجلد البوابة
**What**
- نقل تجربة دخول/تسجيل المزوّد إلى صفحات مخصصة داخل `provider` بدل الاعتماد على صفحة عامة.

**How**
- إضافة صفحات/مكونات:
  - `client/components/pages/provider/provider-login-page.tsx`
  - `client/components/pages/provider/provider-signup-page.tsx`
  - `client/app/provider/login/page.tsx`
  - `client/app/provider/signup/page.tsx`
  - `client/app/provider/company-signup/page.tsx`
- إضافة redirect توافق للخلف:
  - `client/app/provider-signup/page.tsx` → `/provider/company-signup`
- ضبط `provider` layout لتجاوز `RoleGuard` في صفحات auth.

**Impact**
- فصل واضح لبوابة المزوّد وتجربة أكثر اتساقاً مع هوية البوابة.

---

## 30) توحيد طلبات المصادقة بالـ portal الصحيح لكل واجهة
**What**
- كل شاشة دخول/تسجيل أصبحت ترسل `portal` المناسب (admin/provider/hoster) لتفعيل التقييد الخلفي حسب الدور.

**How**
- تحديث شاشات auth التالية لإرسال `portal`:
  - `client/components/pages/login.tsx`
  - `client/components/pages/signup.tsx`
  - `client/components/pages/admin/admin-login.tsx`
  - `client/components/pages/provider/provider-login-page.tsx`
  - `client/components/pages/provider/provider-signup-page.tsx`
  - `client/components/pages/provider/provider-company-signup.tsx`
- تحديث redirect عدم تسجيل الدخول في:
  - `client/components/pages/provider/provider-portal.tsx` إلى `/provider/login`

**Impact**
- منع تسجيل الدخول المتبادل بين البوابات مع UX موحّد ورسالة خطأ عامة.

---

## 31) تقليل الضغط على API في realtime لتحسين سرعة الواجهة
**What**
- تقليل إعادة الجلب المفرطة بعد كل event سوكت.

**How**
- تحسين hook realtime:
  - `client/hooks/use-realtime-socket.ts`
  - استخدام invalidation مجمّع/مؤجل بدل التنفيذ الفوري المتكرر.
  - حصر إعادة الجلب على الاستعلامات النشطة `refetchType: "active"`.
- تحديث helper الاستعلامات:
  - `client/lib/queryClient.ts`
  - إزالة فرض `cache: "no-store"` من كل الطلبات العامة.

**Impact**
- تخفيف حمل backend وتسريع الإحساس العام في الواجهة خصوصاً في الشات والإشعارات.

---

## 🔄 تحديث إضافي (نفس اليوم) — لا تغييرات على الواجهة
**Note**
- دفعة التشفير وتحسينات الـ backend لم تتطلب أي تعديل في الواجهة الأمامية.
