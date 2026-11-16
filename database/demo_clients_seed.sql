-- Demo clients — one per business type category
-- Each client has unique TIN, business license, ELMIS registration
-- Run this on your production database

INSERT INTO clients (
  name, category, business_type, icon,
  description, full_description,
  established, location, phone,
  tin_number, business_license_number, elmis_registration,
  website, facebook, instagram, tiktok, telegram, is_active
) VALUES

-- ── Manufacturers ──────────────────────────────────────────────

('Addis Food & Beverage PLC', 'Manufacturers', 'Food and beverage processing enterprises', '🍶',
 'Leading food and beverage processing company in Addis Ababa.',
 'Addis Food & Beverage PLC specializes in processing and packaging of local food products and beverages for the Ethiopian market and export.',
 '2015', 'Addis Ababa', '+251911100001',
 '0011100001', 'AA/MFG/W01/14/001/100001/2015', 'EMFBP10001',
 'www.addisfood.com', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com', 1),

('Ethio Garment Factory', 'Manufacturers', 'Garment and textile manufacturers', '👗',
 'Quality garment and textile manufacturing for local and international markets.',
 'Ethio Garment Factory produces high-quality clothing and textiles, serving both domestic retailers and international export clients.',
 '2012', 'Addis Ababa', '+251911100002',
 '0011100002', 'AA/MFG/W01/14/001/100002/2012', 'EMGMT10002',
 'www.ethiogarment.com', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com', 1),

('Leather Pride Ethiopia', 'Manufacturers', 'Shoe and leather product manufacturers', '👞',
 'Premium Ethiopian leather shoes and leather goods manufacturer.',
 'Leather Pride Ethiopia crafts premium shoes, bags, and leather accessories using authentic Ethiopian leather, exported worldwide.',
 '2010', 'Addis Ababa', '+251911100003',
 '0011100003', 'AA/MFG/W01/14/001/100003/2010', 'EMLTH10003',
 'www.leatherpride.com', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com', 1),

('Plastic Solutions Ethiopia', 'Manufacturers', 'Plastic product manufacturers', '🏭',
 'Manufacturer of industrial and consumer plastic products.',
 'Plastic Solutions Ethiopia produces a wide range of plastic products including containers, pipes, and packaging materials for industrial and household use.',
 '2018', 'Addis Ababa', '+251911100004',
 '0011100004', 'AA/MFG/W01/14/001/100004/2018', 'EMPLS10004',
 'www.plasticsolutions.com', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com', 1),

('Addis Furniture Works', 'Manufacturers', 'Metal and wood furniture manufacturers', '🪑',
 'Custom metal and wood furniture for homes and offices.',
 'Addis Furniture Works designs and manufactures high-quality metal and wood furniture for residential, commercial, and government clients across Ethiopia.',
 '2014', 'Addis Ababa', '+251911100005',
 '0011100005', 'AA/MFG/W01/14/001/100005/2014', 'EMFWK10005',
 'www.addisfurniture.com', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com', 1),

('EthioBuild Materials', 'Manufacturers', 'Building material manufacturers', '🧱',
 'Manufacturer of cement blocks, tiles, and construction materials.',
 'EthioBuild Materials supplies quality building materials including cement blocks, ceramic tiles, and roofing products to construction projects nationwide.',
 '2016', 'Addis Ababa', '+251911100006',
 '0011100006', 'AA/MFG/W01/14/001/100006/2016', 'EMBLD10006',
 'www.ethiobuild.com', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com', 1),

('PackEthio Industries', 'Manufacturers', 'Packaging and labeling manufacturers', '📦',
 'Packaging and labeling solutions for Ethiopian businesses.',
 'PackEthio Industries provides custom packaging and labeling services for food, pharmaceutical, and consumer goods companies across Ethiopia.',
 '2019', 'Addis Ababa', '+251911100007',
 '0011100007', 'AA/MFG/W01/14/001/100007/2019', 'EMPCK10007',
 'www.packethio.com', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com', 1),

-- ── Retail & Wholesale ─────────────────────────────────────────

('Merkato Wholesale Hub', 'Retail & Wholesale', 'Retail and Wholesale Businesses', '🏪',
 'One-stop wholesale and retail distribution center in Addis Ababa.',
 'Merkato Wholesale Hub connects manufacturers with retailers across Ethiopia, offering competitive wholesale pricing on a wide range of consumer goods.',
 '2011', 'Addis Ababa', '+251911100008',
 '0011100008', 'AA/RTL/W02/14/002/100008/2011', 'EMRWH10008',
 'www.merkatohub.com', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com', 1),

('Addis Fashion House', 'Retail & Wholesale', 'Clothing and fashion stores', '👔',
 'Modern clothing and fashion retail store for all ages.',
 'Addis Fashion House offers the latest Ethiopian and international fashion trends for men, women, and children at affordable prices.',
 '2017', 'Addis Ababa', '+251911100009',
 '0011100009', 'AA/RTL/W02/14/002/100009/2017', 'EMAFH10009',
 'www.addisfashion.com', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com', 1),

('Home & Living Ethiopia', 'Retail & Wholesale', 'Furniture and home appliance shops', '🛋️',
 'Quality furniture and home appliances at competitive prices.',
 'Home & Living Ethiopia stocks a wide selection of furniture, kitchen appliances, and home décor items for modern Ethiopian households.',
 '2013', 'Addis Ababa', '+251911100010',
 '0011100010', 'AA/RTL/W02/14/002/100010/2013', 'EMHLE10010',
 'www.homeandliving.com', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com', 1),

('Ethio Food Distributors', 'Retail & Wholesale', 'Food and beverage wholesalers', '🥫',
 'Wholesale food and beverage distribution across Ethiopia.',
 'Ethio Food Distributors supplies supermarkets, hotels, and restaurants with a comprehensive range of food and beverage products at wholesale prices.',
 '2009', 'Addis Ababa', '+251911100011',
 '0011100011', 'AA/RTL/W02/14/002/100011/2009', 'EMEFD10011',
 'www.ethiofood.com', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com', 1),

('BuildMart Ethiopia', 'Retail & Wholesale', 'Construction material suppliers', '🔩',
 'Your trusted supplier for all construction materials.',
 'BuildMart Ethiopia supplies cement, steel, timber, and all construction materials to contractors and individual builders across the country.',
 '2015', 'Addis Ababa', '+251911100012',
 '0011100012', 'AA/RTL/W02/14/002/100012/2015', 'EMBME10012',
 'www.buildmart.com', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com', 1),

('AgroInput Ethiopia', 'Retail & Wholesale', 'Agricultural input suppliers', '🌱',
 'Supplying quality seeds, fertilizers, and farming tools to Ethiopian farmers.',
 'AgroInput Ethiopia provides certified seeds, fertilizers, pesticides, and modern farming equipment to smallholder and commercial farmers nationwide.',
 '2014', 'Addis Ababa', '+251911100013',
 '0011100013', 'AA/RTL/W02/14/002/100013/2014', 'EMAIE10013',
 'www.agroinput.com', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com', 1);
