/* eslint-disable no-console */
import * as express from 'express'
import * as body from 'body-parser'

const app = express()

app.use(body.json())

app.post('/', (req, res) => {
  const [type, ...data] = req.body
  // @ts-ignore
  console[type || 'log'](...data)
  res.send('')
})

app.listen(5050, '0.0.0.0', () => {
  console.log('Logger is ready')
})
