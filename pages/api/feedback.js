import axios from 'axios'


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
        axios.post(webhookURL, webhookBody)
        res.status(200).send({ content: content })
    } else {
        return {}
        // Handle any other HTTP method
    }
}