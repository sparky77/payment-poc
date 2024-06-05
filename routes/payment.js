const express = require('express');
const validator = require('validator');
const creditCard = require('credit-card-validation');
const iban = require('iban');
const router = express.Router();

const paymentTypes = [
    "Credit Card",
    "PayPal",
    "Bank Transfer",
    "Cheque",
    "Batch File"
];
let paymentDetails = [];
let transactions = {}; // Store transactions for demo purposes

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

  // Generate a unique transaction ID (for demo purposes, use a simple counter)
  const transactionId = `txn_${Date.now()}`;
  transactions[transactionId] = { type, details, status: 'Pending' };

  // Assuming the payment details have already been validated
  paymentDetails.push({ type, details });
  res.json({ success: true, transactionId });
});

router.get('/check-transaction-status/:transactionId', (req, res) => {
  const { transactionId } = req.params;

  if (transactions[transactionId]) {
    res.json({ transactionId, status: transactions[transactionId].status });
  } else {
    res.status(404).json({ message: 'Transaction not found' });
  }
});

module.exports = router;
