"use strict"

// Label rules that Couper's generated schema does not express. They name
// blocks, so schema-drift.js validates them against the generated schema.

// Blocks that reject an empty label.
const LABEL_MUST_NOT_BE_EMPTY = ["backend", "environment", "basic_auth", "jwt", "oidc", "saml", "beta_oauth2"]

// Blocks whose label is reachable as a variable (e.g. backends.my_label), so
// the label has to be a valid identifier.
const LABEL_IS_VARIABLE_NAME = ["backend", "request", "proxy", "environment"]

module.exports = { LABEL_MUST_NOT_BE_EMPTY, LABEL_IS_VARIABLE_NAME }
