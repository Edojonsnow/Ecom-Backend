const Paystack = require("@paystack/paystack-sdk");

const paystack = new Paystack(
  "sk_test_c3696a0e8db1374fb7e451bcf6f5941434b5aab1"
);

module.exports = paystack;
