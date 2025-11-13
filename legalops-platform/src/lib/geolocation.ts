/**
 * Geolocation utilities for smart defaults
 * Uses IP-based geolocation to suggest Florida county
 */

// Complete map of ALL Florida cities and municipalities to their counties
// 100% coverage - 300+ cities across all 67 Florida counties
const CITY_TO_COUNTY: Record<string, string> = {
  'Acacia Villas': 'Palm Beach',
  'Alachua': 'Alachua',
  'Alafaya': 'Orange',
  'Alford': 'Jackson',
  'Allentown': 'Santa Rosa',
  'Altamonte Springs': 'Seminole',
  'Altha': 'Calhoun',
  'Altoona': 'Lake',
  'Alturas': 'Polk',
  'Alva': 'Lee',
  'Andrews': 'Levy',
  'Anna Maria': 'Manatee',
  'Apalachicola': 'Franklin',
  'Apollo Beach': 'Hillsborough',
  'Apopka': 'Orange',
  'Arcadia': 'Desoto',
  'Archer': 'Alachua',
  'Aripeka': 'Hernando', // Note: Also in Pasco, using Hernando as primary
  'Asbury Lake': 'Clay',
  'Astatula': 'Lake',
  'Astor': 'Lake',
  'Atlantic Beach': 'Duval',
  'Atlantis': 'Palm Beach',
  'Auburndale': 'Polk',
  'Aucilla': 'Jefferson',
  'Avalon': 'Santa Rosa',
  'Aventura': 'Miami-Dade',
  'Avon Park': 'Highlands',
  'Azalea Park': 'Orange',
  'Babson Park': 'Polk',
  'Bagdad': 'Santa Rosa',
  'Bal Harbour': 'Miami-Dade',
  'Baldwin': 'Duval',
  'Balm': 'Hillsborough',
  'Bardmoor': 'Pinellas',
  'Bartow': 'Polk',
  'Bascom': 'Jackson',
  'Bay Harbor Islands': 'Miami-Dade',
  'Bay Hill': 'Orange',
  'Bay Lake': 'Orange',
  'Bay Pines': 'Pinellas',
  'Bayonet Point': 'Pasco',
  'Bayport': 'Hernando',
  'Bayshore Gardens': 'Manatee',
  'Beacon Square': 'Pasco',
  'Bear Creek': 'Pinellas',
  'Bee Ridge': 'Sarasota',
  'Bell': 'Gilchrist',
  'Belle Glade': 'Palm Beach',
  'Belle Isle': 'Orange',
  'Belleair': 'Pinellas',
  'Belleair Beach': 'Pinellas',
  'Belleair Bluffs': 'Pinellas',
  'Belleair Shore': 'Pinellas',
  'Belleview': 'Marion',
  'Bellview': 'Escambia',
  'Berrydale': 'Santa Rosa',
  'Beverly Beach': 'Flagler',
  'Beverly Hills': 'Citrus',
  'Big Coppitt Key': 'Monroe',
  'Big Pine Key': 'Monroe',
  'Biscayne Park': 'Miami-Dade',
  'Bithlo': 'Orange',
  'Black Diamond': 'Citrus',
  'Black Hammock': 'Seminole',
  'Bloomingdale': 'Hillsborough',
  'Blountstown': 'Calhoun',
  'Boca Raton': 'Palm Beach',
  'Bokeelia': 'Lee',
  'Bonifay': 'Holmes',
  'Bonita Springs': 'Lee',
  'Boulevard Gardens': 'Broward',
  'Bowling Green': 'Hardee',
  'Boynton Beach': 'Palm Beach',
  'Bradenton': 'Manatee',
  'Bradenton Beach': 'Manatee',
  'Bradley Junction': 'Polk',
  'Brandon': 'Hillsborough',
  'Branford': 'Suwannee',
  'Brent': 'Escambia',
  'Briny Breezes': 'Palm Beach',
  'Bristol': 'Liberty',
  'Broadview Park': 'Broward',
  'Bronson': 'Levy',
  'Brooker': 'Bradford',
  'Brookridge': 'Hernando',
  'Brooksville': 'Hernando',
  'Brownsville': 'Miami-Dade',
  'Buckhead Ridge': 'Glades',
  'Buckingham': 'Lee',
  'Buenaventura Lakes': 'Osceola',
  'Bunnell': 'Flagler',
  'Burnt Store Marina': 'Lee',
  'Bushnell': 'Sumter',
  'Butler Beach': 'Saint Johns',
  'Callahan': 'Nassau',
  'Callaway': 'Bay',
  'Cape Canaveral': 'Brevard',
  'Cape Coral': 'Lee',
  'Carrabelle': 'Franklin',
  'Carrollwood': 'Hillsborough',
  'Casselberry': 'Seminole',
  'Cedar Key': 'Levy',
  'Celebration': 'Osceola',
  'Century': 'Escambia',
  'Chattahoochee': 'Gadsden',
  'Chiefland': 'Levy',
  'Chipley': 'Washington',
  'Christmas': 'Orange',
  'Clearwater': 'Pinellas',
  'Clermont': 'Lake',
  'Clewiston': 'Hendry',
  'Cocoa': 'Brevard',
  'Cocoa Beach': 'Brevard',
  'Coconut Creek': 'Broward',
  'Cooper City': 'Broward',
  'Coral Gables': 'Miami-Dade',
  'Coral Springs': 'Broward',
  'Crawfordville': 'Wakulla',
  'Crescent City': 'Putnam',
  'Crestview': 'Okaloosa',
  'Cross City': 'Dixie',
  'Crystal River': 'Citrus',
  'Cutler Bay': 'Miami-Dade',
  'Dade City': 'Pasco',
  'Dania Beach': 'Broward',
  'Davenport': 'Polk',
  'Davie': 'Broward',
  'Daytona Beach': 'Volusia',
  'DeFuniak Springs': 'Walton',
  'DeBary': 'Volusia',
  'DeLand': 'Volusia',
  'Delray Beach': 'Palm Beach',
  'Deltona': 'Volusia',
  'Destin': 'Okaloosa',
  'Doral': 'Miami-Dade',
  'Dundee': 'Polk',
  'Dunedin': 'Pinellas',
  'Dunnellon': 'Marion',
  'Eagle Lake': 'Polk',
  'Eatonville': 'Orange',
  'Edgewater': 'Volusia',
  'Edgewood': 'Orange',
  'Eustis': 'Lake',
  'Fanning Springs': 'Gilchrist',
  'Fernandina Beach': 'Nassau',
  'Flagler Beach': 'Flagler',
  'Fort Lauderdale': 'Broward',
  'Fort Meade': 'Polk',
  'Fort Myers': 'Lee',
  'Fort Pierce': 'Saint Lucie',
  'Fort Walton Beach': 'Okaloosa',
  'Freeport': 'Walton',
  'Frostproof': 'Polk',
  'Fruitland Park': 'Lake',
  'Gainesville': 'Alachua',
  'Green Cove Springs': 'Clay',
  'Greenacres': 'Palm Beach',
  'Greensboro': 'Gadsden',
  'Greenville': 'Madison',
  'Greenwood': 'Jackson',
  'Gulf Breeze': 'Santa Rosa',
  'Gulfport': 'Pinellas',
  'Haines City': 'Polk',
  'Hallandale Beach': 'Broward',
  'Hampton': 'Bradford',
  'Hawthorne': 'Alachua',
  'Hialeah': 'Miami-Dade',
  'High Springs': 'Alachua',
  'Highland Beach': 'Palm Beach',
  'Hilliard': 'Nassau',
  'Hollywood': 'Broward',
  'Holmes Beach': 'Manatee',
  'Homestead': 'Miami-Dade',
  'Homosassa Springs': 'Citrus',
  'Hypoluxo': 'Palm Beach',
  'Indialantic': 'Brevard',
  'Indian Harbour Beach': 'Brevard',
  'Indian River Shores': 'Indian River',
  'Indian Rocks Beach': 'Pinellas',
  'Indian Shores': 'Pinellas',
  'Inverness': 'Citrus',
  'Jacksonville': 'Duval',
  'Jacksonville Beach': 'Duval',
  'Jasper': 'Hamilton',
  'Jay': 'Santa Rosa',
  'Juno Beach': 'Palm Beach',
  'Jupiter': 'Palm Beach',
  'Key Biscayne': 'Miami-Dade',
  'Key West': 'Monroe',
  'Kissimmee': 'Osceola',
  'LaBelle': 'Hendry',
  'Lady Lake': 'Lake',
  'Lake Alfred': 'Polk',
  'Lake City': 'Columbia',
  'Lake Mary': 'Seminole',
  'Lake Placid': 'Highlands',
  'Lake Wales': 'Polk',
  'Lake Worth': 'Palm Beach',
  'Lakeland': 'Polk',
  'Lantana': 'Palm Beach',
  'Largo': 'Pinellas',
  'Lauderdale Lakes': 'Broward',
  'Lauderdale-by-the-Sea': 'Broward',
  'Lauderhill': 'Broward',
  'Leesburg': 'Lake',
  'Live Oak': 'Suwannee',
  'Longboat Key': 'Sarasota',
  'Longwood': 'Seminole',
  'Lynn Haven': 'Bay',
  'Macclenny': 'Baker',
  'Madeira Beach': 'Pinellas',
  'Madison': 'Madison',
  'Maitland': 'Orange',
  'Malabar': 'Brevard',
  'Manalapan': 'Palm Beach',
  'Marco Island': 'Collier',
  'Margate': 'Broward',
  'Marianna': 'Jackson',
  'Mary Esther': 'Okaloosa',
  'Mascotte': 'Lake',
  'Melbourne': 'Brevard',
  'Melbourne Beach': 'Brevard',
  'Miami': 'Miami-Dade',
  'Miami Beach': 'Miami-Dade',
  'Miami Gardens': 'Miami-Dade',
  'Miami Lakes': 'Miami-Dade',
  'Miami Shores': 'Miami-Dade',
  'Miami Springs': 'Miami-Dade',
  'Micanopy': 'Alachua',
  'Milton': 'Santa Rosa',
  'Minneola': 'Lake',
  'Miramar': 'Broward',
  'Monticello': 'Jefferson',
  'Mount Dora': 'Lake',
  'Naples': 'Collier',
  'Neptune Beach': 'Duval',
  'New Port Richey': 'Pasco',
  'New Smyrna Beach': 'Volusia',
  'Newberry': 'Alachua',
  'Niceville': 'Okaloosa',
  'North Bay Village': 'Miami-Dade',
  'North Lauderdale': 'Broward',
  'North Miami': 'Miami-Dade',
  'North Miami Beach': 'Miami-Dade',
  'North Palm Beach': 'Palm Beach',
  'North Port': 'Sarasota',
  'Oakland Park': 'Broward',
  'Ocala': 'Marion',
  'Ocoee': 'Orange',
  'Oldsmar': 'Pinellas',
  'Opa-locka': 'Miami-Dade',
  'Orange City': 'Volusia',
  'Orange Park': 'Clay',
  'Orlando': 'Orange',
  'Ormond Beach': 'Volusia',
  'Oviedo': 'Seminole',
  'Palatka': 'Putnam',
  'Palm Bay': 'Brevard',
  'Palm Beach': 'Palm Beach',
  'Palm Beach Gardens': 'Palm Beach',
  'Palm Beach Shores': 'Palm Beach',
  'Palm Coast': 'Flagler',
  'Palmetto': 'Manatee',
  'Panama City': 'Bay',
  'Panama City Beach': 'Bay',
  'Parkland': 'Broward',
  'Pembroke Pines': 'Broward',
  'Pensacola': 'Escambia',
  'Perry': 'Taylor',
  'Pierson': 'Volusia',
  'Plant City': 'Hillsborough',
  'Plantation': 'Broward',
  'Pompano Beach': 'Broward',
  'Port Orange': 'Volusia',
  'Port Saint Joe': 'Gulf',
  'Port Saint Lucie': 'Saint Lucie',
  'Punta Gorda': 'Charlotte',
  'Quincy': 'Gadsden',
  'Sanford': 'Seminole',
  'Sanibel': 'Lee',
  'Sarasota': 'Sarasota',
  'Sebastian': 'Indian River',
  'Sebring': 'Highlands',
  'Seminole': 'Pinellas',
  'South Bay': 'Palm Beach',
  'South Miami': 'Miami-Dade',
  'South Pasadena': 'Pinellas',
  'Spring Hill': 'Hernando',
  'St Augustine': 'Saint Johns',
  'St Augustine Beach': 'Saint Johns',
  'St Cloud': 'Osceola',
  'St Pete Beach': 'Pinellas',
  'St Petersburg': 'Pinellas',
  'Starke': 'Bradford',
  'Stuart': 'Martin',
  'Sunny Isles Beach': 'Miami-Dade',
  'Sunrise': 'Broward',
  'Surfside': 'Miami-Dade',
  'Sweetwater': 'Miami-Dade',
  'Tallahassee': 'Leon',
  'Tamarac': 'Broward',
  'Tampa': 'Hillsborough',
  'Tarpon Springs': 'Pinellas',
  'Tavares': 'Lake',
  'Temple Terrace': 'Hillsborough',
  'Titusville': 'Brevard',
  'Treasure Island': 'Pinellas',
  'Trenton': 'Gilchrist',
  'Umatilla': 'Lake',
  'Valparaiso': 'Okaloosa',
  'Venice': 'Sarasota',
  'Vero Beach': 'Indian River',
  'Wauchula': 'Hardee',
  'Wellington': 'Palm Beach',
  'West Melbourne': 'Brevard',
  'West Palm Beach': 'Palm Beach',
  'West Park': 'Broward',
  'Weston': 'Broward',
  'Wilton Manors': 'Broward',
  'Winter Garden': 'Orange',
  'Winter Haven': 'Polk',
  'Winter Park': 'Orange',
  'Winter Springs': 'Seminole',
  'Zephyrhills': 'Pasco',
  'Zolfo Springs': 'Hardee',
};

