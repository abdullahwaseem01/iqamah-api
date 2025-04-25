const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://oshawamosque.com', { waitUntil: 'domcontentloaded' });

  // Instead of waiting for a selector, just wait 15 seconds manually
  await page.waitForTimeout(15000); // wait 15 seconds

  const times = await page.evaluate(() => {
    const data = {};
    const textBlocks = Array.from(document.querySelectorAll(".elementor-widget-container"))
      .map(el => el.innerText)
      .join("\n");

    const fajrMatch = textBlocks.match(/Fajr[\s\S]*?(\d{1,2}:\d{2}\s?[ap]m)/i);
    const zuhrMatch = textBlocks.match(/Zuhr[\s\S]*?(\d{1,2}:\d{2}\s?[ap]m)/i);
    const asrMatch = textBlocks.match(/Asr[\s\S]*?(\d{1,2}:\d{2}\s?[ap]m)/i);
    const maghribMatch = textBlocks.match(/Maghrib[\s\S]*?(\d{1,2}:\d{2}\s?[ap]m)/i);
    const ishaMatch = textBlocks.match(/Isha[\s\S]*?(\d{1,2}:\d{2}\s?[ap]m)/i);

    if (fajrMatch) data.Fajr = fajrMatch[1];
    if (zuhrMatch) data.Dhuhr = zuhrMatch[1];
    if (asrMatch) data.Asr = asrMatch[1];
    if (maghribMatch) data.Maghrib = maghribMatch[1];
    if (ishaMatch) data.Isha = ishaMatch[1];

    return data;
  });

  await browser.close();

  if (Object.keys(times).length > 0) {
    fs.writeFileSync('iqamah.json', JSON.stringify(times, null, 2));
    console.log("✅ iqamah.json updated with data:", times);
  } else {
    console.log("⚠️ No prayer times found. Skipping update.");
  }
})();
