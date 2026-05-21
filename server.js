const express = require('express');
const crypto = require('crypto');
const app = express();

const SECRET_KEY = Buffer.from(process.env.SECRET_KEY, 'hex');
const API_KEY = process.env.API_KEY;
const API_TOKEN = process.env.API_TOKEN;

// التحقق من المفتاح والتوكن معاً
function authMiddleware(req, res, next) {
    const key = req.headers['x-api-key'];
    const token = req.headers['x-api-token'];

    if (!key || key !== API_KEY) {
        return res.status(403).json({ error: 'Invalid API Key' });
    }

    if (!token || token !== API_TOKEN) {
        return res.status(403).json({ error: 'Invalid API Token' });
    }

    next();
}

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return iv.toString('hex') + ':' + encrypted;
}

app.get('/bypass', authMiddleware, async (req, res) => {
    try {
        const response = await fetch(process.env.BYPASS_URL);
        const data = await response.text();
        res.send(encrypt(data));
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/download', authMiddleware, (req, res) => {
    try {
        res.send(encrypt(process.env.DOWNLOAD_URL));
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

module.exports = app;