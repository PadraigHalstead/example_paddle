require('dotenv').config();
import express from 'express';
import { Request, Response } from 'express';
import { PaddleSDK } from 'paddle-sdk';

const cors = require('cors');

const client = new PaddleSDK(
	process.env.VENDOR_ID,
	process.env.VENDOR_AUTH_CODE,
	undefined,
	{ sandbox: true }
);

if (!process.env.VENDOR_ID || !process.env.VENDOR_AUTH_CODE) {
	throw Error('Environment Variables not all set - please check your .env file in the project root or create one!')
}

const app: express.Application = express();

app.use(express.static(__dirname + '/build'));

app.use(express.json())

app.use(cors({
	origin: '*',
}));

app.get('/subscriptions', async (req: Request, res: Response) => {
	const subscriptions = await client.getSubscriptionPlans()

	console.log(subscriptions)
	return res.json(subscriptions)
});

app.post('/generatePayLink', async (req: Request, res: Response) => {
	const returnUrl = "https://deividasovs.github.io/scopey-paddle-frontend-poc/"

	const workspaceId = req.body.workspaceId
	const productId = req.body.productId
	const workspaceName = req.body.workspaceName
	const tierName = req.body.tierName
	const customerEmail = req.body.customerEmail

	// Sample return url = http://localhost:3000/#/orderConfirmation?&checkout=1414460-chre33d624c0c4d-e4f4c6569f&workspaceId=wk1&tier=Bronze
	const subscriptions = await client.generatePayLink({
		product_id: productId,
		return_url: returnUrl + "#/orderConfirmation" + "?&checkout={checkout_hash}&workspaceId=" + workspaceId + "&tier=" + tierName,
		customer_email: customerEmail,
		title: `${tierName} subscription for ${workspaceName}`
	})

	return res.json(subscriptions)
});

app.post('/verifyPayment', async (req: Request, res: Response) => {
	const checkoutId = req.body.checkoutId
	const transaction = await client.getCheckoutTransactions(checkoutId)

	return res.json({ status: transaction[0].status })
});

app.get('/users', async (req: Request, res: Response) => {
	const users = await client.getUsers()
	return res.json(users)
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
});