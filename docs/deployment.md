# Deployment / Dağıtım

[English](#english) · [Türkçe](#türkçe)

The backend deploys to **Azure Container Apps** automatically on every push to
`main`, via [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).

The workflow file is public and contains **no credentials**. Azure authentication
uses OIDC (federated identity — a short-lived token, no stored Azure secret).
Infra identifiers live in repository Variables, not in the file.

**Why it's built this way** (OIDC, least-privilege, the gates): see
[deployment-notes.md](deployment-notes.md) — a living rationale log. /
Neden böyle kurgulandı: [deployment-notes.md](deployment-notes.md).

---

<a name="english"></a>

## English

### How it works

```
push to main ──▶ GitHub Actions ──▶ [wait for your approval] ──▶ build image ──▶ push to registry ──▶ update Azure Container App
                       │
                       └─ authenticates to Azure with a one-time OIDC token (no stored secret)
```

Two things this workflow does **not** do, and you manage elsewhere:

- **Runtime config** (`DATABASE_URL`, `JWT_SECRET`, `GMAIL_*`, …) lives on the
  Azure Container App itself (portal → your Container App → *Settings → Containers
  → Environment variables*, or as *Secrets*). The workflow only ships a new image.
- **Creating** the Container App / resource group. This guide assumes they
  already exist (`studymentor-api` in `studymentor-rg`).

### Prerequisites

- The [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
  (`az`), logged in with `az login` as an account that can:
  - create **app registrations** in Microsoft Entra ID, and
  - create **role assignments** on the resource group (needs `Owner` or
    `User Access Administrator` there).
- Your **subscription ID** and **resource group name**.
- Admin access to the GitHub repository (to add secrets, variables, environments,
  branch rules).

---

### Step 1 — Azure: create a federated identity (OIDC)

**Why:** instead of storing a long-lived Azure password in GitHub, we tell Azure
"trust tokens that GitHub Actions issues for *this repo*, running in *this
environment*". GitHub mints a signed, single-use token for each run; Azure
verifies it and hands back a short-lived access token. Nothing to leak.

Three Azure objects are involved:

| Object | What it is |
| --- | --- |
| **App registration** | an identity definition in Entra ID |
| **Service principal** | that identity, usable *in your tenant* and assignable roles |
| **Federated credential** | the trust rule: "GitHub repo X + environment Y may act as this identity" |

```bash
# --- fill these in ---
SUBSCRIPTION_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
RESOURCE_GROUP="studymentor-rg"
REPO="fatmanurkaragozz/StudyMentor"          # exactly as it appears in the URL
APP_NAME="studymentor-github-deploy"

# 1a. App registration
CLIENT_ID=$(az ad app create --display-name "$APP_NAME" --query appId -o tsv)
echo "CLIENT_ID = $CLIENT_ID"

# 1b. Service principal for it
az ad sp create --id "$CLIENT_ID"

# 1c. Let it manage the resource group (Contributor, scoped to the RG only)
az role assignment create \
  --assignee "$CLIENT_ID" \
  --role Contributor \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP"

# 1d. The trust rule. `subject` MUST match what GitHub sends (see note below).
az ad app federated-credential create --id "$CLIENT_ID" --parameters '{
  "name": "github-studymentor-production",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:fatmanurkaragozz/StudyMentor:environment:production",
  "description": "GitHub Actions deploy from the production environment",
  "audiences": ["api://AzureADTokenExchange"]
}'

# 1e. Collect the three values you'll paste into GitHub
echo "AZURE_CLIENT_ID       = $CLIENT_ID"
echo "AZURE_TENANT_ID       = $(az account show --query tenantId -o tsv)"
echo "AZURE_SUBSCRIPTION_ID = $SUBSCRIPTION_ID"
```

> **Windows PowerShell:** inline JSON quoting for step 1d is fragile. Put the JSON
> in a file `cred.json` and run
> `az ad app federated-credential create --id $CLIENT_ID --parameters cred.json`.

> **The `subject` string.** Our `deploy` job declares `environment: production`,
> so GitHub's OIDC token subject is
> `repo:<owner>/<repo>:environment:production` — **not** a branch ref. If you ever
> delete the `environment:` line from the workflow, change the federated
> credential subject to `repo:<owner>/<repo>:ref:refs/heads/main`.

> **Can't create app registrations?** In many organisation tenants this is
> restricted. Ask a directory admin to run step 1a–1b, or create the app under
> *Entra ID → App registrations → New registration* in the portal.

**Verify:** `az ad app federated-credential list --id "$CLIENT_ID"` shows your
credential with the expected `subject`.

---

### Step 2 — Container registry access token

**Why:** the workflow builds a Docker image and pushes it to a registry. Use a
**scoped token**, never your account password — if the token leaks you revoke
just that token.

**Docker Hub:**

1. <https://hub.docker.com> → your avatar → **Account settings → Security →
   Personal access tokens → Generate new token**.
2. Description: `studymentor-github-deploy`. Permissions: **Read & Write**.
3. Copy the token now — it is shown once.
4. So: `REGISTRY_USERNAME` = your Docker Hub username,
   `REGISTRY_PASSWORD` = this token.

The image repository (`<username>/studymentor-api`) is created automatically on
first push. If you want it **private**, create it first on Docker Hub as private.

> Using a different registry (GHCR, ACR)? Same idea — a scoped username/token
> pair. For ACR you can drop the registry secrets entirely and let the Azure
> login cover it, but that's a bigger change.

---

### Step 3 — GitHub: repository Secrets

Repo → **Settings → Secrets and variables → Actions → Secrets tab → New
repository secret**. Add five:

| Secret | Value | From |
| --- | --- | --- |
| `AZURE_CLIENT_ID` | the app's client ID | step 1e |
| `AZURE_TENANT_ID` | your Entra tenant ID | step 1e |
| `AZURE_SUBSCRIPTION_ID` | your subscription ID | step 1e |
| `REGISTRY_USERNAME` | registry username | step 2 |
| `REGISTRY_PASSWORD` | the scoped token | step 2 |

You can delete the old `STUDYMENTORAPI_*` secrets once this runs.

> The three Azure IDs are *identifiers*, not passwords — the security comes from
> the federated-credential trust, not from hiding them. They're stored as secrets
> only to keep them out of the public file and logs.

---

### Step 4 — GitHub: repository Variables

Same screen → **Variables tab → New repository variable**. Add four:

| Variable | Example value |
| --- | --- |
| `CONTAINER_REGISTRY_URL` | `docker.io` |
| `CONTAINER_IMAGE_NAME` | `<your-dockerhub-username>/studymentor-api` |
| `AZURE_CONTAINER_APP_NAME` | `studymentor-api` |
| `AZURE_RESOURCE_GROUP` | `studymentor-rg` |

**Why Variables and not Secrets:** these are non-sensitive config. Variables keep
the workflow file generic (no infra names in a public file) without pretending
they're secret.

---

### Step 5 — GitHub: the `production` environment gate

Repo → **Settings → Environments → New environment** → name it exactly
`production` (must match the workflow's `environment:` line and the federated
credential subject).

- **Required reviewers** → add yourself. Now every deploy **pauses** in the
  Actions tab until you click *Review deployments → Approve*. This is your
  "are you sure" button before anything hits Azure.
- **Deployment branches and tags** → *Selected branches* → add `main`. The
  environment can only be used from `main`.

---

### Step 6 — Protect `main`

**Why this matters most:** the workflow triggers on *push to `main`*. If anyone
with write access can push straight to `main`, they can push straight to
production. A branch rule turns "push to main" into "merge a reviewed PR".

Repo → **Settings → Branches → Add branch ruleset** (or *Add rule*), target
`main`:

- ✅ **Require a pull request before merging.** (Solo: you can keep required
  approvals at 0 — you still get the PR flow and CI gate; a second maintainer
  later can bump it to 1.)
- ✅ **Require status checks to pass** → select `backend` and `frontend`
  (from `test.yml`).
- Optionally ✅ **Do not allow bypassing the above settings** (as sole owner you
  may prefer to keep a bypass).

---

### Step 7 — Test it

1. Repo → **Actions → "Deploy backend to Azure" → Run workflow → `main`**.
2. The run starts, then **pauses** at the `production` gate → *Review deployments
   → Approve and deploy*.
3. Watch **Azure login (OIDC …)**. If it fails with
   `AADSTS700213: No matching federated identity record found`, the federated
   credential `subject` doesn't match — re-check owner/repo spelling and that the
   environment is `production`.
4. Watch the deploy step; then confirm in the Azure portal that the Container App
   has a new revision.

After this, every push to `main` (touching `backend/**`) runs the same flow,
waiting for your approval each time.

---

### Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `AADSTS700213` at Azure login | Federated credential `subject` ≠ token subject. Must be `repo:<owner>/<repo>:environment:production`. |
| `AuthorizationFailed` during deploy | Role assignment missing or still propagating (wait ~2 min). Check step 1c scope. |
| `denied: requested access to the resource is denied` (registry) | Wrong `REGISTRY_USERNAME`/`REGISTRY_PASSWORD`, or token lacks write, or `CONTAINER_IMAGE_NAME` namespace ≠ username. |
| Container starts then crashes | Runtime env vars not set **on the Container App** (see "How it works"). The image is fine; the config is missing. |
| Workflow didn't trigger | Your push didn't touch `backend/**` or `.github/workflows/deploy.yml`. Use *Run workflow* manually. |

---

### Optional hardening later

- **Pin actions to a commit SHA** (`azure/login@<sha>`) and add
  `.github/dependabot.yml` for `github-actions` updates.
- **Move the deploy secrets to the `production` environment** instead of
  repo-level, so they're unreachable from any other workflow.
- **Switch the registry to Azure Container Registry** and drop
  `REGISTRY_USERNAME` / `REGISTRY_PASSWORD` — Azure login then covers registry
  auth via a role assignment.

---

<a name="türkçe"></a>

## Türkçe

### Nasıl çalışıyor

```
main'e push ──▶ GitHub Actions ──▶ [senin onayını bekler] ──▶ imaj derle ──▶ registry'ye push ──▶ Azure Container App'i güncelle
                     │
                     └─ Azure'a tek kullanımlık bir OIDC token ile bağlanır (saklanan sır yok)
```

Bu workflow'un **yapmadığı**, senin başka yerde yönettiğin iki şey:

- **Çalışma zamanı ayarları** (`DATABASE_URL`, `JWT_SECRET`, `GMAIL_*`, …) Azure
  Container App'in kendisinde durur (portal → Container App'in → *Settings →
  Containers → Environment variables*, ya da *Secrets*). Workflow sadece yeni
  imajı yollar.
- Container App / resource group **oluşturmak**. Bu rehber ikisinin de var
  olduğunu varsayar (`studymentor-rg` içinde `studymentor-api`).

### Ön koşullar

- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) (`az`),
  `az login` ile giriş yapılmış; kullandığın hesap şunları yapabilmeli:
  - Microsoft Entra ID'de **app registration** oluşturmak,
  - resource group üzerinde **rol ataması** yapmak (orada `Owner` ya da
    `User Access Administrator` gerekir).
