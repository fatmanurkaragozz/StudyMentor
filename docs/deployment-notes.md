# Deployment & Güvenlik Kararları — Neden Ne Yaptık

> Bu doküman **canlı bir kayıt**. Deploy hattı ve reponun public'e açılması
> sürecinde alınan kararların *gerekçelerini* tutar — "ne yaptık" değil, "neden
> öyle yaptık". Yeni bir karar aldıkça alttaki günlüğe bir satır ekle ve
> gerekirse ilgili S/C bölümünü genişlet.
>
> Kurulum adımları için: [deployment.md](deployment.md).
> Mimari ve kod kuralları için: [../CLAUDE.md](../CLAUDE.md).

---

## Karar günlüğü

| Tarih | Karar | Neden |
| --- | --- | --- |
| 2026-08-31 | `.claude/`, `docs/superpowers/`, kişisel `Documents/` dosyaları, Duolingo CSV takipten çıkarıldı | Public repoda gürültü + kişisel içerik + lisans riski. Dosyalar diskte duruyor, sadece `.gitignore`'da |
| 2026-08-31 | Git geçmişi yeniden yazılmadı | Geçmişte gerçek bir kimlik bilgisi yoktu; rewrite'ın maliyeti (hash değişimi, branch/klon bozulması, force-push) buna değmezdi |
| 2026-08-31 | `errorHandler` üretimde generic mesaj dönüyor | Ham `err.message` stack/DB detayı sızdırabilir |
| 2026-08-31 | `helmet` eklendi | Standart güvenlik header'ları için ucuz taban savunma |
| 2026-08-31 | LICENSE / CONTRIBUTING / SECURITY / CODE_OF_CONDUCT / issue-PR şablonları eklendi | Katkıya açık repo için gerekli asgari set |
| 2026-09-02 | Eski Azure deploy workflow'u silindi, yerine OIDC'li `deploy.yml` yazıldı | Uzun ömürlü SP secret'ı yerine parolasız kimlik; altyapı isimleri dosyadan çıktı |
| 2026-09-02 | Azure kimliği: Contributor rolü **sadece `studymentor-rg`** kapsamında | En az yetki — kimlik ele geçirilse etki alanı tek resource group |
| 2026-09-02 | `production` environment + required reviewer + `main` branch koruması | Deploy push ile tetikleniyor; asıl koruma "main'e kim kod koyabiliyor" |
| 2026-09-02 | Docker Hub: hesap parolası değil, kapsamlı access token (1 yıl) | Sızarsa yalnızca o token iptal edilir; hijyen/kullanılabilirlik dengesi |
| 2026-09-02 | PR #21 merge edildi, ilk deploy başarılı | Hat çalışıyor: merge → deploy.yml → production kapısı → OIDC → build → Azure Container Apps |
| 2026-09-02 | 2. federated credential eklendi (`gh-studymentor-prod-2`) | Bu reponun OIDC subject'i numeric ID taşıyor; düz subject `AADSTS700213` veriyordu (aşağıda S/C) |

<!-- Yeni satırları buraya ekle -->

---

## Sık sorulabilecek sorular ve cevaplar

### 0. "İlk deploy'da Azure login neden `AADSTS700213` verdi?"

GitHub'ın gönderdiği OIDC token'ının `sub` claim'i, beklenen düz biçimde
(`repo:<owner>/<repo>:environment:production`) değil — araya **owner ID ve repo
ID** giriyor:
`repo:fatmanurkaragozz@157278225/StudyMentor@1306608188:environment:production`.

İlk federated credential düz subject ile oluşturulmuştu, eşleşmedi. Çözüm: repo
ve owner ID'lerini (`curl -s https://api.github.com/repos/<owner>/<repo>` →
`.id`, `.owner.id`) içeren ikinci bir credential (`gh-studymentor-prod-2`).

Not: GitHub, owner adını bir secret ile eşleşiyorsa (`REGISTRY_USERNAME` =
`fatmanurkaragoz`) hata logunda `***` ile maskeler; hata mesajındaki subject'i
okurken bunu zihnen aç.

