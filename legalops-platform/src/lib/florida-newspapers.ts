/**
 * Florida Newspapers Database for Fictitious Name Publication
 * 
 * Comprehensive list of newspapers that publish legal notices (fictitious names)
 * organized by county with contact information and step-by-step instructions.
 */

export interface Newspaper {
  name: string;
  phone: string;
  email?: string;
  website?: string;
  estimatedCost: string;
  processingTime: string;
  instructions: string[];
  notes?: string;
}

export interface CountyNewspapers {
  county: string;
  newspapers: Newspaper[];
}

/**
 * Database of Florida newspapers by county that publish fictitious name notices
 * 
 * Note: This is a curated list of newspapers known to publish legal notices.
 * Costs and contact information are approximate and should be verified.
 */
export const FLORIDA_NEWSPAPERS_BY_COUNTY: CountyNewspapers[] = [
  {
    county: 'Miami-Dade',
    newspapers: [
      {
        name: 'Miami\'s Community Newspapers',
        phone: '(305) 669-7355',
        email: 'legalnotices@communitynewspapers.com',
        website: 'https://communitynewspapers.com/legalnotices/',
        estimatedCost: '$75 - $125',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (305) 669-7355 or email legalnotices@communitynewspapers.com',
          'Request to publish a "Fictitious Name Notice" for Miami-Dade County',
          'Provide your fictitious name exactly as you want it published',
          'Provide your legal name and business address',
          'They will prepare the notice text for you (standard format)',
          'Pay by credit card over the phone or via invoice',
          'Receive proof of publication via email within 1-2 weeks',
        ],
        notes: 'Designated record newspaper for legal notices in Miami-Dade County.',
      },
      {
        name: 'Miami Herald',
        phone: '(305) 376-2677',
        website: 'https://www.miamiherald.com',
        estimatedCost: '$150 - $250',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (305) 376-2677 and ask for the Legal Notices department',
          'Request to publish a "Fictitious Name Registration Notice"',
          'Provide your fictitious name and business details',
          'They will quote you a price based on word count',
          'Submit payment and approve the notice text',
          'Receive affidavit of publication by mail or email',
        ],
        notes: 'Major daily newspaper with wide circulation.',
      },
      {
        name: 'El Nuevo Herald',
        phone: '(305) 376-2677',
        website: 'https://www.elnuevoherald.com',
        estimatedCost: '$150 - $250',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (305) 376-2677 and ask for Legal Notices',
          'Request "Fictitious Name Notice" publication',
          'Provide your business information',
          'Receive quote and submit payment',
          'Approve notice text',
          'Receive affidavit of publication',
        ],
        notes: 'Spanish-language newspaper serving Miami-Dade County.',
      },
    ],
  },
  {
    county: 'Broward',
    newspapers: [
      {
        name: 'Broward\'s Community Newspapers',
        phone: '(954) 356-4458',
        email: 'legalnotices@communitynewspapers.com',
        website: 'https://communitynewspapers.com/legalnotices/',
        estimatedCost: '$75 - $125',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (954) 356-4458 or email legalnotices@communitynewspapers.com',
          'Request to publish a "Fictitious Name Notice" for Broward County',
          'Provide your fictitious name exactly as you want it published',
          'Provide your legal name and business address',
          'They will prepare the notice text for you (standard format)',
          'Pay by credit card over the phone or via invoice',
          'Receive proof of publication via email within 1-2 weeks',
        ],
        notes: 'Publishes legal notices for Broward County.',
      },
      {
        name: 'South Florida Sun-Sentinel',
        phone: '(954) 356-4000',
        website: 'https://www.sun-sentinel.com',
        estimatedCost: '$150 - $250',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (954) 356-4000 and ask for Legal Advertising',
          'Request to publish a "Fictitious Name Notice"',
          'Provide your business information',
          'Receive a quote based on word count',
          'Submit payment and approve notice',
          'Receive proof of publication',
        ],
        notes: 'Major daily newspaper serving Broward County.',
      },
      {
        name: 'Broward Daily Business Review',
        phone: '(954) 468-2600',
        website: 'https://www.law.com/dailybusinessreview/',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (954) 468-2600 and ask for Legal Notices',
          'Request "Fictitious Name Publication"',
          'Provide your DBA details',
          'Receive quote',
          'Submit payment and approve notice',
          'Receive affidavit of publication',
        ],
        notes: 'Business-focused legal newspaper.',
      },
    ],
  },
  {
    county: 'Palm Beach',
    newspapers: [
      {
        name: 'Palm Beach Post',
        phone: '(561) 820-4663',
        website: 'https://www.palmbeachpost.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (561) 820-4663 for Legal Notices department',
          'Request "Fictitious Name Publication"',
          'Provide your DBA name and business details',
          'Receive quote and submit payment',
          'Approve notice text before publication',
          'Receive affidavit of publication',
        ],
        notes: 'Major daily newspaper serving Palm Beach County.',
      },
      {
        name: 'Palm Beach Daily News',
        phone: '(561) 820-3800',
        website: 'https://www.palmbeachdailynews.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (561) 820-3800 and ask for Legal Advertising',
          'Request "Fictitious Name Notice"',
          'Provide your business information',
          'Receive quote',
          'Pay and approve notice',
          'Receive proof of publication',
        ],
        notes: 'Daily newspaper serving Palm Beach area.',
      },
    ],
  },
  {
    county: 'Orange',
    newspapers: [
      {
        name: 'Orlando Sentinel',
        phone: '(407) 420-5000',
        website: 'https://www.orlandosentinel.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (407) 420-5000 and ask for Legal Advertising',
          'Request "Fictitious Name Notice" publication',
          'Provide your fictitious name and business information',
          'Receive pricing quote',
          'Submit payment and approve notice',
          'Receive proof of publication via mail or email',
        ],
        notes: 'Major daily newspaper serving Orange County.',
      },
      {
        name: 'The Apopka Chief',
        phone: '(407) 886-2777',
        email: 'legals@theapopkachief.com',
        website: 'https://theapopkachief.com',
        estimatedCost: '$75 - $150',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (407) 886-2777 or email legals@theapopkachief.com',
          'Request "Fictitious Name Notice" publication',
          'Provide your business information',
          'Receive quote',
          'Submit payment and approve notice',
          'Receive proof of publication',
        ],
        notes: 'Community newspaper serving Apopka and Orange County.',
      },
      {
        name: 'West Orange Times',
        phone: '(407) 656-2121',
        website: 'https://www.orangeobserver.com',
        estimatedCost: '$75 - $150',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (407) 656-2121 and ask for Legal Notices',
          'Request "Fictitious Name Publication"',
          'Provide your DBA details',
          'Receive quote',
          'Pay and approve notice',
          'Receive affidavit of publication',
        ],
        notes: 'Community newspaper serving West Orange County.',
      },
    ],
  },
  {
    county: 'Hillsborough',
    newspapers: [
      {
        name: 'Tampa Bay Times',
        phone: '(727) 893-8111',
        website: 'https://www.tampabay.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (727) 893-8111 and ask for Legal Notices',
          'Request to publish a "Fictitious Name Registration"',
          'Provide your DBA name and business details',
          'Receive quote based on notice length',
          'Pay and approve the notice text',
          'Receive affidavit of publication',
        ],
        notes: 'Major daily newspaper serving Tampa Bay area.',
      },
      {
        name: 'Tampa Bay Newspapers',
        phone: '(727) 397-5563',
        website: 'https://www.tbnweekly.com',
        estimatedCost: '$75 - $150',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (727) 397-5563 and ask for Legal Notices',
          'Request "Fictitious Name Publication"',
          'Provide your business information',
          'Receive quote',
          'Submit payment and approve notice',
          'Receive affidavit of publication',
        ],
        notes: 'Community newspaper group serving Tampa Bay.',
      },
    ],
  },
  {
    county: 'Pinellas',
    newspapers: [
      {
        name: 'Tampa Bay Times',
        phone: '(727) 893-8111',
        website: 'https://www.tampabay.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (727) 893-8111 and ask for Legal Notices',
          'Request to publish a "Fictitious Name Registration"',
          'Provide your DBA name and business details',
          'Receive quote based on notice length',
          'Pay and approve the notice text',
          'Receive affidavit of publication',
        ],
        notes: 'Major daily newspaper serving Pinellas County and St. Petersburg area.',
      },
      {
        name: 'Tampa Bay Newspapers',
        phone: '(727) 397-5563',
        website: 'https://www.tbnweekly.com',
        estimatedCost: '$75 - $150',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (727) 397-5563 and ask for Legal Notices',
          'Request "Fictitious Name Publication"',
          'Provide your business information',
          'Receive quote',
          'Submit payment and approve notice',
          'Receive affidavit of publication',
        ],
        notes: 'Community newspaper group serving Pinellas County.',
      },
      {
        name: 'Seminole/Beach Beacon',
        phone: '(727) 397-5563',
        website: 'https://www.tbnweekly.com',
        estimatedCost: '$75 - $150',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (727) 397-5563 and ask for Legal Notices',
          'Request "Fictitious Name Publication"',
          'Provide your business information',
          'Receive quote',
          'Submit payment and approve notice',
          'Receive affidavit of publication',
        ],
        notes: 'Community newspaper serving Seminole and beach communities in Pinellas County.',
      },
    ],
  },
  {
    county: 'Duval',
    newspapers: [
      {
        name: 'Florida Times-Union',
        phone: '(904) 359-4111',
        website: 'https://www.jacksonville.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (904) 359-4111 and ask for Legal Advertising',
          'Request "Fictitious Name Notice" publication',
          'Provide your business information',
          'Receive pricing quote',
          'Submit payment and approve notice',
          'Receive proof of publication',
        ],
        notes: 'Primary newspaper for Jacksonville/Duval County.',
      },
    ],
  },
  {
    county: 'Lee',
    newspapers: [
      {
        name: 'News-Press (Fort Myers)',
        phone: '(239) 335-0200',
        website: 'https://www.news-press.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (239) 335-0200 and ask for Legal Notices',
          'Request "Fictitious Name Publication"',
          'Provide your DBA details',
          'Receive quote and payment instructions',
          'Approve notice text',
          'Receive affidavit of publication',
        ],
        notes: 'Serves Fort Myers and Lee County area.',
      },
    ],
  },
  {
    county: 'Polk',
    newspapers: [
      {
        name: 'The Ledger (Lakeland)',
        phone: '(863) 802-7000',
        website: 'https://www.theledger.com',
        estimatedCost: '$75 - $150',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (863) 802-7000 and ask for Legal Advertising',
          'Request "Fictitious Name Notice"',
          'Provide your business information',
          'Receive quote',
          'Submit payment and approve notice',
          'Receive proof of publication',
        ],
        notes: 'Primary newspaper for Polk County (Lakeland area).',
      },
    ],
  },
  {
    county: 'Collier',
    newspapers: [
      {
        name: 'Naples Daily News',
        phone: '(239) 262-3161',
        website: 'https://www.naplesnews.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (239) 262-3161 and ask for Legal Notices',
          'Request "Fictitious Name Publication"',
          'Provide your DBA name and business details',
          'Receive pricing quote',
          'Submit payment and approve notice',
          'Receive affidavit of publication',
        ],
        notes: 'Primary newspaper for Naples and Collier County.',
      },
    ],
  },
  {
    county: 'Sarasota',
    newspapers: [
      {
        name: 'Sarasota Herald-Tribune',
        phone: '(941) 361-4000',
        website: 'https://www.heraldtribune.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (941) 361-4000 and ask for Legal Advertising',
          'Request "Fictitious Name Notice"',
          'Provide your business information',
          'Receive quote',
          'Pay and approve notice',
          'Receive proof of publication',
        ],
        notes: 'Serves Sarasota County and surrounding areas.',
      },
    ],
  },
  {
    county: 'Brevard',
    newspapers: [
      {
        name: 'Florida Today',
        phone: '(321) 242-3500',
        website: 'https://www.floridatoday.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (321) 242-3500 and ask for Legal Notices',
          'Request "Fictitious Name Publication"',
          'Provide your DBA details',
          'Receive pricing quote',
          'Submit payment and approve notice',
          'Receive affidavit of publication',
        ],
        notes: 'Primary newspaper for Brevard County (Melbourne, Cocoa Beach area).',
      },
    ],
  },
  {
    county: 'Volusia',
    newspapers: [
      {
        name: 'Daytona Beach News-Journal',
        phone: '(386) 681-2300',
        website: 'https://www.news-journalonline.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (386) 681-2300 and ask for Legal Advertising',
          'Request "Fictitious Name Notice"',
          'Provide your business information',
          'Receive quote',
          'Pay and approve notice',
          'Receive proof of publication',
        ],
        notes: 'Serves Daytona Beach and Volusia County.',
      },
    ],
  },
  {
    county: 'Seminole',
    newspapers: [
      {
        name: 'Orlando Sentinel',
        phone: '(407) 420-5000',
        website: 'https://www.orlandosentinel.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (407) 420-5000 and ask for Legal Advertising',
          'Request "Fictitious Name Notice" for Seminole County',
          'Provide your fictitious name and business information',
          'Receive pricing quote',
          'Submit payment and approve notice',
          'Receive proof of publication via mail or email',
        ],
        notes: 'Also serves Seminole County (Sanford, Altamonte Springs area).',
      },
    ],
  },
  {
    county: 'Lake',
    newspapers: [
      {
        name: 'Daily Commercial',
        phone: '(352) 365-8200',
        website: 'https://www.dailycommercial.com',
        estimatedCost: '$75 - $150',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (352) 365-8200 and ask for Legal Notices',
          'Request "Fictitious Name Publication"',
          'Provide your DBA details',
          'Receive quote',
          'Submit payment and approve notice',
          'Receive affidavit of publication',
        ],
        notes: 'Primary newspaper for Lake County (Leesburg, Clermont area).',
      },
    ],
  },
  {
    county: 'Marion',
    newspapers: [
      {
        name: 'Ocala Star-Banner',
        phone: '(352) 867-4010',
        website: 'https://www.ocala.com',
        estimatedCost: '$75 - $150',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (352) 867-4010 and ask for Legal Advertising',
          'Request "Fictitious Name Notice"',
          'Provide your business information',
          'Receive quote',
          'Pay and approve notice',
          'Receive proof of publication',
        ],
        notes: 'Primary newspaper for Marion County (Ocala area).',
      },
    ],
  },
  {
    county: 'St. Johns',
    newspapers: [
      {
        name: 'St. Augustine Record',
        phone: '(904) 819-3492',
        website: 'https://www.staugustine.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (904) 819-3492 and ask for Legal Notices',
          'Request "Fictitious Name Publication"',
          'Provide your DBA details',
          'Receive pricing quote',
          'Submit payment and approve notice',
          'Receive affidavit of publication',
        ],
        notes: 'Serves St. Augustine and St. Johns County.',
      },
    ],
  },
  {
    county: 'Escambia',
    newspapers: [
      {
        name: 'Pensacola News Journal',
        phone: '(850) 435-8500',
        website: 'https://www.pnj.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (850) 435-8500 and ask for Legal Advertising',
          'Request "Fictitious Name Notice"',
          'Provide your business information',
          'Receive quote',
          'Pay and approve notice',
          'Receive proof of publication',
        ],
        notes: 'Primary newspaper for Pensacola and Escambia County.',
      },
    ],
  },
  {
    county: 'Leon',
    newspapers: [
      {
        name: 'Tallahassee Democrat',
        phone: '(850) 599-2100',
        website: 'https://www.tallahassee.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (850) 599-2100 and ask for Legal Notices',
          'Request "Fictitious Name Publication"',
          'Provide your DBA details',
          'Receive pricing quote',
          'Submit payment and approve notice',
          'Receive affidavit of publication',
        ],
        notes: 'Primary newspaper for Tallahassee and Leon County.',
      },
    ],
  },
  {
    county: 'Alachua',
    newspapers: [
      {
        name: 'The Gainesville Sun',
        phone: '(352) 374-5000',
        website: 'https://www.gainesville.com',
        estimatedCost: '$75 - $150',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (352) 374-5000 and ask for Legal Advertising',
          'Request "Fictitious Name Notice"',
          'Provide your business information',
          'Receive quote',
          'Pay and approve notice',
          'Receive proof of publication',
        ],
        notes: 'Primary newspaper for Gainesville and Alachua County.',
      },
    ],
  },
  {
    county: 'Manatee',
    newspapers: [
      {
        name: 'Bradenton Herald',
        phone: '(941) 748-0411',
        website: 'https://www.bradenton.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (941) 748-0411 and ask for Legal Notices',
          'Request "Fictitious Name Publication"',
          'Provide your DBA details',
          'Receive quote',
          'Submit payment and approve notice',
          'Receive affidavit of publication',
        ],
        notes: 'Serves Bradenton and Manatee County.',
      },
    ],
  },
  {
    county: 'Pasco',
    newspapers: [
      {
        name: 'Tampa Bay Times',
        phone: '(727) 893-8111',
        website: 'https://www.tampabay.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (727) 893-8111 and ask for Legal Notices',
          'Request "Fictitious Name Publication" for Pasco County',
          'Provide your DBA details',
          'Receive quote',
          'Submit payment and approve notice',
          'Receive affidavit of publication',
        ],
        notes: 'Also serves Pasco County (New Port Richey area).',
      },
    ],
  },
  {
    county: 'Osceola',
    newspapers: [
      {
        name: 'Osceola News-Gazette',
        phone: '(407) 846-7600',
        website: 'https://www.aroundosceola.com',
        estimatedCost: '$75 - $150',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (407) 846-7600 and ask for Legal Notices',
          'Request "Fictitious Name Publication"',
          'Provide your business information',
          'Receive quote',
          'Pay and approve notice',
          'Receive proof of publication',
        ],
        notes: 'Primary newspaper for Kissimmee and Osceola County.',
      },
    ],
  },
  {
    county: 'St. Lucie',
    newspapers: [
      {
        name: 'TCPalm (Treasure Coast)',
        phone: '(772) 221-4100',
        website: 'https://www.tcpalm.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (772) 221-4100 and ask for Legal Advertising',
          'Request "Fictitious Name Notice"',
          'Provide your DBA details',
          'Receive pricing quote',
          'Submit payment and approve notice',
          'Receive affidavit of publication',
        ],
        notes: 'Serves Port St. Lucie and St. Lucie County.',
      },
    ],
  },
  {
    county: 'Martin',
    newspapers: [
      {
        name: 'TCPalm (Treasure Coast)',
        phone: '(772) 221-4100',
        website: 'https://www.tcpalm.com',
        estimatedCost: '$100 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (772) 221-4100 and ask for Legal Advertising',
          'Request "Fictitious Name Notice" for Martin County',
          'Provide your DBA details',
          'Receive pricing quote',
          'Submit payment and approve notice',
          'Receive affidavit of publication',
        ],
        notes: 'Also serves Stuart and Martin County.',
      },
    ],
  },
  {
    county: 'Charlotte',
    newspapers: [
      {
        name: 'Charlotte Sun',
        phone: '(941) 206-1000',
        website: 'https://www.yoursun.com',
        estimatedCost: '$75 - $150',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (941) 206-1000 and ask for Legal Notices',
          'Request "Fictitious Name Publication"',
          'Provide your business information',
          'Receive quote',
          'Pay and approve notice',
          'Receive proof of publication',
        ],
        notes: 'Primary newspaper for Punta Gorda and Charlotte County.',
      },
    ],
  },
  {
    county: 'Okaloosa',
    newspapers: [
      {
        name: 'Northwest Florida Daily News',
        phone: '(850) 863-1111',
        website: 'https://www.nwfdailynews.com',
        estimatedCost: '$75 - $150',
        processingTime: '1-2 weeks',
        instructions: [
          'Call (850) 863-1111 and ask for Legal Advertising',
          'Request "Fictitious Name Notice"',
          'Provide your DBA details',
          'Receive quote',
          'Submit payment and approve notice',
          'Receive affidavit of publication',
        ],
        notes: 'Serves Fort Walton Beach and Okaloosa County.',
      },
    ],
  },
  // For counties not specifically listed above, provide helpful instructions
  {
    county: 'DEFAULT',
    newspapers: [
      {
        name: 'Find a Qualified Newspaper in Your County',
        phone: 'See instructions below',
        estimatedCost: '$75 - $200',
        processingTime: '1-2 weeks',
        instructions: [
          'Visit FloridaPublicNotices.com and filter by your county to see all qualified newspapers',
          'OR search Google for "[Your County Name] Florida legal notices newspaper"',
          'Call the newspaper and ask for the "Legal Notices" or "Legal Advertising" department',
          'Tell them: "I need to publish a Fictitious Name Notice for a DBA registration"',
          'Provide your fictitious name exactly as you registered it',
          'Provide your legal name (or business name) and principal business address',
          'Ask for a price quote - typically $75-$200 depending on the newspaper',
          'The newspaper will prepare the notice text in the required legal format for you',
          'Review and approve the notice text before they publish it',
          'Pay by credit card, check, or invoice (payment methods vary by newspaper)',
          'After publication, request an "Affidavit of Publication" or "Proof of Publication"',
          'Keep the affidavit for your records - you may need it for future filings',
        ],
        notes: 'Florida law requires publication in a newspaper of general circulation in your county. Most counties have multiple qualified newspapers. You can choose any qualified newspaper - there is no "official" or "required" newspaper.',
      },
    ],
  },
];

/**
 * Get newspapers for a specific county
 */
export function getNewspapersByCounty(county: string): Newspaper[] {
  const countyData = FLORIDA_NEWSPAPERS_BY_COUNTY.find(
    (c) => c.county.toLowerCase() === county.toLowerCase()
  );

  // If county not found, return default instructions
  if (!countyData) {
    const defaultData = FLORIDA_NEWSPAPERS_BY_COUNTY.find((c) => c.county === 'DEFAULT');
    return defaultData?.newspapers || [];
  }

  return countyData.newspapers;
}

/**
 * Get all counties that have newspaper data
 */
export function getCountiesWithNewspapers(): string[] {
  return FLORIDA_NEWSPAPERS_BY_COUNTY.map((c) => c.county);
}

