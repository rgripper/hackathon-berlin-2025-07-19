Installing and running

Using uv
```sh
curl -LsSf https://astral.sh/uv/install.sh | sh

# restart your terminal

uv run server/server.py
```

Legacy
```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python server/server.py
```