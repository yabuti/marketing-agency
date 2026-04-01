export const ETHIOPIAN_CITIES = [
  'Addis Ababa', 'Dire Dawa', 'Gondar', "Mek'ele", 'Adama / Nazret',
  'Bahir Dar', 'Dessie', 'Hawassa', 'Jimma', 'Bishoftu',
  'Harar', 'Sodo', 'Shashamene', 'Arba Minch', 'Adigrat', 'Debre Birhan',
];

export const CITY_TRANSLATIONS = {
  en: {
    'Addis Ababa': 'Addis Ababa', 'Dire Dawa': 'Dire Dawa', 'Gondar': 'Gondar',
    "Mek'ele": "Mek'ele", 'Adama / Nazret': 'Adama / Nazret', 'Bahir Dar': 'Bahir Dar',
    'Dessie': 'Dessie', 'Hawassa': 'Hawassa', 'Jimma': 'Jimma', 'Bishoftu': 'Bishoftu',
    'Harar': 'Harar', 'Sodo': 'Sodo', 'Shashamene': 'Shashamene',
    'Arba Minch': 'Arba Minch', 'Adigrat': 'Adigrat', 'Debre Birhan': 'Debre Birhan',
  },
  am: {
    'Addis Ababa': 'አዲስ አበባ', 'Dire Dawa': 'ድሬ ዳዋ', 'Gondar': 'ጎንደር',
    "Mek'ele": 'መቀሌ', 'Adama / Nazret': 'አዳማ / ናዝሬት', 'Bahir Dar': 'ባህር ዳር',
    'Dessie': 'ደሴ', 'Hawassa': 'ሐዋሳ', 'Jimma': 'ጅማ', 'Bishoftu': 'ቢሾፍቱ',
    'Harar': 'ሐረር', 'Sodo': 'ሶዶ', 'Shashamene': 'ሻሸመኔ',
    'Arba Minch': 'አርባ ምንጭ', 'Adigrat': 'አዲግራት', 'Debre Birhan': 'ደብረ ብርሃን',
  },
  or: {
    'Addis Ababa': 'Finfinnee', 'Dire Dawa': 'Dire Dhawaa', 'Gondar': 'Gondar',
    "Mek'ele": "Maqalee", 'Adama / Nazret': 'Adaamaa', 'Bahir Dar': 'Baahir Dar',
    'Dessie': 'Dessie', 'Hawassa': 'Hawwasaa', 'Jimma': 'Jimmaa', 'Bishoftu': 'Bishooftuu',
    'Harar': 'Harar', 'Sodo': 'Sodo', 'Shashamene': 'Shaashamannee',
    'Arba Minch': 'Arba Minch', 'Adigrat': 'Adigrat', 'Debre Birhan': 'Debre Birhan',
  },
};

