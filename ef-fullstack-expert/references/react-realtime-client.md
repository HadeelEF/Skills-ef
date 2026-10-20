# عميل Realtime في React (SignalR وSSE وWebSockets)

اقرأ عند إضافة إشعارات أو تحديثات حية للواجهة. جانب الخادم (backplane، groups، المصادقة، IIS)
في مرجع Realtime وStreaming. التنفيذ المختبر: `golden-react-feature/src/shared/realtime` و
`features/requests/realtime`.

## المبدأ

الرسالة الحية **إشعار بأن شيئًا تغيّر**، والـAPI مصدر الحقيقة. SignalR يسلم at-most-once دون
تخزين؛ ما يُرسل أثناء الانقطاع يضيع. لذلك: الحدث يبطل الـcache أو يحدّثه بشرط النسخة، وبعد أي
reconnect أو restart تعيد مزامنة النطاق كله.

## دورة حياة الاتصال

- **اتصال واحد لكل جلسة** مشترك بين الميزات، لا اتصال لكل مكون. مالك الاتصال provider في الـshell
  تحت حد الجلسة (يتجدد عند تبديل المستخدم أو الجهة).
- **StrictMode:** effects تُركّب وتُفك ثم تُركّب. اجعل الإدارة ref-counted مع إيقاف مؤجل، وإلا تتسابق
  `start()` مع `stop()` ويفشل الاتصال في التطوير أو تُفتح اتصالات مكررة.
- **`onreconnected` و`onclose` في عميل SignalR JS لا تملك دالة إزالة:** سجّلها مرة واحدة في المدير
  ووزعها على listeners خاصة بك قابلة للإزالة؛ وإلا تتراكم callbacks مع كل mount.
- `withAutomaticReconnect` لا يغطي فشل **أول** `start()`: أعد المحاولة بنفسك مع backoff ما دام الاتصال
  مطلوبًا. بعد انتهاء محاولات إعادة الاتصال يُستدعى `onclose`: أعد التشغيل إن كان مطلوبًا.
- حمّل عميل SignalR بـ`import()` ديناميكي عند أول حاجة؛ قلل حجمه من الحزمة الأولية (في المثال الذهبي:
  من 148 إلى 130 KB gzip).
- المصادقة: مع BFF وcookies استخدم `withCredentials`؛ مع tokens استخدم `accessTokenFactory` يعيد token
  صالحًا عند كل (إعادة) اتصال. التوكن يمر في query string لـWebSockets: لا تسجله في الخادم أو الـproxy.

## من الحدث إلى الـcache

```ts
connection.on('RequestChanged', (payload) => {
  const event = requestChangedEventSchema.safeParse(payload); // events are untrusted input
  if (!event.success) return;
  const cached = queryClient.getQueryData<Versioned<PurchaseRequest>>(detailKey);
  if (cached?.etag === event.data.etag) return;                // own write or duplicate delivery
  void queryClient.invalidateQueries({ queryKey: detailKey });
});
connection.onReconnected(() => queryClient.invalidateQueries({ queryKey: requestKeys.all(scope) }));
```

- **منع التكرار والترتيب:** احمل version أو ETag أو sequence في الحدث. تجاهل ما يساوي النسخة المخزنة؛
  لا تطبق `setQueryData` من حدث أقدم من الموجود.
- `setQueryData` من payload الحدث فقط إذا حمل المورد الكامل بنسخته وكان مسموحًا للمستخدم رؤيته؛ غير ذلك
  أبطل ودع الـAPI يطبق التفويض.
- لا تعرض toast لكل حدث على شاشة نشطة؛ حدّث البيانات وأعلن التغيير المهم فقط في live region مهذب.
- إشعارات المستخدم (inbox): الحدث يزيد العداد بعد إعادة قراءة endpoint الإشعارات، لا بحساب محلي يتراكم خطؤه.

## واجهة حالة الاتصال

اعرض حالة "غير متصل، البيانات قد لا تكون محدثة" عند انقطاع طويل فقط (بعد مهلة)، لا وميضًا عند كل
إعادة اتصال قصيرة. لا تعطل الكتابة بسبب انقطاع realtime؛ الـAPI مستقل عنه.

## البدائل

- **SSE** (`EventSource`): تدفق خادم → عميل بسيط عبر HTTP، يعيد الاتصال تلقائيًا ويدعم `Last-Event-ID`
  للاستئناف إذا خزّن الخادم الأحداث. لا يرسل headers مخصصة في المتصفح (cookies فقط).
- **Polling** بـ`refetchInterval` مع staleTime: كافٍ لبيانات تتغير كل دقائق ولعدد مستخدمين صغير؛ أبسط تشغيلًا.
- WebSockets خام: فقط عند بروتوكول خاص؛ ستعيد بناء ما يوفره SignalR.

## اختبر

بواجهة اتصال وهمية (`RealtimeConnection`): حدث بنفس النسخة لا يبطل، نسخة أحدث تبطل، payload تالف
لا يكسر، reconnect يعيد المزامنة، إزالة listeners عند unmount. وفي بيئة حقيقية: recycle للتطبيق، نشر
جديد، نسختان من الخادم، مستخدم فقد الصلاحية لا يستقبل أحداث المجموعة.
