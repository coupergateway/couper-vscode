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
        parents: ['beta_oauth2', 'definitions', 'jwt', 'oauth2', 'oidc', 'proxy', 'request'],
        description: "Defines the connection to a local/remote backend service.",
        examples: ['backend-configuration'],
        labelled: (parentBlockName) => {
            return parentBlockName === "definitions"
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
        labelled: true
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
    error_handler: {
        parents: ['api', 'basic_auth', 'beta_oauth2', 'endpoint', 'jwt', 'oidc', 'saml'],
        examples: ['error-handling-ba', 'sequences'],
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
        description: "Configures file serving.",
        examples: ['simple-fileserving', 'spa-serving'],
        labelled: false
    },
    jwt: {
        parents: ['definitions'],
        description: "Configures a JSON Web Token access control.",
        examples: ['jwt-access-control', 'creating-jwt'],
        labelled: true
    },
    jwt_signing_profile: {
        parents: ['definitions'],
        description: "Configure a JSON Web Token signing profile which is referenced in the `jwt_sign()` function.",
        examples: ['creating-jwt'],
        labelled: true
    },
    oauth2: {
        parents: ['backend'],
        description: "Configures the OAuth2 Client Credentials flow to request a bearer token for its backend request.",
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
        parents: ['endpoint', 'error_handler'],
        description: "Executes a proxy request to a backend service.",
        examples: ['api-proxy', 'custom-requests', 'multiple-requests'],
        labels: [null, DEFAULT_LABEL]
    },
    request: {
        parents: ['endpoint', 'error_handler'],
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
    settings: {
        description: "Configures global behavior of your gateway.",
        labelled: false
    },
    spa: {
        parents: ['server'],
        description: "Configures how SPA assets are served.",
        examples: ['spa-serving'],
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
        examples: ['query'],
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
        type: 'array',
        options: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    },
    allowed_origins: {
        parents: ['cors'],
        type: 'array'
    },
    array_attributes: {
        parents: ['saml'],
        examples: ['saml'],
        type: 'array'
    },
    authorization_endpoint: {
        parents: ['beta_oauth2']
    },
    backend: { // label reference
        parents: ['beta_oauth2', 'jwt', 'oauth2', 'oidc', 'proxy', 'request'],
        examples: ['backend-configuration']
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
    beta_required_permission: {
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
        parents: ['spa'],
        examples: ['spa-serving']
    },
    ca_file: {
      parents: ['settings']
    },
    claims: {
        parents: ['jwt', 'jwt_signing_profile'],
        examples: ['jwt-access-control'],
        type: 'map'
    },
    client_id: {
        parents: ['beta_oauth2', 'oauth2', 'oidc'],
        examples: ['oauth2-client-credentials', 'oidc']
    },
    client_secret: {
        parents: ['beta_oauth2', 'oauth2', 'oidc'],
        examples: ['oauth2-client-credentials', 'oidc']
    },
    configuration_url: {
        parents: ['oidc'],
        examples: ['oidc']
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
        examples: ['custom-logging', 'sequences'],
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
        parents: ['files'],
        examples: ['simple-fileserving', 'spa-serving']
    },
    environment_variables: {
        parents: ['defaults'],
        examples: ['env-var'],
        type: 'map'
    },
    error_file: {
        parents: ['api', 'endpoint', 'error_handler', 'files', 'server'],
        examples: ['simple-fileserving']
    },
    expected_status: {
        parents: ['proxy', 'request'],
        type: 'array',
        examples: ['sequences'],
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
        parents: ['jwt'],
        examples: ['jwt-access-control']
    },
    headers: {
        parents: ['jwt_signing_profile', 'request', 'response'],
        examples: ['static-responses'],
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
    json_body: {
        parents: ['request', 'response'],
        examples: ['static-responses'],
        type: 'map'
    },
    jwks_ttl: {
        parents: ['jwt']
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
        examples: ['spa-serving'],
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
        parents: ['beta_oauth2', 'oidc'],
        examples: ['oidc']
    },
    remove_form_params: {
        parents: ['backend', 'endpoint', 'error_handler', 'proxy'],
        type: 'array'
    },
    remove_query_params: {
        parents: ['backend', 'endpoint', 'error_handler', 'proxy'],
        examples: ['query'],
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
        examples: ['jwt-access-control'],
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
        examples: ['query'],
        type: 'map'
    },
    set_request_headers: {
        parents: ['backend', 'endpoint', 'error_handler', 'proxy', 'websockets'],
        examples: ['sending-jwt-upstream'],
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
        parents: ['jwt']
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
        examples: ['jwt-access-control'],
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
    unixtime: { description: 'Retrieves the current UNIX timestamp in seconds.' },
    url_encode: { description: 'URL-encodes a given string according to RFC 3986.' },
}

const commonProperties = ['body', 'context', 'cookies', 'headers', 'json_body']

const variables = {
    backend_request: {
        parents: ['backend'],
        description: "Holds information about the current backend request.",
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
        description: "An object with all backend requests and their attributes. To access a specific request use the related label.\n\n`request` and `proxy` blocks without a label will be available as `default`.\n\n**Example:** Use `backend_requests.default.method` to access the HTTP method of the default  request.",
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
        description: "The value of an environment variable.",
        examples: ['env-var', 'docker-compose#environment-variables'],
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
