-- =========================================
-- VEHICLE IMAGES SEPARATE TABLE MIGRATION
-- =========================================

-- Step 1: Create the new vehicle_images table
CREATE TABLE vehicle_images (
    id int IDENTITY(1,1) PRIMARY KEY,
    vehicleId int NOT NULL,
    imageData nvarchar(MAX) NOT NULL,
    fileName nvarchar(255) NULL,
    mimeType nvarchar(100) NULL,
    fileSize bigint NULL,
    sortOrder int DEFAULT 0,
    uploadedAt datetime2 DEFAULT GETDATE(),
    FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Step 2: Create indexes for better performance
CREATE INDEX IX_vehicle_images_vehicleId ON vehicle_images(vehicleId);
CREATE INDEX IX_vehicle_images_sortOrder ON vehicle_images(vehicleId, sortOrder);

-- Step 3: Migrate existing data from vehicles.images to vehicle_images table
-- Note: This script assumes images are stored as JSON array in the images column
-- You'll need to run this after creating the table

-- Step 4: Add a temporary column to track migration status
ALTER TABLE vehicles ADD imagesMigrated bit DEFAULT 0;

-- Step 5: (Optional) After migration is complete, you can drop the old images column
-- ALTER TABLE vehicles DROP COLUMN images;
-- ALTER TABLE vehicles DROP COLUMN imagesMigrated;

-- =========================================
-- DATA MIGRATION SCRIPT (Run separately)
-- =========================================

-- This script will migrate existing images from the vehicles.images column
-- to the new vehicle_images table. Run this AFTER creating the table above.

DECLARE @vehicleId int;
DECLARE @imagesJson nvarchar(MAX);
DECLARE @imageArray nvarchar(MAX);
DECLARE @singleImage nvarchar(MAX);
DECLARE @sortOrder int;

DECLARE vehicle_cursor CURSOR FOR
SELECT id, images FROM vehicles WHERE images IS NOT NULL AND images != '' AND imagesMigrated = 0;

OPEN vehicle_cursor;
FETCH NEXT FROM vehicle_cursor INTO @vehicleId, @imagesJson;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sortOrder = 0;
    
    -- Try to parse as JSON array
    IF ISJSON(@imagesJson) = 1
    BEGIN
        -- Parse JSON array and insert each image
        DECLARE @json_cursor CURSOR;
        SET @json_cursor = CURSOR FOR
        SELECT value FROM OPENJSON(@imagesJson);
        
        OPEN @json_cursor;
        FETCH NEXT FROM @json_cursor INTO @singleImage;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Extract MIME type from data URL
            DECLARE @mimeType nvarchar(100) = NULL;
            IF @singleImage LIKE 'data:image/%'
            BEGIN
                SET @mimeType = SUBSTRING(@singleImage, 6, CHARINDEX(';', @singleImage) - 6);
            END
            
            -- Insert image record
            INSERT INTO vehicle_images (vehicleId, imageData, mimeType, sortOrder)
            VALUES (@vehicleId, @singleImage, @mimeType, @sortOrder);
            
            SET @sortOrder = @sortOrder + 1;
            FETCH NEXT FROM @json_cursor INTO @singleImage;
        END
        
        CLOSE @json_cursor;
        DEALLOCATE @json_cursor;
    END
    ELSE
    BEGIN
        -- Single image (not JSON array)
        DECLARE @mimeType2 nvarchar(100) = NULL;
        IF @imagesJson LIKE 'data:image/%'
        BEGIN
            SET @mimeType2 = SUBSTRING(@imagesJson, 6, CHARINDEX(';', @imagesJson) - 6);
        END
        
        INSERT INTO vehicle_images (vehicleId, imageData, mimeType, sortOrder)
        VALUES (@vehicleId, @imagesJson, @mimeType2, 0);
    END
    
    -- Mark this vehicle as migrated
    UPDATE vehicles SET imagesMigrated = 1 WHERE id = @vehicleId;
    
    FETCH NEXT FROM vehicle_cursor INTO @vehicleId, @imagesJson;
END

CLOSE vehicle_cursor;
DEALLOCATE vehicle_cursor;

-- Verify migration
SELECT 
    'Migration Summary' AS Status,
    (SELECT COUNT(*) FROM vehicles WHERE imagesMigrated = 1) AS VehiclesMigrated,
    (SELECT COUNT(*) FROM vehicle_images) AS TotalImagesCreated,
    (SELECT COUNT(DISTINCT vehicleId) FROM vehicle_images) AS VehiclesWithImages;

-- =========================================
-- FINAL CLEANUP (Run after verifying migration)
-- =========================================

-- After verifying that all images have been migrated successfully:
-- 1. Check that all vehicles show imagesMigrated = 1
-- 2. Check that vehicle_images table has all your images
-- 3. Then run these cleanup commands:

-- ALTER TABLE vehicles DROP COLUMN images;
-- ALTER TABLE vehicles DROP COLUMN imagesMigrated;
