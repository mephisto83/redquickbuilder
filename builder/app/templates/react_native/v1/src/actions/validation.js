
export function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

export function maxLength(val, length) {
    return `${val}`.length < length;
}
export function minLength(val, length) {
    return `${val}`.length > length;
}

export function greaterThanOrEqualTo(val, length) {
    if (typeof (val) === 'string')
        return `${val}`.length <= length;

    return val <= length;
}
export function lessThanOrEqualTo(val, length) {
    if (typeof (val) === 'string')
        return `${val}`.length >= length;

    return val <= length;
}

export function equalsLength(val, length) {
    return `${val}`.length === length;
}

export function alphanumericLike(val) {
    return !(val || '').toString().split('').find(t => {
        t = t.toLowerCase();
        return 'abcdefghijk lmnopqrstuvwxyz,.;\'0123456789'.indexOf(t) === -1;
    })
}
export function alphanumeric(val) {
    return !(val || '').toString().split('').find(t => {
        t = t.toLowerCase();
        return 'abcdefghijklmnopqrstuvwxyz0123456789'.indexOf(t) === -1;
    })
}
export function alpha(val) {
    return !(val || '').toString().split('').find(t => {
        t = t.toLowerCase();
        return 'abcdefghijklmnopqrstuvwxyz'.indexOf(t) === -1;
    })
}