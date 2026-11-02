CSpark Content Studio, metinlerini veya web yazılarını özetlere, video senaryolarına ve sosyal medya paylaşımlarına dönüştürür.

<p align="center">
  <img src="public/octopus-logo.png" width="112" alt="CSpark ahtapot logosu" />
</p>

<h1 align="center">CSpark Content Studio</h1>

<p align="center"><strong>Tek fikir. Birçok anlatım.</strong></p>
<p align="center">Özet, video senaryosu, sosyal medya paylaşımı ve SEO metni için yapay zekâ destekli içerik çalışma alanı.</p>

<p align="center">
  <a href="README.md">English</a> · <strong>Türkçe</strong><br />
  <a href="#yerel-olarak-çalıştır"><strong>Yerel olarak çalıştır</strong></a> ·
  <a href="https://cspark-app.vercel.app">Proje sitesi</a> ·
  <a href="#apiye-genel-bakış">API rehberi</a>
</p>

---

Bir metin veya web yazısıyla başla, çıktı biçimini seç ve sonucu farklı bir kitleye ya da kanala uyarla. CSpark, Türkçe ağırlıklı arayüzünü Türkçe ve İngilizce üretim seçenekleri, ton ve uzunluk ayarları, metni kopyalama ve indirme araçlarıyla birleştirir.

**Bu repo bir web uygulaması içerir.** Aktif arayüz kendi Next.js API rotalarını çağırır. Giriş ekranı oturum açmayı simüle eder ve sağlayıcı hatalarında hazır örnek yanıtlar dönebilir. Bir yanıtı başarılı canlı model üretimi olarak değerlendirmeden önce mevcut sınırları incele.

## Başlangıç

| Gereksinim | Repo kurulumu |
| --- | --- |
| Çalışma ortamı | Sabitlenmiş Next.js 15.4.6 ile uyumlu Node.js, örneğin 20.x veya üzeri |
| Paket yöneticisi | Repodaki `package-lock.json` ile npm |
| Yapay zekâ üretimi | Yapılandırılmış çıkarım sağlayıcısına erişebilen Hugging Face token'ı |
| Arayüz | Türkçe ağırlıklı arayüz, Türkçe ve İngilizce üretim seçenekleri |
| Varsayılan API | `/api` altındaki Next.js rotaları |

1. Aşağıdaki yerel kurulumu tamamla ve [localhost:3000](http://localhost:3000) adresini aç.
2. [localhost:3000/create](http://localhost:3000/create) içerik çalışma alanına geç.
3. Metni veya desteklenen web adresini gir, içerik türünü ve üretim ayarlarını seç. Sonucu kopyalamadan veya indirmeden önce gözden geçir.

## Çalışma alanında neler var?

- **Beş çıktı biçimi.** Özet, YouTube senaryosu, kısa video senaryosu, sosyal medya paylaşımı ve SEO metni üret.
- **Metin ve yazı girdisi.** Düz metin kullan veya sunucudaki çıkarma rotası üzerinden bir URL'den yazı metni al.
- **Ayarlanabilir anlatım.** Türkçe veya İngilizce, ton ve uzunluk seç. Video odaklı isteklerde süre de belirtilebilir.
- **Şablonlarla başlayan sohbetler.** Ajan arayüzü yazı, video, sosyal medya ve SEO için başlangıç istemleri sunar.
- **Bir girdiden birden çok çıktı.** Toplu uç nokta beş biçimi sırayla ister ve başarılı sonuçları döndürür.
- **Yeniden kullanılabilir metin.** Üretilen içeriği kopyala veya metin dosyası olarak indir.
- **Farklı ekranlara uyumlu arayüz.** Animasyonlu bileşenler ve açık/koyu görünüm içerik akışını destekler.

Senaryolar ve küçük resim önerileri metin çıktılarıdır. Bu repo bitmiş video veya küçük resim görseli üretmez.

## Yerel olarak çalıştır

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

## Doğrulama ve mevcut sınırlar

Bu belgeler repo kaynağı ve yapılandırmasıyla karşılaştırıldı. Bu güncelleme için uygulama derlemesi, tarayıcı oturumu veya canlı sağlayıcı isteği çalıştırılmadı.

- Üretim rotası, istemi oluşturmadan önce kaynak metni 4.000 karaktere kısaltır.
- Eksik kimlik bilgileri veya çıkarım hataları, başarılı HTTP durumuyla hazır yanıt üretebilir. Sağlık yanıtı tek başına yapay zekâ üretimini doğrulamaz.
- Giriş akışı bir arayüz simülasyonudur. Tamamlanmış hesap veya yetkilendirme sistemi değildir.
- Trend uç noktaları şu anda yer tutucu veri döndürür. Doğrulanmış trend entegrasyonu sunmaz.
- `package.json` içinde `test` komutu yoktur. Derleme ve lint komutları vardır, ancak burada başarılı çalıştıkları iddia edilmez.
- Web'den metin çıkarma, hedef sitenin yapısına ve erişilebilirliğine bağlıdır. Üretilen içerik olgusal ve editoryal inceleme gerektirir.

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

Tekrarlanabilir hata bildirimi için rota veya ekranı, girdi türünü, üretim ayarlarını ve gözlenen davranışı ekle. Çıktının yapılandırılmış sağlayıcıdan mı yoksa yedek yanıttan mı geldiğini belirt. Kimlik bilgilerini ve özel kaynak metinleri raporlara koyma. Odaklı pull request'lerde değişikliği ve nasıl kontrol edildiğini açıkla.

## Lisans ve kaynaklar

Projenin kodu [MIT lisansı](LICENSE) ile dağıtılır. Modellere erişim ve üçüncü taraf paketler kendi koşullarına tabidir. Mevcut CSpark logosu bu repodan kullanılmıştır.
