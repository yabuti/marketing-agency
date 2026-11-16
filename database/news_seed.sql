-- News articles seed — 2 articles
-- BEFORE running: copy the images to your server's uploads/news/ folder:
--   php-backend/news/image.png  → uploads/news/enterprise_week_1.png
--   php-backend/news/image2.png → uploads/news/ethiopia_tamrit_1.png
--   php-backend/news/image3.png → uploads/news/enterprise_week_2.png

-- ── Article 1: Enterprise Week Exhibition ─────────────────────
INSERT INTO news (
  title, title_am, title_or,
  content, content_am, content_or,
  category, is_published, source_url, source_urls
) VALUES (
  'Over 32 Million Birr in Market Linkages Created at Enterprise Week Exhibition',
  'በአውደ ርዕይና ባዛር ከ32 ሚሊዮን ብር በላይ የገበያ ትስስር መፍጠር ተቻለ',
  'Agaroo Miliyoona 32 Ol''aanaa Walitti Hidhamiinsa Gabaa Uumame',

  'The Enterprise Week Exhibition and Bazaar held at Meskel Square under the theme "Enterprise Productivity for National Prosperity" has concluded after five days. The Addis Ababa Labor and Skills Bureau announced that over 32,509,606 Birr in market linkages were created during the event. The bureau noted that the city''s manufacturing enterprises showcased their potential and demonstrated the preference for locally made products. The bureau''s Enterprise and Technology Development Sector Head, Mr. Mideksa Kebede, described the week as a special platform where Ethiopians proved their manufacturing capabilities and pride in local products. He highlighted that the beautiful roads, bicycle lanes, and green development works seen in the city are results of enterprise work. He also noted that the sector, being the backbone of the country''s economy, is being given focused attention to transition enterprises to larger industries. The bureau''s Employment and Food Security Sector Head, Mr. Asfaw Legese, described it as a successful platform where enterprises demonstrated they are producers bringing quality products to market, and where participants exchanged experience and knowledge. The bureau pledged to continue strengthening support in workspace, credit supply, and machine leasing. Citizens were called upon to buy and use locally made products to support enterprise growth. At the closing ceremony, it was announced that 10,921 enterprises had graduated from micro to small level, and over 2 million city residents had benefited from employment opportunities in recent years. In the participation competition, Kolfe Keranio Sub-city won 1st place, Gulele and Addis Ketema won 2nd, and Kirkos Sub-city won 3rd place.',

  'በ"የኢንተርፕራይዞች ምርታማነት ለሀገር ብልጽግና" መሪ ቃል በመስቀል አደባባይ ላለፉት አምስት ቀናት ሲካሄድ የቆየው የኢንተርፕራይዞች ሳምንት አውደ ርዕይና ባዛር ተጠናቋል። አውደ ርዕይና ባዛሩ ከ32 ሚሊዮን 509ሺ 606 ብር በላይ የገበያ ትስስር እንደተፈጠረበት የአዲስ አበባ ሥራና ክህሎት ቢሮ አስታውቋል። የከተማዋ አምራች ኢንተርፕራይዞች ያላቸውን እምቅ አቅም ለህዝብ ያሳዩበትና የሀገር በቀል ምርቶች ተመራጭነት በተግባር የተረጋገጠበት ሆኖ ማለፉንም አመላክቷል። በቢሮው የኢንተርፕራይዝና ቴክኖሎጂ ልማት ዘርፍ ኃላፊ አቶ ሚዴቅሳ ከበደ፤ ሳምንቱ ኢትዮጵያውያን ማምረት እንደሚችሉ እና በሀገር በቀል ምርቶች ላይ ያላቸውን ኩራት ያረጋገጡበት ልዩ መድረክ መሆኑን ገልጸዋል። በከተማዋ የሚታዩ ውብ መንገዶች፣ የብስክሌት መስመሮች እና የአረንጓዴ ልማት ሥራዎች የኢንተርፕራይዞች ውጤት መሆናቸውን ጠቅሰዋል። ዘርፉ የሀገሪቱ የኢኮኖሚ የጀርባ አጥንት በመሆኑ ወደ ትላልቅ ኢንዱስትሪዎች እንዲሸጋገሩ በትኩረት እንደሚሠራም አመላክተዋል። የቢሮው የሥራ ስምሪትና ምግብ ዋስትና ዘርፍ ኃላፊ አቶ አስፋው ለገሰ፤ ኢንተርፕራይዞች ከሥራ ፈላጊነት ተላቀው ጥራት ያላቸውን ምርቶች ለገበያ የሚያቀርቡ አምራቾች መሆናቸው የታየበትና እርስ በእርስ ልምድና እውቀት የተለዋወጡበት ስኬታማ መድረክ መሆኑን ገልጸዋል። ቢሮው የመሥሪያ ቦታ፣ የብድር አቅርቦት እና የማሽን ሊዝ ድጋፎችን ለወደፊቱም አጠናክሮ እንደሚቀጥል ጠቁሟል። 10,921 ኢንተርፕራይዞች ከጥቃቅን ወደ አነስተኛ ደረጃ መሸጋገራቸው ተገልጿል። ኮልፌ ቀራኒዮ ክፍለ ከተማ 1ኛ፣ ጉለሌ እና አዲስ ከተማ 2ኛ፣ ቂርቆስ ክፍለ ከተማ 3ኛ ደረጃን ይዘዋል።',

  'Agaroo Miliyoona 32 Ol''aanaa Walitti Hidhamiinsa Gabaa Uumame',

  'News', 1,
  'https://web.facebook.com/MolsFDRE',
  '["https://web.facebook.com/MolsFDRE","https://t.me/FDRE_MoLSofficial","https://tiktok.com/@mols_official","https://twitter.com/Jobs_Ministry","https://whatsapp.com/channel/0029VakCgcYI"]'
);

