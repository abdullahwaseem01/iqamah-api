const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://oshawamosque.com', { waitUntil: 'networkidle2' });

  const times = await page.evaluate(() => {
    const data = {};
    document.querySelectorAll(".elementor-widget-container").forEach((el) => {
      const text = el.innerText;
      if (text.includes("Fajr")) data.Fajr = text.match(/Fajr.*?(\d{1,2}:\d{2}\s?[ap]m)/i)?.[1];
      if (text.includes("Zuhr")) data.Dhuhr = text.match(/Zuhr.*?(\d{1,2}:\d{2}\s?[ap]m)/i)?.[1];
      if (text.includes("Asr")) data.Asr = text.match(/Asr.*?(\d{1,2}:\d{2}\s?[ap]m)/i)?.[1];
      if (text.includes("Maghrib")) data.Maghrib = text.match(/Maghrib.*?(\d{1,2}:\d{2}\s?[ap]m)/i)?.[1];
      if (text.includes("Isha")) data.Isha = text.match(/Isha.*?(\d{1,2}:\d{2}\s?[ap]m)/i)?.[1];
    });
    return data;
  });

  await browser.close();

  fs.writeFileSync('iqamah.json', JSON.stringify(times, null, 2));
})();
