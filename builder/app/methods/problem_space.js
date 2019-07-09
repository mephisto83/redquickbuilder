export function createProblemSpace() {
    return {
        properties: {}
    }
}
export function createPropertySpace(id) {
    return {
        id,
        vectors: {}
    }
}
export function createVectorSpace(id) {
    return {
        id
    }
}

function booleanSpace(options = {}) {
    var { valid = [true], invalid = [] } = options;
    var res = {
        space: () => [true, false],
        valid: () => valid,
        possible: () => {
            var valid_values = res.valid().unique();
            var invalid_values = res.invalid().unique();
            var intersection = valid_values.intersection(invalid_values);
            return intersection.length === 0 && res.space().length === valid_values.length + invalid_values.length;
        }
    }
    return res;
}

//Add a property space to the space
export function addPropertySpace(space, propertyId) {
    if (space && space.properties)
        space.properties[propertyId] = space.properties[propertyId] || createPropertySpace(propertyId);
    return space.properties[propertyId];
}

export function addVectorSpace(propertySpace, vector) {
    if (propertySpace && propertySpace.vectors)
        propertySpace.vectors[vector] = propertySpace.vectors[vector] || createVectorSpace(vector);

    return propertySpace.vectors[vector];
}

export function getPropertySpace(space, property) {
    if (space && space.properties)
        return space.properties[property] || null;
    return null;
}

export function getVectorSpace(propertySpace, vector) {
    if (propertySpace || propertySpace.vectors)
        return propertySpace.vectors[vector] || null;
    return null;
}