#!/usr/bin/env sh

cd $(dirname "$0")

if [ ! -e .env ]; then
	echo "No .env file found. Generating a new one..."
    cp .env.example .env
fi

if [ ! -d "./prisma/migrations" ]; then
	echo "No migrations found. Applying initial migration..."
	npx prisma migrate dev --name initial

	echo "Seeding database with example data..."
	npm run db:populate
fi
