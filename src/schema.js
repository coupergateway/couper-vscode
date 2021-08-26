// TODO: generate from golang:hcl :)

const blocks = {
    api: {
        parents: ['server'],
        labelled: false
    },
    backend: {
        parents: ['definitions', 'proxy', 'request', 'oauth2', 'beta_oauth2', 'beta_oidc'],
        labelled: true
    },
    basic_auth: {
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
    cors: {
        parents: ['api', 'files', 'server', 'spa'],
        labelled: false
    },
    defaults: {
        labelled: false
    },
    definitions: {
        labelled: false
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
        parents: ['server'],
        labelled: false
    },
    jwt: {
        parents: ['definitions'],
        labelled: true
    },
    jwt_signing_profile: {
        parents: ['definitions'],
        labelled: true
    },
    oauth2: {
        parents: ['backend'],
        labelled: false
    },
    openapi: {
        parents: ['backend'],
        labelled: false
    },
    proxy: {
        parents: ['endpoint', 'error_handler'],
        labelled: false
    },
    request: {
        parents: ['endpoint', 'error_handler'],
        labelled: true
    },
    response: {
        parents: ['endpoint', 'error_handler'],
        labelled: false
    },
    saml: {
        parents: ['definitions'],
        labelled: true
    },
    server: {
        labelled: true
    },
    settings: {
        labelled: false,
    },
    spa: {
        parents: ['server'],
        labelled: false
    },
    websockets: {
        parents: ['proxy'],
        labelled: false
    }
}

const attributes = {
    access_control: {
        parents: ['server', 'files', 'spa', 'endpoint', 'api'],
        type: 'array'
    },
    accept_forwarded_url: {
        parents: ['settings'],
        type: 'array'
    },
    add_form_params: {
        parents: ['backend', 'endpoint', 'proxy'],
        type: 'block'
    },
    add_query_params: {
        parents: ['backend', 'endpoint', 'proxy', 'error_handler'],
        type: 'block'
    },
    add_request_headers: {
        parents: ['backend', 'endpoint', 'proxy', 'error_handler', 'websockets'],
        type: 'block'
    },
    add_response_headers: {
        parents: ['server', 'files', 'spa', 'api', 'backend', 'endpoint', 'proxy', 'error_handler', 'websockets'],
        type: 'block'
    },
    allow_credentials: {
        parents: ['cors'],
        type: 'boolean'
    },
    allowed_origins: {
        parents: ['cors'],
        type: 'array'
    },
    array_attributes: {
        parents: ['saml'],
        type: 'array'
    },
	authorization_endpoint: {
		parents: ['beta_oauth2']
	},
    backend: { // label reference
        parents: ['request', 'proxy', 'oauth2', 'beta_oauth2', 'beta_oidc']
    },
    base_path: {
        parents: ['server', 'api']
    },
    basic_auth: {
        parents: ['backend']
    },
    body: {
        parents: ['request', 'response']
    },
    bootstrap_file: {
        parents: ['spa']
    },
    claims: {
        parents: ['jwt', 'jwt_signing_profile'],
        type: 'block'
    },
    client_id: {
        parents: ['oauth2', 'beta_oauth2', 'beta_oidc'],
    },
    client_secret: {
        parents: ['oauth2', 'beta_oauth2', 'beta_oidc'],
    },
	configuration_url: {
		parents: ['beta_oidc']
	},
	configuration_ttl: {
		parents: ['beta_oidc']
	},
    cookie: {
        parents: ['jwt']
    },
    connect_timeout: {
        parents: ['backend']
    },
    default_port: {
        parents: ['settings'],
        type: 'number'
    },
    disable_access_control: {
        parents: ['server', 'files', 'spa', 'endpoint', 'api'],
        type: 'array'
    },
    disable_certificate_validation: {
        parents: ['backend']
    },
    disable_connection_reuse: {
        parents: ['backend']
    },
    document_root: {
        parents: ['files']
    },
    environment_variables: {
        parents: ['defaults'],
        type: 'block'
    },
    error_file: {
        parents: ['api', 'files', 'server', 'endpoint', 'error_handler']
    },
    file: {
        parents: ['openapi'],
    },
    form_body: {
        parents: ['request'],
        type: 'block'
    },
    grant_type: {
        parents: ['oauth2', 'beta_oauth2'],
        options: ['client_credentials', 'authorization_code'],
    },
    header: {
        parents: ['jwt']
    },
    headers: {
        parents: ['request', 'response'],
        type: 'block'
    },
    health_path: {
        parents: ['settings']
    },
    hostname: {
        parents: ['backend']
    },
    hosts: {
        parents: ['server'],
        type: 'array'
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
        type: 'array'
    },
    idp_metadata_file: {
        parents: ['saml']
    },
    ignore_request_violations: {
        parents: ['openapi'],
        type: 'boolean'
    },
    ignore_response_violations: {
        parents: ['openapi'],
        type: 'boolean'
    },
    json_body: {
        parents: ['request', 'response'],
        type: 'block'
    },
    key: {
        parents: ['jwt', 'jwt_signing_profile']
    },
    key_file: {
        parents: ['jwt', 'jwt_signing_profile']
    },
    log_format: {
        parents: ['settings']
    },
    log_pretty: {
        parents: ['settings'],
        type: 'boolean'
    },
    max_age: {
        parents: ['cors'],
    },
    max_connections: {
        parents: ['backend'],
        type: 'number'
    },
    method: {
        parents: ['request']
    },
    no_proxy_from_env: {
        parents: ['settings'],
        type: 'boolean'
    },
    origin: {
        parents: ['backend']
    },
    password: {
        parents: ['basic_auth']
    },
    path: {
        parents: ['backend', 'endpoint', 'proxy', 'error_handler']
    },
    paths: {
        parents: ['spa'],
        type: 'array'
    },
    proxy: {
        parents: ['backend']
    },
    realm: {
        parents: ['basic_auth']
    },
	redirect_uri: {
		parents: ['beta_oauth2', 'beta_oidc']
	},
    remove_form_params: {
        parents: ['backend', 'endpoint', 'proxy'],
        type: 'array'
    },
    remove_query_params: {
        parents: ['backend', 'endpoint', 'proxy', 'error_handler'],
        type: 'array'
    },
    remove_request_headers: {
        parents: ['backend', 'endpoint', 'proxy', 'error_handler', 'websockets'],
        type: 'array'
    },
    remove_response_headers: {
        parents: ['server', 'files', 'spa', 'api', 'backend', 'endpoint', 'proxy', 'error_handler', 'websockets'],
        type: 'array'
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
        parents: ['settings']
    },
    required_claims: {
        parents: ['jwt'],
        type: 'array'
    },
    scope: {
        parents: ['oauth2', 'beta_oauth2', 'beta_oidc'],
    },
    secure_cookies: {
        parents: ['settings']
    },
    set_form_params: {
        parents: ['backend', 'endpoint', 'proxy'],
        type: 'block'
    },
    set_query_params: {
        parents: ['backend', 'endpoint', 'proxy', 'error_handler'],
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
    set_response_status: {
        parents: ['backend', 'endpoint', 'error_handler'],
        type: 'number'
    },
    signature_algorithm: {
        parents: ['jwt', 'jwt_signing_profile'],
        options: ['RS256', 'RS384', 'RS512', 'HS256', 'HS384', 'HS512'],
    },
    sp_acs_url: {
        parents: ['saml']
    },
    sp_entity_id: {
        parents: ['saml']
    },
    status: {
        parents: ['response'],
        type: 'number'
    },
    timeout: {
        parents: ['backend', 'websockets']
    },
    token_endpoint: {
        parents: ['oauth2', 'beta_oauth2'],
    },
    token_endpoint_auth_method: {
        parents: ['oauth2', 'beta_oauth2', 'beta_oidc'],
        options: ['client_secret_basic', 'client_secret_post'],
    },
    ttfb_timeout: {
        parents: ['backend']
    },
    ttl : {
        parents: ['jwt_signing_profile']
    },
    url: {
        parents: ['request', 'proxy']
    },
    user: {
        parents: ['basic_auth']
    },
	verifier_method: {
		parents: ['beta_oauth2', 'beta_oidc'],
		options: ['ccm_s256', 'state', 'nonce'],
	},
	verifier_value: {
		parents: ['beta_oauth2', 'beta_oidc']
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
    backend_requests: {
        child: 'default',
        values: commonProperties.concat(...['method', 'path', 'query', 'body', 'form_body', 'json_body', 'url', 'origin', 'protocol', 'host', 'port']),
    },
    backend_responses: {
        child: 'default',
        values: commonProperties.concat(...['status', 'json_body']),
    },
    couper: { values: ['version'] },
    env: { values: [] },
    request: { values: commonProperties.concat(...['id', 'method', 'path', 'path_params', 'query', 'body', 'form_body', 'json_body', 'url', 'origin', 'protocol', 'host', 'port']) },
}

module.exports = { attributes, blocks, functions, variables }
