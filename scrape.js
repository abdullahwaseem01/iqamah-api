const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://oshawamosque.com', { waitUntil: 'networkidle2' });

  // Allow extra time to fully render
  console.log("🕒 Waiting for full dynamic load...");
  await new Promise(resolve => setTimeout(resolve, 20000));

  const times = await page.evaluate(() => {
    const data = {};

    const getTime = (selector) => {
      const element = document.querySelector(selector);
      return element ? element.innerText.trim() : null;
    };

    data.Fajr = getTime('.PrayerTime_Fajr');
    data.Dhuhr = getTime('.PrayerTime_Dhuhr');
    data.Asr = getTime('.PrayerTime_Asr');
    data.Maghrib = getTime('.PrayerTime_Maghrib');
    data.Isha = getTime('.PrayerTime_Isha');

    return data;
  });

  await browser.close();

  if (Object.keys(times).length > 0) {
    fs.writeFileSync('iqamah.json', JSON.stringify(times, null, 2));
    console.log("✅ iqamah.json updated with:", times);
  } else {
    console.log("⚠️ No prayer times found. Skipping update.");
  }
})();
