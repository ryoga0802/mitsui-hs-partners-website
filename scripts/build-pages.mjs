// Build the eight static pages and keep shared homepage navigation in sync.
// Run from any directory: node scripts/build-pages.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const company = '株式会社Mitsui H&amp;S Partners';
const logo = 'logo-mark_93581173.png';
const pages = [
  { slug: 'business', title: '事業内容', en: 'Our Business', lead: '査定から販売、暮らしのサポートまで。三つの事業を通じて、モノの価値と人の想いを次へつなぎます。', photo: 'biz-trust-vintage_c3da8c25.png' },
  { slug: 'company', title: '会社概要', en: 'Company', lead: '未来の自分のパートナーに。私たちの理念と会社の基本情報をご紹介します。', photo: 'office-interior_f7e0e96c.png' },
  { slug: 'compliance', title: 'コンプライアンス', en: 'Compliance', lead: '誠実な取引を、事業の土台に。お客様と社会からの信頼を守るために大切にしたい考え方。' },
  { slug: 'news', title: '会社の最新情報', en: 'News', lead: '日々の取り組みやイベント、採用に関する情報をお届けします。' },
  { slug: 'recruit', title: '採用情報', en: 'Careers', lead: 'モノの価値を見極め、人の想いに向き合う。これからのリユースを、一緒につくる仲間へ。', photo: 'banner-recruit_04a37a58.png' },
  { slug: 'achievements', title: '実績紹介', en: 'Our Works', lead: '一つひとつの出会いを、確かなかたちに。店舗や査定の場、催事などの取り組みをご紹介します。' },
  { slug: 'blog', title: '社員ブログ', en: 'Journal', lead: '仕事のこと、日々の気づき、これからのこと。私たちの現場を、社員の言葉で。' },
  { slug: 'message', title: '社長メッセージ', en: 'Top Message', lead: '目の前の一人に誠実に。その積み重ねが、未来の信用になる。' },
];
const asset = (name) => `../assets/images/${name}`;
const image = (name, alt, caption = '') => `<figure class="image-frame"><img src="${asset(name)}" alt="${alt}" loading="lazy" width="1200" height="900" />${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
const note = (text) => `<p class="page-note">${text}</p>`;
const section = (content, id = '') => `<section class="page-section"${id ? ` id="${id}"` : ''}><div class="page-wrap">${content}</div></section>`;
const heading = (en, jp) => `<p class="page-kicker">${en}</p><h2 class="page-heading">${jp}</h2>`;
const copy = (...paragraphs) => `<div class="page-copy">${paragraphs.map(p => `<p>${p}</p>`).join('')}</div>`;
const outline = (href, text) => `<a class="outline-link" href="${href}">${text}</a>`;
const related = (entries) => `<div class="related-links">${entries.map(([href, label]) => `<a href="${href}">${label} →</a>`).join('')}</div>`;
const sampleNote = '以下はデザイン確認用のサンプルです。実際の発表・実績・募集状況を示すものではありません。';

function header(prefix, current = '') {
  const home = `${prefix}index.html`;
  const links = pages.map(p => `<a href="${prefix}${p.slug}/"${p.slug === current ? ' aria-current="page"' : ''}>${p.title}</a>`).join('');
  const mobile = pages.map(p => `<a href="${prefix}${p.slug}/"${p.slug === current ? ' aria-current="page"' : ''}>${p.title}<em>${p.en}</em></a>`).join('');
  return `<header class="site-header" data-header>
    <div class="container header-inner">
      <a class="brand" href="${home}" aria-label="${company} トップへ"><img src="${prefix}assets/images/${logo}" alt="Mitsui H&amp;S Partners ロゴマーク" width="44" height="44" /><span class="brand-name"><strong>Mitsui H&amp;S Partners</strong><small>Corporate Site</small></span></a>
      <nav class="desktop-nav" aria-label="グローバルナビゲーション">${links}<a class="contact-link" href="${home}#contact">お問い合わせ</a></nav>
      <button class="menu-button" type="button" aria-label="メニューを開く" aria-expanded="false" aria-controls="mobile-nav" data-menu-button><span></span><span></span><span></span></button>
    </div>
    <nav class="mobile-nav" id="mobile-nav" aria-label="モバイルナビゲーション" data-mobile-nav><a href="${home}">トップ<em>Home</em></a>${mobile}<a href="${home}#contact">お問い合わせ<em>Contact</em></a></nav>
  </header>`;
}
function footer(prefix) {
  return `<footer><div class="container"><div class="footer-brand"><img src="${prefix}assets/images/${logo}" alt="" width="44" height="44" /><p>${company}<small>Mitsui H&amp;S Partners Co., Ltd.</small></p></div>
  <nav class="site-footer-nav" aria-label="フッターナビゲーション"><a href="${prefix}index.html">トップ</a>${pages.map(p => `<a href="${prefix}${p.slug}/">${p.title}</a>`).join('')}<a href="${prefix}index.html#contact">お問い合わせ</a></nav>
  <p class="note">所在地・連絡先は確認中です。</p><p class="copyright">© 2026 Mitsui H&amp;S Partners Co., Ltd. All Rights Reserved.</p></div></footer>`;
}
const cta = `<section class="page-section"><div class="page-wrap page-cta"><div><h2>Let's connect.</h2><p>事業のご相談や、私たちへのお問い合わせはこちら。</p></div>${outline('../index.html#contact', 'お問い合わせ')}</div></section>`;
function document(page, body, index) {
  return `<!doctype html>
<html lang="ja"><head>
  <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${page.lead}" /><title>${page.title}｜${company}</title>
  <link rel="icon" href="../assets/images/${logo}" type="image/png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&amp;family=Shippori+Mincho:wght@400;500;600;700&amp;family=Zen+Kaku+Gothic+New:wght@400;500;700&amp;display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../css/dark.css" /><link rel="stylesheet" href="../css/dark-reference.css" /><link rel="stylesheet" href="../css/pages.css" />
  <script src="../js/main.js" defer></script>
</head><body class="dark-page inner-page">
  <a class="skip-link" href="#main">本文へ移動</a>${header('../', page.slug)}
  <main id="main"><section class="page-masthead" aria-labelledby="page-title">
    ${page.photo ? `<img class="masthead-photo" src="${asset(page.photo)}" alt="" fetchpriority="high" />` : ''}
    <div class="page-wrap"><nav aria-label="パンくずリスト"><ol class="breadcrumb"><li><a href="../index.html">Home</a></li><li aria-current="page">${page.title}</li></ol></nav>
    <p class="masthead-en" lang="en">${page.en}</p><h1 id="page-title">${page.title}</h1><p class="masthead-lead">${page.lead}</p><span class="masthead-number" aria-hidden="true">0${index + 1} / 08</span></div>
  </section>${body}${cta}</main>${footer('../')}
  <div class="toast" role="status" aria-live="polite" data-toast></div>
</body></html>\n`.replace(/[ \t]+$/gm, '');
}

