import base64
import hmac
import hashlib
import time
import struct
import requests
from datetime import datetime


userid = input("Enter your Email: ")  # e.g., "
gistURL = input("Enter your Gist URL: ")  # e.g., "https://gist.github.com/your_gist_url"
secret_suffix = "HENNGECHALLENGE"
shared_secret = userid + secret_suffix

timestep = 30
T0 = 0

def HOTP(K, C, digits=10):
    """HOTP:
    K is the shared key
    C is the counter value
    digits control the response length
    """
    K_bytes = K.encode()
    C_bytes = struct.pack(">Q", C)
    hmac_sha512 = hmac.new(key=K_bytes, msg=C_bytes, digestmod=hashlib.sha512).hexdigest()  # Use SHA-512 instead of SHA-1
    return Truncate(hmac_sha512)[-digits:]

def Truncate(hmac_sha512):
    """truncate sha512 value"""
    offset = int(hmac_sha512[-1], 16)
    binary = int(hmac_sha512[(offset * 2):((offset * 2) + 8)], 16) & 0x7FFFFFFF
    return str(binary)

def TOTP(K, digits=10, timeref=0, timestep=30):
    """TOTP, time-based variant of HOTP
    digits control the response length
    the C in HOTP is replaced by ((currentTime - timeref) / timestep)
    """
    C = int(time.time() - timeref) // timestep
    print(C)
    return HOTP(K, C, digits=digits)

# Generate the TOTP password
passwd = TOTP(shared_secret, 10, T0, timestep).zfill(10)

# Encode the userid and password in base64 for Basic Authentication
auth_string = f"{userid}:{secret_suffix}"
auth_header = base64.b64encode(auth_string.encode()).decode()

# Prepare the headers
headers = {
    "Authorization": f"Basic {auth_header}",
    "Content-Type": "application/json"
}

# Prepare the body
body = {
      "contact_email": userid,
  "github_url": gistURL,
  "solution_framework": "react"
}

# Send the POST request
response = requests.post("https://api.challenge.hennge.com/challenges/frontend-password-validation/001", headers=headers, json=body)

# Output the response
print(response.text)
print(passwd)
