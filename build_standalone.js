const fs = require('fs');

// Read files
const css = fs.readFileSync('style.css', 'utf8');
const js = fs.readFileSync('app.js', 'utf8');
let html = fs.readFileSync('index.html', 'utf8');

// Encode audio files to base64 data URIs
const liamBase64 = 'data:audio/mp3;base64,' + fs.readFileSync('audio/ev_liam.mp3').toString('base64');
const bndBase64 = 'data:audio/mp3;base64,' + fs.readFileSync('audio/ev_brand_new_day.mp3').toString('base64');
const danuBase64 = 'data:audio/mp3;base64,' + fs.readFileSync('audio/ev_danu_anomalies.mp3').toString('base64');
const klayBase64 = 'data:audio/mp3;base64,' + fs.readFileSync('audio/ev_klay_anomalies.mp3').toString('base64');

// Replace CSS links with inlined <style>
html = html.replace(/<link\s+rel=["']stylesheet["']\s+href=["']\.?\/style\.css["']\s*\/?>/i, `<style>\n${css}\n</style>`);

// Replace audio sources with base64 data URIs
html = html.replace(/src=["']\.?\/audio\/ev_liam\.mp3["']/i, `src="${liamBase64}"`);
html = html.replace(/src=["']\.?\/audio\/ev_brand_new_day\.mp3["']/i, `src="${bndBase64}"`);
html = html.replace(/src=["']\.?\/audio\/ev_danu_anomalies\.mp3["']/i, `src="${danuBase64}"`);
html = html.replace(/src=["']\.?\/audio\/ev_klay_anomalies\.mp3["']/i, `src="${klayBase64}"`);

// Replace external JS script with inlined <script>
html = html.replace(/<script\s+src=["']\.?\/app\.js["']\s*><\/script>/i, `<script>\n${js}\n</script>`);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully bundled self-contained index.html!');
console.log('Size:', (fs.statSync('index.html').size / 1024).toFixed(1), 'KB');
