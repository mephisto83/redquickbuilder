import * as _ from './array';

export function MinLengthAttribute(min: any, equal?: any) {
	return createValidationAttribute((val: any) => {
		if (equal) {
			return `${val}`.length >= min;
		}
		return `${val}`.length > min;
	}, createDefaultError(`Needs to be at least ${min} long.`));
}
function createDefaultError(text: any) {
	return {
		fail: { title: text },
		success: { title: '' }
	};
}
export function MaxLengthAttribute(max: any, equal?: any) {
	return createValidationAttribute((val: any) => {
		if (equal) {
			return `${val}`.length <= max;
		}
		return `${val}`.length < max;
	}, createDefaultError(`Needs to be less ${max} long.`));
}

export function EqualsModelProperty(propName: any) {
	return createValidationAttribute((val: any, object: any) => {
		return object && val === object[propName];
	}, createDefaultError(`${propName} needs to match.`));
}

export function AlphaOnlyAttribute() {
	return createValidationAttribute(alpha, createDefaultError(`Only alphabet letters.`));
}

export function AlphaNumericLikeAttribute() {
	return createValidationAttribute(alphanumericLike, createDefaultError(`Only alphanumeric characters.`));
}

export function AlphaOnlyWithSpacesAttribute() {
	return createValidationAttribute(alphawithspaces, createDefaultError(`Only alphanumeric characters and spaces.`));
}

export function IsNullAttribute() {
	return createValidationAttribute(
		(a: any) => a === null || a === undefined,
		createDefaultError(`This value cannot be set.`)
	);
}

export function IsNotNullAttribute() {
	return createValidationAttribute(
		(a: any) => a !== null && a !== undefined,
		createDefaultError(`This value must be set.`)
	);
}

export function MaxAttribute(max: any, equal?: any) {
	return createValidationAttribute((val: any) => {
		if (equal) {
			return val <= max;
		}
		return val < max;
	}, createDefaultError(equal ? `This value must be less than or equal to ${max}.` : `This value must be less than ${max}.`));
}

export function MinAttribute(min: any, equal?: any) {
	return createValidationAttribute((val: any) => {
		if (equal) {
			return val >= min;
		}
		return val > min;
	}, createDefaultError(equal ? `This value must be greater than or equal to ${min}.` : `This value must be greater than ${min}.`));
}

function ValidateEmail(mail: any) {
	if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
		return true;
	}

	return false;
}

const urlpattern = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

const ssnPattern = /^[0-9]{3}\-?[0-9]{2}\-?[0-9]{4}$/;

export function SSNAttribute() {
	return createValidationAttribute(
		(val: any) => ssnPattern.test(val),
		createDefaultError(`Isn't a valid Social Security Number.`)
	);
}
export function SSNEmptyAttribute() {
	return createValidationAttribute((val: any) => {
		if (val) return ssnPattern.test(val);
		return true;
	}, createDefaultError(`Isn't a valid Social Security Number.`));
}
export function IsValidDateAttribute() {
	return createValidationAttribute((val: any) => {
		const date = typeof val === 'string' ? Date.parse(val) : val;
		return date.getTime() === date.getTime();
	}, createDefaultError(`Isn't a valid date.`));
}
function isValidDate(val: any) {
	if (!val && val !== 0) {
		return true;
	}
	const date = typeof val === 'string' ? Date.parse(val) : val;
	return date.getTime() === date.getTime();
}
export function IsValidDateOrEmptyAttribute() {
	return createValidationAttribute((val: any) => isValidDate(val), createDefaultError(`Isn't a valid date.`));
}
export function PastDateAttribute(_pastDate: any) {
	const pastDate: any = Date.parse(_pastDate);
	return createValidationAttribute((val: any) => {
		if (isValidDate(val)) {
			return val.getTime() > pastDate.getTime();
		}

		return false;
	}, createDefaultError(_pastDate ? `It must be past ${new Date(_pastDate).toLocaleDateString()}.` : null));
}
export function Is18YearsPlusAttribute() {
	return createValidationAttribute((val: any) => {
		if (isValidDate(val)) {
			try {
				const date = new Date(Date.parse(val));
				return Date.now() - date.getTime() > 5.676e11;
			} catch (e) {
				return false;
			}
		}

		return false;
	}, createDefaultError(`Has to be over 18.`));
}
export function CreditCardValidation() {
	return createValidationAttribute(
		(val: any) =>
			CredCardValidations.find((j) => {
				return j.startsWith.find((t) => val.startsWith(t)) && j.lengths.find((t) => val.length == t);
			}),
		createDefaultError(`It isn't recognized as a valid credit card number.`)
	);
}

export function GetCardType(x: any) {
	return CredCardValidations.find(
		(j) => j.startsWith.find((t) => x.startsWith(t)) && j.lengths.find((t) => x.length === t)
	);
}

