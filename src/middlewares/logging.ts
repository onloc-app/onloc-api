import type { Request, Response, NextFunction } from "express"
import chalk from "chalk"
import fs from "fs"
import path from "path"

const logFilePath = path.join(process.cwd(), "./logs/")
const logFileName = "requests.log"

if (!fs.existsSync(logFilePath)) {
  fs.mkdirSync(logFilePath)
}

function logToFile(message: string) {
  fs.appendFile(logFilePath + logFileName, message + "\n", (error) => {
    if (error) {
      console.error("Failed to write log to file:", error)
    }
  })
}

const logRequest = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now()

  const timestamp = new Date().toISOString()
  const method = req.method
  const url = req.originalUrl

  const coloredLog = `${chalk.yellow("[")}${chalk.gray(
    timestamp
  )}${chalk.yellow("]")} ${chalk.white("Incoming request:")} ${chalk.cyan(
    method
  )} ${chalk.green(url)}`
  const basicLog = `[${timestamp}] Incoming request: ${method} ${url}`

  console.log(coloredLog)
  logToFile(basicLog)

  const originalSend = res.send
  res.send = function (body: any) {
    const endTime = Date.now()
    const duration = endTime - startTime

    const timestamp = new Date().toISOString()

    const durationStr = `${duration}ms`
    let durationColor = chalk.green(durationStr)
    if (duration > 300) {
      durationColor = chalk.red(durationStr)
    } else if (duration > 100) {
      durationColor = chalk.yellow(durationStr)
    }

    const coloredLog = `${chalk.yellow("[")}${chalk.gray(
      timestamp
    )}${chalk.yellow("]")} ${chalk.white("Time taken:")} ${durationColor}`
    const basicLog = `[${timestamp}] Time taken: ${durationStr}`

    console.log(coloredLog)
    logToFile(basicLog)

    originalSend.call(this, body)
    return this
  }

  next()
}

export default logRequest
