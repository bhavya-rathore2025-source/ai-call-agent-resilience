import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import fs from 'fs'

const creds = JSON.parse(fs.readFileSync('config/googleCredentials.json', 'utf-8'))

const SHEET_ID = '1SYtPDjQ_5b2SUwQq0RCawn5SF3ug9LT8z2FcuJ5bU3A'

export async function logToSheet(log) {
  try {
    // ✅ Correct auth for v4+
    const auth = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const doc = new GoogleSpreadsheet(SHEET_ID, auth)

    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]

    await sheet.addRow({
      timestamp: log.timestamp,
      service: log.service,
      errorCategory: log.errorCategory,
      retryCount: log.retryCount,
      circuitState: log.circuitState,
      message: log.message,
    })
  } catch (err) {
    console.error('Google Sheet logging failed:', err.message)
  }
}