- **Subscription ID**'n ve **resource group** adın.
- GitHub deposunda admin yetkisi (secret, variable, environment, branch kuralı
  eklemek için).

---

### Adım 1 — Azure: federated identity (OIDC) oluştur

**Neden:** GitHub'da uzun ömürlü bir Azure parolası saklamak yerine, Azure'a
"GitHub Actions'ın *bu depo* için, *bu environment*'ta ürettiği token'lara güven"
diyoruz. GitHub her çalıştırma için imzalı, tek kullanımlık bir token üretir;
Azure onu doğrulayıp kısa ömürlü bir erişim token'ı verir. Sızacak bir şey yok.

Üç Azure nesnesi devrede:

| Nesne | Nedir |
| --- | --- |
| **App registration** | Entra ID'de bir kimlik tanımı |
| **Service principal** | o kimliğin *senin tenant'ında* kullanılabilen, rol atanabilen hâli |
| **Federated credential** | güven kuralı: "GitHub deposu X + environment Y bu kimlik olarak davranabilir" |

```bash
# --- burayı doldur ---
SUBSCRIPTION_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
RESOURCE_GROUP="studymentor-rg"
REPO="fatmanurkaragozz/StudyMentor"          # URL'de göründüğü gibi birebir
APP_NAME="studymentor-github-deploy"

# 1a. App registration
CLIENT_ID=$(az ad app create --display-name "$APP_NAME" --query appId -o tsv)
echo "CLIENT_ID = $CLIENT_ID"

# 1b. Onun için service principal
az ad sp create --id "$CLIENT_ID"

# 1c. Resource group'u yönetebilsin (Contributor, sadece o RG kapsamında)
az role assignment create \
  --assignee "$CLIENT_ID" \
  --role Contributor \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP"

# 1d. Güven kuralı. `subject` GitHub'ın gönderdiğiyle BİREBİR aynı olmalı (alttaki nota bak).
az ad app federated-credential create --id "$CLIENT_ID" --parameters '{
  "name": "github-studymentor-production",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:fatmanurkaragozz/StudyMentor:environment:production",
  "description": "GitHub Actions production environment deploy",
  "audiences": ["api://AzureADTokenExchange"]
}'

# 1e. GitHub'a yapıştıracağın üç değer
echo "AZURE_CLIENT_ID       = $CLIENT_ID"
echo "AZURE_TENANT_ID       = $(az account show --query tenantId -o tsv)"
echo "AZURE_SUBSCRIPTION_ID = $SUBSCRIPTION_ID"
```

