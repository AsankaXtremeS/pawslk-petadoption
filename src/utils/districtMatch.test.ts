import { describe, expect, it } from 'vitest';
import { districtOf } from './districtMatch';

// Real location strings from PawConnect listings.
const cases: [string, string | undefined][] = [
  ['Colombo 14', 'Colombo'],
  ['Rathmalana', 'Colombo'],
  ['No 165, Aranayaka road, Godagama, Mawanella', 'Kegalle'],
  ['Pannipitiya, railway station road', 'Colombo'],
  ['Pitipana north, homagama, sarasavi medura boys hostel usjp.', 'Colombo'],
  ['Sabaragamuwa University Sinharaja Hostel Complex, Belihuloya', 'Ratnapura'],
  ['Near to Teaching Hospital Kurunegala', 'Kurunegala'],
  ['Galle fort, Baladaksha mawatha, near the entrance', 'Galle'],
  ['Galle Road, Colombo 03', 'Colombo'],
  ['Kulupana,horana', 'Kalutara'],
  ['Matara , Nupe', 'Matara'],
  ['Ja ela', 'Gampaha'],
  ['Jaela', 'Gampaha'],
  ['wellawatta colombo 06', 'Colombo'],
  ['Ihala Kobbekaduwa', 'Kandy'],
  ['Hikkaduwa', 'Galle'],
  ['මාලබේ', 'Colombo'],
  ['පේරාදෙණිය, මහනුවර', 'Kandy'],
  ['මොණරාගල බඩල්කුබුර', 'Monaragala'],
  ['මිගමුව කදිරාන ඇක්වා ගාර්මන්ට් එක අසල', 'Gampaha'],
  ['කැලනිය', 'Gampaha'],
  ['රාගම, පෙරලන්ද පාර, වැව අසල', 'Gampaha'],
  ['+94758662797', undefined],
  ['', undefined],
];

describe('districtOf', () => {
  it.each(cases)('%s → %s', (location, district) => {
    expect(districtOf(location)).toBe(district);
  });
});