const businesses = [
  { id: 'trust-vintage', name: 'Trust vintage', jp: 'ブランド品・時計買取', image: 'biz-trust-vintage_c3da8c25.png', alt: '時計と査定道具のイメージ', lead: '価値を見極める。その先の想いまで。', paragraphs: ['大切に使われてきた時計やブランド品には、持ち主だけが知る物語があります。状態や市場の動向を見極めながら、その背景にも耳を傾ける。納得につながる対話を、査定の出発点にしています。', '査定の根拠をわかりやすくお伝えし、売却の判断をお客様自身で選べるように。目先の取引だけで終わらない、長く相談できる関係を目指します。'], tags: ['ブランド品・時計', '価値の見極め', '丁寧なご説明'] },
  { id: 'trust-retail-lab', name: 'Trust Retail Lab', jp: 'リテール研究・EC販売', image: 'biz-retail-lab_537be947.png', alt: '市場分析を行うワークスペースのイメージ', lead: 'モノが、もう一度輝く場所へ。', paragraphs: ['国内外の相場や販売動向を研究し、それぞれの商品が必要とされる市場へつなぐ。買取の先にある販売まで考えることが、適正な価値の循環を支えます。', '商品の魅力が正しく伝わる情報づくりと、販売チャネルの検討を積み重ねます。リユースとECの可能性を探り、モノと次の持ち主との出会いを生み出していきます。'], tags: ['市場・相場研究', 'EC販売', '販路の開拓'] },
  { id: 'trust-life', name: 'Trust Life', jp: '遺品整理・ライフサポート', image: 'biz-trust-life_96530969.png', alt: '和室と大切な品々のイメージ', lead: '暮らしの節目に、寄り添う存在へ。', paragraphs: ['遺品整理や生前整理は、モノの整理だけではありません。ご家族の気持ちやこれからの暮らしに関わる、大切な時間でもあります。お話を伺い、急がず、一つずつ進め方を考えます。', '残したいもの、次へつなぎたいもの。それぞれのご意向を確かめながら、査定と整理の視点からお手伝いすることを目指します。対応内容や地域は、ご相談時に個別にご確認ください。'], tags: ['遺品整理のご相談', '生前整理のご相談', '品物の査定'] },
];
const businessBody = `<div class="page-wrap"><nav class="page-jumps" aria-label="事業を選ぶ">${businesses.map(b => `<a href="#${b.id}">${b.name}</a>`).join('')}</nav></div>`
  + section(`<div class="editorial-split"><div>${heading('Three businesses, one belief.', '価値をつなぎ、<br />信用を育てる。')}</div>${copy('「誠実な査定」×「確かな販路」。私たちは、この二つがそろってこそ、モノの価値を正しく次へつなげられると考えます。', '買取を担うTrust vintage、販売を担うTrust Retail Lab、暮らしの節目に寄り添うTrust Life。三つの事業を通じて、一人ひとりに合ったお付き合いを目指します。')}</div>`)
  + businesses.map((b, i) => section(`<div class="business-feature${i === 1 ? ' reverse' : ''}">${image(b.image, b.alt)}<div><p class="page-kicker">Business 0${i + 1}</p><h2>${b.name}</h2><h3>${b.jp}</h3><p class="page-heading" style="font-size:22px">${b.lead}</p>${copy(...b.paragraphs)}<ul class="service-tags">${b.tags.map(t => `<li>${t}</li>`).join('')}</ul></div></div>`, b.id)).join('')
  + section(`${heading('The way we work', 'ご相談から始まる、お付き合い。')}<ol class="steps"><li><span>01</span><h3>お話を伺う</h3><p>お品物やご事情、ご希望を伺い、必要なサポートを整理します。</p></li><li><span>02</span><h3>価値と選択肢を伝える</h3><p>状態や市場の動向を踏まえ、ご判断に必要な情報をお伝えします。</p></li><li><span>03</span><h3>次の一歩へつなぐ</h3><p>ご意向を確認しながら、売却や整理などの次のステップを考えます。</p></li></ol>`);

