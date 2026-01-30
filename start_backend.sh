#!/bin/bash

echo "========================================"
echo "   Starting CatalogStudio Backend"
echo "========================================"

cd catalogstudio-backend

# Check if venv exists
if [ ! -d "catalog" ]; then
    echo "Error: Virtual environment 'catalog' not found!"
    echo "Please run phase 1 setup or create the venv first."
    exit 1
fi

source catalog/bin/activate
python manage.py runserver
