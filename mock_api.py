from flask import Flask, jsonify
import random
import time

app = Flask(__name__)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """
    Mock API for MagnoGen Dashboard
    Generates random data simulating Earth's magnetic field energy harvesting.
    """
    return jsonify({
        "coilTemp": round(random.uniform(30, 95), 1),
        "energyProduced": round(random.uniform(80, 200), 1),
        "energyStored": round(random.uniform(0, 100), 1),
        "energyConsumed": round(random.uniform(50, 150), 1),
        "timestamp": time.strftime("%H:%M:%S"),
        "status": "online"
    })

if __name__ == '__main__':
    # Run on port 5000 for local testing
    app.run(debug=True, port=5000)
