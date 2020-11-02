// TODO: generate from golang:hcl :)

const blocks = {
    server: {
        labelled: true
    },
    endpoint: {
        parents: ['api'],
        labelled: true
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
    backend: {
        parents: ['endpoint', 'defaults', 'definitions', 'api'],
    },
    jwt: {
        parents: ['definitions'],
        labelled: true
    },
    basic_auth: {
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
    }
}

const attributes = {
    hosts: {
        parents: ['server'],
        type: 'array'
    },
    document_root: {
        parents: ['files']
    },
    error_file: {
        parents: ['files']
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
    backend: {
        parents: ['endpoint']
    },
    path: {
        parents: ['endpoint', 'backend']
    },
    // backend
    origin: {
        parents: ['backend']
    },
    request_headers: {
        parents: ['backend'],
        type: 'block'
    },
    response_headers: {
        parents: ['backend'],
        type: 'block'
    },
    hostname: {
        parents: ['backend']
    },
    connect_timeout: {
        parents: ['backend']
    },
    request_body_limit: {
        parents: ['backend']
    },
    ttfb_timeout: {
        parents: ['backend']
    },
    timeout: {
        parents: ['backend']
    },

    access_control: {
        parents: ['server', 'files', 'spa', 'endpoint', 'api'],
        type: 'array'
    },
    // JWT
    cookie: {
        parents: ['jwt']
    },
    header: {
        parents: ['jwt']
    },
    key: {
        parents: ['jwt']
    },
    key_file: {
        parents: ['jwt']
    },
    signature_algorithm: {
        parents: ['jwt']
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

    // settings
    default_port: {
        parents: ['settings']
    },
    health_path: {
        parents: ['settings']
    },
    log_format: {
        parents: ['settings']
    },
    xfh: {
        parents: ['settings']
    },
    request_id_format: {
        parents: ['settings']
    },
}

const variables = {
    'env': null,
    'req': ['ctx', 'cookies', 'headers', 'id', 'method', 'path', 'query', 'post', 'url', 'json_body'],
    'bereq': ['ctx', 'cookies', 'headers', 'method', 'path', 'query', 'post', 'url'],
    'beresp': ['ctx', 'cookies', 'headers', 'status', 'json_body'],
}

module.exports = { attributes, blocks, variables }