const facts = [
  ['商号', company], ['英語表記', 'Mitsui H&amp;S Partners Co., Ltd.'], ['事業内容', 'ブランド品・時計買取 ／ リテール研究・EC販売 ／ 遺品整理・ライフサポート'],
  ['代表者', '<span class="pending">確認中</span>'], ['所在地', '<span class="pending">確認中（住所・アクセスは確定後に掲載します）</span>'], ['設立', '<span class="pending">確認中</span>'], ['資本金', '<span class="pending">確認中</span>'], ['古物商許可', '<span class="pending">公安委員会名・許可番号を確認中</span>'], ['主要取引銀行', '<span class="pending">確認中</span>'], ['電話番号', '<span class="pending">確認中</span>'], ['お問い合わせ', '<a class="text-link" href="../index.html#contact">お問い合わせフォームへ</a>'],
];
const companyBody = section(`<div class="editorial-split"><div>${heading('Our philosophy', '未来の自分の<br />パートナーに。')}</div>${copy('一度きりの取引ではなく、暮らしや事業の節目に思い出していただける存在でありたい。社名に込めた「Partners」という言葉には、その想いがあります。', 'モノの価値を正しく見極めること。納得できる理由を伝えること。約束を守ること。私たちは、日々の小さな誠実さを信用へとつないでいきます。')}</div>`)
  + section(`${heading('Corporate information', '会社の基本情報')}${note('未確定の会社情報は「確認中」としています。正式な情報を確認後に更新します。')}<dl class="company-facts">${facts.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>`)
  + section(`<div class="editorial-split">${image('office-interior_f7e0e96c.png', 'オフィス空間のイメージ', '写真はイメージです。実際の所在地を示すものではありません。')}<div>${heading('Our approach', '当たり前を、<br />丁寧に積み重ねる。')}${copy('買取・販売・ライフサポート。事業のかたちは異なっても、大切にするのは人との向き合い方です。私たちの考え方や事業について、こちらもご覧ください。')}${related([['../message/', '社長メッセージ'], ['../business/', '事業内容'], ['../compliance/', 'コンプライアンス']])}</div></div>`);

