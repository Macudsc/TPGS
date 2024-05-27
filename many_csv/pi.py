import csv
import re

# Функция для извлечения координат из строки
def extract_coordinates(location):
    match = re.search(r'coordinates=\[(.*?),(.*?)\]', location)
    if match:
        longitude = float(match.group(1).strip())
        latitude = float(match.group(2).strip())
        return longitude, latitude
    return None, None

# Открытие исходного CSV файла и создание нового CSV файла с отдельными координатами
with open('AquaparksCustom.csv', 'r', newline='', encoding='utf-8') as infile, open('output.csv', 'w', newline='', encoding='utf-8') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = ['id', 'longitude', 'latitude']
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    
    writer.writeheader()
    for row in reader:
        longitude, latitude = extract_coordinates(row['geoData'])
        writer.writerow({'id': row['id'], 'longitude': longitude, 'latitude': latitude})

print("Координаты успешно извлечены и сохранены в output.csv.")

