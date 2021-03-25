__DIR__ := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

all: install

install:
	rm -f $(HOME)/.vscode/extensions/couper
	ln -s $(__DIR__) $(HOME)/.vscode/extensions/couper

run:
	code --extensionDevelopmentPath=$(__DIR__)

# TAG=v0.3 make changelog
changelog:
	git-chglog --next-tag $(TAG) $(TAG)
