export function sanitizeObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  } else if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([key]) => key !== "password")
        .map(([key, value]) => [key, sanitizeObject(value)])
    )
  } else if (typeof obj === "bigint") {
    return obj.toString()
  }
  return obj
}
