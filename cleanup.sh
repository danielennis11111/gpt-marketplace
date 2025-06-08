#!/bin/bash

echo "====== macOS Disk Space Cleanup Script ======"
echo "This script will help clean up unnecessary files to free up disk space."
echo ""

# Create a temporary directory for the cleanup log
mkdir -p ~/cleanup_logs
LOGFILE=~/cleanup_logs/cleanup_$(date +"%Y%m%d_%H%M%S").log
echo "Cleanup started at $(date)" > $LOGFILE

# Function to safely remove files with user confirmation
safe_remove() {
  local path="$1"
  local desc="$2"
  local size="$3"
  
  echo "Would you like to remove $desc ($size)? [y/n]"
  read -r response
  if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Removing $path..."
    rm -rf "$path"
    echo "✓ Removed $desc ($size)" | tee -a $LOGFILE
    return 0
  else
    echo "× Skipped $desc" | tee -a $LOGFILE
    return 1
  fi
}

# Function to calculate size of a directory
get_size() {
  du -sh "$1" | cut -f1
}

echo "====== 1. Application Logs ======"
# Adobe logs
ADOBE_LOGS_SIZE=$(get_size ~/Library/Logs/Adobe)
safe_remove ~/Library/Logs/Adobe "Adobe logs" "$ADOBE_LOGS_SIZE"

# Creative Cloud logs
CC_LOGS_SIZE=$(get_size ~/Library/Logs/CreativeCloud)
safe_remove ~/Library/Logs/CreativeCloud "Creative Cloud logs" "$CC_LOGS_SIZE"

echo "====== 2. Large Downloads ======"
# Soggy Preservation Vault.zip
if [ -f ~/Downloads/Soggy\ Preservation\ Vault.zip ]; then
  SOGGY_SIZE=$(get_size ~/Downloads/Soggy\ Preservation\ Vault.zip)
  safe_remove ~/Downloads/Soggy\ Preservation\ Vault.zip "Soggy Preservation Vault.zip" "$SOGGY_SIZE"
fi

# Dropbox duplicates
if [ -f ~/Downloads/Dropbox\ \(2\).zip ]; then
  DROPBOX_SIZE=$(get_size ~/Downloads/Dropbox\ \(2\).zip)
  safe_remove ~/Downloads/Dropbox\ \(2\).zip "Dropbox (2).zip" "$DROPBOX_SIZE"
fi

# Duplicate video files
echo "Would you like to review and potentially delete large video files in Downloads? [y/n]"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  echo "Finding large video files (>100MB)..."
  find ~/Downloads -name "*.mp4" -o -name "*.mov" -size +100M | while read -r file; do
    FILE_SIZE=$(get_size "$file")
    safe_remove "$file" "$(basename "$file")" "$FILE_SIZE"
  done
fi

echo "====== 3. Unreal Projects ======"
# Unreal Projects - MetaHumans folders
echo "Cleaning up Unreal Projects..."

# List MetaHumans folders
find ~/Documents/Unreal\ Projects -maxdepth 1 -name "MetaHumans*" | while read -r folder; do
  FOLDER_SIZE=$(get_size "$folder")
  safe_remove "$folder" "$(basename "$folder")" "$FOLDER_SIZE"
done

# Clean Intermediate folders
echo "Cleaning up Unreal Intermediate and Saved folders..."
find ~/Documents/Unreal\ Projects -name "Intermediate" -type d -o -name "Saved" -type d | while read -r folder; do
  FOLDER_SIZE=$(get_size "$folder")
  safe_remove "$folder" "Temporary Unreal Engine files in $(dirname "$folder")" "$FOLDER_SIZE"
done

echo "====== 4. Docker and VM Files ======"
# UTM VM image
if [ -f ~/Library/Containers/com.utmapp.UTM/Data/Documents/UEFN-Developer.utm/Data/26100.2033.241004-2336.ge_release_svc_refresh_CLIENTCONSUMER_RET_A64FRE_en-us.qcow2 ]; then
  VM_SIZE=$(get_size ~/Library/Containers/com.utmapp.UTM/Data/Documents/UEFN-Developer.utm/Data/26100.2033.241004-2336.ge_release_svc_refresh_CLIENTCONSUMER_RET_A64FRE_en-us.qcow2)
  safe_remove ~/Library/Containers/com.utmapp.UTM/Data/Documents/UEFN-Developer.utm/Data/26100.2033.241004-2336.ge_release_svc_refresh_CLIENTCONSUMER_RET_A64FRE_en-us.qcow2 "UTM VM image" "$VM_SIZE"
fi

# Docker.raw
if [ -f ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw ]; then
  DOCKER_SIZE=$(get_size ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw)
  safe_remove ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw "Docker.raw" "$DOCKER_SIZE"
fi

echo "====== 5. Epic Games ======"
# Fortnite
if [ -d /Users/Shared/Epic\ Games/Fortnite ]; then
  FORTNITE_SIZE=$(get_size /Users/Shared/Epic\ Games/Fortnite)
  safe_remove /Users/Shared/Epic\ Games/Fortnite "Fortnite" "$FORTNITE_SIZE"
fi

echo "====== 6. Additional Cleanups ======"
echo "Would you like to empty the trash? [y/n]"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  echo "Emptying trash..."
  rm -rf ~/.Trash/*
  echo "✓ Emptied Trash" | tee -a $LOGFILE
fi

echo "====== Cleanup Complete ======"
echo "Cleanup completed at $(date)" | tee -a $LOGFILE
echo "Log file saved to $LOGFILE" 