// TODO: generate from golang:hcl :)

const DEFAULT_LABEL = "…"

const blocks = {
	api: {
		parents: ['server'],
		description: "Bundles endpoints under a certain `base_path`.",
		examples: ['api-proxy'],
		labels: [null, DEFAULT_LABEL]
	},
	backend: {
		parents: ['beta_oauth2', 'beta_token_request', 'definitions', 'jwt', 'oauth2', 'oidc', 'proxy', 'request'],
		description: "Defines the connection to a local/remote backend service.",
		examples: ['backend-configuration'],
		labels: (parentBlockName) => {
			return parentBlockName === "definitions" ? [DEFAULT_LABEL] : [DEFAULT_LABEL, null]
		}
	},
	basic_auth: {
		parents: ['definitions'],
		description: "Access control for Basic Authentication.",
		labelled: true
	},
	beta_oauth2: {
		parents: ['definitions'],
		description: "Access control for an OAuth2 Authorization Code Grant Flow redirect endpoint.",
		docs: '/configuration/block/oauth2',
		labelled: true
	},
	beta_health: {
		parents: ['backend'],
		examples: ['health-check'],
		docs: '/configuration/block/health',
		labelled: false
	},
	beta_job: {
		parents: ['definitions'],
		docs: '/configuration/block/job',
		labelled: true
	},
	beta_rate_limit: {
		parents: (context) => {
			if (context.length >= 2 && context[0].name === "backend" && context[1].name === "definitions") {
				return ['backend']
			}
			return `"beta_rate_limit" only valid in a "backend" in a "definitions" block.`
		},
		description: "Protects backend services. It implements quota management used to avoid cascading failures or to spare resources.",
		labelled: false
	},
	beta_token_request: {
		parents: ['backend'],
		description: "Configures a request to get a token used to authorize backend requests.",
		labels: [null, DEFAULT_LABEL]
	},
	client_certificate: {
		parents: (context) => {
			if (context.length >= 2 && context[0].name === "tls" && context[1].name === "server") {
				return ['tls']
			}
			return `"client_certificate" only valid in a "tls" in a "server" block.`
		},
		description: "Configures a client certificate.",
		labels: [null, DEFAULT_LABEL]
	},
	cors: {
		parents: ['api', 'files', 'server', 'spa'],
		description: "Configures CORS (Cross-Origin Resource Sharing) behavior.",
		labelled: false
	},
	defaults: {
		description: "Sets default values.",
		labelled: false
	},
	definitions: {
		description: "Defines configurations for reuse.",
		labelled: false
	},
	endpoint: {
		parents: ['api', 'server'],
		description: "Defines the entry points of Couper.",
		labels: ['/']
	},
	environment: {
		preprocessed: true,
		description: "Refines the configuration based on the current environment.",
		labels: [DEFAULT_LABEL],
		parents: context => {
			for (const item of context) {
				if (item.name === "environment" && item.type === "block") {
					return `Nested "environment" blocks are not allowed.`
				}
			}
			return ALL_BLOCKS_BUT_ENVIRONMENT.concat([null]) // top-level
		},
		examples: ['environment']
	},
	error_handler: {
		parents: ['api', 'basic_auth', 'beta_oauth2', 'endpoint', 'jwt', 'oidc', 'saml'],
		examples: ['error-handling-ba', 'sequences'],
		labels: (parentBlockName) => {
			return [null].concat(blocks.error_handler._labelsForParent[parentBlockName])
		},
		_labelsForParent: {
			'api':         ['access_control', 'backend', 'backend_timeout', 'backend_openapi_validation', 'backend_unhealthy', 'beta_backend_token_request', 'insufficient_permissions', 'beta_insufficient_permissions'],
			'basic_auth':  ['access_control', 'basic_auth', 'basic_auth_credentials_missing'],
			'endpoint':    ['access_control', 'backend', 'backend_timeout', 'backend_openapi_validation', 'backend_unhealthy', 'beta_backend_token_request', 'endpoint', 'insufficient_permissions', 'beta_insufficient_permissions', 'sequence', 'unexpected_status'],
			'jwt':         ['access_control', 'jwt', 'jwt_token_expired', 'jwt_token_invalid', 'jwt_token_missing'],
			'saml':        ['access_control', 'saml'],
			'beta_oauth2': ['access_control', 'oauth2'],
			'oidc':        ['access_control', 'oauth2']
		}
	},
	files: {
		parents: ['server'],
		description: "Configures file serving.",
		examples: ['simple-fileserving', 'spa-serving'],
		labels: [null, DEFAULT_LABEL]
	},
	jwt: {
		parents: ['definitions'],
		description: "Configures a JSON Web Token access control.",
		examples: ['jwt-access-control', 'creating-jwt'],
		labelled: true
	},
	jwt_signing_profile: {
		parents: ['definitions', 'beta_oauth2', 'oauth2', 'oidc'],
		description: "Configure a JSON Web Token signing profile which is referenced in the `jwt_sign()` function.",
		examples: ['creating-jwt'],
		labels: (parentBlockName) => {
			return parentBlockName === "definitions" ? [DEFAULT_LABEL] : [null]
		}
	},
	oauth2: {
		parents: ['backend'],
		description: "Configures the OAuth2 Client Credentials flow to request a bearer token for its backend request.",
		docs: '/configuration/block/oauth2req_auth',
		examples: ['oauth2-client-credentials'],
		labelled: false
	},
	oidc: {
		parents: ['definitions'],
		description: "An access control for an OIDC Authorization Code Grant Flow redirect endpoint.",
		examples: ['oidc'],
		labelled: true
	},
	openapi: {
		parents: ['backend'],
		description: "Configures the OpenAPI 3 validation of messages to and from the origin.",
		examples: ['backend-validation'],
		labelled: false
	},
	proxy: {
		parents: ['definitions', 'endpoint', 'error_handler'],
		description: "Executes a proxy request to a backend service.",
		examples: ['api-proxy', 'custom-requests', 'multiple-requests'],
		labels: (parentBlockName) => {
			return parentBlockName === "definitions" ? [DEFAULT_LABEL] : [DEFAULT_LABEL, null]
		}
	},
	request: {
		parents: ['endpoint', 'error_handler', 'beta_job'],
		description: "Executes a request to a backend service.",
		examples: ['custom-requests', 'multiple-requests'],
		labels: [null, DEFAULT_LABEL]
	},
	response: {
		parents: ['endpoint', 'error_handler'],
		description: "Sends a client response.",
		examples: ['static-responses'],
		labelled: false
	},
	saml: {
		parents: ['definitions'],
		description: "An access control for a SAML ACS endpoint.",
		examples: ['saml'],
		labelled: true
	},
	server: {
		labels: [null, DEFAULT_LABEL],
		description: "Bundles gateway services accessible under a port.",
	},
	server_certificate: {
		parents: (context) => {
			if (context.length >= 2 && context[0].name === "tls" && context[1].name === "server") {
				return ['tls']
			}
			return `"server_certificate" only valid in a "tls" in a "server" block.`
		},
		description: "Configures a server certificate.",
		labels: [null, DEFAULT_LABEL]
	},
	settings: {
		description: "Configures global behavior of your gateway.",
		labelled: false
	},
	spa: {
		parents: ['server'],
		description: "Configures how SPA assets are served.",
		examples: ['spa-serving'],
		labels: [null, DEFAULT_LABEL]
	},
	tls: {
		parents: ['backend', 'server'],
		description: "Configures mTLS for backend or server.",
		labelled: false
	},
	websockets: {
		parents: ['proxy'],
		description: "Activates support for WebSocket connections.",
		labelled: false
	}
}

