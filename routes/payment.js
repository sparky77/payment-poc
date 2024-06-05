const express = require('express');
const router = express.Router();

let paymentTypes = ['Credit Card', 'PayPal', 'Bank Transfer'];
let paymentDetails = [];

router.get('/payment-types', (req, res) => {
    res.json(paymentTypes);
});

router.post('/validate-payment', (req, res) => {
    const { type, details } = req.body;
    if (paymentTypes.includes(type) && details) {
        res.json({ valid: true });
    } else {
        res.json({ valid: false });
    }
});

router.post('/submit-payment', (req, res) => {
    const { type, details } = req.body;
    paymentDetails.push({ type, details });
    res.json({ success: true });
});

module.exports = router;