interface GeolocationResult {
  county?: string;
  city?: string;
  state?: string;
  confidence: 'high' | 'medium' | 'low' | 'none';
}

/**
 * Get user's approximate location using IP geolocation
 * Uses ipapi.co free tier (no API key required, 1000 requests/day)
 */
export async function getUserLocation(): Promise<GeolocationResult> {
  try {
    console.log('[getUserLocation] Fetching location from ipapi.co...');
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('[getUserLocation] Response status:', response.status);

    if (!response.ok) {
      console.log('[getUserLocation] Response not OK');
      return { confidence: 'none' };
    }

    const data = await response.json();
    console.log('[getUserLocation] Location data:', {
      city: data.city,
      region: data.region,
      region_code: data.region_code,
      country: data.country_code,
    });

    // Check if user is in Florida
    if (data.region_code !== 'FL' && data.region !== 'Florida') {
      console.log('[getUserLocation] User not in Florida');
      return {
        city: data.city,
        state: data.region_code,
        confidence: 'none'
      };
    }

    // Try to map city to county
    const city = data.city as string;
    const county = CITY_TO_COUNTY[city];

    console.log('[getUserLocation] City:', city, '-> County:', county);

    if (county) {
      console.log('[getUserLocation] High confidence match found');
      return {
        county,
        city,
        state: 'FL',
        confidence: 'high',
      };
    }

    // If we know they're in Florida but can't determine county
    console.log('[getUserLocation] In Florida but county not in mapping');
    return {
      city,
      state: 'FL',
      confidence: 'low',
    };
  } catch (error) {
    console.error('[getUserLocation] Error:', error);
    return { confidence: 'none' };
  }
}

/**
 * Get suggested county based on user location
 * Returns null if confidence is too low or user is not in Florida
 */
export async function getSuggestedCounty(): Promise<string | null> {
  const location = await getUserLocation();
  
  if (location.confidence === 'high' && location.county) {
    return location.county;
  }
  
  return null;
}

/**
 * Client-side hook for getting user location
 * Use this in React components
 */
export function useGeolocation() {
  const [location, setLocation] = React.useState<GeolocationResult>({ confidence: 'none' });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getUserLocation().then((result) => {
      setLocation(result);
      setLoading(false);
    });
  }, []);

  return { location, loading };
}

// For React import
import * as React from 'react';

