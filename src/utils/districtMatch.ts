import { p } from './sriLankaAddress';

/**
 * Works out which district a free-text listing location belongs to, e.g.
 * "No 165, Aranayaka road, Godagama, Mawanella" → Kegalle,
 * "Colombo 14" → Colombo, "මොණරාගල බඩල්කුබුර" → Monaragala.
 * Used by the /adopt/:district landing pages. Returns undefined when unsure.
 */

// Well-known places missing from sl-address's postal-town list.
const EXTRA_TOWNS: Record<string, string[]> = {
  Colombo: [
    'Colombo', 'Fort', 'Ratmalana', 'Malabe', 'Attidiya', 'Kohuwala', 'Pepiliyana', 'Katubedda',
    'Kotikawatta', 'Kalalgoda', 'Thalapathpitiya', 'Wellawatte', 'Bambalapitiya', 'Dehiwala',
    'Mount Lavinia', 'Rajagiriya', 'Battaramulla', 'Kottawa', 'Maharagama', 'Boralesgamuwa',
    'Piliyandala', 'Kesbewa', 'Angoda', 'Mulleriyawa', 'Orugodawatta', 'Kolonnawa', 'Thalawathugoda',
  ],
  Gampaha: ['Negombo', 'Ja-Ela', 'Kadawatha', 'Ragama', 'Wattala', 'Kiribathgoda', 'Peliyagoda', 'Minuwangoda', 'Kandana'],
  Kandy: ['Akurana', 'Katugastota', 'Kundasale', 'Gampola'],
  Kalutara: ['Mathugama', 'Beruwala', 'Aluthgama', 'Wadduwa'],
  Anuradhapura: ['Kekirawa'],
};

// Sinhala spellings of districts and common towns (matched as substrings).
const SINHALA: Record<string, string[]> = {
  Colombo: ['කොළඹ', 'මොරටුව', 'මාලබේ', 'පිලියන්දල', 'පන්නිපිටිය', 'කොටිකාවත්ත', 'මහරගම', 'නුගේගොඩ', 'දෙහිවල'],
  Gampaha: ['ගම්පහ', 'මීගමුව', 'රාගම', 'කඩවත', 'කැලණිය', 'මිනුවන්ගොඩ', 'ජාඇල', 'වත්තල'],
  Kalutara: ['කළුතර', 'හොරණ', 'පානදුර'],
  Kandy: ['මහනුවර', 'පේරාදෙණිය', 'අකුරණ', 'ගම්පොල'],
  Matale: ['මාතලේ'],
  'Nuwara Eliya': ['නුවරඑළිය'],
  Galle: ['ගාල්ල'],
  Matara: ['මාතර'],
  Hambantota: ['හම්බන්තොට'],
  Jaffna: ['යාපනය'],
  Kilinochchi: ['කිලිනොච්චිය'],
  Mannar: ['මන්නාරම'],
  Vavuniya: ['වවුනියාව'],
  Mullaitivu: ['මුලතිව්'],
  Batticaloa: ['මඩකලපුව'],
  Ampara: ['අම්පාර'],
  Trincomalee: ['ත්‍රිකුණාමලය'],
  Kurunegala: ['කුරුණෑගල', 'නිකවැරටිය', 'කුලියාපිටිය'],
  Puttalam: ['පුත්තලම'],
  Anuradhapura: ['අනුරාධපුර', 'කැකිරාව'],
  Polonnaruwa: ['පොළොන්නරුව'],
  Badulla: ['බදුල්ල'],
  Monaragala: ['මොණරාගල'],
  Ratnapura: ['රත්නපුර'],
  Kegalle: ['කෑගල්ල', 'මාවනැල්ල'],
};

// Address words that are never a town on their own.
const STOPWORDS = new Set([
  'no', 'near', 'road', 'rd', 'mawatha', 'lane', 'cross', 'street', 'st', 'north', 'south', 'east', 'west',
  'upper', 'lower', 'city', 'town', 'junction', 'station', 'railway', 'hospital', 'teaching', 'school', 'college',
  'university', 'hostel', 'temple', 'church', 'mosque', 'complex', 'main', 'the', 'to', 'and', 'of', 'at', 'in',
  'food', 'house', 'garden', 'place', 'entrance', 'boys', 'girls', 'fort',
]);

/** Latin: lowercase, letters only, "th"→"t", doubled letters collapsed ("Rathmalana" = "Ratmalana"). */
const normLatin = (s: string) =>
  s.normalize('NFD').toLowerCase().replace(/[^a-z]/g, '').replace(/th/g, 't').replace(/(.)\1+/g, '$1');

/** Sinhala: drop joiners/spaces and fold letter/vowel-length variants people mix up when typing. */
const normSinhala = (s: string) =>
  s
    .normalize('NFC')
    .replace(/[‌‍\s]/g, '')
    .replace(/ණ/g, 'න')
    .replace(/ළ/g, 'ල')
    .replace(/ී/g, 'ි')
    .replace(/ූ/g, 'ු')
    .replace(/ේ/g, 'ෙ')
    .replace(/ෝ/g, 'ො')
    .replace(/ෑ/g, 'ැ');

let latinIndex: Map<string, string> | null = null;
let sinhalaKeys: [string, string][] | null = null;

function buildIndex() {
  latinIndex = new Map();
  for (const district of p.getDistricts()) {
    for (const town of p.getCitiesByDistrict(district)) {
      const key = normLatin(town.replace(/\(.*?\)|\d+/g, ''));
      if (key.length >= 3 && !latinIndex.has(key)) latinIndex.set(key, district);
    }
  }
  for (const [district, towns] of Object.entries(EXTRA_TOWNS)) {
    for (const town of towns) latinIndex.set(normLatin(town), district);
  }
  sinhalaKeys = Object.entries(SINHALA)
    .flatMap(([district, names]) => names.map((n) => [normSinhala(n), district] as [string, string]))
    .sort((a, b) => b[0].length - a[0].length);
}

function matchSegment(segment: string): string | undefined {
  const index = latinIndex!;
  const whole = index.get(normLatin(segment.replace(/\d+/g, '')));
  if (whole) return whole;

  const words = segment.split(/\s+/).filter(Boolean);
  for (let n = Math.min(3, words.length); n >= 1; n--) {
    for (let i = 0; i + n <= words.length; i++) {
      const phrase = words.slice(i, i + n);
      if (n === 1 && STOPWORDS.has(phrase[0].toLowerCase().replace(/[^a-z]/g, ''))) continue;
      const key = normLatin(phrase.join(''));
      if (key.length < 4) continue;
      const hit = index.get(key);
      if (hit) return hit;
    }
  }

  const sinhala = normSinhala(segment);
  if (/[඀-෿]/.test(sinhala)) {
    for (const [key, district] of sinhalaKeys!) if (sinhala.includes(key)) return district;
  }
  return undefined;
}

export function districtOf(location: string | null | undefined): string | undefined {
  if (!location) return undefined;
  if (!latinIndex) buildIndex();
  // The town is usually at the end of an address, so read segments last-first.
  const segments = location.split(/[,|/;]+/).map((s) => s.trim()).filter(Boolean).reverse();
  for (const segment of segments) {
    const hit = matchSegment(segment);
    if (hit) return hit;
  }
  return undefined;
}
