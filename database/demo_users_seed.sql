-- Demo user accounts for the 13 demo clients
-- Default password for ALL accounts: Allthings2026
--
-- IMPORTANT: Before running this file, generate the correct bcrypt hash on your server:
--   php -r "echo password_hash('Allthings2026', PASSWORD_BCRYPT);"
-- Then replace the hash value in the SET @pwd line below.
--
-- The placeholder hash below will NOT work for login until you replace it.

SET @pwd = 'REPLACE_WITH_BCRYPT_HASH_OF_Allthings2026';

INSERT INTO users (
  full_name, phone, email, password,
  company_name, business_type,
  tin_number, elmis_registration, business_license_number,
  location, website, status
) VALUES

-- Manufacturers
('Addis Food & Beverage PLC',  '+251911100001', 'addisfood@demo.et', @pwd,
 'Addis Food & Beverage PLC',  'Food and beverage processing enterprises',
 '0011100001', 'EMFBP10001', 'AA/MFG/W01/14/001/100001/2015',
 'Addis Ababa', 'www.addisfood.com', 'active'),

('Ethio Garment Factory',      '+251911100002', 'ethiogarment@demo.et', @pwd,
 'Ethio Garment Factory',      'Garment and textile manufacturers',
 '0011100002', 'EMGMT10002', 'AA/MFG/W01/14/001/100002/2012',
 'Addis Ababa', 'www.ethiogarment.com', 'active'),

('Leather Pride Ethiopia',     '+251911100003', 'leatherpride@demo.et', @pwd,
 'Leather Pride Ethiopia',     'Shoe and leather product manufacturers',
 '0011100003', 'EMLTH10003', 'AA/MFG/W01/14/001/100003/2010',
 'Addis Ababa', 'www.leatherpride.com', 'active'),

('Plastic Solutions Ethiopia', '+251911100004', 'plasticsolutions@demo.et', @pwd,
 'Plastic Solutions Ethiopia', 'Plastic product manufacturers',
 '0011100004', 'EMPLS10004', 'AA/MFG/W01/14/001/100004/2018',
 'Addis Ababa', 'www.plasticsolutions.com', 'active'),

('Addis Furniture Works',      '+251911100005', 'addisfurniture@demo.et', @pwd,
 'Addis Furniture Works',      'Metal and wood furniture manufacturers',
 '0011100005', 'EMFWK10005', 'AA/MFG/W01/14/001/100005/2014',
 'Addis Ababa', 'www.addisfurniture.com', 'active'),

('EthioBuild Materials',       '+251911100006', 'ethiobuild@demo.et', @pwd,
 'EthioBuild Materials',       'Building material manufacturers',
 '0011100006', 'EMBLD10006', 'AA/MFG/W01/14/001/100006/2016',
 'Addis Ababa', 'www.ethiobuild.com', 'active'),

('PackEthio Industries',       '+251911100007', 'packethio@demo.et', @pwd,
 'PackEthio Industries',       'Packaging and labeling manufacturers',
 '0011100007', 'EMPCK10007', 'AA/MFG/W01/14/001/100007/2019',
 'Addis Ababa', 'www.packethio.com', 'active'),

-- Retail & Wholesale
('Merkato Wholesale Hub',      '+251911100008', 'merkatohub@demo.et', @pwd,
 'Merkato Wholesale Hub',      'Retail and Wholesale Businesses',
 '0011100008', 'EMRWH10008', 'AA/RTL/W02/14/002/100008/2011',
 'Addis Ababa', 'www.merkatohub.com', 'active'),

('Addis Fashion House',        '+251911100009', 'addisfashion@demo.et', @pwd,
 'Addis Fashion House',        'Clothing and fashion stores',
 '0011100009', 'EMAFH10009', 'AA/RTL/W02/14/002/100009/2017',
 'Addis Ababa', 'www.addisfashion.com', 'active'),

('Home & Living Ethiopia',     '+251911100010', 'homeandliving@demo.et', @pwd,
 'Home & Living Ethiopia',     'Furniture and home appliance shops',
 '0011100010', 'EMHLE10010', 'AA/RTL/W02/14/002/100010/2013',
 'Addis Ababa', 'www.homeandliving.com', 'active'),

('Ethio Food Distributors',    '+251911100011', 'ethiofood@demo.et', @pwd,
 'Ethio Food Distributors',    'Food and beverage wholesalers',
 '0011100011', 'EMEFD10011', 'AA/RTL/W02/14/002/100011/2009',
 'Addis Ababa', 'www.ethiofood.com', 'active'),

('BuildMart Ethiopia',         '+251911100012', 'buildmart@demo.et', @pwd,
 'BuildMart Ethiopia',         'Construction material suppliers',
 '0011100012', 'EMBME10012', 'AA/RTL/W02/14/002/100012/2015',
 'Addis Ababa', 'www.buildmart.com', 'active'),

('AgroInput Ethiopia',         '+251911100013', 'agroinput@demo.et', @pwd,
 'AgroInput Ethiopia',         'Agricultural input suppliers',
 '0011100013', 'EMAIE10013', 'AA/RTL/W02/14/002/100013/2014',
 'Addis Ababa', 'www.agroinput.com', 'active');

-- Create user_profiles entries for each new user
INSERT INTO user_profiles (user_id)
SELECT id FROM users WHERE phone IN (
  '+251911100001','+251911100002','+251911100003','+251911100004',
  '+251911100005','+251911100006','+251911100007','+251911100008',
  '+251911100009','+251911100010','+251911100011','+251911100012',
  '+251911100013'
);