> **Windows PowerShell:** 1d adımındaki satır-içi JSON tırnakları sorun çıkarır.
> JSON'u `cred.json` dosyasına koy ve
> `az ad app federated-credential create --id $CLIENT_ID --parameters cred.json`
> çalıştır.

> **`subject` metni.** `deploy` job'ımızda `environment: production` var, o yüzden
> GitHub OIDC token'ının subject'i `repo:<owner>/<repo>:environment:production` —
> branch ref'i **değil**. Workflow'dan `environment:` satırını silersen,
> federated credential subject'ini `repo:<owner>/<repo>:ref:refs/heads/main`
> yap.

> **App registration oluşturamıyor musun?** Kurumsal tenant'larda çoğu zaman
> kısıtlıdır. Bir dizin admininden 1a–1b'yi çalıştırmasını iste ya da portalda
> *Entra ID → App registrations → New registration* ile oluştur.

**Doğrula:** `az ad app federated-credential list --id "$CLIENT_ID"` komutu
credential'ı beklenen `subject` ile gösterir.

---

### Adım 2 — Registry erişim token'ı

**Neden:** workflow bir Docker imajı derleyip registry'ye push eder. Hesap
parolanı değil, **kapsamı sınırlı bir token** kullan — sızarsa sadece o token'ı
iptal edersin.

