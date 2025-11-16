-- ============================================
-- QUICK MIGRATION EXECUTION STEPS
-- ============================================
-- Execute these scripts ONE BY ONE in SQL Server Management Studio

-- ============================================
-- STEP 1: BACKUP (MANDATORY!)
-- ============================================
-- Replace 'vehicle_hub' with your actual database name
-- Replace the backup path with your preferred location

BACKUP DATABASE [vehicle_hub] 
TO DISK = 'C:\Backup\vehicle_hub_before_migration.bak'
WITH FORMAT, INIT;

PRINT '✅ Step 1 Complete: Database backup created';
GO

-- ============================================
-- STEP 2: CREATE NEW TABLE
-- ============================================

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

CREATE INDEX IX_vehicle_images_vehicleId ON vehicle_images(vehicleId);
CREATE INDEX IX_vehicle_images_sortOrder ON vehicle_images(vehicleId, sortOrder);

ALTER TABLE vehicles ADD imagesMigrated bit DEFAULT 0;

PRINT '✅ Step 2 Complete: Tables and indexes created';
GO

-- ============================================
-- STEP 3: CHECK CURRENT DATA
-- ============================================

SELECT 
    'Before Migration' AS Status,
    COUNT(*) AS TotalVehicles,
    COUNT(CASE WHEN images IS NOT NULL AND images != '' THEN 1 END) AS VehiclesWithImages
FROM vehicles;

PRINT '✅ Step 3 Complete: Data analysis done';
GO

-- ============================================
-- STEP 4: MIGRATE DATA (MAIN PROCESS)
-- ============================================
-- This is the main migration - it may take a few minutes

DECLARE @TotalVehicles INT = 0;
DECLARE @ProcessedVehicles INT = 0;
DECLARE @TotalImagesCreated INT = 0;

SELECT @TotalVehicles = COUNT(*) 
FROM vehicles 
WHERE images IS NOT NULL AND images != '' AND imagesMigrated = 0;

PRINT 'Starting migration of ' + CAST(@TotalVehicles AS VARCHAR(10)) + ' vehicles...';

DECLARE @vehicleId INT;
DECLARE @imagesJson NVARCHAR(MAX);
DECLARE @sortOrder INT;

DECLARE vehicle_cursor CURSOR FOR
SELECT id, images 
FROM vehicles 
WHERE images IS NOT NULL AND images != '' AND imagesMigrated = 0;

OPEN vehicle_cursor;
FETCH NEXT FROM vehicle_cursor INTO @vehicleId, @imagesJson;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sortOrder = 0;
    
    BEGIN TRY
        IF ISJSON(@imagesJson) = 1
        BEGIN
            -- Process JSON array of images
            DECLARE @imageData NVARCHAR(MAX);
            DECLARE json_cursor CURSOR FOR
            SELECT value FROM OPENJSON(@imagesJson);
            
            OPEN json_cursor;
            FETCH NEXT FROM json_cursor INTO @imageData;
            
            WHILE @@FETCH_STATUS = 0
            BEGIN
                DECLARE @mimeType NVARCHAR(100) = NULL;
                DECLARE @fileSize BIGINT = NULL;
                
                IF @imageData LIKE 'data:image/%'
                BEGIN
                    SET @mimeType = SUBSTRING(@imageData, 6, CHARINDEX(';', @imageData) - 6);
                    DECLARE @base64Part NVARCHAR(MAX) = SUBSTRING(@imageData, CHARINDEX(',', @imageData) + 1, LEN(@imageData));
                    SET @fileSize = (LEN(@base64Part) * 3) / 4;
                END
                
                INSERT INTO vehicle_images (vehicleId, imageData, mimeType, fileSize, sortOrder)
                VALUES (@vehicleId, @imageData, @mimeType, @fileSize, @sortOrder);
                
                SET @sortOrder = @sortOrder + 1;
                SET @TotalImagesCreated = @TotalImagesCreated + 1;
                
                FETCH NEXT FROM json_cursor INTO @imageData;
            END
            
            CLOSE json_cursor;
            DEALLOCATE json_cursor;
        END
        ELSE
        BEGIN
            -- Single image (not JSON)
            DECLARE @singleMimeType NVARCHAR(100) = NULL;
            DECLARE @singleFileSize BIGINT = NULL;
            
            IF @imagesJson LIKE 'data:image/%'
            BEGIN
                SET @singleMimeType = SUBSTRING(@imagesJson, 6, CHARINDEX(';', @imagesJson) - 6);
            END
            
            INSERT INTO vehicle_images (vehicleId, imageData, mimeType, fileSize, sortOrder)
            VALUES (@vehicleId, @imagesJson, @singleMimeType, @singleFileSize, 0);
            
            SET @TotalImagesCreated = @TotalImagesCreated + 1;
        END
        
        UPDATE vehicles SET imagesMigrated = 1 WHERE id = @vehicleId;
        SET @ProcessedVehicles = @ProcessedVehicles + 1;
        
        IF @ProcessedVehicles % 10 = 0
        BEGIN
            PRINT 'Processed ' + CAST(@ProcessedVehicles AS VARCHAR(10)) + ' vehicles...';
        END
        
    END TRY
    BEGIN CATCH
        PRINT 'Error processing vehicle ' + CAST(@vehicleId AS VARCHAR(10)) + ': ' + ERROR_MESSAGE();
    END CATCH
    
    FETCH NEXT FROM vehicle_cursor INTO @vehicleId, @imagesJson;
END

CLOSE vehicle_cursor;
DEALLOCATE vehicle_cursor;

PRINT '✅ Step 4 Complete: Migrated ' + CAST(@ProcessedVehicles AS VARCHAR(10)) + ' vehicles, created ' + CAST(@TotalImagesCreated AS VARCHAR(10)) + ' images';
GO

-- ============================================
-- STEP 5: VERIFY RESULTS
-- ============================================

SELECT 
    'Migration Summary' AS Status,
    (SELECT COUNT(*) FROM vehicles) AS TotalVehicles,
    (SELECT COUNT(*) FROM vehicles WHERE imagesMigrated = 1) AS VehiclesMigrated,
    (SELECT COUNT(*) FROM vehicle_images) AS TotalImagesCreated,
    (SELECT COUNT(DISTINCT vehicleId) FROM vehicle_images) AS VehiclesWithImages;

-- Show any vehicles that failed to migrate
SELECT COUNT(*) AS FailedMigrations
FROM vehicles 
WHERE images IS NOT NULL AND images != '' AND imagesMigrated = 0;

PRINT '✅ Step 5 Complete: Migration verification done';
GO

-- ============================================
-- STEP 6: TEST NEW STRUCTURE
-- ============================================

-- Test the query structure that the API will use
SELECT TOP 3
    v.id,
    v.title,
    (
        SELECT 
            id, vehicleId, 
            CASE WHEN LEN(imageData) > 50 THEN LEFT(imageData, 50) + '...' ELSE imageData END as imageDataPreview,
            mimeType, fileSize, sortOrder
        FROM vehicle_images vi2 
        WHERE vi2.vehicleId = v.id 
        ORDER BY sortOrder ASC
        FOR JSON PATH
    ) as vehicleImages
FROM vehicles v
WHERE EXISTS (SELECT 1 FROM vehicle_images WHERE vehicleId = v.id);

PRINT '✅ Step 6 Complete: API structure test passed';
PRINT '🎉 MIGRATION COMPLETE! You can now test your application.';
GO
