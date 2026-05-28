# !/bin/bash
# Make sure you have a .env file with the required variables. Something as such:

# AI_SERVER_URL="http://localhost:9090/Monolith/api" # This should point to your local SEMOSS server
# ACCESS_KEY="your_access_key"
# SECRET_KEY="your_secret_key"

# Then run the script as follows (if in windows, use git bash or wsl):

set -a; . .github/scripts/.env; set +a; python3 .github/scripts/validate-semoss-compilation.py