import fs from 'fs'
import path from 'path'

export function loadConfig(relativePath) {
  const fullPath = path.resolve(relativePath)
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
}
