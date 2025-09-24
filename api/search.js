import cheerio from 'cheerio';


export default async function handler(req, res) {
const q = (req.query.q || req.query.query || '').trim();
if (!q) return res.status(400).json({ error: 'query required' });


const stores = [
{ store: 'Jumia', url: `https://www.jumia.com.eg/catalog/?q=${encodeURIComponent(q)}`, sel: '.prc' },
{ store: 'Amazon EG', url: `https://www.amazon.eg/s?k=${encodeURIComponent(q)}`, sel: '.a-price-whole' },
{ store: 'Noon', url: `https://www.noon.com/egypt-en/search?q=${encodeURIComponent(q)}`, sel: '.price' },
{ store: 'Btech', url: `https://btech.com/ar/catalogsearch/result/?q=${encodeURIComponent(q)}`, sel: '.price' },
{ store: 'Raya', url: `https://www.rayashop.com/search?q=${encodeURIComponent(q)}`, sel: '.price' },
{ store: 'Dream2000', url: `https://dream2000.com/search?type=product&q=${encodeURIComponent(q)}`, sel: '.price-item' },
{ store: 'Dubai Phone', url: `https://dubaiphone.net/search?type=product&q=${encodeURIComponent(q)}`, sel: '.price-item' },
{ store: '2B', url: `https://2b.com.eg/catalogsearch/result/?q=${encodeURIComponent(q)}`, sel: '.price' },
{ store: 'Cairo Sales', url: `https://cairosales.com/search?controller=search&s=${encodeURIComponent(q)}`, sel: '.price' },
{ store: 'RezkAllah', url: `https://rezkallamobile.com/?s=${encodeURIComponent(q)}&post_type=product`, sel: '.woocommerce-Price-amount' }
];


const fetchHtml = async (url) => {
const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PriceHunter/1.0)' } });
return await r.text();
};


const results = [];
for (const s of stores) {
try {
const html = await fetchHtml(s.url);
const $ = cheerio.load(html);
const txt = $(s.sel).first().text() || '';
const price = parseInt(txt.replace(/[^0-9]/g, '')) || null;
results.push({ store: s.store, price, link: s.url });
} catch (err) {
results.push({ store: s.store, price: null, link: s.url, error: true });
}
}


// ترتيب من الأصغر للأكبر، null (غير موجود) يوضعوا في النهاية
results.sort((a, b) => {
if (a.price === null && b.price === null) return 0;
if (a.price === null) return 1;
if (b.price === null) return -1;
return a.price - b.price;
});


res.json(results);
}