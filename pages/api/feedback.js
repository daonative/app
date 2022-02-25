import fetch from 'node-fetch';



const webhookURL = process.env.DAONATIVE_DISCORD_WEBHOOK


export default function handler(req, res) {
    if (req.method === 'POST') {
        // Process a POST request
        const content = req.body?.content
        const user = req.body?.user
        const webhookBody = {
            "username": `${user} via Feedback Bot`,
            "avatar_url": "https://www.daonative.xyz/frame-logo.png",
            "content": content,
        }
        console.log(webhookURL, webhookBody)
        fetch(webhookURL, {
            method: 'POST',
            body: JSON.stringify(webhookBody),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json())
            .then(json => res.status(200).send(json));
    } else {
        return {}
        // Handle any other HTTP method
    }
}