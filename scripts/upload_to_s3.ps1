param (
    [Parameter(Mandatory=$true)]
    [string]$Folder,
    
    [Parameter(Mandatory=$true)]
    [string]$Bucket
)

# Validate folder exists
if (!(Test-Path -Path $Folder -PathType Container)) {
    Write-Error "Folder does not exist: $Folder"
    exit 1
}

$folderName = (Get-Item $Folder).Name
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$archiveName = "$folderName-$timestamp.tar.gz"

Write-Host "Creating archive $archiveName from $Folder..."
tar.exe -czf $archiveName $Folder

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create archive"
    exit 1
}

Write-Host "Uploading $archiveName to S3 bucket $Bucket..."
aws s3 cp $archiveName "s3://$Bucket/$archiveName"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to upload to S3"
    exit 1
}

Write-Host "Upload completed successfully."
# Clean up
Remove-Item $archiveName -Force
