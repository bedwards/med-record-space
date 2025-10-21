import os
from deta import Deta
from datetime import datetime, timedelta

def cleanup_expired_tokens():
    """Remove expired access tokens"""
    deta = Deta(os.getenv("DETA_PROJECT_KEY"))
    db = deta.Base("tokens")
    
    cutoff = datetime.now() - timedelta(hours=24)
    expired = db.fetch({"expiry?lt": int(cutoff.timestamp())})
    
    for token in expired.items:
        db.delete(token["key"])
    
    print(f"Cleaned up {len(expired.items)} expired tokens")

def send_heartbeat():
    """Send system health heartbeat"""
    print(f"Heartbeat sent at {datetime.now().isoformat()}")

if __name__ == "__main__":
    cleanup_expired_tokens()
    send_heartbeat()
