#!/bin/bash

# Sync External Marketplaces Script
# This script pulls the latest changes from all git submodules (external marketplaces)

set -e

echo "🔄 Syncing external marketplaces..."

# Initialize and update all submodules
git submodule update --init --recursive --remote

echo "✅ All external marketplaces synced successfully!"