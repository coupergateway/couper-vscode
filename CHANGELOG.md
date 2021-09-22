# Changelog

## [Unreleased](https://github.com/avenga/couper/compare-vscode/v0.6.0...master)

### Added

- `jwt` block:
  - `signing_key`, `signing_key_file`, `signing_ttl` [#39](https://github.com/avenga/couper-vscode/pull/39)
  - `jwks_uri`, `jwks_ttl` [#40](https://github.com/avenga/couper-vscode/pull/40)

<a name="v0.6.0"></a>

## [v0.6.0](https://github.com/avenga/couper-vscode/compare/v0.5.0...v0.6.0)

> 2021-08-24

### Added

- `beta_*`:
  - `beta_oauth2` & `beta_oidc` block [#33](https://github.com/avenga/couper-vscode/issues/33)
  - related functions: `beta_oauth_authorization_url` and `beta_oauth_verifier`
- `settings` block: [#34](https://github.com/avenga/couper-vscode/issues/34)
  - `accept_forwarded_url` [#30](https://github.com/avenga/couper-vscode/issues/30)
  - `https_dev_proxy`
  - `log_pretty`
  - `request_id_accept_from_header`
  - `request_id_backend_header`
  - `request_id_client_header`
  - `request_id_format`
  - `secure_cookies`
- `defaults` block:
  - `environment_variables` [#28](https://github.com/avenga/couper-vscode/issues/28)
- `websockets` block and attribute [#35](https://github.com/avenga/couper-vscode/issues/35)
- Variables:
  - `couper.version` [#31](https://github.com/avenga/couper-vscode/issues/31)
  - `backend_requests.*.{body,json_body,origin,protocol,host,port}` [#32](https://github.com/avenga/couper-vscode/issues/32)
  - `request.{origin,protocol,host,port}`
- Missing blocks and attributes:
  - `openapi` block
  - `disable` attribute
  - `path_prefix` attribute
  - `query_params` attribute
  - `retries` attribute

### Fixes

- highlighting for quoted map keys [#29](https://github.com/avenga/couper-vscode/issues/29)
- highlight comments after attributes [#29](https://github.com/avenga/couper-vscode/issues/29)
- support for `\"` in strings, highlight escape sequences [#29](https://github.com/avenga/couper-vscode/issues/29)
- indented heredoc highlighting [#29](https://github.com/avenga/couper-vscode/issues/29)

<a name="v0.5.0"></a>

## [v0.5.0](https://github.com/avenga/couper-vscode/compare/v0.4.0...v0.5.0)

> 2021-06-21

### Added

- completion for `set_response_status` within `backend`, `endpoint` and `error_handler` blocks [#27](https://github.com/avenga/couper-vscode/issues/27)
- support for form parameter: `set_form_params`, `add_form_params`, `remove_form_params` [#23](https://github.com/avenga/couper-vscode/issues/23)

### Changed

- response-headers modifier are available for: `server`, `files`, `spa`, `api` blocks [#26](https://github.com/avenga/couper-vscode/issues/26)

## [v0.4.0](https://github.com/avenga/couper-vscode/compare/v0.3.0...v0.4.0)

> 2021-05-20

### Added

- Add autocompletion for error-handling ([#24](https://github.com/avenga/couper-vscode/issues/24))
- Add more OAuth2 options: `token_endpoint_auth_method` and `scope` ([#22](https://github.com/avenga/couper-vscode/issues/22))

### Fixed

- Fix function description type: rendered as markdown now
- Fix `form_body` autocompletion type to object `{}` ([#20](https://github.com/avenga/couper-vscode/issues/20))
- Fix `json_body` autocompletion type to object `{}` ([#20](https://github.com/avenga/couper-vscode/issues/20))

## [v0.3.0](https://github.com/avenga/couper-vscode/compare/v0.2.0...v0.3.0)

> 2021-04-08

### Bug Fixes

- Remove obsolete new line for block snippets
- No string text snippets for attribute number types ([#19](https://github.com/avenga/couper-vscode/pull/19))

### Changes

- Variable names related to couper specification changes ([#18](https://github.com/avenga/couper-vscode/pull/18))

### Features

- `json_body` and `form_body` attributes [#16](https://github.com/avenga/couper-vscode/issues/16)
- Suggestion for known const values ([#19](https://github.com/avenga/couper-vscode/pull/19))
  - `grant_type` (oauth2)
  - `signature_algorithm` (jwt)

## [v0.2.0](https://github.com/avenga/couper-vscode/compare/v0.1.1...v0.2.0)

> 2021-03-25

### Bug Fixes

- Fix auto-space in assignment snippet

### Changes

- Schema update to reflect Couper 0.7 features [#15](https://github.com/avenga/couper-vscode/issues/15)

### Features

- Added `functions` with documentation

## [v0.1.1](https://github.com/avenga/couper-vscode/compare/v0.1.0...v0.1.1)

> 2020-12-21

### Add

- Add boolean attribute type; prevent string auto-completion

## [v0.1.0](https://github.com/avenga/couper-vscode/compare/v0.0.3...v0.1.0)

> 2020-12-21

### Add

- autocompletion for missing variable properties: `path_params` and common ones: `ctx`, `cookies`, `headers`
- autocompletion for `query_params` and `openapi`

### Change

- `set_request_headers` and `set_response_headers` as replacement for `request/response_headers`

### Fix

- map assignment to hcl syntax highlighting
- variable completion for attributes with string quote or function usage on left side
- wrong autocomplete behaviour while typing a specific character

### Pull Requests

- Merge pull request [#14](https://github.com/avenga/couper-vscode/issues/14) from avenga/fix-var-map-highlighting
- Merge pull request [#10](https://github.com/avenga/couper-vscode/issues/10) from avenga/add-missing-variables
- Merge pull request [#11](https://github.com/avenga/couper-vscode/issues/11) from avenga/add-openapi
- Merge pull request [#12](https://github.com/avenga/couper-vscode/issues/12) from avenga/vscode-ignore
- Merge pull request [#8](https://github.com/avenga/couper-vscode/issues/8) from avenga/query-params
- Merge pull request [#9](https://github.com/avenga/couper-vscode/issues/9) from avenga/set-headers

## [v0.0.3](https://github.com/avenga/couper-vscode/compare/v0.0.2...v0.0.3)

> 2020-11-02

### Add

- Add api/cors and disable_access_control attributes

### Fix

- Fix lacking support for hcl in general (variable types) ([#5](https://github.com/avenga/couper-vscode/issues/5))
- Fix language activation events and alias for couper / hcl

## [v0.0.2](https://github.com/avenga/couper-vscode/compare/v0.0.1...v0.0.2)

> 2020-10-29

### Add

- a quoted snippet for non block attributes
- auto-completion for blocks, attributes and (parent)variables with type trigger
- support for child variables/attributes
- settings block

### Evaluate

- Evaluate scope position; variables are allowed for backend scope only

### Fix

- label block states which was added within wrong context
- Allow backend in defaults block

### Change

- to the latest backend block attributes

### Pull Requests

- Merge pull request [#1](https://github.com/avenga/couper-vscode/issues/1) from avenga/lang-conf-update
- Merge pull request [#3](https://github.com/avenga/couper-vscode/issues/3) from avenga/release-action
- Merge pull request [#2](https://github.com/avenga/couper-vscode/issues/2) from avenga/readme-update

## v0.0.1

> 2020-10-26

Initial release

### Add

- Basic support for configuration block and attribute completion
