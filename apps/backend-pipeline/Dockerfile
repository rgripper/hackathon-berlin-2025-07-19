FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg && apt-get clean

COPY . .

RUN pip install --no-cache-dir "pipecat-ai[websocket]" python-dotenv

EXPOSE 8080

CMD ["python", "server/server.py"]