const complianceBody = section(`${note('本ページは公開前の方針案です。実際の社内規程・運用体制を確認し、内容を確定する必要があります。')}<div class="editorial-split"><div>${heading('Integrity first', '信用の土台は、<br />誠実であること。')}</div>${copy('お客様の大切な品物や情報をお預かりする仕事だからこそ、法令を守ることと、相手の立場で考えることを大切にします。', '取引の透明性、情報の適切な取り扱い、働く人への尊重。日常の判断に立ち返るための基本姿勢を、ここに整理しています。')}</div>`)
  + section(`${heading('Our principles', '大切にする六つの姿勢')}<ol class="principles">${[
    ['法令とルールを守る', '事業に関係する法令や社内ルールを確認し、それらに沿った取引を行うことを基本とします。'],
    ['取引をわかりやすく伝える', '査定の内容や取引条件について、お客様が理解し判断できるように説明することを目指します。'],
    ['品物と記録を適切に扱う', 'お預かりした品物や取引に関わる記録を、責任を持って取り扱う姿勢を大切にします。'],
    ['個人情報を大切にする', '取得する情報の目的や必要性を確認し、適切に管理することを基本とします。具体的な管理方法は運用確認後に掲載します。'],
    ['公正な関係を築く', '取引先との公平な関係を大切にし、不適切な利益供与や反社会的な関係を避ける方針を定めることを目指します。'],
    ['人を尊重する', '立場や背景の違いを尊重し、差別やハラスメントのない職場づくりを目指します。'],
  ].map(([title, text]) => `<li><h3>${title}</h3><p>${text}</p></li>`).join('')}</ol>`)
  + section(`<div class="editorial-split"><div>${heading('Review & improvement', '気づきを、改善へ。')}${copy('疑問や懸念を共有し、事実を確かめ、必要な改善を行う。この流れを日々の業務に根づかせることを目指します。', '担当部署、社内相談窓口、外部相談先などの正式な体制は確認中です。')}</div><div class="policy-flow" aria-label="対応の流れ（案）"><div>気づき・相談<small>懸念や疑問を共有する</small></div><div>事実確認・検討<small>関係する情報を整理する</small></div><div>改善・振り返り<small>同じ問題を繰り返さないために</small></div></div></div>`);

