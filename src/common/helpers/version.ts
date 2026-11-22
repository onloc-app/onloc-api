import { readFileSync } from "fs"
import { resolve } from "path"

export function getApiVersion(): string {
  const { version } = JSON.parse(
    readFileSync(
      resolve(import.meta.dirname, "../../../package.json"),
      "utf-8",
    ),
  )
  return version
}
