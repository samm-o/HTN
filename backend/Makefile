# Project BASTION - Database Management
# Simple commands to seed and clear demo data

# Load environment variables
include .env
export

# Database connection (requires SUPABASE_URL and SUPABASE_ANON_KEY in .env)
DB_URL := $(SUPABASE_URL)
DB_KEY := $(SUPABASE_ANON_KEY)

.PHONY: seed-data clear-data

seed-data:
	@python3 setup/seed_data.py

clear-data:
	@python3 setup/seed_data.py clear