**Docker Hub:**

1. <https://hub.docker.com> → avatarın → **Account settings → Security →
   Personal access tokens → Generate new token**.
2. Açıklama: `studymentor-github-deploy`. İzinler: **Read & Write**.
3. Token'ı hemen kopyala — bir kez gösterilir.
4. Yani: `REGISTRY_USERNAME` = Docker Hub kullanıcı adın,
   `REGISTRY_PASSWORD` = bu token.

İmaj deposu (`<kullanıcıadı>/studymentor-api`) ilk push'ta otomatik oluşur.
**Private** istiyorsan önce Docker Hub'da private olarak oluştur.

---

### Adım 3 — GitHub: repository Secrets

Depo → **Settings → Secrets and variables → Actions → Secrets sekmesi → New
repository secret**. Beş tane ekle:

| Secret | Değer | Kaynak |
| --- | --- | --- |
| `AZURE_CLIENT_ID` | app'in client ID'si | adım 1e |
| `AZURE_TENANT_ID` | Entra tenant ID | adım 1e |
| `AZURE_SUBSCRIPTION_ID` | subscription ID | adım 1e |
| `REGISTRY_USERNAME` | registry kullanıcı adı | adım 2 |
| `REGISTRY_PASSWORD` | kapsamlı token | adım 2 |

Bu çalıştıktan sonra eski `STUDYMENTORAPI_*` secret'larını silebilirsin.

> Üç Azure ID'si *tanımlayıcı*, parola değil — güvenlik onları gizlemekten değil,
> federated-credential güveninden gelir. Yalnızca public dosyadan ve loglardan
> uzak tutmak için secret olarak saklanıyorlar.

---

### Adım 4 — GitHub: repository Variables

Aynı ekran → **Variables sekmesi → New repository variable**. Dört tane ekle:

| Variable | Örnek değer |
| --- | --- |
| `CONTAINER_REGISTRY_URL` | `docker.io` |
| `CONTAINER_IMAGE_NAME` | `<docker-hub-kullanıcı-adın>/studymentor-api` |
| `AZURE_CONTAINER_APP_NAME` | `studymentor-api` |
| `AZURE_RESOURCE_GROUP` | `studymentor-rg` |

