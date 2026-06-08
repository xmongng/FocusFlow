import { SolarDate } from 'lunar-date-vn';

try {
  const solar = new SolarDate(new Date(2026, 4, 19)); // May 19, 2026 (Note: month is 0-indexed in JS, so 4 is May)
  const lunar = solar.toLunarDate();
  console.log('Lunar Date Object:', JSON.stringify(lunar));
  console.log('Lunar Date Keys:', Object.keys(lunar));
  console.log('Solar Date Keys:', Object.keys(solar));
} catch (err) {
  console.error(err);
}