const news = [
  { id: 'popup-event', date: '2026-07-10', category: 'event', label: 'イベント', title: '名古屋・栄にてブランド時計ポップアップ査定イベントを開催いたします', body: ['ブランド時計の査定をテーマにしたポップアップイベントの告知サンプルです。身近な場所で相談できる機会を、写真や開催情報とともにお伝えする想定です。', '開催日時・会場・予約方法などの確定情報はありません。実際のイベントが決まり次第、正式なお知らせに差し替えます。'] },
  { id: 'appraisal-video', date: '2026-06-28', category: 'media', label: 'メディア', title: '公式YouTubeチャンネルを更新しました「時計査定の裏側 — 相場はどう決まるのか」', body: ['査定の仕事を動画で紹介する記事のサンプルです。状態の確認や市場の動向など、普段は見えにくい仕事の一端を伝える構成を想定しています。', '本記事は公開済み動画の案内ではありません。実際の動画とチャンネル情報を確認後に掲載します。'] },
  { id: 'recruitment', date: '2026-06-12', category: 'recruit', label: '採用', title: 'バイヤー職・査定スタッフの中途採用募集を開始しました（名古屋本社勤務）', body: ['採用に関するお知らせの表示サンプルです。仕事内容や募集背景を紹介し、採用情報へつなぐことを想定しています。', '現在の募集有無・勤務地・雇用条件は未確定です。募集内容のサンプルは採用情報ページでご覧いただけます。'], href: '../recruit/', link: '採用情報を見る' },
  { id: 'website-launch', date: '2026-05-30', category: 'information', label: 'お知らせ', title: 'コーポレートサイトを公開しました', body: ['ウェブサイト公開時のお知らせを想定したサンプルです。会社の考え方、事業内容、採用情報などをお届けするためのサイトを制作しています。', '記載の日付はデザイン確認用です。正式な公開日が決まり次第、内容を更新します。'] },
];
function filters(items) {
  return `<div class="filter-buttons" role="group" aria-label="カテゴリーで絞り込む">${[['all', 'すべて'], ...items].map(([value, label]) => `<button type="button" data-filter="${value}" aria-pressed="${value === 'all'}">${label}</button>`).join('')}</div>`;
}
function searchControl(withYear = false) {
  return `<div class="listing-search">${withYear ? '<label>掲載年<select data-year><option value="">すべての年</option><option value="2026">2026年</option></select></label>' : ''}<label>キーワード検索<input type="search" data-search placeholder="キーワードを入力" aria-label="記事のキーワード検索" /></label></div>`;
}
const resultMessages = '<p class="result-count" data-results role="status" aria-live="polite"></p><p class="empty-state" data-empty hidden>条件に一致する記事がありません。検索条件を変更してください。</p>';
const newsBody = section(`${note(sampleNote)}<div data-listing><div class="listing-tools">${filters([['information', 'お知らせ'], ['event', 'イベント'], ['media', 'メディア'], ['recruit', '採用']])}${searchControl(true)}</div>${resultMessages}<div>${news.map(n => `<details class="news-entry" id="${n.id}" data-item data-category="${n.category}" data-year="2026"><summary><time datetime="${n.date}">${n.date.replaceAll('-', '.')}</time><span class="entry-category">${n.label}</span><h2>${n.title}</h2></summary><div class="entry-body"><p class="pending">サンプル記事</p>${n.body.map(p => `<p>${p}</p>`).join('')}${n.href ? `<a class="text-link" href="${n.href}">${n.link} →</a>` : ''}</div></details>`).join('')}</div></div>`);