const attributes = {
	access_control: {
		parents: ['api', 'endpoint', 'files', 'server', 'spa'],
		description: "Secures the current block context with a predefined access control.",
		examples: ['jwt-access-control'],
		definingBlocks: ['basic_auth', 'jwt', 'oidc', 'saml', 'beta_oauth2'],
		type: 'tuple'
	},
	accept_forwarded_url: {
		parents: ['settings'],
		type: 'tuple',
		options: ['proto', 'host', 'port']
	},
	add_form_params: {
		parents: ['backend', 'endpoint', 'error_handler', 'proxy'],
		type: 'object'
	},
	add_query_params: {
		parents: ['backend', 'endpoint', 'error_handler', 'proxy'],
		examples: ['query'],
		type: 'object'
	},
	add_request_headers: {
		parents: ['backend', 'endpoint', 'error_handler', 'proxy', 'websockets'],
		type: 'object'
	},
	add_response_headers: {
		parents: ['api', 'backend', 'endpoint', 'error_handler', 'files', 'proxy', 'server', 'spa', 'websockets'],
		type: 'object'
	},
	allow_credentials: {
		parents: ['cors'],
		type: 'boolean'
	},
	allowed_methods: {
		parents: ['api', 'endpoint'],
		type: 'tuple',
		options: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', '*']
	},
	allowed_origins: {
		parents: ['cors'],
		type: ['tuple', 'string']
	},
	array_attributes: {
		parents: ['saml'],
		examples: ['saml'],
		type: 'tuple'
	},
	assertion: {
		parents: ['oauth2']
	},
	authorization_endpoint: {
		parents: ['beta_oauth2']
	},
	backend: { // label reference
		parents: ['beta_oauth2', 'beta_token_request', 'jwt', 'oauth2', 'oidc', 'proxy', 'request'],
		definingBlocks: ["backend"],
		examples: ['backend-configuration']
	},
	base_path: {
		parents: ['api', 'files', 'server', 'spa']
	},
	basic_auth: {
		parents: ['backend']
	},
	bearer: {
		parents: ['jwt'],
		type: 'boolean',
	},
	beta_metrics: {
		parents: ['settings'],
		type: 'boolean',
	},
	beta_metrics_port: {
		parents: ['settings'],
		type: 'number',
	},
	beta_service_name: {
		parents: ['settings'],
	},
	body: {
		parents: ['beta_token_request', 'request', 'response']
	},
	bootstrap_file: {
		parents: ['spa'],
		examples: ['spa-serving']
	},
	bootstrap_data: {
		parents: ['spa'],
		type: 'object'
	},
	bootstrap_data_placeholder: {
		parents: ['spa'],
	},
	ca_certificate: {
		parents: ['client_certificate']
	},
	ca_certificate_file: {
		parents: ['client_certificate']
	},
	ca_file: {
		parents: ['settings']
	},
	claims: {
		parents: ['jwt', 'jwt_signing_profile'],
		examples: ['jwt-access-control'],
		type: 'object'
	},
	client_certificate: {
		parents: (context) => {
			if (context.length >= 2 && context[0].name === "tls" && context[1].name === "backend") {
				return ['tls']
			}
			return `"client_certificate" only valid in a "tls" in a "backend" block.`
		}
	},
	client_certificate_file: {
		parents: (context) => {
			if (context.length >= 2 && context[0].name === "tls" && context[1].name === "backend") {
				return ['tls']
			}
			return `"client_certificate_file" only valid in a "tls" in a "backend" block.`
		}
	},
	client_id: {
		parents: ['beta_oauth2', 'oauth2', 'oidc'],
		examples: ['oauth2-client-credentials', 'oidc']
	},
	client_private_key: {
		parents: (context) => {
			if (context.length >= 2 && context[0].name === "tls" && context[1].name === "backend") {
				return ['tls']
			}
			return `"client_private_key" only valid in a "tls" in a "backend" block.`
		}
	},
	client_private_key_file: {
		parents: (context) => {
			if (context.length >= 2 && context[0].name === "tls" && context[1].name === "backend") {
				return ['tls']
			}
			return `"client_private_key_file" only valid in a "tls" in a "backend" block.`
		}
	},
	client_secret: {
		parents: ['beta_oauth2', 'oauth2', 'oidc'],
		examples: ['oauth2-client-credentials', 'oidc']
	},
	configuration_backend: { // label reference
		parents: ['oidc'],
		definingBlocks: ["backend"]
	},
	configuration_max_stale: {
		parents: ['oidc'],
		type: 'duration'
	},
	configuration_url: {
		parents: ['oidc'],
		examples: ['oidc']
	},
	configuration_ttl: {
		parents: ['oidc'],
		type: 'duration'
	},
	cookie: {
		parents: ['jwt']
	},
	connect_timeout: {
		parents: ['backend'],
		type: 'duration'
	},
	custom_log_fields: {
		parents: ['api', 'backend', 'endpoint', 'error_handler', 'files', 'server', 'spa', 'jwt', 'basic_auth', 'saml', 'oidc', 'beta_job', 'beta_oauth2'],
		examples: ['custom-logging', 'sequences'],
		type: 'object'
	},
	default_port: {
		parents: ['settings'],
		type: 'number'
	},
	disable: {
		parents: ['cors'],
		type: 'boolean'
	},
	disable_access_control: {
		parents: ['api', 'endpoint', 'files', 'server', 'spa'],
		definingBlocks: ['basic_auth', 'jwt', 'oidc', 'saml', 'beta_oauth2'],
		type: 'tuple'
	},
	disable_certificate_validation: {
		parents: ['backend'],
		type: 'boolean'
	},
	disable_connection_reuse: {
		parents: ['backend'],
		type: 'boolean'
	},
	disable_private_caching: {
		parents: ['jwt'],
		type: 'boolean'
	},
	document_root: {
		parents: ['files'],
		examples: ['simple-fileserving', 'spa-serving']
	},
	environment_variables: {
		parents: ['defaults'],
		examples: ['env-var'],
		type: 'object'
	},
	error_file: {
		parents: ['api', 'endpoint', 'error_handler', 'files', 'server'],
		examples: ['simple-fileserving']
	},
	expected_status: {
		parents: ['beta_health', 'beta_token_request', 'proxy', 'request'],
		type: 'tuple',
		examples: ['sequences'],
		tupleType: 'number'
	},
	expected_text: {
		parents: ['beta_health']
	},
	environment: {
		parents: ['settings']
	},
	failure_threshold: {
		parents: ['beta_health'],
		type: 'number'
	},
	file: {
		parents: ['openapi']
	},
	form_body: {
		parents: ['beta_token_request', 'request'],
		type: 'object'
	},
	grant_type: {
		parents: ['beta_oauth2', 'oauth2'],
		options: ['authorization_code', 'client_credentials', 'password', 'urn:ietf:params:oauth:grant-type:jwt-bearer']
	},
	header: {
		parents: ['jwt'],
		examples: ['jwt-access-control']
	},
	headers: {
		parents: ['beta_health', 'beta_token_request', 'jwt_signing_profile', 'request', 'response'],
		examples: ['static-responses'],
		type: 'object'
	},
	health_path: {
		parents: ['settings']
	},
	hostname: {
		parents: ['backend']
	},
	hosts: {
		parents: ['server'],
		type: 'tuple'
	},
	htpasswd_file: {
		parents: ['basic_auth']
	},
	http2: {
		parents: ['backend'],
		type: 'boolean'
	},
	https_dev_proxy: {
		parents: ['settings'],
		type: 'tuple'
	},
	idp_metadata_file: {
		parents: ['saml'],
		examples: ['saml']
	},
	ignore_request_violations: {
		parents: ['openapi'],
		type: 'boolean'
	},
	ignore_response_violations: {
		parents: ['openapi'],
		type: 'boolean'
	},
	interval: {
		parents: ['beta_health', 'beta_job'],
		type: 'duration'
	},
	json_body: {
		parents: ['beta_token_request', 'request', 'response'],
		examples: ['static-responses'],
		type: ['boolean', 'number', 'string', 'object', 'tuple'],
	},
	jwks_uri_backend: { // label reference
		parents: ['oidc'],
		definingBlocks: ["backend"]
	},
	jwks_ttl: {
		parents: ['jwt', 'oidc'],
		type: 'duration'
	},
	jwks_max_stale: {
		parents: ['jwt', 'oidc'],
		type: 'duration'
	},
	jwks_url: {
		parents: ['jwt'],
		examples: ['jwt-access-control']
	},
	key: {
		parents: ['jwt', 'jwt_signing_profile'],
		examples: ['jwt-access-control']
	},
	key_file: {
		parents: ['jwt', 'jwt_signing_profile'],
		examples: ['jwt-access-control']
	},
	leaf_certificate: {
		parents: ['client_certificate']
	},
	leaf_certificate_file: {
		parents: ['client_certificate']
	},
	log_format: {
		parents: ['settings'],
		options: ['common', 'json']
	},
	log_level: {
		parents: ['settings'],
		options: ['info', 'panic', 'fatal', 'error', 'warn', 'debug', 'trace']
	},
	log_pretty: {
		parents: ['settings'],
		type: 'boolean'
	},
	max_age: {
		parents: ['cors'],
		type: 'duration'
	},
	max_connections: {
		parents: ['backend'],
		type: 'number'
	},
	method: {
		parents: ['beta_token_request', 'request']
	},
	mode: {
		parents: ['beta_rate_limit'],
		options: ['wait', 'block']
	},
	name: {
		parents: ['proxy'],
		description: "Defines the proxy request name. Allowed only in the definitions block.",
	},
	no_proxy_from_env: {
		parents: ['settings'],
		type: 'boolean'
	},
	origin: {
		parents: ['backend']
	},
	password: {
		parents: ['basic_auth', 'oauth2']
	},
	path: {
		parents: ['backend', 'beta_health']
	},
	path_prefix: {
		parents: ['backend']
	},
	paths: {
		parents: ['spa'],
		examples: ['spa-serving'],
		type: 'tuple'
	},
	period: {
		parents: ['beta_rate_limit'],
		type: 'duration'
	},
	period_window: {
		parents: ['beta_rate_limit'],
		options: ['sliding', 'fixed']
	},
	permissions_claim: {
		parents: ['jwt'],
		examples: ['permissions', 'permissions-map', 'permissions-rbac']
	},
	beta_permissions_claim: {
		parents: ['jwt'],
		examples: ['permissions', 'permissions-map', 'permissions-rbac'],
		deprecated: {
			version: 'v1.13',
			attribute: 'permissions_claim'
		}
	},
	permissions_map: {
		parents: ['jwt'],
		examples: ['permissions-map'],
		type: 'object'
	},
	beta_permissions_map: {
		parents: ['jwt'],
		examples: ['permissions-map'],
		type: 'object',
		deprecated: {
			version: 'v1.13',
			attribute: 'permissions_map'
		}
	},
	permissions_map_file: {
		parents: ['jwt'],
		examples: ['permissions-map']
	},
	beta_permissions_map_file: {
		parents: ['jwt'],
		examples: ['permissions-map'],
		deprecated: {
			version: 'v1.13',
			attribute: 'permissions_map_file'
		}
	},
	per_period: {
		parents: ['beta_rate_limit'],
		type: 'number'
	},
	public_key: {
		parents: ['server_certificate']
	},
	public_key_file: {
		parents: ['server_certificate']
	},
	private_key: {
		parents: ['server_certificate']
	},
	private_key_file: {
		parents: ['server_certificate']
	},
	proxy: { // (label reference in endpoints)
		parents: ['backend', 'endpoint'],
		definingBlocks: ["proxy"]
	},
	query_params: {
		parents: ['beta_token_request', 'request'],
		type: 'object'
	},
	realm: {
		parents: ['basic_auth']
	},
	redirect_uri: {
		parents: ['beta_oauth2', 'oidc'],
		examples: ['oidc']
	},
	remove_form_params: {
		parents: ['backend', 'endpoint', 'error_handler', 'proxy'],
		type: 'tuple'
	},
	remove_query_params: {
		parents: ['backend', 'endpoint', 'error_handler', 'proxy'],
		examples: ['query'],
		type: 'tuple'
	},
	remove_request_headers: {
		parents: ['backend', 'endpoint', 'error_handler', 'proxy', 'websockets'],
		type: 'tuple'
	},
	remove_response_headers: {
		parents: ['api', 'backend', 'endpoint', 'error_handler', 'files', 'proxy', 'server', 'spa', 'websockets'],
		type: 'tuple'
	},
	request_body_limit: {
		parents: ['endpoint']
	},
	request_id_accept_from_header: {
		parents: ['settings']
	},
	request_id_backend_header: {
		parents: ['settings']
	},
	request_id_client_header: {
		parents: ['settings']
	},
	request_id_format: {
		parents: ['settings'],
		options: ['common', 'uuid4']
	},
	required_claims: {
		parents: ['jwt'],
		examples: ['jwt-access-control'],
		type: 'tuple'
	},
	required_permission: {
		parents: ['api', 'endpoint'],
		examples: ['permissions', 'permissions-map', 'permissions-rbac'],
		type: ['string', 'object']
	},
	beta_required_permission: {
		parents: ['api', 'endpoint'],
		examples: ['permissions', 'permissions-map', 'permissions-rbac'],
		type: ['string', 'object'],
		deprecated: {
			version: 'v1.13',
			attribute: 'required_permission'
		}
	},
	retries: {
		parents: ['oauth2'],
		type: 'number'
	},
	roles_claim: {
		parents: ['jwt'],
		examples: ['permissions-rbac']
	},
	beta_roles_claim: {
		parents: ['jwt'],
		examples: ['permissions-rbac'],
		deprecated: {
			version: 'v1.13',
			attribute: 'roles_claim'
		}
	},
	roles_map: {
		parents: ['jwt'],
		examples: ['permissions-rbac'],
		type: 'object'
	},
	beta_roles_map: {
		parents: ['jwt'],
		examples: ['permissions-rbac'],
		type: 'object',
		deprecated: {
			version: 'v1.13',
			attribute: 'roles_map'
		}
	},
	roles_map_file: {
		parents: ['jwt'],
		examples: ['permissions-rbac']
	},
	beta_roles_map_file: {
		parents: ['jwt'],
		examples: ['permissions-rbac'],
		deprecated: {
			version: 'v1.13',
			attribute: 'roles_map_file'
		}
	},
	scope: {
		parents: ['beta_oauth2', 'oauth2', 'oidc']
	},
	secure_cookies: {
		parents: ['settings'],
		options: ['strip', '']
	},
	server_ca_certificate: {
		parents: (context) => {
			if (context.length >= 2 && context[0].name === "tls" && context[1].name === "backend") {
				return ['tls']
			}
			return `"server_ca_certificate" only valid in a "tls" in a "backend" block.`
		}
	},
	server_ca_certificate_file: {
		parents: (context) => {
			if (context.length >= 2 && context[0].name === "tls" && context[1].name === "backend") {
				return ['tls']
			}
			return `"server_ca_certificate_file" only valid in a "tls" in a "backend" block.`
		}
	},
	server_timing_header: {
		parents: ['settings'],
		type: 'boolean'
	},
	set_form_params: {
		parents: ['backend', 'endpoint', 'error_handler', 'proxy'],
		type: 'object'
	},
	set_query_params: {
		parents: ['backend', 'endpoint', 'error_handler', 'proxy'],
		examples: ['query'],
		type: 'object'
	},
	set_request_headers: {
		parents: ['backend', 'endpoint', 'error_handler', 'proxy', 'websockets'],
		examples: ['sending-jwt-upstream'],
		type: 'object'
	},
	set_response_headers: {
		parents: ['api', 'backend', 'endpoint', 'error_handler', 'files', 'proxy', 'server', 'spa', 'websockets'],
		type: 'object'
	},
	set_response_status: {
		parents: ['backend', 'endpoint', 'error_handler'],
		type: 'number'
	},
	signature_algorithm: {
		parents: ['jwt', 'jwt_signing_profile'],
		options: ['ES256', 'ES384', 'ES512', 'HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512'],
		examples: ['jwt-access-control']
	},
	signing_key: {
		parents: ['jwt']
	},
	signing_key_file: {
		parents: ['jwt']
	},
	signing_ttl: {
		parents: ['jwt'],
		type: 'duration'
	},
	sp_acs_url: {
		parents: ['saml'],
		examples: ['saml'],
	},
	sp_entity_id: {
		parents: ['saml'],
		examples: ['saml']
	},
	status: {
		parents: ['response'],
		examples: ['static-responses'],
		type: 'number'
	},
	timeout: {
		parents: ['backend', 'beta_health', 'websockets'],
		type: 'duration'
	},
	token_backend: { // label reference
		parents: ['oidc'],
		definingBlocks: ["backend"]
	},
	token_endpoint: {
		parents: ['beta_oauth2', 'oauth2']
	},
	token_endpoint_auth_method: {
		parents: ['beta_oauth2', 'oauth2', 'oidc'],
		options: ['client_secret_basic', 'client_secret_jwt', 'client_secret_post', 'private_key_jwt']
	},
	token: {
		parents: ['beta_token_request']
	},
	token_value: {
		parents: ['jwt'],
		examples: ['jwt-access-control'],
		type: ['string', 'number', 'boolean']
	},
	ttfb_timeout: {
		parents: ['backend'],
		type: 'duration'
	},
	ttl: {
		parents: ['beta_token_request', 'jwt_signing_profile'],
		type: 'duration'
	},
	url: {
		parents: ['beta_token_request', 'request', 'proxy']
	},
	use_when_unhealthy: {
		parents: ['backend'],
		type: 'boolean'
	},
	user: {
		parents: ['basic_auth']
	},
	username: {
		parents: ['oauth2']
	},
	userinfo_backend: { // label reference
		parents: ['oidc'],
		definingBlocks: ["backend"]
	},
	verifier_method: {
		parents: ['beta_oauth2', 'oidc'],
		options: ['ccm_s256', 'nonce', 'state']
	},
	verifier_value: {
		parents: ['beta_oauth2', 'oidc']
	},
	websockets: {
		parents: ['proxy'],
		type: 'boolean'
	},
	xfh: {
		parents: ['settings'],
		type: 'boolean'
	}
}

