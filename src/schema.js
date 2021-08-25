// TODO: generate from golang:hcl :)

const blocks = {
    server: {
        labelled: true
    },
    endpoint: {
        parents: ['api', 'server'],
        labelled: true
    },
    error_handler: {
        parents: ['basic_auth', 'jwt', 'saml', 'beta_oauth2', 'beta_oidc'],
        labelled: false,
        labels: {
            'basic_auth': ['basic_auth', 'basic_auth_credentials_missing'],
            'jwt':        ['jwt', 'jwt_token_expired', 'jwt_token_invalid', 'jwt_token_missing'],
            'saml':       ['saml2'],
            'beta_oauth2': ['oauth2'],
            'beta_oidc':   ['oauth2'],
        }
    },
    files: {
        parents: ['server']
    },
    spa: {
        parents: ['server']
    },
    api: {
        parents: ['server']
    },
    cors: {
        parents: ['api', 'files', 'server', 'spa'],
        labelled: false,
    },
    proxy: {
        parents: ['endpoint', 'error_handler']
    },
    request: {
        parents: ['endpoint', 'error_handler']
    },
    response: {
        parents: ['endpoint', 'error_handler']
    },
    backend: {
        parents: ['definitions', 'proxy', 'request', 'oauth2', 'beta_oauth2', 'beta_oidc'],
    },
    oauth2: {
        parents: ['backend'],
    },
    jwt: {
        parents: ['definitions'],
        labelled: true
    },
    jwt_signing_profile: {
        parents: ['definitions'],
        labelled: true
    },
    basic_auth: {
        parents: ['definitions'],
        labelled: true
    },
    saml: {
        parents: ['definitions'],
        labelled: true
    },
    beta_oauth2: {
        parents: ['definitions'],
        labelled: true
    },
    beta_oidc: {
        parents: ['definitions'],
        labelled: true
    },
    defaults: {
        labelled: false,
    },
    definitions: {
        labelled: false,
    },
    settings: {
        labelled: false,
    },
    websockets: {
        parents: ['proxy'],
        labelled: false
    }
}

