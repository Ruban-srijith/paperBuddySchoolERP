import asyncio
import httpx

async def test():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000/api/v1") as client:
        # First login to get token
        res = await client.post("/auth/login", json={"email": "transport@school.edu", "password": "password123"})
        if res.status_code != 200:
            print("Login failed:", res.json())
            return
            
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test creating a vehicle
        res = await client.post("/transport/vehicles", json={
            "registration_number": "TEST-123",
            "vehicle_type": "bus",
            "capacity": 40
        }, headers=headers)
        
        print("Create Vehicle Status:", res.status_code)
        print("Create Vehicle Response:", res.json())

asyncio.run(test())
