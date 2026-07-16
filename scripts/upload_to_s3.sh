#!/bin/bash

# Exit on error
set -e

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <folder_path> <s3_bucket_name>"
    exit 1
fi

FOLDER=$1
BUCKET=$2

if [ ! -d "$FOLDER" ]; then
    echo "Error: Directory $FOLDER does not exist."
    exit 1
fi

FOLDER_NAME=$(basename "$FOLDER")
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_NAME="${FOLDER_NAME}-${TIMESTAMP}.tar.gz"

echo "Creating archive $ARCHIVE_NAME from $FOLDER..."
tar -czf "$ARCHIVE_NAME" "$FOLDER"

echo "Uploading $ARCHIVE_NAME to s3://$BUCKET..."
aws s3 cp "$ARCHIVE_NAME" "s3://$BUCKET/$ARCHIVE_NAME"

echo "Upload completed successfully."
# Clean up
rm -f "$ARCHIVE_NAME"
