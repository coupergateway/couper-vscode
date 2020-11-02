
<a name="v0.0.3"></a>
## [v0.0.3](https://github.com/avenga/couper-vscode/compare/v0.0.2...v0.0.3)

> 2020-11-02

### Add

* Add api/cors and disable_access_control attributes

### Fix

* Fix lacking support for hcl in general (variable types) ([#5](https://github.com/avenga/couper-vscode/issues/5))
* Fix language activation events and alias for couper / hcl


<a name="v0.0.2"></a>
## [v0.0.2](https://github.com/avenga/couper-vscode/compare/v0.0.1...v0.0.2)

> 2020-10-29

### Add

* a quoted snippet for non block attributes
* auto-completion for blocks, attributes and (parent)variables with type trigger
* support for child variables/attributes
* settings block

### Evaluate

* Evaluate scope position; variables are allowed for backend scope only

### Fix

* label block states which was added within wrong context
* Allow backend in defaults block

### Change

* to the latest backend block attributes

### Pull Requests

* Merge pull request [#1](https://github.com/avenga/couper-vscode/issues/1) from avenga/lang-conf-update
* Merge pull request [#3](https://github.com/avenga/couper-vscode/issues/3) from avenga/release-action
* Merge pull request [#2](https://github.com/avenga/couper-vscode/issues/2) from avenga/readme-update

<a name="v0.0.1"></a>
## v0.0.1

> 2020-10-26

Initial release

### Add

* Basic support for configuration block and attribute completion
