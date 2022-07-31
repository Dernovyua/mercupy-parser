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
            let customExtractor = new Object();
            if (typeof req.query.headers !== 'undefined') {
                headers = JSON.parse(req.query.headers);
            }
            // console.log(`customExtractor: ${typeof req.query.customExtractor}`)
            if (typeof req.query.customExtractor !== 'undefined') {
                customExtractor = JSON.parse(req.query.customExtractor);
                console.log(customExtractor);
                //Mercury.addExtractor(customExtractor);
                result = await Mercury.parse(req.query.url, {
                    contentType,
                    headers,
                    customExtractor,
                });
            }
            else {
                result = await Mercury.parse(req.query.url, {
                    contentType,
                    headers,
                });
            }
        } catch (error) {
            result = { error: true, messages: error.message };
        }
    }
    return res.json(result);
});

router.route('/parser').post(async (req, res) => {
    let result = { message: 'No HTML was provided. Make sure you include your UTF-8 HTML as POST body. If so, make sure you set "Content-Type: text/html; charset=UTF-8" in headers.' };
    //let decoder = new TextDecoder();
    //console.log(`URL: ${req.headers.url}`)
    //console.log(`Body len: ${req.body.length}`);
    if (req.body) {
        try {
            console.log(req.headers);
            const contentType = req.get('Return-Content-Type') || 'html';
            console.log(`Trying to parse JSON... ${req.get('Custom-Extractor')}`);
            let customExtractor = null;
            if (req.get('Custom-Extractor')) {
                customExtractor = JSON.parse(Buffer.from(req.get('Custom-Extractor'), 'utf-8'))
            }
            console.log(`JSON parsed, customExtractor: ${customExtractor}`);
            
            //console.log(`HTML payload length: ${req.body.html.length}`)
            result = await Mercury.parse(req.get('URL') || 'http://example.com/', {
                contentType: contentType,
                //headers,
                html: Buffer.from(req.body, 'utf-8'),
                customExtractor: customExtractor,
            });
        } catch (error) {
            result = { error: true, messages: error.message };
            if (req.get('URL')) {
            	result.url = req.get('URL');
            }
        }
    }
    res.set({ 'Content-Type': 'application/json; charset=utf-8' });
    //console.log(result)
    return res.json(result);
});

router.route('/parser-legacy').post(async (req, res) => {
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
