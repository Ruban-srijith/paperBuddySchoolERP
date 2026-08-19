import httpx
import asyncio

async def test():
    key = "YOUR_API_KEY_HERE"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={key}"
    async with httpx.AsyncClient(timeout=120.0) as client:
        r = await client.post(url, headers={'Content-Type': 'application/json'}, json={'contents':[{'parts':[{'text':'hi'}]}]})
        print(r.status_code, r.text)

asyncio.run(test())