### 1. OIDC / parolasız kimlik doğrulama

**OIDC nedir?**
OpenID Connect. OAuth 2.0'ın üzerine kurulmuş bir kimlik doğrulama katmanı.
OAuth "bu isteğin şu kaynağa erişme yetkisi var mı?" sorusunu, OIDC "bu istekte
bulunan **kim**?" sorusunu cevaplar. Kimlik bilgisini imzalı bir JWT (ID token)
içinde taşır; token'da `iss` (kim verdi), `sub` (kim olduğun), `aud` (kimin
için), son kullanma zamanı gibi standart alanlar bulunur.

**Neden service principal secret'ı yerine OIDC?**
Eskiden GitHub'da uzun ömürlü bir Azure kimlik bilgisi (`AZURE_CREDENTIALS`
JSON'u) saklanıyordu — tek nokta riski: sızarsa süresi dolana kadar tüm
aboneliğe erişim, rotasyonu manuel. OIDC'de saklanan sır yok: GitHub her
çalıştırma için dakikalar ömürlü, tek kullanımlık imzalı bir token üretiyor,
Azure onu doğrulayıp ~1 saatlik dar kapsamlı bir erişim token'ı veriyor.

**OIDC akışı adım adım**
1. Workflow job'ı `permissions: id-token: write` ile başlar.
2. GitHub'ın OIDC sağlayıcısı bu çalıştırmaya özel bir JWT üretir:
   `issuer=token.actions.githubusercontent.com`,
   `subject=repo:fatmanurkaragozz/StudyMentor:environment:production`,
   `audience=api://AzureADTokenExchange`; GitHub'ın özel anahtarıyla imzalı.
3. `azure/login` action'ı bu token'ı `client-id` ile Entra ID'ye gönderir.
4. Azure client-id'den app registration'ı bulur, federated credential'larına
   bakar: issuer/subject/audience eşleşiyor mu, GitHub imzası geçerli mi.
5. Hepsi tutarsa service principal için kısa ömürlü access token verir.
6. Sonraki `az` çağrıları bu token'ı kullanır.

**Sır yoksa biri token'ı çalıp kullanamaz mı?**
O JWT yalnızca o workflow çalıştırması içinde, `id-token: write` yetkisiyle koşan
koda verilir ve dakikalar içinde geçersiz olur. Fork'tan gelen PR
`environment:production` subject'li token isteyemez. Sızsa bile Azure'ın verdiği
token ~1 saatte ölür ve yalnızca tek resource group'ta Contributor'dır.

**`AZURE_CLIENT_ID` / `TENANT_ID` / `SUBSCRIPTION_ID` parola değilse neden Secret?**
Bunlar tanımlayıcı, kimlik bilgisi değil — bilinmeleri erişim vermez. Secret
yapılmalarının tek sebebi public workflow dosyasından ve loglardan uzak tutmak,
altyapı topolojisini gereksiz ilan etmemek. Teknik olarak Variable da
olabilirlerdi.

**`environment: production` satırı silinirse ne olur?**
Token subject'i `repo:.../ref:refs/heads/main` olur, federated credential artık
eşleşmez, Azure login `AADSTS700213` ile patlar. O yüzden federated credential'ın
subject'i de güncellenmeli — ikisi birbirine bağlı.

### 2. En az yetki / etki alanı

**Neden `Contributor` rolü, daha dar bir şey yok muydu?**
Container Apps deployment'ı Container App kaynağını ve revision'larını
güncelleyebilmeli. "Sadece container app deploy et" diyen hazır bir dar rol yok.
Contributor'ı **tüm abonelik değil, yalnızca `studymentor-rg`** kapsamına verdim.
Daha da sıkmak istesem `Microsoft.App/containerApps/*` ile sınırlı bir custom role
tanımlanabilir ama bu proje için over-engineering olurdu.

