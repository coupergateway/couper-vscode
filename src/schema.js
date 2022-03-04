// TODO: generate from golang:hcl :)

const DEFAULT_LABEL = "…"

const blocks = {
    api: {
        parents: ['server'],
        labels: [null, DEFAULT_LABEL]
    },
    backend: {
        parents: ['beta_oauth2', 'definitions', 'jwt', 'oauth2', 'oidc', 'proxy', 'request'],
        labelled: (parentBlockName) => {
            return parentBlockName === "definitions"
        }
    },
    basic_auth: {
        parents: ['definitions'],
        labelled: true
    },
    beta_oauth2: {
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
        labels: ['/']
    },
    error_handler: {
        parents: ['api', 'basic_auth', 'beta_oauth2', 'endpoint', 'jwt', 'oidc', 'saml'],
        labels: (parentBlockName) => {
            return [null].concat(blocks.error_handler._labelsForParent[parentBlockName])
        },
        _labelsForParent: {
            'api':         ['beta_scope', 'beta_insufficient_scope', 'beta_operation_denied'],
            'basic_auth':  ['basic_auth', 'basic_auth_credentials_missing'],
            'endpoint':    ['beta_scope', 'beta_insufficient_scope', 'beta_operation_denied', 'sequence', 'unexpected_status'],
            'jwt':         ['jwt', 'jwt_token_expired', 'jwt_token_invalid', 'jwt_token_missing'],
            'saml':        ['saml'],
            'beta_oauth2': ['oauth2'],
            'oidc':        ['oauth2']
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
    oidc: {
        parents: ['definitions'],
        labelled: true
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
        labels: [null, DEFAULT_LABEL]
    },
    settings: {
        labelled: false
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
        parents: ['api', 'endpoint', 'files', 'server', 'spa'],
        type: 'array'
    },
    accept_forwarded_url: {
        parents: ['settings'],
        type: 'array'
    },
    add_form_params: {
        parents: ['backend', 'endpoint', 'error_handler', 'proxy'],
        type: 'map'
    },
    add_query_params: {
        parents: ['backend', 'endpoint', 'error_handler', 'proxy'],
        type: 'map'
    },
    add_request_headers: {
        parents: ['backend', 'endpoint', 'error_handler', 'proxy', 'websockets'],
        type: 'map'
    },
    add_response_headers: {
        parents: ['api', 'backend', 'endpoint', 'error_handler', 'files', 'proxy', 'server', 'spa', 'websockets'],
        type: 'map'
    },
    allow_credentials: {
        parents: ['cors'],
        type: 'boolean'
    },
    allowed_methods: {
        parents: ['api', 'endpoint'],
        type: 'array'
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
        parents: ['beta_oauth2', 'jwt', 'oauth2', 'oidc', 'proxy', 'request']
    },
    base_path: {
        parents: ['api', 'files', 'server', 'spa']
    },
    basic_auth: {
        parents: ['backend']
    },
    beta_metrics: {
        parents: ['settings'],
        type: 'boolean',
    },
    beta_metrics_port: {
        parents: ['settings'],
        type: 'number',
    },
    beta_roles_claim: {
        parents: ['jwt']
    },
    beta_roles_map: {
        parents: ['jwt'],
        type: 'map'
    },
    beta_scope: {
        parents: ['api', 'endpoint']
    },
    beta_scope_claim: {
        parents: ['jwt']
    },
    beta_scope_map: {
        parents: ['jwt'],
        type: 'map'
    },
    beta_service_name: {
        parents: ['settings'],
    },
    body: {
        parents: ['request', 'response']
    },
    bootstrap_file: {
        parents: ['spa']
    },
    claims: {
        parents: ['jwt', 'jwt_signing_profile'],
        type: 'map'
    },
    client_id: {
        parents: ['beta_oauth2', 'oauth2', 'oidc']
    },
    client_secret: {
        parents: ['beta_oauth2', 'oauth2', 'oidc']
    },
    configuration_url: {
        parents: ['oidc']
    },
    configuration_ttl: {
        parents: ['oidc']
    },
    cookie: {
        parents: ['jwt']
    },
    connect_timeout: {
        parents: ['backend']
    },
    custom_log_fields: {
        parents: ['api', 'backend', 'endpoint', 'error_handler', 'files', 'server', 'spa', 'jwt', 'basic_auth', 'saml', 'beta_oidc', 'beta_oauth2'],
        type: 'map'
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
        type: 'array'
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
        parents: ['files']
    },
    environment_variables: {
        parents: ['defaults'],
        type: 'map'
    },
    error_file: {
        parents: ['api', 'endpoint', 'error_handler', 'files', 'server']
    },
    expected_status: {
        parents: ['proxy', 'request'],
        type: 'array',
        arrayType: 'number'
    },
    file: {
        parents: ['openapi']
    },
    form_body: {
        parents: ['request'],
        type: 'map'
    },
    grant_type: {
        parents: ['beta_oauth2', 'oauth2'],
        options: ['authorization_code', 'client_credentials']
    },
    header: {
        parents: ['jwt']
    },
    headers: {
        parents: ['jwt_signing_profile', 'request', 'response'],
        type: 'map'
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
        type: 'map'
    },
    jwks_ttl: {
        parents: ['jwt']
    },
    jwks_url: {
        parents: ['jwt']
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
    log_level: {
        parents: ['settings'],
        options: ['info', 'panic', 'fatal', 'error', 'warn', 'debug', 'trace']
    },
    log_pretty: {
        parents: ['settings'],
        type: 'boolean'
    },
    max_age: {
        parents: ['cors']
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
        parents: ['backend', 'endpoint', 'error_handler', 'proxy']
    },
    path_prefix: {
        parents: ['backend']
    },
    paths: {
        parents: ['spa'],
        type: 'array'
    },
    proxy: {
        parents: ['backend']
    },
    query_params: {
        parents: ['request'],
        type: 'map'
    },
    realm: {
        parents: ['basic_auth']
    },
    redirect_uri: {
        parents: ['beta_oauth2', 'oidc']
    },
    remove_form_params: {
        parents: ['backend', 'endpoint', 'error_handler', 'proxy'],
        type: 'array'
    },
    remove_query_params: {
        parents: ['backend', 'endpoint', 'error_handler', 'proxy'],
        type: 'array'
    },
    remove_request_headers: {
        parents: ['backend', 'endpoint', 'error_handler', 'proxy', 'websockets'],
        type: 'array'
    },
    remove_response_headers: {
        parents: ['api', 'backend', 'endpoint', 'error_handler', 'files', 'proxy', 'server', 'spa', 'websockets'],
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
    retries: {
        parents: ['oauth2'],
        type: 'number'
    },
    scope: {
        parents: ['beta_oauth2', 'oauth2', 'oidc']
    },
    secure_cookies: {
        parents: ['settings']
    },
    set_form_params: {
        parents: ['backend', 'endpoint', 'error_handler', 'proxy'],
        type: 'map'
    },
    set_query_params: {
        parents: ['backend', 'endpoint', 'error_handler', 'proxy'],
        type: 'map'
    },
    set_request_headers: {
        parents: ['backend', 'endpoint', 'error_handler', 'proxy', 'websockets'],
        type: 'map'
    },
    set_response_headers: {
        parents: ['api', 'backend', 'endpoint', 'error_handler', 'files', 'proxy', 'server', 'spa', 'websockets'],
        type: 'map'
    },
    set_response_status: {
        parents: ['backend', 'endpoint', 'error_handler'],
        type: 'number'
    },
    signature_algorithm: {
        parents: ['jwt', 'jwt_signing_profile'],
        options: ['ES256', 'ES384', 'ES512', 'HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512']
    },
    signing_key: {
        parents: ['jwt']
    },
    signing_key_file: {
        parents: ['jwt']
    },
    signing_ttl: {
        parents: ['jwt']
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
        parents: ['beta_oauth2', 'oauth2']
    },
    token_endpoint_auth_method: {
        parents: ['beta_oauth2', 'oauth2', 'oidc'],
        options: ['client_secret_basic', 'client_secret_post']
    },
    token_value: {
        parents: ['jwt'],
        type: 'any'
    },
    ttfb_timeout: {
        parents: ['backend']
    },
    ttl: {
        parents: ['jwt_signing_profile']
    },
    url: {
        parents: ['request', 'proxy']
    },
    user: {
        parents: ['basic_auth']
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
    default: { description: 'Returns the first of the given arguments that is not null.' },
    json_decode: { description: 'Parses the given JSON string and, if it is valid, returns the value it represents.' },
    json_encode: { description: 'Returns a JSON serialization of the given value.' },
    jwt_sign: { description: 'jwt_sign creates and signs a JSON Web Token (JWT) from information from a referenced jwt_signing_profile block and additional claims provided as a function parameter.' },
    merge: { description: 'Deep-merges two or more of either objects or tuples. `null` arguments are ignored. A `null` attribute value in an object removes the previous attribute value. An attribute value with a different type than the current value is set as the new value. `merge()` with no parameters returns `null`.' },
    oauth2_authorization_url: { description: 'Creates an OAuth2 authorization URL from a referenced OAuth2 AC Block or OIDC Block.' },
    oauth2_verifier: { description: 'Creates a cryptographically random key as specified in RFC 7636, applicable for all verifier methods; e.g. to be set as a cookie and read into verifier_value. Multiple calls of this function in the same client request context return the same value.' },
    relative_url: { description: 'Returns a relative URL by retaining path, query and fragment components. The input URL must begin with `/<path>`, `//<authority>`, `http://` or `https://`, otherwise an error is thrown.' },
    saml_sso_url: { description: 'Creates a SAML SingleSignOn URL (including the `SAMLRequest` parameter) from a referenced `saml` block.' },
    split: { description: 'Divides a given string by a given separator.' },
    substr: { description: 'Extracts a sequence of characters from another string.' },
    to_lower: { description: 'Converts a given string to lowercase.' },
    to_upper: { description: 'Converts a given string to uppercase.' },
    unixtime: { description: 'Retrieves the current UNIX timestamp in seconds.' },
    url_encode: { description: 'URL-encodes a given string according to RFC 3986.' },
}

const commonProperties = ['body', 'context', 'cookies', 'headers', 'json_body']

const variables = {
    backend_request: {
        parents: ['backend'],
        values: commonProperties.concat(...[
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
        values: commonProperties.concat(...[
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
        values: commonProperties.concat(...[
            'status'
        ])
    },
    backend_responses: {
        child: 'default',
        values: commonProperties.concat(...[
            'status'
        ])
    },
    couper: {
        values: ['version']
    },
    env: {
        values: []
    },
    request: {
        values: commonProperties.concat(...[
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
    }
}

module.exports = { attributes, blocks, functions, variables, DEFAULT_LABEL }
