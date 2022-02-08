# Changelog

## [Unreleased](https://github.com/avenga/couper/compare-vscode/v1.0.1...master)

### Added

- `log_level` attribute for `settings` block [#62](https://github.com/avenga/couper-vscode/pull/62)
- `disable_private_caching` attribute for `jwt` block [#65](https://github.com/avenga/couper-vscode/pull/65)
- `beta_scope_map` attribute for `jwt` block [#66](https://github.com/avenga/couper-vscode/pull/66)
- `backend_request` and `backend_response` variables [#64](https://github.com/avenga/couper-vscode/pull/64)

### Fixed

- type of `custom_log_fields` [#62](https://github.com/avenga/couper-vscode/pull/62)

---

## [v1.0.1](https://github.com/avenga/couper-vscode/releases/tag/v1.0.1)

### Fixed

- Broken universal version
- _Go to definition_ sometimes jumped too short [#61](https://github.com/avenga/couper-vscode/pull/61)

## [v1.0.0](https://github.com/avenga/couper-vscode/releases/tag/v1.0.0)

### Added

- Support for running as [web-extension](https://code.visualstudio.com/api/extension-guides/web-extensions) [#60](https://github.com/avenga/couper-vscode/pull/60)
  - [vscode.dev](https://vscode.dev/)
  - [github.dev](https://github.dev/github/dev)

## [v0.9.0](https://github.com/avenga/couper-vscode/releases/tag/v0.9.0)

### Added

- `custom_log_fields` attribute in blocks: [#54](https://github.com/avenga/couper-vscode/pull/54)
  - `api`
  - `backend`
  - `endpoint`
  - `error_handler`
  - `files`
  - `server`
  - `spa`
  - access-control definitions: `basic_auth`, `beta_oauth2`, `oidc`, `jwt`, `saml`
- `expected_status` attribute in `proxy` and `request` blocks [#59](https://github.com/avenga/couper-vscode/pull/59)
- `sequence` and `unexpected_status` error types [#59](https://github.com/avenga/couper-vscode/pull/59)
- completion for EC signing algorithms [#56](https://github.com/avenga/couper-vscode/pull/56)

### Changed

- Unbeta the `oidc` block and the `oauth2_authorization_url()` and `oauth2_verifier()` functions [#57](https://github.com/avenga/couper-vscode/pull/57)

> 2021-11-25

## [v0.8.1](https://github.com/avenga/couper-vscode/releases/tag/v0.8.1)

### Added

- `functions`:
  - `split()` [#52](https://github.com/avenga/couper-vscode/pull/52)
  - `substr()` [#52](https://github.com/avenga/couper-vscode/pull/52)

### Changed

- `functions`:
  - `coalesce()` is renamed to `default()` [#52](https://github.com/avenga/couper-vscode/pull/52)

> 2021-11-25

## [v0.8.0](https://github.com/avenga/couper-vscode/releases/tag/v0.8.0)

### Added

- `server` and `api` block completion with optional label [#49](https://github.com/avenga/couper-vscode/pull/49)
- `functions`:
  - `relative_url()` [#48](https://github.com/avenga/couper-vscode/pull/48)
- _Go to definition_ for `access_control`, `disable_access_control` and `backend` references [#44](https://github.com/avenga/couper-vscode/pull/44)
- `api` block:
  - `error_handler` block [#51](https://github.com/avenga/couper-vscode/pull/51)
- `endpoint` block:
  - `error_handler` block [#51](https://github.com/avenga/couper-vscode/pull/51)

> 2021-10-20

## [v0.7.0](https://github.com/avenga/couper-vscode/compare/v0.6.0...v0.7.0)

### Added

- `api` block:
  - `beta_scope` [#41](https://github.com/avenga/couper-vscode/pull/41)
- `endpoint` block:
  - `beta_scope` [#41](https://github.com/avenga/couper-vscode/pull/41)
- `jwt` block:
  - `signing_key`, `signing_key_file`, `signing_ttl` attributes [#39](https://github.com/avenga/couper-vscode/pull/39)
  - `jwks_url`, `jwks_ttl` attributes, `backend` block or reference [#40](https://github.com/avenga/couper-vscode/pull/40)
  - `beta_scope_claim` [#41](https://github.com/avenga/couper-vscode/pull/41)
  - `beta_roles_claim`, `beta_roles_map` [#42](https://github.com/avenga/couper-vscode/pull/42), [#46](https://github.com/avenga/couper-vscode/pull/46)
  - `token_value` [#45](https://github.com/avenga/couper-vscode/pull/45)
- `jwt_signing_profile` block:
  - `headers` map [#43](https://github.com/avenga/couper-vscode/pull/43)
- `settings` block:
  - `beta_metrics`, `beta_metrics_port`, `beta_service_name` [#47](https://github.com/avenga/couper-vscode/pull/47)

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
