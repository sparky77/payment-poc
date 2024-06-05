const express = require('express');
const bodyParser = require('body-parser');
const paymentRoutes = require('./routes/payment');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api', paymentRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
