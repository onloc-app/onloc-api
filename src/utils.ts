export function sanitizeData(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (key === "password") return undefined
      if (typeof value === "bigint") return value.toString()
      return value
    }),
  )
}