const functions = {
	base64_decode: { description: 'Decodes Base64 data, as specified in RFC 4648.' },
	base64_encode: { description: 'Encodes Base64 data, as specified in RFC 4648.' },
	contains: { description: 'Determines whether a given list contains a given single value as one of its elements.' },
	default: { description: 'Returns the first of the given arguments that is not null.' },
	join: { description: 'Concatenates together the string elements of one or more lists with a given separator.' },
	json_decode: { description: 'Parses the given JSON string and, if it is valid, returns the value it represents.' },
	json_encode: {
		description: 'Returns a JSON serialization of the given value.',
		examples: ['sending-jwt-upstream'],
	},
	jwt_sign: { description: 'jwt_sign creates and signs a JSON Web Token (JWT) from information from a referenced jwt_signing_profile block and additional claims provided as a function parameter.' },
	keys: { description: 'Takes a map and returns a sorted list of the map keys.' },
	length: { description: 'Returns the number of elements in the given collection.' },
	lookup: { description: 'Performs a dynamic lookup into a map.' },
	merge: { description: 'Deep-merges two or more of either objects or tuples. `null` arguments are ignored. A `null` attribute value in an object removes the previous attribute value. An attribute value with a different type than the current value is set as the new value. `merge()` with no parameters returns `null`.' },
	oauth2_authorization_url: {
		description: 'Creates an OAuth2 authorization URL from a referenced OAuth2 AC Block or OIDC Block.',
		examples: ['oidc']
	},
	oauth2_verifier: { description: 'Creates a cryptographically random key as specified in RFC 7636, applicable for all verifier methods; e.g. to be set as a cookie and read into verifier_value. Multiple calls of this function in the same client request context return the same value.' },
	relative_url: { description: 'Returns a relative URL by retaining path, query and fragment components. The input URL must begin with `/<path>`, `//<authority>`, `http://` or `https://`, otherwise an error is thrown.' },
	saml_sso_url: {
		description: 'Creates a SAML SingleSignOn URL (including the `SAMLRequest` parameter) from a referenced `saml` block.',
		examples: ['saml']
	},
	set_intersection: { description: 'Returns a new set containing the elements that exist in all of the given sets.' },
	split: { description: 'Divides a given string by a given separator.' },
	substr: { description: 'Extracts a sequence of characters from another string.' },
	to_lower: { description: 'Converts a given string to lowercase.' },
	to_number: { description: 'Converts its argument to a number value.' },
	to_upper: { description: 'Converts a given string to uppercase.' },
	trim: { description: 'Removes any whitespace characters from the start and end of the given string.' },
	unixtime: { description: 'Retrieves the current UNIX timestamp in seconds.' },
	url_encode: { description: 'URL-encodes a given string according to RFC 3986.' },
}