const jobs = [
  ['買取・査定', 'バイヤー・査定スタッフ', 'お客様との対話を通じたブランド品・時計の査定、買取に関するご案内などを想定しています。', '相手の話を丁寧に聞き、知識を少しずつ学び続けられる方。'],
  ['リテール・EC', 'EC運営・商品管理スタッフ', '商品の情報整理、撮影・掲載のサポート、販売データの確認、商品管理などを想定しています。', '細かな確認を大切にし、モノの魅力をわかりやすく伝えることに関心がある方。'],
  ['ライフサポート', 'ご相談・整理サポートスタッフ', '遺品整理や生前整理に関するヒアリング、品物の確認、整理に関するサポートなどを想定しています。', '人の気持ちや背景を尊重し、落ち着いた対応ができる方。'],
];
const recruitBody = section(`<div class="editorial-split"><div>${heading('Work with purpose', 'モノの先にいる、<br />人を想う仕事。')}</div>${copy('時計の状態を丁寧に確かめる。商品の魅力を言葉にする。整理の一歩を一緒に考える。私たちの仕事は、いつも人との関わりの中にあります。', '知識や経験と同じくらい、大切にしたいのは誠実さ。目の前の一人に向き合い、学びを重ねていく姿勢です。')}</div>`)
  + `<div class="page-wrap"><figure class="feature-banner"><img src="${asset('banner-recruit_04a37a58.png')}" alt="一緒に働く仲間のイメージ" loading="lazy" /><h2>あなたの誠実さが、<br />誰かの安心になる。</h2></figure></div>`
  + section(`${heading('What we value', '一緒に大切にしたいこと')}<ol class="steps"><li><span>01</span><h3>相手に向き合う</h3><p>答えを急がず、まずは話を聞く。お客様や仲間の立場に立って考える。</p></li><li><span>02</span><h3>学び続ける</h3><p>モノの知識も市場の変化も、日々の仕事を通じて理解を深めていく。</p></li><li><span>03</span><h3>チームでつなぐ</h3><p>買取から販売まで、互いの仕事を理解し、情報を共有する。</p></li></ol>`)
  + section(`${heading('Possible roles', '仕事を知る')}${note('以下は職種紹介・募集要項のサンプルです。現在の募集有無、雇用形態、勤務地、給与、勤務時間、待遇、選考方法は未確定です。')}<div class="job-list">${jobs.map(([category, title, work, person]) => `<details><summary><small>${category}</small><h3>${title}</h3></summary><div class="job-description"><dl class="company-facts"><div><dt>想定する仕事</dt><dd>${work}</dd></div><div><dt>大切にしたい姿勢</dt><dd>${person}</dd></div><div><dt>募集条件</dt><dd class="pending">募集有無を含め確認中。正式な募集要項は確定後に掲載します。</dd></div></dl></div></details>`).join('')}</div>`)
  + section(`<div class="editorial-split"><div>${heading('Meet our people', '仕事の向こうにある、<br />私たちの日常。')}</div><div>${copy('仕事への向き合い方や、日々の気づきを社員ブログでご紹介する予定です。現在は記事のサンプルをご覧いただけます。')}${outline('../blog/', '社員ブログを見る')}</div></div>`);

const works = [
  { id: 'nagoya-store', category: 'store', label: '店舗', title: 'Trust vintage 名古屋本店', image: 'store-front_d976b37d.png', desc: '地域に根ざした、気軽に相談できる買取の拠点。', body: '店舗紹介のサンプルです。実際の店舗が確定した際は、外観・店内の写真、サービス内容、アクセス情報などを掲載する想定です。' },
  { id: 'appraisal-salon', category: 'store', label: '査定サロン', title: '査定サロン開設', image: 'appraisal-desk_8e555556.png', desc: '一つひとつのご相談に、落ち着いて向き合う場。', body: '査定サロンの紹介サンプルです。相談空間や査定の流れなど、初めてのお客様にも伝わる情報を掲載する想定です。' },
  { id: 'department-popup', category: 'event', label: '催事', title: '百貨店ポップアップ催事', image: 'popup-event_f7ad5dfa.png', desc: '日常の場所で、リユースとの出会いをつくる。', body: '催事実績のサンプルです。開催場所・期間・取り組み内容を、現場の写真とともにご紹介する想定です。実在する催事の実績ではありません。' },
  { id: 'office-relocation', category: 'office', label: 'オフィス', title: '本社オフィス移転', image: 'office-interior_f7e0e96c.png', desc: '事業を横断して、対話が生まれるワークプレイス。', body: 'オフィス紹介のサンプルです。拠点整備の目的や働く環境などを掲載する想定です。実際の移転事実や所在地を示すものではありません。' },
];
const worksBody = section(`${note(sampleNote + ' 写真もすべてイメージです。')}<div data-listing><div class="listing-tools">${filters([['store', '店舗・サロン'], ['event', '催事'], ['office', 'オフィス']])}</div>${resultMessages}<div class="work-grid">${works.map(w => `<details class="work-card" id="${w.id}" data-item data-category="${w.category}"><summary><div class="card-image"><img src="${asset(w.image)}" alt="${w.title}のイメージ" loading="lazy" width="1200" height="750" /></div><div class="card-meta"><span>${w.label}</span><small>SAMPLE PROJECT</small></div><h2>${w.title}</h2><p class="card-summary">${w.desc}</p></summary><div class="entry-body"><p>${w.body}</p><p class="pending">場所・実施時期・実績情報は確認後に掲載します。</p></div></details>`).join('')}</div></div>`);

