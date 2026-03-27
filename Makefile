.PHONY: dev build search

# Start dev server with live search (builds first, indexes, then serves)
dev:
	hugo --minify
	pagefind --site public --output-subdir pagefind
	cp -r public/pagefind static/pagefind
	hugo server -D

# Production build (used by GitHub Actions)
build:
	hugo --minify --gc
	pagefind --site public --output-subdir pagefind

# Re-index search only (faster, when you haven't changed content structure)
search:
	hugo --minify
	pagefind --site public --output-subdir pagefind
	cp -r public/pagefind static/pagefind
