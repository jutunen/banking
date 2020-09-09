const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const app = express();
const dbClient = require('pg').Client;

import {
  handleNewUserReq,
  handleCreateAccountReq,
  handleDepositReq,
  handleWithdrawalReq,
  handleTransferReq,
  handleAccountInfoReq,
  authenticateJWT,
  handleLoginReq,
  handleTransactionsReq } from "./functions.js";

export const client = new dbClient({
    user: 'jussi',
    host: 'localhost',
    database: 'jussi',
    password: 'jussi',
    port: 5432,
});

async function connectDb() {
    await client.connect();
}

connectDb();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => setTimeout(next, 1000));
app.set('trust proxy', true);

app.post("/user/login", (req, res) => {
    handleLoginReq(req.body, res);
});

app.get("/user/accounts", authenticateJWT, (req, res) => {
    handleAccountInfoReq(req.params.id, res);
});

app.post("/user/user", (req, res) => {
    handleNewUserReq(req.body, res);
});

app.post("/user/create_account", authenticateJWT, (req, res) => {
    handleCreateAccountReq(req.body, res);
});

app.patch("/user/deposit", authenticateJWT, (req, res) => {
    handleDepositReq(req.body, res);
});

app.patch("/user/withdraw", authenticateJWT, (req, res) => {
    handleWithdrawalReq(req.body, res);
});

app.patch("/user/transfer", authenticateJWT, (req, res) => {
    handleTransferReq(req.body, res);
});

app.get("/user/transactions/:skip/:limit", authenticateJWT, (req, res) => {
    handleTransactionsReq(req.params, res);
});

console.log("Listening port 5000");
app.listen(5000);