SET @news1_id = LAST_INSERT_ID();

INSERT INTO news_images (news_id, file_path, description, sort_order) VALUES
(@news1_id, 'uploads/news/enterprise_week_1.png', 'Enterprise Week Exhibition at Meskel Square', 0),
(@news1_id, 'uploads/news/enterprise_week_2.png', 'Award ceremony for top sub-cities', 1);


-- ── Article 2: Ethiopia Tamrit Expo 2018 ──────────────────────
INSERT INTO news (
  title, title_am, title_or,
  content, content_am, content_or,
  category, is_published, source_url, source_urls
) VALUES (
  'Participate in Ethiopia Tamrit Expo 2018!',
  'በኢትዮጵያ ታምርት ኤክስፖ 2018 ይሳተፉ!',
  'Expo Ethiopia Tamrit 2018 Irratti Hirmaadhu!',

  'Join us at the Ethiopia Tamrit Expo 2018 from Miyazia 24-28/2018 E.C. at the Addis Convention Center. Register using the link below to participate. https://ethiopiatamrit.et/made-in-ethiopia #ForComprehensiveSovereignty #EthiopiaMakes #WeAlsoBuy',

  'ከሚያዚያ 24-28/2018 ዓ.ም በአዲስ ኮንቬንሽን ማዕከል በመገኘት በኢትዮጵያ ታምርት ኤክስፖ ለመሳተፍ ከታች የተቀመጠውን ሊንክ ተጠቅመው ይመዝገቡ! https://ethiopiatamrit.et/made-in-ethiopia #ለሁለንተናዊ_ሉዓላዊነት #ኢትዮጵያ_ታምርት #እኛም_እንሸምት',

  'Guyyaa Miyaaziyaa 24-28/2018 A.L.I. Giddu-gala Konveenshinii Addis Ababa irratti Expo Ethiopia Tamrit 2018 irratti hirmaachuuf liinkii armaan gadii fayyadamaa galmaa''aa! https://ethiopiatamrit.et/made-in-ethiopia',

  'News', 1,
  'https://ethiopiatamrit.et/made-in-ethiopia',
  '["https://ethiopiatamrit.et/made-in-ethiopia"]'
);

SET @news2_id = LAST_INSERT_ID();

INSERT INTO news_images (news_id, file_path, description, sort_order) VALUES
(@news2_id, 'uploads/news/ethiopia_tamrit_1.png', 'Ethiopia Tamrit Expo 2018', 0);
