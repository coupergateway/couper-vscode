.PHONY: all install compile run run-web host-vscode-dev test lint

__DIR__ := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

all: install

install:
	rm -f $(HOME)/.vscode/extensions/couper
	ln -s $(__DIR__) $(HOME)/.vscode/extensions/couper

compile:
	npm run compile

run: compile
	code --extensionDevelopmentPath=$(__DIR__)

run-web: compile
	code --extensionDevelopmentPath=$(__DIR__) --extensionDevelopmentKind=web

host-vscode-dev: compile
	npx serve --cors -l 5000 & trap 'kill $$!' EXIT; npx localtunnel -p 5000

test:
	npm test -- --testNamePattern $(TEST)

lint:
	npm run lint