const commonProperties = ['body', 'context', 'cookies', 'headers', 'json_body']

const variables = {
	backend: {
		parents: ['backend'],
		description: "An object with backend attributes.",
		values: [
			'health', // TODO how to add health object properties?
			'beta_tokens',
			'beta_token'
		]
	},
	backends: {
		child: 'default',
		description: "An object with all backends and their attributes. To access a specific backend use the related name.",
		values: [
			'health',
			'beta_tokens',
			'beta_token'
		]
	},
	backend_request: {
		parents: ['backend'],
		description: "Holds information about the current backend request.",
		values: commonProperties.concat([
			'form_body',
			'host',
			'id',
			'method',
			'origin',
			'path',
			'port',
			'protocol',
			'query',
			'url'
		])
	},
	backend_requests: {
		child: 'default',
		description: "An object with all backend requests and their attributes. To access a specific request use the related label.\n\n`request` and `proxy` blocks without a label will be available as `default`.\n\n**Example:** Use `backend_requests.default.method` to access the HTTP method of the default  request.",
		values: commonProperties.concat([
			'form_body',
			'host',
			'id',
			'method',
			'origin',
			'path',
			'port',
			'protocol',
			'query',
			'url'
		])
	},
	backend_response: {
		parents: ['backend'],
		values: commonProperties.concat([
			'status'
		])
	},
	backend_responses: {
		child: 'default',
		values: commonProperties.concat([
			'status'
		])
	},
	couper: {
		values: ['environment', 'version']
	},
	env: {
		description: "The value of an environment variable.",
		examples: ['env-var', 'docker-compose#environment-variables'],
		values: []
	},
	request: {
		values: commonProperties.concat([
			'form_body',
			'host',
			'id',
			'method',
			'origin',
			'path',
			'path_params',
			'port',
			'protocol',
			'query',
			'url'
		])
	},
	beta_token_response: {
		parents: ['beta_token_request'],
		description: "Holds information about the current token response.",
		values: commonProperties.concat([
			'status'
		])
	}
}

const ALL_BLOCKS = Object.keys(blocks)
const ALL_BLOCKS_BUT_ENVIRONMENT = ALL_BLOCKS.filter(block => block !== "environment")

module.exports = { attributes, blocks, functions, variables, DEFAULT_LABEL }
