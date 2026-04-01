# Client Form Update - Instructions

## Changes Made

### 1. Database Updates
- Added `tin_number` field (Tax Identification Number)
- Added `business_license_number` field
- Added `business_type` field for comprehensive business categorization

### 2. Phone Number Auto-Formatting
- Phone numbers starting with "09" are automatically converted to "+2519"
- Example: "0912345678" → "+251912345678"

### 3. Business Type Dropdown
Added comprehensive business categories:

#### Startups and Entrepreneurs
- Tech startups (apps, software, IT services)
- E-commerce businesses
- Digital service startups
- Creative startups (design, media, photography)

#### Retail and Wholesale Businesses
- Shops and minimarkets
- Clothing and fashion stores
- Shoe and accessories shops
- Electronics and mobile phone shops
- Cosmetics and beauty product shops
- Bookshops and stationery shops
- Furniture and home appliance shops
- Food and beverage wholesalers
- Construction material suppliers
- Agricultural input suppliers
- Textile and garment wholesalers

#### Hospitality and Tourism Sector
- Restaurants and cafes
- Traditional food houses
- Event and conference venues
- Car rental services

#### Educational Institutions
- Private schools (KG–Grade 12)
- Training centers
- Language schools
- Computer and IT training centers
- Tutorial and exam preparation centers
- Online learning platforms
- Educational consultancy services

#### Service Providers
- Advertising and marketing agencies
- Printing and publishing services
- Graphic design and branding services
- Accounting and auditing firms
- Legal and consultancy services
- Cleaning and maintenance services
- Security service providers
- Repair services (electronics, machinery, vehicles)
- Beauty salons and barber shops
- Transportation and logistics services

#### Manufacturers
- Food and beverage processing enterprises
- Garment and textile manufacturers
- Shoe and leather product manufacturers
- Plastic product manufacturers
- Metal and wood furniture manufacturers
- Building material manufacturers (cement blocks, tiles)
- Packaging and labeling manufacturers
- Soap, detergent, and cosmetic producers
- Agro-processing plants

## Manual Database Update

### Option 1: Using SQL File
Run the SQL commands in `database_update_manual.sql` file in your database tool.

### Option 2: Direct SQL Commands
```sql
ALTER TABLE clients 
ADD COLUMN tin_number VARCHAR(255) NULL AFTER phone,
ADD COLUMN business_license_number VARCHAR(255) NULL AFTER tin_number,
ADD COLUMN business_type VARCHAR(255) NULL AFTER industry;
```

### Option 3: Using Laravel Migration (if you have PHP/Laravel setup)
```bash
php artisan migrate
```

## Files Updated

1. **Database Migration**: `database/migrations/2025_12_08_191809_create_clients_table.php`
2. **Server Model**: `server/src/models/Client.js`
3. **Admin Form**: `client/src/pages/admin/ClientForm.jsx`
4. **Flutter Model**: `all_things_app/lib/models/client_model.dart`

## Testing

After updating the database:

1. Go to Admin Panel → Clients → Add New Client
2. Fill in the form with:
   - Business Name
   - Select Business Type from dropdown
   - Phone number (try entering "0912345678" - it should auto-convert to "+251912345678")
   - TIN Number
   - Business License Number
   - Other required fields
3. Submit and verify the data is saved correctly

## Notes

- All three new fields are currently optional (NULL allowed)
- If you want to make them required, uncomment the lines at the end of the SQL file
- The phone auto-formatting only works for numbers starting with "09"
- Business types are organized in optgroups for better UX