**Neden Secret değil Variable:** bunlar hassas olmayan ayarlar. Variable'lar
workflow dosyasını generic tutar (public dosyada altyapı ismi olmaz), sır gibi
davranmadan.

---

### Adım 5 — GitHub: `production` environment kapısı

Depo → **Settings → Environments → New environment** → adını tam olarak
`production` koy (workflow'daki `environment:` satırı ve federated credential
subject'i ile eşleşmeli).

- **Required reviewers** → kendini ekle. Artık her deploy, sen *Review
  deployments → Approve* diyene kadar Actions sekmesinde **durur**. Azure'a bir
  şey gitmeden önceki "emin misin" düğmen.
- **Deployment branches and tags** → *Selected branches* → `main` ekle.
  Environment sadece `main`'den kullanılabilir.

---

### Adım 6 — `main`'i koru

**En önemli kısım:** workflow *`main`'e push* ile tetikleniyor. Yazma yetkisi
olan biri doğrudan `main`'e push edebiliyorsa, doğrudan production'a push
edebiliyor demektir. Branch kuralı "main'e push"u "gözden geçirilmiş PR merge'i"
hâline getirir.

Depo → **Settings → Branches → Add branch ruleset** (ya da *Add rule*), hedef
`main`:

- ✅ **Require a pull request before merging.** (Tek kişi: required approvals'ı
  0'da tutabilirsin — yine PR akışı ve CI kapısı olur; sonra ikinci bir
  maintainer 1'e çıkarır.)
- ✅ **Require status checks to pass** → `backend` ve `frontend`'i seç
  (`test.yml`'den).
- İsteğe bağlı ✅ **Do not allow bypassing the above settings** (tek sahip olarak
  bypass yetkisini tutmak isteyebilirsin).

---

### Adım 7 — Test et

1. Depo → **Actions → "Deploy backend to Azure" → Run workflow → `main`**.
2. Çalışma başlar, sonra `production` kapısında **durur** → *Review deployments →
   Approve and deploy*.
3. **Azure login (OIDC …)** adımını izle.
   `AADSTS700213: No matching federated identity record found` hatası gelirse
   federated credential `subject`'i eşleşmiyor — owner/repo yazımını ve
   environment'ın `production` olduğunu kontrol et.
4. Deploy adımını izle; sonra Azure portalında Container App'in yeni bir revision
   aldığını doğrula.

Bundan sonra `main`'e her push (`backend/**` içine dokunan) aynı akışı çalıştırır
ve her seferinde senin onayını bekler.

---

### Sorun giderme

| Belirti | Sebep / çözüm |
| --- | --- |
| Azure login'de `AADSTS700213` | Federated credential `subject`'i ≠ token subject'i. `repo:<owner>/<repo>:environment:production` olmalı. |
| Deploy sırasında `AuthorizationFailed` | Rol ataması eksik ya da hâlâ yayılıyor (~2 dk bekle). 1c adımındaki scope'u kontrol et. |
| `denied: requested access ... is denied` (registry) | Yanlış `REGISTRY_USERNAME`/`REGISTRY_PASSWORD`, ya da token'da write yok, ya da `CONTAINER_IMAGE_NAME` namespace'i ≠ kullanıcı adı. |
| Container başlıyor sonra çöküyor | Çalışma zamanı env değişkenleri **Container App üzerinde** ayarlı değil ("Nasıl çalışıyor" bölümü). İmaj sağlam; ayar eksik. |
| Workflow tetiklenmedi | Push'un `backend/**` ya da `.github/workflows/deploy.yml` içine dokunmadı. *Run workflow* ile manuel çalıştır. |

---

### Sonradan yapılabilecek ek sertleştirme

- **Action'ları commit SHA'ya sabitle** (`azure/login@<sha>`) ve
  `github-actions` güncellemeleri için `.github/dependabot.yml` ekle.
- **Deploy secret'larını `production` environment'ına taşı** (repo seviyesinden),
  böylece başka hiçbir workflow'dan erişilemezler.
- **Registry'yi Azure Container Registry'ye çevir** ve
  `REGISTRY_USERNAME` / `REGISTRY_PASSWORD`'ü tamamen kaldır — Azure login rol
  ataması üzerinden registry kimlik doğrulamasını da kapsar.
