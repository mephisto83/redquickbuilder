import * as _ from './array';
export function MinLengthAttribute(min, equal) {
  return createValidationAttribute(val => {
    if (equal) {
      return val >= min;
    }
    return val > min;
  });
}

export function MaxLengthAttribute(max, equal) {
  return createValidationAttribute(val => {
    if (equal) {
      return val.length <= max;
    }
    return val.length < max;
  });
}

export function AlphaOnlyAttribute() {
  return createValidationAttribute(alpha);
}

export function AlphaNumericLikeAttribute() {
  return createValidationAttribute(alphanumericLike);
}

export function AlphaOnlyWithSpacesAttribute() {
  return createValidationAttribute(alphawithspaces);
}

export function IsNullAttribute() {
  return createValidationAttribute(a => a === null || a === undefined);
}

export function IsNotNullAttribute() {
  return createValidationAttribute(a => a !== null && a !== undefined);
}

export function MaxAttribute(max, equal) {
  return createValidationAttribute(val => {
    if (equal) {
      return val <= max;
    }
    return val < max;
  });
}

export function MinAttribute(min, equal) {
  return createValidationAttribute(val => {
    if (equal) {
      return val >= min;
    }
    return val > min;
  });
}

function ValidateEmail(mail) {
  if (
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(myForm.emailAddr.value)
  ) {
    return true;
  }
  alert("You have entered an invalid email address!");
  return false;
}

const urlpattern = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

const ssnPattern = /^[0-9]{3}\-?[0-9]{2}\-?[0-9]{4}$/;

export function SSNAttribute() {
  return createValidationAttribute(val => {
    return ssnPattern.test(val);
  });
}
export function SSNEmptyAttribute() {
  return createValidationAttribute(val => {
    if (val) return ssnPattern.test(val);
    return true;
  });
}
export function IsValidDateAttribute() {
  return createValidationAttribute(val => {
    let date = typeof val === "string" ? Date.parse(val) : val;
    return date.getTime() === date.getTime();
  });
}
function isValidDate(val) {
  if (!val && val !== 0) {
    return true;
  }
  let date = typeof val === "string" ? Date.parse(val) : val;
  return date.getTime() === date.getTime();
}
export function IsValidDateOrEmptyAttribute() {
  return createValidationAttribute(val => {
    return isValidDate(val);
  });
}
export function PastDateAttribute(_pastDate) {
  let pastDate = Date.parse(_pastDate);
  return createValidationAttribute(val => {
    if (isValidDate(val)) {
      return val.getTime() > pastDate.getTime();
    }

    return false;
  });
}
export function Is18YearsPlusAttribute() {
  let nowDate = new Date(Date.now());
  return createValidationAttribute(val => {
    if (isValidDate(val)) {
      try {
        var date = new Date(Date.parse(val));
        return Date.now() - date.getTime() > 5.676e11;
      } catch (e) {
        return false;
      }
    }

    return false;
  });
}
export function CreditCardValidation() {
  return createValidationAttribute(val => {
    return CredCardValidations.find(j => {
      return (
        j.startsWith.find(t => x.startsWith(t)) &&
        j.lengths.find(t => x.length == t)
      );
    });
  });
}

export function GetCardType(x) {
  return CredCardValidations.find(j => {
    return (
      j.startsWith.find(t => x.startsWith(t)) &&
      j.lengths.find(t => x.length == t)
    );
  });
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

export function BeforeNowAttribute(_pastDate) {
  let nowDate = new Date(Date.now());
  return createValidationAttribute(val => {
    if (isValidDate(val)) {
      return val.getTime() < nowDate.getTime();
    }

    return false;
  });
}

export function UrlAttribute() {
  return createValidationAttribute(val => {
    return urlpattern.test(val);
  });
}
export function UrlEmptyAttribute() {
  return createValidationAttribute(val => {
    if (val) return urlpattern.test(val);
    return true;
  });
}

export function EmailAttribute() {
  return createValidationAttribute(val => {
    return ValidateEmail(val);
  });
}
export function EmailEmptyAttribute() {
  return createValidationAttribute(val => {
    if (val) return ValidateEmail(val);
    return true;
  });
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
  });
}
function createValidationAttribute(test, defaultOptions = {}) {
  return {
    results: (results, options = {}) => {
      options = {
        ...{ fail: "test failed", success: "test succeeded" },
        ...defaultOptions,
        ...(options || {})
      };
      let { errors, success } = results;
      return {
        isOk: val => {
          if (test(val)) {
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
      t = t.toLowerCase();
      return "abcdefghijk lmnopqrstuvwxyz,.;'0123456789".indexOf(t) === -1;
    });
}
export function alphanumeric(val) {
  return !(val || "")
    .toString()
    .split("")
    .find(t => {
      t = t.toLowerCase();
      return "abcdefghijklmnopqrstuvwxyz0123456789".indexOf(t) === -1;
    });
}
export function alpha(val) {
  return !(val || "")
    .toString()
    .split("")
    .find(t => {
      t = t.toLowerCase();
      return "abcdefghijklmnopqrstuvwxyz".indexOf(t) === -1;
    });
}

export function alphawithspaces(val) {
  return !(val || "")
    .toString()
    .split("")
    .find(t => {
      t = t.toLowerCase();
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
