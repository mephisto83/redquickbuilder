export function createProblemSpace() {
	return {
		properties: {}
	};
}
export function createPropertySpace(id: any) {
	return {
		id,
		vectors: {}
	};
}
export function createVectorSpace(id: any) {
	return {
		id
	};
}

function booleanSpace(options: any = {}) {
	var { valid = [ true ], invalid = [] } = options;
	var res = {
		space: () => [ true, false ],
		valid: () => valid,
		possible: () => {
			var valid_values: any = res.valid().unique();
			var invalid_values: any = []; //res.invalid().unique();
			var intersection: any = valid_values.intersection(invalid_values);
			return intersection.length === 0 && res.space().length === valid_values.length + invalid_values.length;
		}
	};
	return res;
}

//Add a property space to the space
export function addPropertySpace(space: { properties: { [x: string]: any } }, propertyId: string | number) {
	if (space && space.properties)
		space.properties[propertyId] = space.properties[propertyId] || createPropertySpace(propertyId);
	return space.properties[propertyId];
}

export function addVectorSpace(propertySpace: { vectors: { [x: string]: any } }, vector: string | number) {
	if (propertySpace && propertySpace.vectors)
		propertySpace.vectors[vector] = propertySpace.vectors[vector] || createVectorSpace(vector);

	return propertySpace.vectors[vector];
}

export function getPropertySpace(space: { properties: { [x: string]: any } }, property: string | number) {
	if (space && space.properties) return space.properties[property] || null;
	return null;
}

export function getVectorSpace(propertySpace: any, vector: string | number) {
	if (propertySpace || propertySpace.vectors) return propertySpace.vectors[vector] || null;
	return null;
}
