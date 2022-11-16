# Couper Configuration for Visual Studio Code

![Tests](https://github.com/avenga/couper-vscode/actions/workflows/test.yaml/badge.svg)

This extension adds Couper-specific highlighting, autocompletion, diagnostics and more to [Couper's configuration files](https://docs.couper.io/configuration/configuration-file) in Visual Studio Code.

### Features

Select from Couper specific suggestions like blocks, attributes and variables based on your document context.
Jump directly to the necessary label or value spots.

![](images/example.gif)

### Development

To test or improve this extension you can start with `make run` and `make test` within your working directory.

#### Web-Extension

This extension is also build as web-ext. You can use `make run-web` for local testing or `make host-vscode-dev` to run
on vscode.dev environment. See https://code.visualstudio.com/api/extension-guides/web-extensions#test-your-web-extension-in-on-vscode.dev .

### About Couper

[Couper](https://github.com/avenga/couper) is a lightweight API gateway designed to support developers in building and operating API-driven Web projects. Acting as a proxy component it connects clients with (micro) services and adds access control and observability to the project.

### [License](LICENSE)

[MIT](LICENSE)
