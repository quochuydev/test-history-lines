```sh
curl -X POST "https://api.z.ai/api/anthropic/v1/messages" \
     -H "Authorization: Bearer $ANTHROPIC_AUTH_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
           "model": "claude-3-5-sonnet-20240620",
           "max_tokens": 1024,
           "messages": [{"role": "user", "content": "Hello, world"}]
         }'
```

```json
{
  "id": "20251013104553f6d8961e92814310",
  "type": "message",
  "role": "assistant",
  "model": "glm-4.6",
  "content": [{ "type": "text", "text": "Hello! How can I assist you today?" }],
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 9,
    "output_tokens": 14,
    "cache_read_input_tokens": 0
  }
}
```
