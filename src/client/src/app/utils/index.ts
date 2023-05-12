// Filter all falsy values ( "", 0, false, null, undefined )
export const cleanObject = (obj) => Object.entries(obj).reduce((a, [k, v]) => (v ? (a[k] = v, a) : a), {});
