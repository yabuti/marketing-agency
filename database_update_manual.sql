-- Manual SQL commands to update the clients table
-- Run these commands in your database management tool (phpMyAdmin, MySQL Workbench, etc.)

-- Add new columns to clients table
ALTER TABLE clients 
ADD COLUMN tin_number VARCHAR(255) NULL AFTER phone,
ADD COLUMN business_license_number VARCHAR(255) NULL AFTER tin_number,
ADD COLUMN elmis_registration VARCHAR(255) NULL AFTER business_license_number,
ADD COLUMN business_type VARCHAR(255) NULL AFTER industry;

-- Add new columns to contact_messages table
ALTER TABLE contact_messages
ADD COLUMN tin_number VARCHAR(255) NULL AFTER company,
ADD COLUMN elmis_registration VARCHAR(255) NULL AFTER tin_number,
ADD COLUMN business_license_number VARCHAR(255) NULL AFTER elmis_registration;

-- Verify the changes
DESCRIBE clients;
DESCRIBE contact_messages;

-- Optional: If you want to make these fields required later, you can run:
-- For clients table:
-- ALTER TABLE clients MODIFY tin_number VARCHAR(255) NOT NULL;
-- ALTER TABLE clients MODIFY business_license_number VARCHAR(255) NOT NULL;
-- ALTER TABLE clients MODIFY elmis_registration VARCHAR(255) NOT NULL;
-- ALTER TABLE clients MODIFY business_type VARCHAR(255) NOT NULL;

-- For contact_messages table:
-- ALTER TABLE contact_messages MODIFY tin_number VARCHAR(255) NOT NULL;
-- ALTER TABLE contact_messages MODIFY elmis_registration VARCHAR(255) NOT NULL;
-- ALTER TABLE contact_messages MODIFY business_license_number VARCHAR(255) NOT NULL;
