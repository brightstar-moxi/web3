require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors())

app.use(express.json({
    verify: (req, res, buf) => {
        const url = req.originalUrl;
        if (url.startsWith("/webhooks")){
         req.rawBody = buf.toString();
        }
    }
}));

var coinbase = require('coinbase-commerce-node');
var Client = coinbase.Client;
var resources= coinbase.resources
var webhook= coinbase.Webhook

Client.init(process.env.COINBASE_API_KEY);

app.post("/checkout", async (req, res) => {
    const { amount, currency } = req.body;

    try {
        const charge = await resources.Charge.create({
            name: "Deposit",
            description: "deposit",
            local_price: {
                amount: amount,
                currency: currency,
            },
            pricing_type: "fixed_price",
            metadata: {
                user_id: "3434",
            }
        });
        res.status(200).json({
            charge: charge,
        });

    } catch (error) {
        res.status(500).json({
            error: error,
        })
    }
})
app.post("/webhooks", async (req, res) => {
    try{
    const event = webhook.verifyEventBody(
        req.rawBody,
        req.headers["x-cc-webhook-signature"],
        process.env.COINBASE_WEBHOOK_SECRET
    );
   if (event.type === "charge:confirmed") {
    let amount = event.data.pricing.local.amount;
    let currency = event.data.pricing.local.amout;
    let user_id = event.data.metadata.user_id;

    console.log(event);
    console.log(amount,currency, user_id);
   }
   res.sendStatus(200);
}catch(error) {
res.status(500).json({
    error: error,
})
}
  

})
console.log()
app.listen(3021, () => {
    console.log("server is running on port 3021")
});