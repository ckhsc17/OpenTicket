import random
import csv
from faker import Faker
from datetime import datetime

# 初始化 Faker
fake = Faker()

# 設置角色選項
roles = ['User', 'Organizer', 'Admin']

# 生成隨機用戶數據
def generate_users(num_users=5000):
    users = []
    for i in range(1, num_users + 1):
        user = {
            "user_id": i,
            "username": fake.user_name(),
            "password": fake.password(length=12),
            "email": fake.unique.email(),
            "phone": generate_phone_number(),
            "role": random.choice(roles),
            "created_at": fake.date_time_this_decade().strftime('%Y-%m-%d %H:%M:%S')
        }
        users.append(user)
    return users

# 生成 10 位數字的電話號碼
def generate_phone_number():
    return ''.join(random.choices('0123456789', k=10))

# 將數據保存為 CSV
def save_to_csv(users, filename="users.csv"):
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=users[0].keys())
        writer.writeheader()
        writer.writerows(users)
    print(f"Generated {len(users)} users and saved to {filename}")

# 主函數
if __name__ == "__main__":
    num_users = 5000
    users = generate_users(num_users)
    save_to_csv(users)
