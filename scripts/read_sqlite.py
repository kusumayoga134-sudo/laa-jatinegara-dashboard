import sqlite3

conn = sqlite3.connect('backend/prisma/dev.db')
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tables:", [t[0] for t in tables])

for t in tables:
    name = t[0]
    cursor.execute(f"SELECT COUNT(*) FROM \"{name}\";")
    count = cursor.fetchone()[0]
    print(f"Table {name}: {count} rows")
    if name == 'MaintenanceLog' and count > 0:
        cursor.execute(f"SELECT id, targetCode, actionType, description FROM \"{name}\" LIMIT 20;")
        for row in cursor.fetchall():
            print(" ", row)

conn.close()
