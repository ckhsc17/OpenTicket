import csv
from faker import Faker
import random
from datetime import datetime

# 初始化 Faker 實例
fake = Faker()

# 假設的 VENUE 和 USER 的 ID 範圍
venue_ids = [1, 2, 3, 4, 5]  # 假設場地 ID
user_ids = [101, 102, 103, 104, 105]  # 假設主辦方 ID

# 生成隨機 Event Row
def generate_event():
    event_id = fake.unique.random_number(digits=6)  # 隨機生成一個演唱會代號
    event_name = fake.bs()  # 隨機生成一個演唱會名稱
    performer = fake.name()  # 隨機生成演出者名字
    event_date = fake.date_between(start_date='-1y', end_date='today')  # 隨機生成演唱會日期，最近一年內
    venue_id = random.choice(venue_ids)  # 隨機選擇場地 ID
    organizer_id = random.choice(user_ids)  # 隨機選擇主辦方 ID
    status = random.choice(['Scheduled', 'Canceled', 'Completed'])  # 隨機選擇活動狀態
    
    event_row = {
        "event_id": event_id,
        "event_name": event_name,
        "performer": performer,
        "event_date": event_date,
        "venue_id": venue_id,
        "organizer_id": organizer_id,
        "status": status
    }
    
    return event_row

# 生成多個事件並寫入 CSV 檔案
def generate_events_and_save_to_csv(num_events: int, filename: str):
    # 定義 CSV 檔案的欄位名稱
    fieldnames = ["event_id", "event_name", "performer", "event_date", "venue_id", "organizer_id", "status"]

    # 開啟檔案以寫入
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        
        # 寫入標題行
        writer.writeheader()
        
        # 生成並寫入指定數量的事件
        for _ in range(num_events):
            event = generate_event()
            writer.writerow(event)

# 生成並保存 10 條事件資料到 "events.csv"
generate_events_and_save_to_csv(10, "events.csv")
