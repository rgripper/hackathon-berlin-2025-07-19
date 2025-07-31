Installing and running

Using `uv`
```sh
curl -LsSf https://astral.sh/uv/install.sh | sh

# restart your terminal

./run.sh
```

> Note: If you want to run GPU-accelerated Whisper you need to run the backend on top of a cuda-enabled docker container. So for now for simplicity CPU is the default.

### Ollama

Model is `qwen3:1.7b`. See https://ollama.com/library/qwen3

Start docker compose
```sh
docker compose up
```

Pull the model once in a separate terminal session, before running the backend for the first time. 
```sh
docker exec -it ollama ollama pull qwen3:1.7b
```


### Speach to text
TODO: