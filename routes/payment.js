const express = require('express');
const validator = require('validator');
const creditCard = require('credit-card-validation');
const iban = require('iban');
const router = express.Router();

let paymentTypes = ['Credit Card', 'PayPal', 'Bank Transfer'];
let paymentDetails = [];

router.get('/payment-types', (req, res) => {
  res.json(paymentTypes);
});

router.post('/validate-payment', (req, res) => {
  const { type, details } = req.body;

  // Validate payment type
  if (!paymentTypes.includes(type)) {
    return res.status(400).json({ valid: false, message: 'Invalid payment type' });
  }

  // Validate credit card details
  if (type === 'Credit Card') {
    const { cardNumber, expiryMonth, expiryYear, cvc } = details;

    if (!creditCard.validateCardNumber(cardNumber)) {
      return res.status(400).json({ valid: false, message: 'Invalid credit card number' });
    }

    if (!creditCard.validateExpiry(expiryMonth, expiryYear)) {
      return res.status(400).json({ valid: false, message: 'Invalid expiry date' });
    }

    if (!creditCard.validateCVC(cvc)) {
      return res.status(400).json({ valid: false, message: 'Invalid CVC' });
    }
  }

  // Validate PayPal details
  if (type === 'PayPal') {
    const { email } = details;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ valid: false, message: 'Invalid PayPal email' });
    }
  }

  // Validate bank transfer details
  if (type === 'Bank Transfer') {
    const { accountNumber, sortCode, IBAN } = details;

    // Validate IBAN if provided
    if (IBAN) {
      if (!iban.isValid(IBAN)) {
        return res.status(400).json({ valid: false, message: 'Invalid IBAN' });
      }
    } else {
      // Validate account number and sort code
      if (!validator.isNumeric(accountNumber) || accountNumber.length < 8 || accountNumber.length > 20) {
        return res.status(400).json({ valid: false, message: 'Invalid bank account number' });
      }

      if (!validator.isNumeric(sortCode) || sortCode.length !== 6) {
        return res.status(400).json({ valid: false, message: 'Invalid bank sort code' });
      }
    }
  }

  // Additional validation can be added for other payment types if needed
  res.json({ valid: true });
});

router.post('/submit-payment', (req, res) => {
  const { type, details } = req.body;

  // Assuming the payment details have already been validated
  paymentDetails.push({ type, details });
  res.json({ success: true });
});

module.exports = router;
