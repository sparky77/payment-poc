const express = require('express');
const validator = require('validator');
const cardValidator = require('card-validator');
const iban = require('iban');
const router = express.Router();

const paymentTypes = ['Credit Card', 'PayPal', 'Bank Transfer', 'Cheque', 'Batch File'];
const transactionStatuses = ['Pending', 'Completed', 'Failed', 'Canceled', 'Under Review', 'Refunded'];
const paymentDetails = [];
const transactions = {}; // Store transactions for demo purposes

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
    const { cardNumber, expiryMonth, expiryYear, cvc, amount } = details;

    const cardNumberValidation = cardValidator.number(cardNumber);
    if (!cardNumberValidation.isValid) {
      console.error('Invalid credit card number');
      return res.status(400).json({ valid: false, message: 'Invalid credit card number' });
    }

    const expiryValidation = cardValidator.expirationMonth(expiryMonth) && cardValidator.expirationYear(expiryYear);
    if (!expiryValidation.isValid) {
      console.error('Invalid expiry date');
      return res.status(400).json({ valid: false, message: 'Invalid expiry date' });
    }

    const cvcValidation = cardValidator.cvv(cvc);
    if (!cvcValidation.isValid) {
      console.error('Invalid CVC');
      return res.status(400).json({ valid: false, message: 'Invalid CVC' });
    }

    if (!validator.isCurrency(amount, { allow_negatives: false })) {
      console.error('Invalid amount');
      return res.status(400).json({ valid: false, message: 'Invalid amount' });
    }
  }

  // Validate PayPal details
  if (type === 'PayPal') {
    const { email, amount } = details;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ valid: false, message: 'Invalid PayPal email' });
    }

    if (!validator.isCurrency(amount, { allow_negatives: false })) {
      return res.status(400).json({ valid: false, message: 'Invalid amount' });
    }
  }

  // Validate bank transfer details
  if (type === 'Bank Transfer') {
    const { accountNumber, sortCode, IBAN, amount } = details;

    if (IBAN) {
      if (!iban.isValid(IBAN)) {
        return res.status(400).json({ valid: false, message: 'Invalid IBAN' });
      }
    } else {
      if (!validator.isNumeric(accountNumber) || accountNumber.length < 8 || accountNumber.length > 20) {
        return res.status(400).json({ valid: false, message: 'Invalid bank account number' });
      }

      if (!validator.isNumeric(sortCode) || sortCode.length !== 6) {
        return res.status(400).json({ valid: false, message: 'Invalid bank sort code' });
      }
    }

    if (!validator.isCurrency(amount, { allow_negatives: false })) {
      return res.status(400).json({ valid: false, message: 'Invalid amount' });
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
      console.error('Transaction not found:', transactionId);
      res.status(404).json({ message: 'Transaction not found' });
    }
  });

  router.post('/update-transaction-status', (req, res) => {
    const { transactionId, status } = req.body;
  
    if (!transactions[transactionId]) {
      console.error('Transaction not found:', transactionId);
      return res.status(404).json({ message: 'Transaction not found' });
    }
  
    if (!transactionStatuses.includes(status)) {
      console.error('Invalid status:', status);
      return res.status(400).json({ message: 'Invalid status' });
    }
  
    transactions[transactionId].status = status;
    console.log(`Transaction ${transactionId} updated to status: ${status}`);
    res.json({ success: true, transactionId, status });
  });

module.exports = router;
