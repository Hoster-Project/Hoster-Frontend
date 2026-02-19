# تقرير عمل الواجهة الأمامية — 18 فبراير 2026

## ✅ ملخص اليوم
تم تحسين تجربة الشات عبر كل البوابات بحيث تظهر رسالة المرسل فوراً (Optimistic UI) بدل انتظار إعادة الجلب، مع الحفاظ على التزامن النهائي مع استجابة السيرفر وRealtime.

---

## 1) حل تأخير ظهور رسالة المرسل في شات Admin Support
**What**
- الرسالة كانت تصل للطرف الآخر أسرع من ظهورها للمرسل في واجهة Admin.

**How**
- تحديث:
  - `client/components/pages/admin/admin-chat.tsx`
- إضافة `onMutate` لإدراج رسالة مؤقتة مباشرة داخل الكاش.
- إضافة rollback عند الفشل (`onError`) واستبدال الرسالة المؤقتة بالرسالة الحقيقية عند النجاح.

**Impact**
- مشرف النظام يرى رسالته فوراً داخل نفس المحادثة بدون انتظار refetch.

---

## 2) تحسين شات الضيوف في بوابة المضيف (Host Guest Chat)
**What**
- تأخير بصري عند إرسال الرسائل من شاشة شات الضيف.

**How**
- تحديث:
  - `client/components/pages/host/chat.tsx`
- تحويل mutation لإرجاع payload السيرفر.
- إضافة optimistic message بحالة `sending` ثم تحويلها إلى `sent` بعد نجاح الاستجابة.

**Impact**
- إحساس أسرع أثناء المراسلة، مع بقاء صحة البيانات النهائية من السيرفر.

---

## 3) تحسين شات الدعم للمضيف والمزوّد
**What**
- نفس مشكلة التأخير كانت موجودة في شاشات Support Chat.

**How**
- تحديث:
  - `client/components/pages/host/support-chat.tsx`
  - `client/components/pages/provider/provider-support-chat.tsx`
- إضافة optimistic insert + rollback + invalidate منظم بعد الاستقرار.

**Impact**
- تجربة دعم فورية للمضيف والمزوّد، خصوصاً في المحادثات السريعة.

---

## 4) تحسين شات المزودين في Inbox المضيف (Provider Chat)
**What**
- المحادثات (cleaning + marketplace) كانت تعتمد على refetch قبل ظهور الرسالة للمرسل.

**How**
- تحديث:
  - `client/components/pages/host/provider-chat.tsx`
- دعم optimistic message في المصدرين:
  - `cleaning`
  - `marketplace`
- تعديل send handlers لتمرير النص المقصوص `trimmed` مباشرة.

**Impact**
- الرسالة تظهر فوراً بصرياً في محادثات المزود ضمن Inbox.

---

## 5) تحسين شات المزود داخل Provider Portal وCompany Admin Dashboard
**What**
- تأخير ملحوظ في عرض الرسالة الذاتية في شات المزوّد (العامل/مشرف الشركة).

**How**
- تحديث:
  - `client/components/pages/provider/provider-portal.tsx`
  - `client/components/pages/provider/provider-company-admin-dashboard.tsx`
- تطبيق optimistic updates على محادثات:
  - `/api/provider/messages/:subscriptionId`
  - `/api/provider-chats/:chatId/messages`
- إبقاء invalidation بعد الإرسال لضمان التزامن مع السيرفر.

**Impact**
- شاشات الشات للمزوّد أصبحت لحظية ومتسقة مع باقي البوابات.

---

## 6) تحسين شات التنظيف داخل إعدادات المضيف
**What**
- رسالة المضيف في شاشة التنظيف كانت تظهر بعد دورة جلب جديدة.

**How**
- تحديث:
  - `client/components/pages/host/settings-cleaning.tsx`
- تطبيق optimistic insert على query:
  - `/api/cleaning/messages/:subscriptionId`

**Impact**
- إرسال أسرع وتجربة أفضل أثناء التنسيق مع مزوّد التنظيف.

---

## 7) مواءمة Docker Deploy مع Split Repos (Staging)
**What**
- تثبيت بناء وتشغيل الواجهة من ريبـو مستقل ضمن Docker Compose الخاص بالباكند.

**How**
- تحديث Dockerfile ليعمل مع Next.js repo standalone (بدون مجلد `client/`).
- ضمان وجود مجلد `shared/` داخل ريبـو الواجهة لحل imports مثل `@shared/schema`.
- إزالة `npm prune --omit=dev` من runtime image لأن `next.config.js` يعتمد على `@next/bundle-analyzer` عند التشغيل.

