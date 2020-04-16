const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const app = express();

const mongoose = require("mongoose");

import {
  handleAdminLoginReq,
  handleAdminStatsReq,
  authenticateAdminJWT,
  authenticateJWT,
  handleLoginReq,
  handleBalanceReq,
  handleNewUserReq,
  handleTransferReq,
  handleWithdrawalReq,
  handleDepositReq,
  handleTransactionsReq } from "./functions.js";

async function connectMongoose() {
    await mongoose.connect("mongodb://jussi:petteri@localhost/jussinDb", {
    //await mongoose.connect("mongodb://mongou:27017/banking-mongoose", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}

connectMongoose();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => setTimeout(next, 500));

app.post("/auth", (req, res) => {
    handleLoginReq(req.body, res);
});

app.get("/user/balance", authenticateJWT, (req, res) => {
    handleBalanceReq(req.params.id, res);
});

app.post("/user", (req, res) => {
    handleNewUserReq(req.body, res);
});

app.patch("/user/withdraw", authenticateJWT, (req, res) => {
    handleWithdrawalReq(req.body,res);
});

app.patch("/user/deposit", authenticateJWT, (req, res) => {
    handleDepositReq(req.body, res);
});

app.patch("/user/transfer", authenticateJWT, (req, res) => {
    handleTransferReq(req.body, res);
});

app.get("/user/transactions/:skip/:limit", authenticateJWT, (req, res) => {
    handleTransactionsReq(req.params, res);
});

app.post("/admin", (req, res) => {
    handleAdminLoginReq(req.body, res);
});

app.get("/admin/stats", authenticateAdminJWT, (req, res) => {
    handleAdminStatsReq(req, res);
});


console.log("Listening port 5000");
app.listen(5000);
