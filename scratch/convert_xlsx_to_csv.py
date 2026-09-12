import openpyxl
import csv

xlsx_path = r"d:\Application Web\WebTabibi\doctors_data.xlsx"
csv_path = r"d:\Application Web\WebTabibi\doctors_data.csv"

wb = openpyxl.load_workbook(xlsx_path, data_only=True)
sheet = wb.active

with open(csv_path, 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    for row in sheet.iter_rows(values_only=True):
        if any(row):
            writer.writerow([str(c).strip() if c is not None else '' for c in row])

wb.close()
print(f"Successfully converted {xlsx_path} to {csv_path}")
