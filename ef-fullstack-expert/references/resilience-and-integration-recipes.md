# المرونة والتكامل مع الأنظمة الخارجية

اقرأ عند استدعاء API خارجية (ERP، دفع، SMS، بريد، هوية، Apigee)، أو استقبال
webhooks، أو ضبط retries. استدعاء الشبكة ليس استدعاء دالة: قد يفشل، أو يتأخر،
أو ينجح دون أن تعرف.

## ميزانية الزمن قبل السياسات

حدد أولًا الزمن الكلي المقبول للعملية من منظور المستخدم، ثم وزعه: per-attempt timeout ×
عدد المحاولات + الانتظار بينها ≤ الميزانية. retries في عدة طبقات (SDK + HttpClient +
المستدعي) تتضاعف؛ اجعل retry في طبقة واحدة.

```csharp
builder.Services.AddHttpClient<ErpClient>(c =>
    {
        c.BaseAddress = new Uri(builder.Configuration["Erp:BaseUrl"]!);
    })
    .AddStandardResilienceHandler(o =>
    {
        o.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(10);
        o.AttemptTimeout.Timeout = TimeSpan.FromSeconds(3);
        o.Retry.MaxRetryAttempts = 2;
        o.Retry.UseJitter = true;
        o.Retry.DisableForUnsafeHttpMethods(); // لا تكرار POST/PUT/PATCH/DELETE تلقائيًا
        o.CircuitBreaker.SamplingDuration = TimeSpan.FromSeconds(30); // يجب أن تكون ≥ ضعف AttemptTimeout
    });
```

تحقق من أسماء الخصائص وقيمها الافتراضية في إصدار `Microsoft.Extensions.Http.Resilience`
المستخدم، ومن قيود التحقق بين القيم (مثل علاقة SamplingDuration بـAttemptTimeout).

## أي خطأ يُعاد؟

| الاستجابة | الإجراء |
| --- | --- |
| timeout، 502/503/504، انقطاع اتصال | retry محدود مع backoff/jitter للعمليات الآمنة أو بمفتاح idempotency |
| 429 | احترم `Retry-After`؛ قلل التوازي؛ لا retry فوري |
| 400/401/403/404/409/422 | لا retry؛ صحح المدخل أو الإعداد أو الصلاحية |
| timeout بعد إرسال طلب كتابة | **نتيجة مجهولة**: استعلم من المزود بالمفتاح أو سجّل للمصالحة؛ لا تكرر بلا مفتاح |

## الكتابة على أنظمة خارجية

- أرسل Idempotency-Key ثابتًا لكل عملية أعمال (مشتق من معرف العملية لا عشوائي لكل محاولة)
  إذا دعمه المزود.
- إذا لم يدعمه: سجل حالة (Pending → Sent → Confirmed/Failed) واستعلام حالة من المزود،
  ومصالحة دورية، وتدخل يدوي موثق للحالات المجهولة.
- لا تستدعِ النظام الخارجي داخل معاملة قاعدة البيانات؛ اكتب النية في outbox ونفذ لاحقًا.
- الدفع: لا تعتمد على redirect المتصفح لتأكيد الدفع؛ اعتمد على webhook موقع أو استعلام
  خادمي، وطابق المبلغ والعملة والمرجع.

## استقبال Webhooks

- تحقق من التوقيع (HMAC على الجسم الخام بالمقارنة ثابتة الزمن
  `CryptographicOperations.FixedTimeEquals`)، والـtimestamp ضمن نافذة قصيرة، ومعرف الحدث
  في inbox لمنع replay والتكرار.
- استجب بسرعة (2xx) بعد حفظ الحدث، وعالجه في worker. المزود سيعيد الإرسال عند البطء.
- لا تثق بمحتوى webhook لتغيير حالة حرجة دون مطابقته مع سجلك (المبلغ، الحالة الحالية).

## الحماية من الاعتماد البطيء

- bulkhead: حد توازي مستقل لكل اعتماد خارجي (SemaphoreSlim أو limiter) كي لا يستنزف
  مزود بطيء كل threads/connections.
- circuit breaker عندما يكون الفشل السريع أفضل من الانتظار؛ عرّف سلوك المستخدم عند
  الفتح (رسالة واضحة، تأجيل عبر queue، بيانات مخزنة).
- fallback فقط عندما يكون صحيحًا للأعمال؛ لا تعرض قيمة قديمة لرصيد أو صلاحية.

## الرصد

لكل تكامل: معدل النجاح والزمن p95 لكل endpoint خارجي، عدد retries، حالة circuit، عدد
العمليات المجهولة بانتظار المصالحة، وعمر أقدمها. سجل correlation/مرجع المزود دون
أسرار أو بيانات شخصية كاملة.

## اختبر

stub مزود يعيد 503 ثم ينجح، يتأخر بعد استلام الكتابة، يعيد 429 مع Retry-After، يرسل
webhook مكررًا أو قديمًا أو بتوقيع خاطئ؛ وتحقق من عدم تكرار الأثر.
