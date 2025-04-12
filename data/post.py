import requests
import faker
import random

url = 'https://ticketease-backend-prod-396633212684.asia-east1.run.app/events'
payload = {
    "event_name": "Sample Event",
    "performer": "Sample Performer",
    "event_date": "2024-12-09",
    "venue_id": 1,
    "description": "This is a sample event description.",
    "status": "Scheduled"
}

headers = {
    'Accept': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdHJpbmciLCJpZCI6MjAwMDMsImV4cCI6MTczMzc2NTExMX0.ynt0ccRUH3sVVjcopNpLLB8zhAibW55OVR5_2wYwVxA',
    'Content-Type': 'application/json'
}

faker = faker.Faker()

status = ['Scheduled', 'Cancelled', 'Completed']
weight = [0.8, 0.1, 0.1]
for i in range(1000):
    payload['event_name'] = faker.name()
    payload['performer'] = faker.name()
    payload['event_date'] = faker.date_this_year().isoformat()
    payload['description'] = faker.text()
    payload['venue_id'] = random.randint(1, 20)
    payload['status'] = random.choices(status, weight)[0]
    
    response = requests.post(url, headers=headers, json=payload)