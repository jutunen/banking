
const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
    name: String,
    password: String,
    balance: Number,
    id: Number
});

const TransactionSchema = new mongoose.Schema({
    amount: Number,
    type: Number,
    to: Number,
    from: Number,
    date: Date
});

export const Account = mongoose.model("accounts", AccountSchema);

export const Transaction = mongoose.model("transactions", TransactionSchema);

export const TR_WITHDRAWAL = 1;
export const TR_DEPOSIT = 2;
export const TR_TRANSFER = 3;