export const BUSINESS_TYPE_GROUPS = {
  en: [
    { group: 'Startups & Entrepreneurs', items: [
      'Tech startups (apps, software, IT services)', 'E-commerce businesses',
      'Digital service startups', 'Creative startups (design, media, photography)',
    ]},
    { group: 'Retail & Wholesale', items: [
      'Shops and minimarkets', 'Clothing and fashion stores', 'Shoe and accessories shops',
      'Electronics and mobile phone shops', 'Cosmetics and beauty product shops',
      'Bookshops and stationery shops', 'Furniture and home appliance shops',
      'Food and beverage wholesalers', 'Construction material suppliers',
      'Agricultural input suppliers', 'Textile and garment wholesalers',
    ]},
    { group: 'Hospitality & Tourism', items: [
      'Restaurants and cafes', 'Traditional food houses',
      'Event and conference venues', 'Car rental services',
    ]},
    { group: 'Educational Institutions', items: [
      'Private schools (KG–Grade 12)', 'Training centers', 'Language schools',
      'Computer and IT training centers', 'Tutorial and exam preparation centers',
      'Online learning platforms', 'Educational consultancy services',
    ]},
    { group: 'Service Providers', items: [
      'Advertising and marketing agencies', 'Printing and publishing services',
      'Graphic design and branding services', 'Accounting and auditing firms',
      'Legal and consultancy services', 'Cleaning and maintenance services',
      'Security service providers', 'Beauty salons and barber shops',
      'Transportation and logistics services',
    ]},
    { group: 'Manufacturers', items: [
      'Food and beverage processing enterprises', 'Garment and textile manufacturers',
      'Shoe and leather product manufacturers', 'Plastic product manufacturers',
      'Metal and wood furniture manufacturers', 'Building material manufacturers',
      'Packaging and labeling manufacturers',
    ]},
    { group: 'Other', items: ['Other'] },
  ],
  am: [
    { group: 'ስታርተፖች እና ስራ ፈጣሪዎች', items: [
      'የቴክ ስታርተፕ (አፕ፣ ሶፍትዌር፣ አይቲ)', 'የኢ-ኮሜርስ ንግዶች',
      'የዲጂታል አገልግሎት ስታርተፕ', 'ፈጠራ ስታርተፕ (ዲዛይን፣ ሚዲያ፣ ፎቶ)',
    ]},
    { group: 'ችርቻሮ እና ጅምላ ንግድ', items: [
      'ሱቆች እና ሚኒ ማርኬቶች', 'የልብስ እና ፋሽን ሱቆች', 'የጫማ እና ጌጣጌጥ ሱቆች',
      'የኤሌክትሮኒክስ እና ሞባይል ሱቆች', 'የኮስሜቲክስ እና ውበት ምርቶች ሱቆች',
      'የመጽሐፍ እና ቁሳቁስ ሱቆች', 'የቤት እቃ ሱቆች',
      'የምግብ እና መጠጥ ጅምላ ሻጮች', 'የግንባታ ቁሳቁስ አቅራቢዎች',
      'የግብርና ግብዓት አቅራቢዎች', 'የጨርቃጨርቅ ጅምላ ሻጮች',
    ]},
    { group: 'ሆቴልና ቱሪዝም', items: [
      'ምግብ ቤቶች እና ካፌዎች', 'ባህላዊ ምግብ ቤቶች',
      'የዝግጅት አዳራሾች', 'የመኪና ኪራይ አገልግሎቶች',
    ]},
    { group: 'የትምህርት ተቋማት', items: [
      'የግል ትምህርት ቤቶች (KG–12)', 'የስልጠና ማዕከሎች', 'የቋንቋ ትምህርት ቤቶች',
      'የኮምፒዩተር እና አይቲ ስልጠና', 'የትምህርት ዝግጅት ማዕከሎች',
      'የኦንላይን ትምህርት', 'የትምህርት አማካሪ አገልግሎቶች',
    ]},
    { group: 'አገልግሎት ሰጪዎች', items: [
      'የማስታወቂያ ኤጀንሲዎች', 'የህትመት አገልግሎቶች',
      'የግራፊክ ዲዛይን', 'የሂሳብ ድርጅቶች',
      'የህግ አማካሪ', 'የጽዳት አገልግሎቶች',
      'የጥበቃ አገልግሎቶች', 'የውበት ሳሎኖች',
      'የትራንስፖርት አገልግሎቶች',
    ]},
    { group: 'አምራቾች', items: [
      'የምግብ እና መጠጥ ማምረቻዎች', 'የጨርቃጨርቅ አምራቾች',
      'የጫማ አምራቾች', 'የፕላስቲክ ምርቶች አምራቾች',
      'የብረት እና እንጨት ቤት እቃ አምራቾች', 'የግንባታ ቁሳቁስ አምራቾች',
      'የማሸጊያ አምራቾች',
    ]},
    { group: 'ሌላ', items: ['ሌላ'] },
  ],
  or: [
    { group: 'Dhaabbilee Haaraa fi Hojjettoota', items: [
      'Startup teeknoloojii', 'Daldala e-commerce',
      'Startup tajaajila dijitaalaa', 'Startup uumamaa',
    ]},
    { group: 'Daldala Xiqqaa fi Guddaa', items: [
      'Suuqii fi minimarket', 'Suuqii uffata', 'Suuqii kophee',
      'Suuqii elektirooniksii', 'Suuqii kosmetiksii',
      'Suuqii kitaabaa', 'Suuqii meeshaa mana',
      'Gurgurtaa nyaataa fi dhugaatii', 'Dhiyeessaa meeshaa ijaarsa',
      'Dhiyeessaa qonnaa', 'Gurgurtaa suufii',
    ]},
    { group: 'Keessummaa fi Turizimii', items: [
      'Mana nyaataa fi kaafee', 'Mana nyaataa aadaa',
      'Bakka walgahii', 'Tajaajila kireeffannaa konkolaataa',
    ]},
    { group: 'Dhaabbilee Barnootaa', items: [
      'Mana barumsaa dhuunfaa', 'Giddugala leenjii', 'Mana barumsaa afaanii',
      'Leenjii kompiyuutaraa', 'Giddugala qormaataa',
      'Barnootaa online', 'Tajaajila gorsa barnootaa',
    ]},
    { group: 'Dhiyeessitootaa Tajaajilaa', items: [
      'Ejensii beeksisaa', 'Tajaajila maxxansaa',
      'Dizaayinii graafiiksii', 'Dhaabbata herregaa',
      'Gorsa seeraa', 'Tajaajila qulqullinaa',
      'Tajaajila eegumsa', 'Saloon miidhagina',
      'Tajaajila geejjibaa',
    ]},
    { group: 'Warshaalee', items: [
      'Warshaa nyaataa fi dhugaatii', 'Warshaa suufii',
      'Warshaa kophee', 'Warshaa plaastiksii',
      'Warshaa meeshaa mana', 'Warshaa meeshaa ijaarsa',
      'Warshaa maxxansaa',
    ]},
    { group: 'Kan Biroo', items: ['Kan Biroo'] },
  ],
};

// Flat list for English (used as stored value in DB)
export const BUSINESS_TYPES = BUSINESS_TYPE_GROUPS.en.flatMap(g => g.items);
