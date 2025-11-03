//
// Resolves the refs in an object.
//
function resolveRefs(obj) {
    return _resolveRefs(obj, obj);
}

//
// Resolves refs recursively in an object.
//
function _resolveRefs(obj, refs) {
    if (Array.isArray(obj)) {
        return obj.map(element => _resolveRefs(element, refs));
    }

    if (typeof obj !== 'object' || !obj) {
        return obj;
    }

    if (obj.hasOwnProperty('$ref')) {
        const parts = obj.$ref.split('/');
        let val = refs;
        for (const part of parts) {
            if (part === "#") {
                continue;
            }
            val = val[part];
        }

        return _resolveRefs(val, refs);
    }

    const clone = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clone[key] = _resolveRefs(obj[key], refs);
        }
    }

    return clone;
}

module.exports = {
    resolveRefs,
}