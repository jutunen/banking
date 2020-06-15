const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const app = express();
const rateLimit = require("express-rate-limit");

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
    await mongoose.connect("mongodb://user_1:user_1@localhost/banking-mongoose", {
    //await mongoose.connect("mongodb://mongou:27017/banking-mongoose", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}

connectMongoose();

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15
});

const apiLimiter_2 = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15
});

const apiLimiter_3 = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15
});


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => setTimeout(next, 500));
app.set('trust proxy', true);
app.use("/auth", apiLimiter);
app.use("/user/withdraw", apiLimiter);
app.use("/user/deposit", apiLimiter_2);
app.use("/user/transfer", apiLimiter_3);

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
