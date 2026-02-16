import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

with connection.cursor() as cursor:
    cursor.execute("SHOW TABLES")
    tables = [row[0] for row in cursor.fetchall()]
    
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    for table in tables:
        print(f"Dropping table {table}...")
        cursor.execute(f"DROP TABLE {table}")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
    
print("All tables dropped.")
