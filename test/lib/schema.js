const Ajv = require("ajv/dist/2020");

//
// Tests if the value is an object.
//
function isObject(value) {
    return value !== null && typeof value === 'object';
}

//
// Expects that the value matches the schema.
//
function expectMatchesSchema(value, schema) {
    const ajv = new Ajv({
        verbose: true,
        strict: true,
    });
    const validate = ajv.compile(schema);
    const valid = validate(value)
    if (!valid) {
        throw new Error(
            `Expected to match schema\n` +
            validate.errors?.map(e => e.message).join("\n") + "\n" +
            `Value: ${value}\n` +
            `Schema: \n${JSON.stringify(schema, null, 2)}`
        );
    }
}

//
// Expects that the value doesn't match the schema.
//
function expectNotMatchesSchema(value, schema) {
    const ajv = new Ajv({
        verbose: true,
        strict: true,
    });
    const validate = ajv.compile(schema);
    const valid = validate(value);
    if (valid) {
        throw new Error(
            `Expected not to match schema\n` +
            `Value: ${value}\n` +
            `Schema: \n${JSON.stringify(schema, null, 2)}`
        );
    }
}

module.exports = {
    isObject,
    expectMatchesSchema,
    expectNotMatchesSchema,
};