.PHONY: all install run run-web host-vscode-dev test

__DIR__ := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

all: install

install:
	rm -f $(HOME)/.vscode/extensions/couper
	ln -s $(__DIR__) $(HOME)/.vscode/extensions/couper

run:
	code --extensionDevelopmentPath=$(__DIR__)

run-web:
	code --extensionDevelopmentPath=$(__DIR__) --extensionDevelopmentKind=web

host-vscode-dev:
	$(npx serve --cors -l 5000)
	npx localtunnel -p 5000

test:
	npm run jest
