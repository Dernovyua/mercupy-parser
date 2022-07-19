const Router = require('express').Router;
const router = new Router();
const Mercury = require('@postlight/mercury-parser');

router.route('/').get((req, res) => {
    res.json({
        message: 'Welcome to 🚀mercury-parser-api API! Endpoint: /parser',
    });
});

router.route('/parser').get(async (req, res) => {
    let result = { message: 'No URL was provided' };
    if (req.query.url) {
        try {
            const contentType = req.query.contentType || 'html';
            let headers = new Object();
            if (typeof req.query.headers !== 'undefined') {
                headers = JSON.parse(req.query.headers);
            }
            result = await Mercury.parse(req.query.url, {
                contentType,
                headers,
            });
        } catch (error) {
            result = { error: true, messages: error.message };
        }
    }
    return res.json(result);
});

router.route('/parser').post(async (req, res) => {
    let result = { message: 'No HTML was provided. Make sure you include a "html:" field in the JSON payload.' };
    //console.log(`URL: ${req.body.url}`)
    if (req.body.html) {
        try {
            const contentType = req.body.contentType || 'html';
            let headers = new Object();
            if (typeof req.query.headers !== 'undefined') {
                headers = JSON.parse(req.body.headers);
            }
            //console.log(`HTML payload length: ${req.body.html.length}`)
            result = await Mercury.parse(req.body.url || 'http://example.com/', {
                contentType,
                headers,
                html: req.body.html,
            });
        } catch (error) {
            result = { error: true, messages: error.message };
        }
    }
    return res.json(result);
});

module.exports = router;
