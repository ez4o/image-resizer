IMAGE_NAME = wst24365888/image-resizer

.PHONY: all build up down deploy push pull restart

all: build up

build:
	@pnpm run build && docker build -t $(IMAGE_NAME):latest .

up:
	@docker compose up -d

down:
	@docker compose down

deploy: build push

push:
	@docker push $(IMAGE_NAME):latest

pull:
	@docker pull $(IMAGE_NAME):latest

restart: pull down up