const attributes = {
    // cors
    allowed_origins: {
        parents: ['cors'],
        type: 'array'
    },
    allow_credentials: {
        parents: ['cors'],
        type: 'boolean'
    },
    max_age: {
        parents: ['cors'],
    },

    // server
    hosts: {
        parents: ['server'],
        type: 'array'
    },
    document_root: {
        parents: ['files']
    },
    error_file: {
        parents: ['api', 'files', 'server', 'endpoint', 'error_handler']
    },
    bootstrap_file: {
        parents: ['spa']
    },
    paths: {
        parents: ['spa'],
        type: 'array'
    },
    base_path: {
        parents: ['server', 'api']
    },

    // backend
    origin: {
        parents: ['backend']
    },
    hostname: {
        parents: ['backend']
    },
    basic_auth: {
        parents: ['backend']
    },
    disable_certificate_validation: {
        parents: ['backend']
    },
    disable_connection_reuse: {
        parents: ['backend']
    },
    http2: {
        parents: ['backend'],
        type: 'boolean'
    },
    max_connections: {
        parents: ['backend'],
        type: 'number'
    },
    proxy: {
        parents: ['backend']
    },
    connect_timeout: {
        parents: ['backend']
    },
    ttfb_timeout: {
        parents: ['backend']
    },
    timeout: {
        parents: ['backend', 'websockets']
    },

    // backend oauth2, beta_oauth2, beta_oidc
    grant_type: {
        parents: ['oauth2', 'beta_oauth2'],
        options: ['client_credentials', 'authorization_code'],
    },
    token_endpoint: {
        parents: ['oauth2', 'beta_oauth2'],
    },
    token_endpoint_auth_method: {
        parents: ['oauth2', 'beta_oauth2', 'beta_oidc'],
        options: ['client_secret_basic', 'client_secret_post'],
    },
    client_id: {
        parents: ['oauth2', 'beta_oauth2', 'beta_oidc'],
    },
    client_secret: {
        parents: ['oauth2', 'beta_oauth2', 'beta_oidc'],
    },
    scope: {
        parents: ['oauth2', 'beta_oauth2', 'beta_oidc'],
    },

    // endpoint
    request_body_limit: {
        parents: ['endpoint']
    },

    access_control: {
        parents: ['server', 'files', 'spa', 'endpoint', 'api'],
        type: 'array'
    },

    disable_access_control: {
        parents: ['server', 'files', 'spa', 'endpoint', 'api'],
        type: 'array'
    },

	// various
    backend: { // label reference
        parents: ['request', 'proxy', 'oauth2', 'beta_oauth2', 'beta_oidc']
    },

    // request / proxy / response
    body: {
        parents: ['request', 'response']
    },
    json_body: {
        parents: ['request', 'response'],
        type: 'block'
    },
    form_body: {
        parents: ['request'],
        type: 'block'
    },
    headers: {
        parents: ['request', 'response'],
        type: 'block'
    },
    method: {
        parents: ['request']
    },
    url: {
        parents: ['request', 'proxy']
    },
    status: {
        parents: ['response'],
        type: 'number'
    },
    websockets: {
        parents: ['proxy'],
        type: 'boolean'
    },

    // JWT / signing profile
    cookie: {
        parents: ['jwt']
    },
    header: {
        parents: ['jwt']
    },
    claims: {
        parents: ['jwt', 'jwt_signing_profile'],
        type: 'block'
    },
    required_claims: {
        parents: ['jwt'],
        type: 'array'
    },
    key: {
        parents: ['jwt', 'jwt_signing_profile']
    },
    key_file: {
        parents: ['jwt', 'jwt_signing_profile']
    },
    signature_algorithm: {
        parents: ['jwt', 'jwt_signing_profile'],
        options: ['RS256', 'RS384', 'RS512', 'HS256', 'HS384', 'HS512'],
    },
    ttl : {
        parents: ['jwt_signing_profile']
    },

    // basic_auth
    user: {
        parents: ['basic_auth']
    },
    password: {
        parents: ['basic_auth']
    },
    realm: {
        parents: ['basic_auth']
    },
    htpasswd_file: {
        parents: ['basic_auth']
    },

    // saml
    idp_metadata_file: {
        parents: ['saml']
    },
    sp_acs_url: {
        parents: ['saml']
    },
    sp_entity_id: {
        parents: ['saml']
    },
    array_attributes: {
        parents: ['saml'],
        type: 'array'
    },

	// beta_oauth2, beta_oidc
	redirect_uri: {
		parents: ['beta_oauth2', 'beta_oidc']
	},
	verifier_method: {
		parents: ['beta_oauth2', 'beta_oidc'],
		options: ['ccm_s256', 'state', 'nonce'],
	},
	verifier_value: {
		parents: ['beta_oauth2', 'beta_oidc']
	},

	// beta_oauth2
	authorization_endpoint: {
		parents: ['beta_oauth2']
	},

	// beta_oidc
	configuration_url: {
		parents: ['beta_oidc']
	},
	configuration_ttl: {
		parents: ['beta_oidc']
	},

    // meta-attributes
    remove_request_headers: {
        parents: ['backend', 'endpoint', 'proxy', 'error_handler', 'websockets'],
        type: 'array'
    },
    remove_response_headers: {
        parents: ['server', 'files', 'spa', 'api', 'backend', 'endpoint', 'proxy', 'error_handler', 'websockets'],
        type: 'array'
    },
    add_request_headers: {
        parents: ['backend', 'endpoint', 'proxy', 'error_handler', 'websockets'],
        type: 'block'
    },
    add_response_headers: {
        parents: ['server', 'files', 'spa', 'api', 'backend', 'endpoint', 'proxy', 'error_handler', 'websockets'],
        type: 'block'
    },
    set_request_headers: {
        parents: ['backend', 'endpoint', 'proxy', 'error_handler', 'websockets'],
        type: 'block'
    },
    set_response_headers: {
        parents: ['server', 'files', 'spa', 'api', 'backend', 'endpoint', 'proxy', 'error_handler', 'websockets'],
        type: 'block'
    },
    remove_query_params: {
        parents: ['backend', 'endpoint', 'proxy', 'error_handler'],
        type: 'array'
    },
    add_query_params: {
        parents: ['backend', 'endpoint', 'proxy', 'error_handler'],
        type: 'block'
    },
    set_query_params: {
        parents: ['backend', 'endpoint', 'proxy', 'error_handler'],
        type: 'block'
    },
    remove_form_params: {
        parents: ['backend', 'endpoint', 'proxy'],
        type: 'array'
    },
    add_form_params: {
        parents: ['backend', 'endpoint', 'proxy'],
        type: 'block'
    },
    set_form_params: {
        parents: ['backend', 'endpoint', 'proxy'],
        type: 'block'
    },
    path: {
        parents: ['backend', 'endpoint', 'proxy', 'error_handler']
    },

    set_response_status: {
        parents: ['backend', 'endpoint', 'error_handler'],
        type: 'number'
    },

    // openapi block and attributes
    openapi: {
        parents: ['backend'],
        type: 'inline-block'
    },
    file: {
        parents: ['openapi'],
    },
    ignore_request_violations: {
        parents: ['openapi'],
        type: 'boolean'
    },
    ignore_response_violations: {
        parents: ['openapi'],
        type: 'boolean'
    },

    // settings
    accept_forwarded_url: {
        parents: ['settings'],
        type: 'array'
    },
    default_port: {
        parents: ['settings'],
        type: 'number'
    },
    health_path: {
        parents: ['settings']
    },
    https_dev_proxy: {
        parents: ['settings'],
        type: 'array'
    },
    log_format: {
        parents: ['settings']
    },
    log_pretty: {
        parents: ['settings'],
        type: 'boolean'

    },
    no_proxy_from_env: {
        parents: ['settings'],
        type: 'boolean'
    },
    request_id_format: {
        parents: ['settings']
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
    secure_cookies: {
        parents: ['settings']
    },
    xfh: {
        parents: ['settings'],
        type: 'boolean'
    },

    // defaults
    environment_variables: {
        parents: ['defaults'],
        type: 'block'
    },
}

const functions = {
    base64_decode: { description: 'Decodes Base64 data, as specified in RFC 4648.' },
    base64_encode: { description: 'Encodes Base64 data, as specified in RFC 4648.' },
    beta_oauth_authorization_url: { description: 'Creates an OAuth2 authorization URL from a referenced OAuth2 AC Block or OIDC Block.' },
    beta_oauth_verifier: { description: 'Creates a cryptographically random key as specified in RFC 7636, applicable for all verifier methods; e.g. to be set as a cookie and read into verifier_value. Multiple calls of this function in the same client request context return the same value.' },
    coalesce: { description: 'Returns the first of the given arguments that is not null.' },
    json_decode: { description: 'Parses the given JSON string and, if it is valid, returns the value it represents.' },
    json_encode: { description: 'Returns a JSON serialization of the given value.' },
    jwt_sign: { description: 'jwt_sign creates and signs a JSON Web Token (JWT) from information from a referenced jwt_signing_profile block and additional claims provided as a function parameter.' },
    merge: { description: 'Deep-merges two or more of either objects or tuples. `null` arguments are ignored. A `null` attribute value in an object removes the previous attribute value. An attribute value with a different type than the current value is set as the new value. `merge()` with no parameters returns `null`.' },
    saml_sso_url: { description: 'Creates a SAML SingleSignOn URL (including the `SAMLRequest` parameter) from a referenced `saml` block.' },
    to_lower: { description: 'Converts a given string to lowercase.' },
    to_upper: { description: 'Converts a given string to uppercase.' },
    unixtime: { description: 'Retrieves the current UNIX timestamp in seconds.' },
    url_encode: { description: 'URL-encodes a given string according to RFC 3986.' },
}

const commonProperties = ['context', 'cookies', 'headers']
const variables = {
    env: { values: [] },
    couper: { values: ['version'] },
    request: { values: commonProperties.concat(...['id', 'method', 'path', 'path_params', 'query', 'body', 'form_body', 'json_body', 'url', 'origin', 'protocol', 'host', 'port']) },
    backend_requests: {
        child: 'default',
        values: commonProperties.concat(...['method', 'path', 'query', 'body', 'form_body', 'json_body', 'url', 'origin', 'protocol', 'host', 'port']),
    },
    backend_responses: {
        child: 'default',
        values: commonProperties.concat(...['status', 'json_body']),
    },
}

module.exports = { attributes, blocks, functions, variables }