**Impact**
- بناء وتشغيل الواجهة داخل Docker يعمل بشكل ثابت على السيرفر (Next build + Next start).

---

## ✅ التحقق
- `cd client && npm run build` تم بنجاح بعد كل تعديلات الشات.


---

## 8) Subdomain Clean URLs + Portal Isolation (Staging)
**What**
- اعتماد مسارات نظيفة لكل بوابة حسب الـ subdomain بدون الحاجة لـ `/admin/*` أو `/provider/*` في الرابط العام.

**How**
- تحديث `middleware.ts` لعمل:
  - `rewrite` داخلي داخل نفس البوابة (مثال: `staging.admin.tryhoster.com/login` -> route داخلي admin login).
  - `redirect` بين البوابات عند محاولة الوصول لمسارات بوابة أخرى.
  - `redirect` من root domain إلى subdomain الصحيح عند فتح مسارات البوابات.
- تحديث `RoleGuard` ليحوّل المستخدم غير المصرّح/خطأ الدور إلى subdomain الصحيح بدل loop داخل نفس النطاق.
- تحديث layouts:
  - `app/admin/layout.tsx`
  - `app/provider/layout.tsx`
  لدعم public auth paths النظيفة (`/login`, `/signup`, `/company-signup`) على subdomain المخصص.

**Impact**
- الروابط النهائية أصبحت بالشكل المطلوب:
  - `staging.admin.tryhoster.com/login`
  - `staging.provider.tryhoster.com/login`
  - `staging.hoster.tryhoster.com/login`
- عزل واضح بين البوابات ومنع الوصول العرضي لبوابة مختلفة بنفس النطاق.

---

## ✅ التحقق (Portal Routing)
- `npm run build` للواجهة ✅
- سلوك التحويل/العزل يعمل حسب subdomain لكل بوابة.

---

## 9) Fix wrong `:3000` portal redirects on staging
**What**
- بعض التحويلات بعد login كانت تذهب إلى `hoster.tryhoster.com:3000` بدل نطاق staging الصحيح.

**How**
- تحديث `middleware.ts` لاستخراج `env prefix` (مثل `staging`) + `portal subdomain` + `root domain` بشكل صحيح.
- فرض إزالة المنفذ في التحويلات عبر `url.port = ""`.
- تحديث `role-guard.tsx` لبناء روابط absolute صحيحة على شكل:
  - `https://staging.hoster.tryhoster.com/...`
  - `https://staging.provider.tryhoster.com/...`
  - `https://staging.admin.tryhoster.com/...`

**Impact**
- إلغاء تحويلات `:3000` الخاطئة واستقرار التنقل بين البوابات على روابط production الصحيحة.

---

## ✅ التحقق (Redirect Host Fix)
- `npm run build` ✅

---

## 10) تدقيق وتوحيد إعادة التوجيه لكل أنواع إشعارات الرسائل
**What**
- كانت بعض أنواع الإشعارات تُعيد المستخدم لمسارات غير مناسبة للدور الحالي، ما يسبب انتقالات خاطئة أو خروجاً ظاهرياً.

**How**
- تحديث:
  - `lib/notification-links.ts`
  - `components/pages/admin/admin-layout.tsx`
  - `components/pages/provider/provider-notification-bell.tsx`
- اعتماد تصنيف دور واضح (`host` / `provider` / `admin`) داخل دالة routing.
- ربط `entityType` و`type` بمسارات نظيفة بحسب البوابة الحالية فقط.
- تثبيت دور التنقل عند الضغط على الإشعار:
  - admin notifications تستخدم `"admin"`.
  - provider notifications تستخدم `"provider"`.

**Impact**
- التنقل من الإشعارات أصبح متسقاً مع الدور والبوابة، بدون قفزات غير مقصودة بين البوابات.

---

## 11) حل ازدواج غرف الدردشة لحساب Company Admin (وضع العامل vs وضع الإدارة)
**What**
- حسابات الشركة التي تملك وضعين (worker + company-admin) كانت تستطيع فتح الشات من وضع العامل ومن لوحة الإدارة، ما يؤدي لظهور غرفتين منفصلتين بنفس اسم العميل.

**How**
- تحديث:
  - `components/pages/provider/provider-portal.tsx`
- عند وجود `canSwitchMode=true`:
  - إزالة تبويب `Chat` من واجهة worker mode.
  - تحويل أي deep-link يحتوي `?tab=chat` تلقائياً إلى:
  - `?mode=company-admin&tab=clients`

**Impact**
- نقطة دخول واحدة لمحادثات العملاء (Company Admin > Clients)، ما يمنع إنشاء/استخدام مسارين مختلفين لنفس العميل.

---

## ✅ التحقق
- `npm run build` للواجهة ✅
