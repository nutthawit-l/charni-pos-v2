.PHONY: help dev migrate remote-migrate deploy seed-users seed-shop seed-products seed-events seed-product-images

MIGRATIONS := $(sort $(wildcard migrations/*.sql))

help:
	@echo "Usage:"
	@echo "  make dev               Run Vite and Wrangler in separate tmux panes"
	@echo "  make migrate           Apply local D1 migrations"
	@echo "  make remote-migrate    Apply remote D1 migrations"
	@echo "  make deploy            Build and deploy app to Cloudflare Pages"
	@echo "  make seed-events       Seed dev event in local D1"
	@echo "  make remote-seed-events Seed dev event in remote D1"

migrate:
	pnpm install
	@for f in $(MIGRATIONS); do \
		echo "Applying $$f..."; \
		npx wrangler d1 execute charnipos-v2-db --local --file="$$f"; \
	done

remote-migrate:
	pnpm install
	@for f in $(MIGRATIONS); do \
		echo "Applying $$f..."; \
		npx wrangler d1 execute charnipos-v2-db --remote --file="$$f"; \
	done

dev:
	@if [ -n "$$TMUX" ]; then \
		PANE_ID=$$(tmux split-window -h -P -F '#{pane_id}' 'pnpm dev:wrangler'); \
		pnpm dev; \
		tmux kill-pane -t $$PANE_ID 2>/dev/null || true; \
	else \
		tmux kill-session -t charni-dev 2>/dev/null || true; \
		tmux new-session -d -s charni-dev 'pnpm dev; tmux kill-session -t charni-dev'; \
		tmux split-window -h -t charni-dev 'pnpm dev:wrangler; tmux kill-session -t charni-dev'; \
		tmux attach-session -t charni-dev; \
	fi

deploy:
	pnpm deploy

seed-users:
	pnpm install
	npx tsx seed/seed-users.ts
	
remote-seed-users:
	pnpm install
	npx tsx seed/seed-users.ts --remote
	
seed-shop:
	pnpm install
	npx tsx seed/seed-shop.ts

remote-seed-shop:
	pnpm install
	npx tsx seed/seed-shop.ts --remote

seed-shops: seed-shop

remote-seed-shops: remote-seed-shop

seed-products:
	pnpm install
	npx tsx seed/seed-products.ts

remote-seed-products:
	pnpm install
	npx tsx seed/seed-products.ts --remote

seed-product-images:
	pnpm install
	npx tsx seed/seed-product-images.ts

remote-seed-product-images:
	pnpm install
	npx tsx seed/seed-product-images.ts --remote

seed-events:
	pnpm install
	npx tsx seed/seed-events.ts

remote-seed-events:
	pnpm install
	npx tsx seed/seed-events.ts --remote