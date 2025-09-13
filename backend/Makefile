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
	@echo "Seeding database with demo data..."
	@psql "$(DB_URL)?apikey=$(DB_KEY)" -c "SELECT seed_demo_data();"
	@echo "✓ Demo data seeded successfully!"

clear-data:
	@echo "Clearing all demo data..."
	@psql "$(DB_URL)?apikey=$(DB_KEY)" -c "SELECT clear_demo_data();"
	@echo "✓ Data cleared successfully!"