**Bu kimlik ele geçirilse en kötü ne olur?**
Etki alanı tek resource group: `studymentor-rg` içindeki kaynaklar. Diğer
resource group'lara, aboneliğin faturasına, Entra dizinine dokunamaz. Token da
kısa ömürlü, kalıcı anahtar yok.

### 3. Workflow / tedarik zinciri güvenliği

**Kötü niyetli bir katkıcı bu workflow'la deploy yapabilir mi?**
Hayır. Workflow yalnızca `push: branches: [main]` ve manuel `workflow_dispatch`
ile tetikleniyor — `pull_request` yok. `main` korumalı; oraya push = review'dan
geçmiş, yazma yetkisi olan birinin merge'i. Fork PR'ı: main'e push edemez,
kısıtlı bağlamda koşar (`GITHUB_TOKEN` salt-okunur, **secret'lara erişim yok**),
ilk katkıda maintainer onayı ister, bizim environment subject'iyle OIDC token
alamaz.

**`pull_request_target` kullandın mı?**
Hayır, bilerek. O tetikleyici workflow'u base repo bağlamında (secret'larla)
koşturur ama PR kodunu checkout etmeye kandırılabilir — bilinen bir güvenlik
tuzağı.

**Action'ları neden commit SHA'ya pinlemedin?**
Şu an `actions/checkout@v4`, `azure/login@v2` gibi major tag kullanıyorum. En
sıkısı tam SHA'ya pinlemek — ele geçirilmiş bir tag kod enjekte edemesin diye.
Birinci-parti yayıncılar (`actions/`, `azure/`) sağladığı için tag'i kabul
edilebilir bir denge olarak seçtim; SHA pin + Dependabot sonraki sertleştirme
adımı (aşağıya bak).

### 4. Deploy kapıları

**`environment: production` ne işe yarıyor?**
Manuel onay kapısı. Her deploy Actions ekranında durur, "Approve" denene kadar
Azure'a bir şey gitmez. O environment yalnızca `main`'e kısıtlı. Savunmanın bir
katmanı daha.

**Asıl koruma hangisi?**
`main` branch koruması. Deploy push ile tetiklendiği için "deploy güvenliği" =
"main'e kim kod koyabiliyor" güvenliği. PR zorunlu + status check (CI yeşil)
zorunlu; kod hem review'dan hem testlerden geçmeden merge olup deploy'u
tetikleyemez.

**`concurrency` bloğu neden var?**
`cancel-in-progress: false` ile aynı anda iki deploy koşmasını engelliyorum —
Container App revision'ında yarış olmasın, devam eden deploy yarıda kesilmesin.

### 5. Secrets vs Variables

**Neden bazıları Secret, bazıları Variable?**
Secret'lar loglarda maskeli ve arayüzde geri okunamaz — gerçek kimlik bilgileri
(registry token) ve ID'ler için bunu istiyorum. Variable'lar düz metin — hassas
olmayan ayar için (registry URL, imaj adı, RG adı) uygun. Variable kullanmak
workflow dosyasını altyapı isimlerinden temiz tutuyor; public dosya topolojiyi
ele vermiyor ama sır taklidi de yapmıyorum.

### 6. Public'e çıkış öncesi denetim

**Repoyu public yapmadan önce neye baktın?**
Sırayla: (1) `git log --all --full-history -- '*.env'` ile geçmişte `.env`
commit'lenmiş mi — hayır. (2) Tüm takipli dosyalarda ve geçmişte secret deseni
taraması (API anahtarı, connection string, private key) — sadece
`.env.example`'daki placeholder'lar. (3) `.gitignore` kapsamı. (4) Auth tasarımı,
hata yönetimi, CORS, rate limiting. (5) Kaynakta kişisel veri. (6) Üçüncü-parti
veri seti lisansları — Duolingo non-commercial çıktı, çıkardım.

**Geçmişte gerçek bir secret bulsaydın ne yapardın?**
İki şey birden: önce secret'ı **hemen rotate**, sonra `git filter-repo` ile
geçmişten silme. Bizde gerçek kimlik bilgisi yoktu — kişisel bir staj defteri ve
lisanslı bir veri seti vardı — o yüzden rewrite'ın maliyeti buna değmezdi.