const posts = [
  { id: 'watch-appraisal', date: '2026-06-20', category: 'work', label: '仕事を知る', title: '査定の現場から — 一本の時計に向き合うということ', image: 'biz-trust-vintage_c3da8c25.png', intro: '数字だけでは伝わらない価値を、対話の中で見つける。', body: ['時計を手に取るとき、まず大切にしたいのは、その一本に向き合う姿勢です。状態を確かめることと同じように、持ち主のお話に耳を傾ける時間にも意味があります。', '査定の考え方を伝えることは、お客様が次の一歩を選ぶお手伝いでもあります。知識を増やすだけでなく、言葉を丁寧に選ぶことも、仕事の大切な一部だと考えます。'] },
  { id: 'future-of-reuse', date: '2026-05-15', category: 'reuse', label: 'リユースのこと', title: 'リユース業界のこれからと私たちの役割', image: 'biz-retail-lab_537be947.png', intro: '売ること、買うこと。その間をつなぐ仕事の可能性。', body: ['誰かが手放したモノを、次に必要とする人へ届ける。そのシンプルな循環を支えるためには、品物の状態を理解すること、情報を正しく伝えること、出会いの場をつくることが必要です。', 'リユースの選択肢が身近になるほど、わかりやすさや安心感が大切になります。一つひとつの取引を丁寧につなぐことから、その可能性を考えていきたいと思います。'] },
  { id: 'new-season', date: '2026-04-02', category: 'daily', label: '日々のこと', title: '新年度のごあいさつ', image: 'banner-recruit_04a37a58.png', intro: '変わる季節にも、変わらず大切にしたいこと。', body: ['新しい季節は、自分の仕事を見つめ直すきっかけになります。昨日より少しわかりやすく説明すること。仲間の仕事をもう一歩理解すること。小さな目標を考えてみました。', '特別な成果だけでなく、日常の気づきも言葉にして残したい。このブログを、そんな対話のきっかけにしていければと思います。'] },
  { id: 'life-support', date: '2026-03-10', category: 'work', label: '仕事を知る', title: '遺品整理のご相談で大切にしていること', image: 'biz-trust-life_96530969.png', intro: '急がず、決めつけず。一人ひとりのペースに合わせる。', body: ['大切な人の品物を整理する時間には、それぞれ違った想いがあります。最初から答えを決めず、残したいものや迷っていることを一緒に整理する姿勢が大切だと考えます。', 'モノを見る視点と、人に寄り添う視点。その両方を忘れずに、目の前のご相談に向き合う。ライフサポートの仕事について、私たちが考える出発点です。'] },
];
const blogBody = section(`${note('本ページは記事一覧と記事本文のサンプルです。実際の社員による執筆・体験談ではありません。')}<div data-listing><div class="listing-tools">${filters([['work', '仕事を知る'], ['reuse', 'リユースのこと'], ['daily', '日々のこと']])}${searchControl()}</div>${resultMessages}<div class="blog-grid">${posts.map(p => `<details class="blog-card" id="${p.id}" data-item data-category="${p.category}"><summary><div class="card-image"><img src="${asset(p.image)}" alt="${p.label}のイメージ" loading="lazy" width="1200" height="750" /></div><div class="card-meta"><span>${p.label}</span><time datetime="${p.date}">${p.date.replaceAll('-', '.')}</time></div><h2>${p.title}</h2><p class="card-summary">${p.intro}</p></summary><div class="entry-body"><p class="pending">編集サンプル ／ 写真はイメージ</p>${p.body.map(text => `<p>${text}</p>`).join('')}</div></details>`).join('')}</div></div>`);

