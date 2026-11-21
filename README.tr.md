CSpark Content Studio, metinlerden veya web yazılarından özet, video senaryosu, sosyal medya paylaşımı ve SEO metni üretir.


<p align="center">
  <img src="public/octopus-logo.png" width="112" alt="CSpark ahtapot logosu" />
</p>

<h1 align="center">CSpark Content Studio</h1>

<p align="center">
  <a href="README.md">English</a> · <strong>Türkçe</strong><br />
  <a href="#yerel-olarak-çalıştır"><strong>Yerel olarak çalıştır</strong></a> ·
  <a href="https://cspark-app.vercel.app">Proje sitesi</a> ·
  <a href="#apiye-genel-bakış">API rehberi</a>
</p>

Arayüz ağırlıklı olarak Türkçedir; Türkçe ve İngilizce içerik üretebilir. Ton, uzunluk ve video süresini seçebilir, sonucu kopyalayabilir veya metin dosyası olarak indirebilirsin.

## İçerik seçenekleri

- Özet, YouTube senaryosu, kısa video senaryosu, sosyal medya paylaşımı ve SEO metni.
- Düz metin girdisi veya URL üzerinden yazı metni çıkarma.
- Yazı, video, sosyal medya ve SEO sohbetleri için başlangıç istemleri.
- Beş biçimi sırayla isteyen ve başarılı sonuçları döndüren toplu üretim uç noktası.

Video senaryoları ve küçük resim önerileri metin olarak üretilir. Uygulama video dosyası veya küçük resim görseli oluşturmaz.

## Yerel olarak çalıştır

Next.js 15.4.6 ile uyumlu bir Node.js sürümü (örneğin 20.x veya üzeri) ve npm kullan.

Kilit dosyasında **Next.js 15.4.6**, **React 19.1.0** ve **Tailwind CSS 3.4.x** bulunur.

```bash
git clone https://github.com/ArdaHFO/cspark-content-studio.git
cd cspark-content-studio
npm ci
```

Repo kökünde `.env.local` oluştur. Repoda `.env.example` dosyası bulunmaz.

```dotenv
HF_API_TOKEN=your_hugging_face_token
```

Token'ı sunucuda ve sürüm kontrolünün dışında tut. Aktif [üretim rotası](app/api/generate/route.ts), Hugging Face Router üzerinden `deepseek-ai/DeepSeek-R1-Distill-Qwen-14B:novita` modelini çağırır. Modelin kullanılabilirliği ve erişim, sağlayıcı hesabına bağlıdır.

```bash
npm run dev
```

[localhost:3000](http://localhost:3000) adresini açıp [içerik editörüne](http://localhost:3000/create) geç. Metin veya URL gir, biçimi seç ve üretilen sonucu gözden geçir.

Üretim derlemesini yerelde hazırlayıp sunmak için:

```bash
npm run build
npm start
```

[API istemcisi](lib/api.ts) göreli `/api` adreslerini kullanır. Bu akış için ayrı Python sunucusu gerekmez. [backend klasörü](backend/), farklı model varsayılanlarına sahip alternatif FastAPI uygulamasını ve [önceki kurulum rehberini](backend/README.md) korur.

## API'ye genel bakış

| Uç nokta | Amaç |
| --- | --- |
| `GET /api/health` | Temel rota sağlık yanıtı |
| `POST /api/extract` | `url` üzerinden yazı metni çıkarma |
| `POST /api/generate` | `input`, `task` ve isteğe bağlı ayarlarla tek çıktı üretme |
| `POST /api/generate-all` | Beş çıktı biçimini birlikte isteme |

`POST /api/generate` için örnek istek:

```json
{
  "input": "Kaynak metniniz",
  "task": "summary",
  "lang": "tr",
  "tone": "professional",
  "length": "medium"
}
```

Geçerli görevler `summary`, `youtube`, `shorts`, `social` ve `seo` değerleridir. Tek çıktı rotası bir `result` metni döndürür. Toplu üretimde isteği başarısız olan biçimler sonuçta bulunmayabilir.

## Sınırlar

- Giriş ekranı oturum açmayı simüle eder. Tamamlanmış bir hesap veya yetkilendirme sistemi yoktur.
- Eksik erişim bilgileri veya model hataları, başarılı HTTP durumuyla hazır örnek yanıt döndürebilir. `/api/health`, modelin içerik ürettiğini doğrulamaz.
- İstem hazırlanırken kaynak metin 4.000 karaktere kısaltılır.
- Trend uç noktaları yer tutucu veri döndürür.
- Yazı çıkarma, sitenin yapısına ve erişilebilirliğine bağlıdır. Üretilen metni kullanmadan önce olgusal hatalar açısından kontrol et.
- `package.json` içinde derleme ve lint komutları vardır, `test` komutu yoktur.

## Proje yapısı

```text
app/          Sayfalar, yerleşimler ve Next.js API rotaları
components/   Ortak arayüz ve animasyon bileşenleri
lib/          Arayüz API istemcisi ve yardımcılar
public/       Mevcut logolar ve statik dosyalar
backend/      Alternatif Python/FastAPI uygulaması
```

## Belgeler ve katkı

- [API istek türleri ve yardımcıları](lib/api.ts)
- [Üretim uygulaması](app/api/generate/route.ts)
- [Alternatif backend rehberi](backend/README.md)
- [Hata bildirimleri ve özellik talepleri](https://github.com/ArdaHFO/cspark-content-studio/issues)

Hata bildirirken ekranı veya rotayı, girdi türünü, üretim ayarlarını ve gözlenen davranışı belirt. Yanıtın sağlayıcıdan mı yoksa hazır örnekten mi geldiğini ekle. Token ve özel kaynak metinleri çıkar.

## Lisans

Kod [MIT lisansı](LICENSE) ile dağıtılır. Modeller ve bağımlılıklar kendi koşullarına tabidir. CSpark logosu repoda bulunur.
