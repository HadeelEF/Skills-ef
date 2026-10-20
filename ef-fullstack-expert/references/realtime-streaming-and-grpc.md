# Realtime وStreaming وgRPC

اقرأ عند إضافة SignalR، أو اتصال service-to-service بـgRPC، أو رفع/تنزيل
ملفات كبيرة، أو إرجاع نتائج متدفقة. القاعدة: الاتصال الحي ليس مصدر الحقيقة؛
الحالة في قاعدة البيانات، والقناة الحية إشعار يمكن أن يضيع.

## SignalR

- التسليم at-most-once ولا يُخزن. بعد إعادة الاتصال يعيد العميل جلب الحالة من
  API. لا تبنِ workflow يعتمد على وصول رسالة hub.
- Hub عابر لكل استدعاء؛ لا تخزن حالة في fields. للإرسال من خدمة أو worker
  استخدم `IHubContext<THub, TClient>` ولا تحتفظ بمرجع hub.
- Groups لا تُستعاد تلقائيًا بعد إعادة الاتصال؛ أعد الإضافة في
  `OnConnectedAsync` من صلاحيات مشتقة خادميًا، لا من اسم group يرسله العميل.
- Authentication: WebSockets في المتصفح لا تحمل header عادة، فيُمرر token في
  query string؛ امنع تسجيل query strings في IIS/proxy/logs، وفضّل cookies في BFF.
  `IUserIdProvider` من claim ثابت. طبق `[Authorize]` على hub وتحقق من المورد
  داخل كل method تعدل أو تكشف بيانات.
- Scale-out: مع أكثر من نسخة تحتاج sticky sessions (ما لم تكن WebSockets فقط
  مع SkipNegotiation) وbackplane مثل Redis أو خدمة SignalR مدارة. Redis backplane
  لا يحفظ الرسائل عند انقطاعه.
- التشغيل: فعّل WebSockets في IIS، واضبط idle timeouts في load balancer/proxy
  أطول من keep-alive، وحدد `MaximumReceiveMessageSize`، وراقب عدد الاتصالات
  والذاكرة لكل نسخة. اختبر reconnect بعد recycle ونشر جديد.

## gRPC

- اختره لاتصال داخلي عالي الحجم بعقود typed وstreaming. REST أنسب للمتصفح
  والعملاء الخارجيين وبوابات API (مثل Apigee) والتشخيص البشري.
- يحتاج HTTP/2 end-to-end مع trailers؛ تحقق من دعم الـproxy/load balancer وإصدار
  Windows/IIS/HTTP.sys قبل القرار. المتصفح يحتاج gRPC-Web.
- HTTP/2 اتصال طويل: load balancing على مستوى L4 يرسل كل الطلبات لنسخة واحدة؛
  استخدم L7 أو client-side load balancing.
- مرر deadlines وCancellationToken دائمًا؛ deadline غائب = طلب قد يعلق للأبد.
  حوّل الأخطاء إلى status codes مناسبة، ولا تكشف exceptions.
- تطور proto: لا تعيد استخدام field numbers، استخدم `reserved` للمحذوف،
  وأضف الحقول اختيارية. retries عبر service config للعمليات idempotent فقط.

## رفع الملفات الكبيرة

- `IFormFile` يخزن الملف مؤقتًا (ذاكرة للصغير ثم قرص مؤقت)؛ مقبول للأحجام
  الصغيرة والمتوسطة. للأحجام الكبيرة اقرأ `MultipartReader` كتيار واكتب مباشرة
  إلى التخزين مع cancellation، دون تحميل الملف كاملًا إلى الذاكرة.
- الحدود تُفرض في عدة طبقات: IIS `maxAllowedContentLength`، وKestrel/IIS
  `MaxRequestBodySize`، و`FormOptions.MultipartBodyLengthLimit`. ارفعها لendpoint
  محدد فقط، لا على مستوى التطبيق. ضع quota لكل مستخدم/نطاق.
- احسب checksum أثناء التدفق، وطبّق فحص النوع/المحتوى، وحالة pending/ready كما
  في مرجع الملفات. لا تستخدم `ReadAllBytes` أو `MemoryStream` لملف بحجم غير محدود.

## التنزيل والتدفق

- أعد `Results.File(stream, contentType, fileName, enableRangeProcessing: true)`
  أو مكافئه بعد التحقق من الصلاحية، مع ETag/Last-Modified إن دعمت Range.
- لا تفتح الملف قبل التحقق من الصلاحية، وتأكد من التخلص من الـstream عند الإلغاء.
- `IAsyncEnumerable<T>` كاستجابة JSON يتدفق دون تحميل القائمة كاملة، لكنه يحتفظ
  باتصال DB طوال الإرسال للعميل البطيء؛ ضع حدًا للنتائج ومهلة، أو صدّر إلى ملف
  عبر job للأحجام الكبيرة. NDJSON أو Server-Sent Events بدائل عند الحاجة؛ تحقق
  من دعمها في إصدار ASP.NET Core المستهدف.
- استجابة مضغوطة مع streaming: راجع سلوك response compression والـbuffering.

## اختبر

reconnect بعد recycle، رسالة hub لمستخدم فقد الصلاحية، نسختان دون backplane،
رفع 2GB مع مراقبة ذاكرة العملية، إلغاء الرفع في المنتصف وتنظيف المؤقت، Range
request لجزء من ملف خاص بهوية غير مصرح لها، gRPC بلا deadline خلف proxy.

## مصادر

- [SignalR scale-out](https://learn.microsoft.com/en-us/aspnet/core/signalr/scale)
- [gRPC on .NET](https://learn.microsoft.com/en-us/aspnet/core/grpc/)
- [Large file uploads](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads)
