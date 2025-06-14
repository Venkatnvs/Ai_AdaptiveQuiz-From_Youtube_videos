import time
import logging
from flask import Flask, jsonify, request, render_template_string
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DJANGO_BASE = "http://localhost:8000/api/core"

CACHE = {}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("fog_node.log"), 
        logging.StreamHandler()
    ]
)

def get_cache(key):
    entry = CACHE.get(key)
    if entry and (time.time() - entry['time'] < entry['cache_timeout']):
        logging.info(f"Cache hit for key: {key}")
        return entry['data']
    logging.info(f"Cache miss for key: {key}")
    return None

def set_cache(key, data, cache_timeout):
    CACHE[key] = {'data': data, 'time': time.time(), 'cache_timeout': cache_timeout}
    logging.info(f"Cache set for key: {key}")

def get_auth_headers():
    headers = {}
    if 'Authorization' in request.headers:
        headers['Authorization'] = request.headers['Authorization']
    return headers

def proxy_get(path, use_cache=False, cache_key=None, cache_timeout=60):
    if use_cache and cache_key:
        cached = get_cache(cache_key)
        if cached:
            return jsonify(cached), 200

    try:
        full_url = f"{DJANGO_BASE}{path}"
        logging.info(f"Fetching from Django API: {full_url}")
        response = requests.get(full_url, headers=get_auth_headers())

        if response.ok:
            data = response.json()
            if use_cache and cache_key:
                set_cache(cache_key, data, cache_timeout)
            return jsonify(data), response.status_code
        else:
            logging.warning(f"Django API error - {path} - Status: {response.status_code}")
            return jsonify({"error": "Failed to fetch data", "status": response.status_code}), response.status_code

    except requests.RequestException as e:
        logging.error(f"Request error on {path}: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/total-stars', methods=['GET'])
def total_stars():
    return proxy_get("/total-stars", use_cache=True, cache_key=get_user_cache_key('total_stars'), cache_timeout=100)

@app.route('/dashboard-info', methods=['GET'])
def dashboard_info():
    return proxy_get("/dashboard-info", use_cache=True, cache_key=get_user_cache_key('dashboard_info'), cache_timeout=120)

@app.route('/catalog', methods=['GET'])
def catalog():
    return proxy_get("/catalog", use_cache=True, cache_key=get_user_cache_key('catalog'), cache_timeout=600)

@app.route('/course/<int:course_id>/videos/<int:video_id>/quiz', methods=['GET'])
def quiz_detail(course_id, video_id):
    return proxy_get(f"/course/{course_id}/videos/{video_id}/quiz", use_cache=True, cache_key=get_user_cache_key(f'quiz_detail_{course_id}_{video_id}'), cache_timeout=300)

@app.route('/q-table/overall', methods=['GET'])
def q_table_overall():
    return proxy_get("/q-table/overall", use_cache=True, cache_key=get_user_cache_key('q_table_overall'), cache_timeout=600)

@app.route('/')
def analysis():
    # Cache stats
    now = time.time()
    cache_stats = [
        {
            'key': k,
            'age': round(now - v['time'], 2),
            'timeout': v['cache_timeout'],
            'expires_in': round(v['cache_timeout'] - (now - v['time']), 2)
        }
        for k, v in CACHE.items()
    ]
    # Log tail
    try:
        with open('fog_node.log', 'r') as f:
            log_lines = f.readlines()[-30:]
    except Exception:
        log_lines = ["Log file not found or unreadable."]
    html = '''
    <html>
    <head><title>Fog Node Analysis</title></head>
    <body style="font-family:monospace; background:#f8f8f8; color:#222;">
        <h1>Fog Node Analysis</h1>
        <h2>Cache Stats</h2>
        <table border="1" cellpadding="5" style="border-collapse:collapse;">
            <tr><th>Key</th><th>Age (s)</th><th>Timeout (s)</th><th>Expires In (s)</th></tr>
            {% for entry in cache_stats %}
            <tr>
                <td>{{ entry.key }}</td>
                <td>{{ entry.age }}</td>
                <td>{{ entry.timeout }}</td>
                <td>{{ entry.expires_in }}</td>
            </tr>
            {% endfor %}
        </table>
        <h2>Recent Log Entries</h2>
        <pre style="background:#222; color:#eee; padding:10px; border-radius:5px;">{{ log|safe }}</pre>
    </body>
    </html>
    '''
    return render_template_string(html, cache_stats=cache_stats, log=''.join(log_lines))

def get_user_cache_key(base_key):
    auth = request.headers.get('Authorization', '')
    return f'{base_key}:{auth}'

if __name__ == '__main__':
    logging.info("Starting Flask Fog Node on port 5000")
    app.run(host='0.0.0.0', port=5000)