const CredCardValidations = [
	{ name: 'American Express', startsWith: [ '34', '37' ], lengths: [ 15 ] },
	{
		name: 'Diners Club - Carte Blanche',
		startsWith: [ '300', '301', '302', '303', '304', '305' ],
		lengths: [ 14 ]
	},
	{ name: 'Diners Club - International', startsWith: [ '36' ], lengths: [ 14 ] },
	{ name: 'Diners Club - USA & Canada', startsWith: [ '54' ], lengths: [ 16 ] },
	{
		name: 'Discover',
		startsWith: [
			...[].interpolate(622126, 622925 + 1, (x: any) => x).map((x: any) => x.toString()),
			...[ '6011', '644', '645', '646', '647', '648', '649', '65' ]
		],
		lengths: [ 16, 17, 18, 19 ]
	},
	{
		name: 'InstaPayment',
		startsWith: [ ...[ 637, 638, 639 ].map((x) => x.toString()) ],
		lengths: [ 16 ]
	},
	{
		name: 'JCB',
		startsWith: [ ...[].interpolate(3528, 3589 + 1, (x: any) => x).map((x: any) => x.toString()) ],
		lengths: [ 16, 17, 18, 19 ]
	},
	{
		name: 'Maestro',
		startsWith: [ ...[ 5018, 5020, 5038, 5893, 6304, 6759, 6761, 6762, 6763 ].map((x) => x.toString()) ],
		lengths: [ 16, 17, 18, 19 ]
	},
	{
		name: 'MasterCard',
		startsWith: [
			...[].interpolate(222100, 272099 + 1, (x: any) => x.toString()),
			...[ 51, 52, 53, 54, 55 ].map((x) => x.toString())
		],
		lengths: [ 16, 17, 18, 19 ]
	},
	{
		name: 'Visa',
		startsWith: [ ...[ 4 ].map((x) => x.toString()) ],
		lengths: [ 16, 13, 19 ]
	},
	{
		name: 'Visa Electron',
		startsWith: [ ...[ 4026, 417500, 4508, 4844, 4913, 4917 ].map((x) => x.toString()) ],
		lengths: [ 16 ]
	}
];

export function BeforeNowAttribute() {
	const nowDate = new Date(Date.now());
	return createValidationAttribute((val: any) => {
		if (isValidDate(val)) {
			return val.getTime() < nowDate.getTime();
		}

		return false;
	}, createDefaultError(`It needs to be in the past.`));
}

export function UrlAttribute() {
	return createValidationAttribute((val: any) => urlpattern.test(val), createDefaultError(`This isn't a valid url.`));
}
export function UrlEmptyAttribute() {
	return createValidationAttribute((val: any) => {
		if (val) return urlpattern.test(val);
		return true;
	}, createDefaultError(`This isn't a valid url.`));
}

export function EmailAttribute() {
	return createValidationAttribute(
		(val: any) => ValidateEmail(val),
		createDefaultError(`This isn't a valid email address.`)
	);
}
export function EmailEmptyAttribute() {
	return createValidationAttribute((val: any) => {
		if (val) return ValidateEmail(val);
		return true;
	}, createDefaultError(`This isn't a valid email address.`));
}

export function ZipAttribute() {
	return zipefunc(false);
}

export function ZipEmptyAttribute() {
	return zipefunc(true);
}

function zipefunc(allowNull: any) {
	const AllowedChars = '0123456789';
	return createValidationAttribute((val: any) => {
		if (val) {
			return val.length === 5 && val.split('').filter((v: any) => AllowedChars.indexOf(v) !== -1).length;
		}
		return allowNull || false;
	}, createDefaultError(`This isn't a valid zip code.`));
}
function createValidationAttribute(test: any, defaultOptions = {}) {
	return {
		results: (results: any, options: any = {}) => {
			options = {
				...{ fail: { title: 'test failed' }, success: { title: 'test succeeded' } },
				...defaultOptions,
				...options || {}
			};
			const { errors, success } = results;
			return {
				isOk: (val: any, b?: any, c?: any, d?: any, e?: any, f?: any, g?: any, h?: any, i?: any) => {
					if (test(val, b, c, d, e, f, g, h, i)) {
						if (success) {
							success.push(options.success);
						}
						return true;
					}
					if (errors) {
						errors.push(options.fail);
					}
					return false;
				}
			};
		}
	};
}

export function validateEmail(email: any) {
	return ValidateEmail(email);
}

export function maxLength(val: any, length: any) {
	return `${val}`.length < length;
}
export function minLength(val: any, length: any) {
	return `${val}`.length > length;
}

export function greaterThanOrEqualTo(val: any, length: any) {
	if (typeof val === 'string') return `${val}`.length <= length;

	return val <= length;
}
export function numericalDefault(val: any, defaultValue: any) {
	if (val === undefined || val === null || typeof val !== 'number') {
		return defaultValue;
	}
	return val;
}
export function lessThanOrEqualTo(val: any, length: any) {
	if (typeof val === 'string') return `${val}`.length >= length;

	return val <= length;
}

export function equalsLength(val: any, length: any) {
	return `${val}`.length === length;
}

export function alphanumericLike(val: any) {
	return !(val || '').toString().split('').find((t: any) => {
		t = `${t}`.toLowerCase();
		return "abcdefghijk lmnopqrstuvwxyz,.;'0123456789".indexOf(t) === -1;
	});
}
export function alphanumeric(val: any) {
	return !(val || '').toString().split('').find((t: any) => {
		t = `${t}`.toLowerCase();
		return 'abcdefghijklmnopqrstuvwxyz0123456789'.indexOf(t) === -1;
	});
}
export function alpha(val: any) {
	return !(val || '').toString().split('').find((t: any) => {
		t = `${t}`.toLowerCase();
		return 'abcdefghijklmnopqrstuvwxyz'.indexOf(t) === -1;
	});
}

export function alphawithspaces(val: any) {
	return !(val || '').toString().split('').find((t: any) => {
		t = `${t}`.toLowerCase();
		return 'abcdefghijklmnopqrstuvwxyz  '.indexOf(t) === -1;
	});
}
export function arrayLength(val: any) {
	if (Array.isArray(val)) {
		return val.length;
	}
	if (val && val.length) {
		return val.length;
	}
	return 0;
}
