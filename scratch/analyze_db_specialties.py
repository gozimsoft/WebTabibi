import mysql.connector
import pandas as pd
from collections import defaultdict, Counter

# Connect to database
conn = mysql.connector.connect(
    host='197.140.142.6',
    port=3306,
    user='uyyuppcc_admin',
    password='EV]s6^lwR0OnG029',
    database='uyyuppcc_DBTabibi'
)
cursor = conn.cursor(dictionary=True)

# Load CSV
df_csv = pd.read_csv(r'd:\Application Web\WebTabibi\doctors_data.csv')
print(f"Loaded CSV with {len(df_csv)} rows")

# Clean names and create lookup
csv_map = {}
for idx, row in df_csv.iterrows():
    name = str(row['اسم الطبيب']).strip()
    spec = str(row['التخصص']).strip()
    phone1 = str(row['الهاتف 1']).strip() if pd.notna(row['الهاتف 1']) else ''
    if phone1.endswith('.0'): phone1 = phone1[:-2]
    if phone1 and phone1 != '0':
        csv_map[('phone', phone1)] = spec
    if name:
        csv_map[('name', name)] = spec

# Get all doctors from DB
cursor.execute("SELECT id, fullname, phone, specialtie_id FROM doctors")
db_doctors = cursor.fetchall()
print(f"Loaded {len(db_doctors)} doctors from DB")

id_to_specs = defaultdict(Counter)

for doc in db_doctors:
    sid = doc['specialtie_id']
    name = doc['fullname'] or ''
    # remove prefix
    clean_name = name
    for pfx in ['الدكتور ', 'الدكتورة ', 'Dr. ', 'Dr ', 'DR. ', 'DR ']:
        if clean_name.startswith(pfx):
            clean_name = clean_name[len(pfx):]
            break
    clean_name = clean_name.strip()
    phone = (doc['phone'] or '').strip()
    
    matched = None
    if phone and ('phone', phone) in csv_map:
        matched = csv_map[('phone', phone)]
    elif clean_name and ('name', clean_name) in csv_map:
        matched = csv_map[('name', clean_name)]
    
    if matched:
        id_to_specs[sid][matched] += 1
    else:
        id_to_specs[sid]['NO_MATCH'] += 1

print("\n=== SUMMARY MAPPING OF DB specialtie_id TO CSV SPECIALTIES ===")
for sid, counter in sorted(id_to_specs.items(), key=lambda x: str(x[0])):
    most_common = counter.most_common(2)
    total = sum(counter.values())
    print(f"UUID: {sid} | Total: {total} | Top: {most_common}")

# Check current specialties table
cursor.execute("SELECT id, namear, namefr FROM specialties")
current_specs = cursor.fetchall()
print("\n=== CURRENT SPECIALTIES TABLE IN DB ===")
for s in current_specs:
    print(s)

cursor.close()
conn.close()
