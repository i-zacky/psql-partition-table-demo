const fs = require('fs')
const path = require('path')
const ULID = require('ulid')
const dayjs = require("dayjs")
const BigNumber = require('bignumber.js')
const csv = require('fast-csv')

const generateYear = process.argv[2]
const generateCount = process.argv[3]

const CCY = [
    'JPY',
    'USD',
    'EUR'
]

const fileName = `deposit-y${generateYear}-${generateCount}row.csv`
const file = fs.createWriteStream(path.resolve(__dirname, fileName), { encoding: 'utf-8' })

const stream = csv.format({
    headers: false
})
stream.pipe(file).on('end', () => process.exit())
for (let i = 1; i <= generateCount; i++) {
    const depositDate = dayjs(`${generateYear}-01-01`).add(Math.floor(Math.random() * 364 + 1), 'day').format('YYYY-MM-DD')
    const currency = CCY[Math.floor(Math.random() * CCY.length)]
    let fxRate
    let amount
    if (currency === 'USD') {
        // USD/JPY = 100.0000 ~ 120.0000
        fxRate = new BigNumber(Math.random() * (120 - 100) + 100).toFixed(4)
        // amount = $100 ~ $1000
        amount = new BigNumber(Math.random() * (1000 - 100) + 100).toFixed(4)
    } else if (currency === 'EUR') {
        // EUR/JPY = 125.0000 - 135.0000
        fxRate = new BigNumber(Math.random() * (135 - 125) + 125).toFixed(4)
        // amount = €80 ~ $800
        amount = new BigNumber(Math.random() * (800 - 80) + 80).toFixed(4)
    } else {
        fxRate = "1.0000"
        amount = new BigNumber(Math.random() * (10000 - 1000) + 1000).toFixed(0)
    }

    if (i % 100 === 0) {
        console.log(`${i}row processed`)
    }
    stream.write({
        id: ULID.ulid(),
        deposit_date: depositDate,
        currency: currency,
        fx_rate: fxRate,
        amount: amount
    })
}