const messageBody = section(`${note('本文はメッセージの原稿案です。代表者の氏名・写真・正式なメッセージは確認後に更新します。')}<div class="editorial-split"><figure class="image-frame message-portrait"><img src="${asset('ceo-portrait_e30aa7bf.png')}" alt="代表者のポートレート掲載イメージ（実際の代表者ではありません）" width="900" height="1200" /><figcaption>ポートレートはイメージです。</figcaption></figure><div>${heading('A message from our president', '一つひとつの取引が、<br />会社の信用をつくる。')}${copy('査定台の上に置かれた一本の時計。その時計には、数字や型番だけでは表せない、持ち主の時間が宿っています。私たちは、品物の価値と同時に、そこに込められた想いにも向き合いたいと考えています。', '価値を正しく見極めること。査定の理由を丁寧に伝えること。次の持ち主へとつながる道筋を考えること。リユースという仕事は、その一つひとつの積み重ねで成り立っています。', 'Trust vintage、Trust Retail Lab、Trust Life。三つの事業は、買取、販売、暮らしのサポートと、それぞれ役割が異なります。しかし、根底にあるのは同じです。目の前の一人に、誠実であること。その姿勢が、すべての仕事をつないでいます。')}<h2 class="page-heading" style="font-size:26px;margin-top:48px">未来の自分のパートナーに。</h2>${copy('今、相談してよかったと思っていただくこと。そして、何年か先の節目にも思い出していただけること。私たちが目指すのは、そんな長く続く信頼関係です。', 'お客様、お取引先、地域の皆様、そして共に働く仲間。その一人ひとりとの対話を大切にしながら、モノの価値が正しく受け継がれる未来をつくっていきたいと考えています。', '当たり前のことを、当たり前に、丁寧に。これからも、その姿勢を日々の仕事で示せる会社を目指してまいります。')}<p class="message-signature">${company}<br />代表取締役<strong>代表者氏名 確認中</strong></p>${related([['../company/', '会社概要'], ['../business/', '事業内容']])}</div></div>`);

const bodies = [businessBody, companyBody, complianceBody, newsBody, recruitBody, worksBody, blogBody, messageBody];
pages.forEach((page, i) => {
  const dir = path.join(root, page.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), document(page, bodies[i], i));
});

// Turn all existing homepage actions into real, crawlable links.
let home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
home = home.replace(/<header class="site-header"[\s\S]*?<\/header>/, header('', ''));
home = home.replace(/<footer>[\s\S]*?<\/footer>/, footer(''));
if (!home.includes('css/pages.css')) home = home.replace('<script src="js/main.js"', '<link rel="stylesheet" href="css/pages.css" />\n    <script src="js/main.js"');
if (!home.includes('class="skip-link"')) home = home.replace('<body class="dark-page">', '<body class="dark-page">\n    <a class="skip-link" href="#top">本文へ移動</a>');
let newsIndex = 0;
let blogIndex = 0;
const destinations = {
  '事業内容': 'business/', '会社概要': 'company/', 'コンプライアンス': 'compliance/', '会社の最新情報': 'news/',
  'リクルート': 'recruit/', '採用情報': 'recruit/', '実績紹介': 'achievements/', '社員ブログ': 'blog/', '社長メッセージ': 'message/',
  'Trust vintage': 'business/#trust-vintage', 'Trust Retail Lab': 'business/#trust-retail-lab', 'Trust Life': 'business/#trust-life',
};
home = home.replace(/<button([^>]*?)data-coming-soon="([^"]+)"([^>]*)>([\s\S]*?)<\/button>/g, (match, before, label, after, body) => {
  let href = destinations[label];
  if (label === 'お知らせ詳細') href = `news/#${news[newsIndex++].id}`;
  if (label === '社員ブログ' && body.includes('<time>')) href = `blog/#${posts[blogIndex++].id}`;
  if (!href) throw new Error(`Unmapped homepage link: ${label}`);
  return `<a${before.replace(/\s*type="button"/, '')}href="${href}"${after}>${body}</a>`;
});
// Clarify pre-existing illustrative news/blog content on the homepage, too.
if (!home.includes('最新情報をお知らせいたします。（記事はサンプル）')) {
  home = home.replace('最新情報をお知らせいたします。', '最新情報をお知らせいたします。（記事はサンプル）');
}
home = home.replace('査定の現場や日々の取り組みを、社員の言葉でお伝えしています。', '査定の現場や日々の取り組みを、社員の言葉でお伝えするブログです。<small>現在の記事はサンプルです。</small>');
fs.writeFileSync(path.join(root, 'index.html'), home);
console.log(`Built ${pages.length} corporate pages and updated homepage navigation.`);
