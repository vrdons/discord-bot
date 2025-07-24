export function ensureArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val];
}

export function flattenJSON(
  obj: Record<string, any>,
  prefix = "",
): Record<string, any> {
  let result: Record<string, any> = {};
  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      Object.assign(result, flattenJSON(obj[key], prefix + key + "."));
    } else {
      result[prefix + key] = obj[key];
    }
  }
  return result;
}
