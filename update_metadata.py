import os
import json

# --- CONFIGURATION ---
JSON_DIR = "./build/json"  # Ensure this points to your JSON folder
IMAGE_CID = "PASTE_YOUR_IMAGE_CID_HERE"  # Paste the Pinata CID here

def update_metadata():
    if not os.path.exists(JSON_DIR):
        print(f"❌ Error: Could not find folder {JSON_DIR}")
        return

    files = [f for f in os.listdir(JSON_DIR) if f.endswith(".json")]
    print(f"🔄 Found {len(files)} metadata files. Initializing update...")

    for filename in files:
        filepath = os.path.join(JSON_DIR, filename)
        
        # Read the JSON
        with open(filepath, 'r') as file:
            data = json.load(file)

        # Extract the Token ID from the filename (e.g., "1.json" -> "1")
        # Note: If your files are named 0001.json, this will extract "0001"
        token_id = filename.split('.')[0] 

        # Update the image string to point to the IPFS directory + filename
        data['image'] = f"ipfs://{IMAGE_CID}/{token_id}.png"

        # Save the updated JSON
        with open(filepath, 'w') as file:
            json.dump(data, file, indent=4)

    print(f"✨ SUCCESS: All {len(files)} ledgers have been cryptographically linked to the Image CID.")

if __name__ == "__main__":
    update_metadata()