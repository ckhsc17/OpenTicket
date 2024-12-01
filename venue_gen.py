import csv
from faker import Faker
import random

# 初始化 Faker 實例
fake = Faker()

# 生成隨機 Venue Row
def generate_venue(venue_id):
    venue_name = fake.company()  # 隨機生成場地名稱
    address = fake.address().replace("\n", ", ")  # 隨機生成地址並將換行符號替換為逗號
    city = fake.city()  # 隨機生成城市名稱
    capacity = random.randint(100, 5000)  # 隨機生成容納人數（100 至 5000 之間）
    
    venue_row = {
        "venue_id": venue_id,
        "venue_name": venue_name,
        "address": address,
        "city": city,
        "capacity": capacity
    }
    
    return venue_row

# 生成多個場地並寫入 CSV 檔案
def generate_venues_and_save_to_csv(num_venues: int, filename: str):
    # 定義 CSV 檔案的欄位名稱
    fieldnames = ["venue_id", "venue_name", "address", "city", "capacity"]

    # 開啟檔案以寫入
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        
        # 寫入標題行
        writer.writeheader()
        
        # 生成並寫入指定數量的場地，venue_id 只有 1 到 5
        for venue_id in range(1, num_venues + 1):
            venue = generate_venue(venue_id)
            writer.writerow(venue)

# 生成並保存 5 條場地資料到 "venues.csv"
generate_venues_and_save_to_csv(5, "venues.csv")
