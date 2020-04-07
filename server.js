const express = require('express')
const { WebhookClient } = require('dialogflow-fulfillment')
const app = express()

app.get('/', (req, res) => res.send('online'))
app.post('/dialogflow', express.json(), (req, res) => {
    const agent = new WebhookClient({ request: req, response: res })

    function orderDrink() {
        agent.add('Your drink is being prepared')
    }

    let intentMap = new Map()
    intentMap.set('order.drink', orderDrink)
    agent.handleRequest(intentMap)
})

app.listen(process.env.PORT || 8080)