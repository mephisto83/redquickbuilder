import * as _ from './array';

export function MinLengthAttribute(min, equal) {
  return createValidationAttribute(val => {
    if (equal) {
      return `${val}`.length >= min;
    }
    return `${val}`.length > min;
  }, createDefaultError(`Needs to be at least ${min} long.`));
}
function createDefaultError(text) {
  return {
    fail: { title: text },
    success: { title: '' }
  }
}
export function MaxLengthAttribute(max, equal) {
  return createValidationAttribute(val => {
    if (equal) {
      return `${val}`.length <= max;
    }
    return `${val}`.length < max;
  }, createDefaultError(`Needs to be less ${max} long.`));
}

export function EqualsModelProperty(propName) {
  return createValidationAttribute((val, object) => {
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
  return createValidationAttribute(a => a === null || a === undefined, createDefaultError(`This value cannot be set.`));
}

export function IsNotNullAttribute() {
  return createValidationAttribute(a => a !== null && a !== undefined, createDefaultError(`This value must be set.`));
}

export function MaxAttribute(max, equal) {
  return createValidationAttribute(val => {
    if (equal) {
      return val <= max;
    }
    return val < max;
  }, createDefaultError(equal ? `This value must be less than or equal to ${max}.` : `This value must be less than ${max}.`));
}

export function MinAttribute(min, equal) {
  return createValidationAttribute(val => {
    if (equal) {
      return val >= min;
    }
    return val > min;
  }, createDefaultError(equal ? `This value must be greater than or equal to ${min}.` : `This value must be greater than ${min}.`));
}

function ValidateEmail(mail) {
  if (
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)
  ) {
    return true;
  }

  return false;
}

const urlpattern = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

const ssnPattern = /^[0-9]{3}\-?[0-9]{2}\-?[0-9]{4}$/;

export function SSNAttribute() {
  return createValidationAttribute(val => ssnPattern.test(val), createDefaultError(`Isn't a valid Social Security Number.`));
}
export function SSNEmptyAttribute() {
  return createValidationAttribute(val => {
    if (val) return ssnPattern.test(val);
    return true;
  }, createDefaultError(`Isn't a valid Social Security Number.`));
}
export function IsValidDateAttribute() {
  return createValidationAttribute(val => {
    const date = typeof val === "string" ? Date.parse(val) : val;
    return date.getTime() === date.getTime();
  }, createDefaultError(`Isn't a valid date.`));
}
function isValidDate(val) {
  if (!val && val !== 0) {
    return true;
  }
  const date = typeof val === "string" ? Date.parse(val) : val;
  return date.getTime() === date.getTime();
}
export function IsValidDateOrEmptyAttribute() {
  return createValidationAttribute(val => isValidDate(val), createDefaultError(`Isn't a valid date.`));
}
export function PastDateAttribute(_pastDate) {
  const pastDate = Date.parse(_pastDate);
  return createValidationAttribute(val => {
    if (isValidDate(val)) {
      return val.getTime() > pastDate.getTime();
    }

    return false;
  }, createDefaultError(_pastDate ? `It must be past ${(new Date(_pastDate)).toLocaleDateString()}.` : null));
}
export function Is18YearsPlusAttribute() {
  return createValidationAttribute(val => {
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
  return createValidationAttribute(val => CredCardValidations.find(j => {
    return (
      j.startsWith.find(t => x.startsWith(t)) &&
      j.lengths.find(t => x.length == t)
    );
  }), createDefaultError(`It isn't recognized as a valid credit card number.`));
}

export function GetCardType(x) {
  return CredCardValidations.find(j => (
    j.startsWith.find(t => x.startsWith(t)) &&
    j.lengths.find(t => x.length === t)
  ));
}

const CredCardValidations = [
  { name: "American Express", startsWith: ["34", "37"], lengths: [15] },
  {
    name: "Diners Club - Carte Blanche",
    startsWith: ["300", "301", "302", "303", "304", "305"],
    lengths: [14]
  },
  { name: "Diners Club - International", startsWith: ["36"], lengths: [14] },
  { name: "Diners Club - USA & Canada", startsWith: ["54"], lengths: [16] },
  {
    name: "Discover",
    startsWith: [
      ...[].interpolate(622126, 622925 + 1, x => x).map(x => x.toString()),
      ...["6011", "644", "645", "646", "647", "648", "649", "65"]
    ],
    lengths: [16, 17, 18, 19]
  },
  {
    name: "InstaPayment",
    startsWith: [...[637, 638, 639].map(x => x.toString())],
    lengths: [16]
  },
  {
    name: "JCB",
    startsWith: [
      ...[].interpolate(3528, 3589 + 1, x => x).map(x => x.toString())
    ],
    lengths: [16, 17, 18, 19]
  },
  {
    name: "Maestro",
    startsWith: [
      ...[5018, 5020, 5038, 5893, 6304, 6759, 6761, 6762, 6763].map(x =>
        x.toString()
      )
    ],
    lengths: [16, 17, 18, 19]
  },
  {
    name: "MasterCard",
    startsWith: [
      ...[].interpolate(222100, 272099 + 1, x => x.toString()),
      ...[51, 52, 53, 54, 55].map(x => x.toString())
    ],
    lengths: [16, 17, 18, 19]
  },
  {
    name: "Visa",
    startsWith: [...[4].map(x => x.toString())],
    lengths: [16, 13, 19]
  },
  {
    name: "Visa Electron",
    startsWith: [
      ...[4026, 417500, 4508, 4844, 4913, 4917].map(x => x.toString())
    ],
    lengths: [16]
  }
];

export function BeforeNowAttribute() {
  const nowDate = new Date(Date.now());
  return createValidationAttribute(val => {
    if (isValidDate(val)) {
      return val.getTime() < nowDate.getTime();
    }

    return false;
  }, createDefaultError(`It needs to be in the past.`));
}

export function UrlAttribute() {
  return createValidationAttribute(val => urlpattern.test(val), createDefaultError(`This isn't a valid url.`));
}
export function UrlEmptyAttribute() {
  return createValidationAttribute(val => {
    if (val) return urlpattern.test(val);
    return true;
  }, createDefaultError(`This isn't a valid url.`));
}

export function EmailAttribute() {
  return createValidationAttribute(val => ValidateEmail(val), createDefaultError(`This isn't a valid email address.`));
}
export function EmailEmptyAttribute() {
  return createValidationAttribute(val => {
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

function zipefunc(allowNull) {
  const AllowedChars = "0123456789";
  return createValidationAttribute(val => {
    if (val) {
      return (
        val.length === 5 &&
        val.split("").filter(v => AllowedChars.indexOf(v) !== -1).length
      );
    }
    return allowNull || false;
  }, createDefaultError(`This isn't a valid zip code.`));
}
function createValidationAttribute(test, defaultOptions = {}) {
  return {
    results: (results, options = {}) => {
      options = {
        ...{ fail: { title: "test failed" }, success: { title: "test succeeded" } },
        ...defaultOptions,
        ...(options || {})
      };
      const { errors, success } = results;
      return {
        isOk: (val, b, c, d, e, f, g, h, i) => {
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

export function validateEmail(email) {
  return ValidateEmail(email);
}

export function maxLength(val, length) {
  return `${val}`.length < length;
}
export function minLength(val, length) {
  return `${val}`.length > length;
}

export function greaterThanOrEqualTo(val, length) {
  if (typeof val === "string") return `${val}`.length <= length;

  return val <= length;
}
export function numericalDefault(val, defaultValue) {
  if (val === undefined || val === null || typeof val !== "number") {
    return defaultValue;
  }
  return val;
}
export function lessThanOrEqualTo(val, length) {
  if (typeof val === "string") return `${val}`.length >= length;

  return val <= length;
}

export function equalsLength(val, length) {
  return `${val}`.length === length;
}

export function alphanumericLike(val) {
  return !(val || "")
    .toString()
    .split("")
    .find(t => {
      t = `${t}`.toLowerCase();
      return "abcdefghijk lmnopqrstuvwxyz,.;'0123456789".indexOf(t) === -1;
    });
}
export function alphanumeric(val) {
  return !(val || "")
    .toString()
    .split("")
    .find(t => {
      t = `${t}`.toLowerCase();
      return "abcdefghijklmnopqrstuvwxyz0123456789".indexOf(t) === -1;
    });
}
export function alpha(val) {
  return !(val || "")
    .toString()
    .split("")
    .find(t => {
      t = `${t}`.toLowerCase();
      return "abcdefghijklmnopqrstuvwxyz".indexOf(t) === -1;
    });
}

export function alphawithspaces(val) {
  return !(val || "")
    .toString()
    .split("")
    .find(t => {
      t = `${t}`.toLowerCase();
      return "abcdefghijklmnopqrstuvwxyz  ".indexOf(t) === -1;
    });
}
export function arrayLength(val) {
  if (Array.isArray(val)) {
    return val.length;
  }
  if (val && val.length) {
    return val.length;
  }
  return 0;
}
