# Default recipe - show available commands
default:
    @just --list

# Install dependencies
install:
    npm install

# Start development server
dev:
    npm run dev

# Build for production
build:
    npm run build

# Start production server
start:
    npm run start

# Run linter
lint:
    npm run lint

# Type check
typecheck:
    npx tsc --noEmit

# Clean build artifacts
clean:
    rm -rf .next out node_modules/.cache

# Full clean including node_modules
clean-all:
    rm -rf .next out node_modules

# Reinstall all dependencies
reinstall: clean-all install

# Build and start production server
prod: build start