**`.env` nasıl yönetiliyor?**
`.env` gitignore'lu; `.env.example` placeholder değerler ve açıklayıcı
yorumlarla commit'li. Backend başlangıçta zorunlu env'leri doğruluyor
(`config/env.ts` yoksa hata fırlatıyor). Üretimde env, Azure Container App'in
kendi environment variable/secret'larından geliyor, dosyadan değil.

### 7. Kod değişiklikleri

**`errorHandler`'da ne değişti, neden?**
Önceden yakalanmamış 500 hatası ham `err.message`'ı her ortamda istemciye
dönüyordu — stack trace, DB hatası, dosya yolu sızabilir. Şimdi gerçek mesaj
yalnızca `NODE_ENV !== 'production'` iken dönüyor; üretimde generic "Internal
server error", detay yine `console.error` ile sunucu loglarına.

**`helmet` ne yapıyor?**
Bir dizi güvenlik HTTP header'ı ekleyen Express middleware'i —
`X-Content-Type-Options: nosniff`, `X-Frame-Options`,
`Strict-Transport-Security`, `X-Powered-By`'ı kaldırma vb. Clickjacking, MIME
sniffing gibi yaygın açıklara karşı ucuz taban savunma.

**`app.set("trust proxy", 1)` neden eklendi?**
Azure Container Apps uygulamanın önüne bir proxy hop'u koyuyor, `X-Forwarded-For`
header'ı geliyor. Bu ayar olmadan `express-rate-limit` ya herkesi aynı IP'ye
yazıyor ya da validation hatası fırlatıyordu. `1` = tam bir proxy katmanına
güven.

### 8. Operasyon

**Çalışma zamanı değişkenleri (`DATABASE_URL` vb.) neden workflow'da yok?**
Bilerek. Workflow'un işi kodu derleyip imajı yollamak. Çalışma zamanı sırları
Azure Container App'in üzerinde. Sorumluluk ayrımı: CI/CD kodu taşır, altyapı
ayarı altyapıyla yaşar. DB parolasını rotate etmek repoya dokunmayı
gerektirmiyor.

**Deploy bozulursa rollback nasıl?**
Azure Container Apps revision tutuyor. Bozuk deploy olursa trafiği önceki
revision'a geri alıyorum (`az containerapp revision` / portal). İmajlar
`github.sha` ile etiketli olduğu için her deploy ayrı, izlenebilir bir imaj —
bilinen iyi bir commit'i her zaman yeniden deploy edebilirim.

**Neden `latest` değil `github.sha` etiketi?**
Değişmez ve izlenebilir — her imaj tam bir commit'e karşılık geliyor. `latest`
anti-pattern'inde ne koştuğunu bilemez, deterministik rollback yapamazsın.

**Docker Hub token'ı sızarsa?**
Kapsamı yalnızca Docker Hub imajlarına Read & Write — Azure'a dokunamaz. Sızarsa
Docker Hub'da revoke, yeni token, `REGISTRY_PASSWORD` secret'ını güncelle.
(Nitekim bir kez oldu: token bir ekran görüntüsünde göründü, hemen iptal edip
yenisini oluşturduk.)

---

## Bilinen eksikler / sonraki adımlar

- [ ] Action'ları commit SHA'ya pinle + `.github/dependabot.yml` (github-actions)
- [ ] Deploy secret'larını repo seviyesinden `production` environment seviyesine taşı
- [ ] Registry'yi Azure Container Registry'ye çevir → `REGISTRY_USERNAME/PASSWORD`'ü tamamen kaldır (Azure login registry auth'u da kapsar)
- [ ] Deploy sonrası health check / smoke test + başarısızsa otomatik rollback
- [ ] Frontend ve ml-service için deploy hattı
- [ ] Test kapsamını genişlet (deploy'a güvenin asıl temeli)
