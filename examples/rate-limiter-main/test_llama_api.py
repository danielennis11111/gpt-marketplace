import asyncio
import aiohttp
import json

async def test_llama_stack():
    try:
        async with aiohttp.ClientSession() as session:
            payload = {
                'model': 'Llama-4-Scout-17B-16E-Instruct',
                'messages': [{'role': 'user', 'content': 'Hello, can you introduce yourself?'}],
                'max_tokens': 100
            }
            async with session.post('http://localhost:8321/inference/chat/completions', 
                                   json=payload) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    print('SUCCESS:', result)
                else:
                    print('ERROR:', resp.status, await resp.text())
    except Exception as e:
        print('CONNECTION ERROR:', e)

if __name__ == "__main__":
    asyncio.run(test_llama_stack()) 