# Security Policy

**English** | [Türkçe](#güvenlik-politikası)

## Reporting a vulnerability

Please **do not** open a public issue, pull request, or discussion for a security
vulnerability.

Instead, use GitHub's private reporting:

1. Go to the **Security** tab of this repository.
2. Click **Report a vulnerability**.
3. Describe the issue, the impact, and steps to reproduce.

You can expect an initial response within a few days. Once the issue is confirmed
and fixed, we will credit you in the release notes unless you prefer to stay
anonymous.

## Scope

This is a learning project without a production deployment guarantee. Reports are
still valued — especially around authentication, the email flows, input
validation, and anything that could leak one user's data to another.

Out of scope: the `ml-service`, which is an internal service with no auth by
design and must not be exposed publicly (see [CONTRIBUTING.md](CONTRIBUTING.md)).

## Supported versions

Only the latest `main` is supported.

---

## Güvenlik Politikası

[English](#security-policy) | **Türkçe**

## Güvenlik açığı bildirimi

Bir güvenlik açığı için lütfen **public bir issue, pull request veya discussion
açma**.

Bunun yerine GitHub'ın özel bildirim özelliğini kullan:

1. Bu deponun **Security** sekmesine git.
2. **Report a vulnerability**'e tıkla.
3. Sorunu, etkisini ve yeniden üretme adımlarını anlat.

Birkaç gün içinde ilk yanıtı alırsın. Sorun doğrulanıp düzeltildikten sonra,
anonim kalmayı tercih etmezsen sürüm notlarında sana teşekkür ederiz.

## Kapsam

Bu, üretim dağıtımı garantisi olmayan bir öğrenme projesidir. Yine de bildirimler
değerlidir — özellikle kimlik doğrulama, e-posta akışları, girdi doğrulama ve bir
kullanıcının verisini başka bir kullanıcıya sızdırabilecek her şey.

Kapsam dışı: tasarım gereği kimlik doğrulaması olmayan ve public olarak açığa
çıkarılmaması gereken `ml-service` (bkz. [CONTRIBUTING.md](CONTRIBUTING.md)).

## Desteklenen sürümler

Yalnızca en güncel `main` desteklenir.
