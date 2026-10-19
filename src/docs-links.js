"use strict"

const { blocks } = require("./schema")

const DOCUMENTATION_URL = "https://docs.couper.io"
const EXAMPLES_URL = "https://github.com/coupergateway/couper-examples/tree/master/"

const blockUrl = (name) => DOCUMENTATION_URL + (blocks[name]?.docs ?? "/configuration/block/" + name)
const attributeUrl = (parentBlock) => blockUrl(parentBlock) + "#attributes"
const functionUrl = () => DOCUMENTATION_URL + "/configuration/functions"
const variableUrl = (name) => DOCUMENTATION_URL + "/configuration/variables#" + name
const exampleUrl = (example) => EXAMPLES_URL + example

module.exports = { DOCUMENTATION_URL, blockUrl, attributeUrl, functionUrl, variableUrl, exampleUrl }
