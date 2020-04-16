const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const tokenSecret = "_seOnSalai$uus!";
const tokenExpirationTime = 60; // seconds
//const adminPasswordHash = '$2b$10$Zs1db/75PHRVkemj5kbN4eaFTZcAOy.6ClHHcNhSBEuQLYaVJwSbK'; // longer and safer
const adminPasswordHash = '$2b$10$SNWmynGCP8X9YSkOZ7qI3u7/96Dm5osN.gvtLplnp1.eYuN/3F0Mm'; // shorter and unsafe
const adminUsername = 'admin';

import { Account, Transaction } from "./models.js";
import { TR_WITHDRAWAL, TR_DEPOSIT, TR_TRANSFER } from "./models.js";
import * as ERR from "./errors.js";

export function authenticateAdminJWT(req, res, next) {

    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, tokenSecret, (err, user) => {
            if (err) {
                console.log(err);
                console.log("sending 403");
                if(err.name === 'TokenExpiredError') {
                  res.status(403).send(ERR.TOKEN_EXPIRED);
                } else {
                  res.sendStatus(403);
                }
                return;
            }

            console.log("user: ");
            console.log(user);

            if(user.username !== adminUsername) {
              console.log("sending 401")
              res.sendStatus(401);
              return;
            }
            next();
        });
    } else {
        console.log("sending 401")
        res.sendStatus(401);
    }
};

export function authenticateJWT(req, res, next) {
    console.log("req.headers: ");
    console.log(req.headers);
    const authHeader = req.headers.authorization;
    console.log("authHeader: ");
    console.log(authHeader);

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        console.log("token: ");
        console.log(token);

        jwt.verify(token, tokenSecret, (err, user) => {
            if (err) {
                console.log(err);
                console.log("sending 403");
                if(err.name === 'TokenExpiredError') {
                  res.status(403).send(ERR.TOKEN_EXPIRED);
                } else {
                  res.sendStatus(403);
                }
                return;
            }

            console.log("user: ");
            console.log(user);

            console.log("req.params: ");
            console.log(req.params);

            console.log("req.body: ");
            console.log(req.body);

            req.params.id = user.username;
            req.body.id = user.username;

            next();
        });
    } else {
        console.log("sending 401")
        res.sendStatus(401);
    }
};

export async function handleLoginReq(request, res) {

  let { id, passwd } = request;
  console.log("id: " + id);
  console.log("passwd: " + passwd);

  if(isNaN(Number(id))) {
    res.status(400).send(ERR.INVALID_ID);
    return;
  }

  console.log("Searching for account.");
  let account = await Account.findOne({ id: id }).exec();

  console.log("Validating account.");
  if(account !== null) {
    let check = await bcrypt.compare(passwd,account.password);
    if(check) {
      const accessToken = jwt.sign({ username: account.id,  role: "client" }, tokenSecret, { expiresIn: tokenExpirationTime });
      console.log("Sending response.");
      res.json({ accessToken });
    } else {
      console.log("invalid password");
      res.status(400).send(ERR.INVALID_PASSWORD);
    }
  } else {
    console.log("id not found");
    res.status(400).send(ERR.ID_NOT_FOUND);
  }
}

export async function handleBalanceReq(id, res) {

   console.log("handleBalanceReq id:" + id);

  if(isNaN(Number(id))) {
    console.log("sending error 400");
    res.status(400).send(ERR.INVALID_ID);
    return;
  }

  let account = await Account.findOne({ id: id }).exec();

  if(account !== null) {
    let response = {name: account.name, balance: account.balance, id: account.id};
    console.log(response);
    res.send(response);
  } else {
    console.log("sending error 400");
    res.status(400).send(ERR.ID_NOT_FOUND);
  }
}

export async function handleNewUserReq(request, res) {
    let { name, deposit, passwd } = request;
    const existingIds = await Account.distinct("id").exec();
    const newId = generateId(existingIds);

    console.log("deposit: " + deposit);
    console.log(typeof deposit);

    if (name && !isNaN(deposit) && passwd) {

        const salt = await bcrypt.genSalt(10);
        passwd = await bcrypt.hash(passwd, salt);

        const account = new Account({
            name: name,
            balance: deposit,
            password: passwd,
            id: newId
        });

        account.save((err, obj) => {
            console.log(obj);
            const accessToken = jwt.sign({ username: obj.id,  role: "client" }, tokenSecret, { expiresIn: tokenExpirationTime });
            res.json({ accessToken });
        });

        if(deposit > 0) {
          addTransaction(deposit, TR_DEPOSIT , null, newId);
        }
    } else {
        console.log("sending error 400");
        res.status(400).send(ERR.INVALID_DATA);
    }
}

export async function handleTransferReq(request, res) {

  const { id, account, amount } = request;
  console.log("handleTransferReq");
  console.log(typeof id);
  console.log(id);
  console.log(typeof account);
  console.log(account);
  console.log(typeof amount);
  console.log(amount);

  if(typeof id !== "number" || typeof account !== "number" || typeof amount !== "number" ) {
    console.log("ERR.INVALID_TYPE");
    res.status(400).send(ERR.INVALID_TYPE);
    return;
  }

  let fromAccount = await Account.findOne({ id: id }).exec();

  if(fromAccount === null) {
    console.log("ERR.INVALID_ID");
    res.status(400).send(ERR.INVALID_ID);
    return;
  }

  let toAccount = await Account.findOne({ id: account }).exec();

  if(toAccount === null) {
    console.log("ERR.ID_NOT_FOUND");
    res.status(400).send(ERR.ID_NOT_FOUND);
    return;
  }

  if(fromAccount.balance < amount) {
    console.log("ERR.INSUFFICIENT_BALANCE");
    res.status(400).send(ERR.INSUFFICIENT_BALANCE);
    return;
  }

  fromAccount.balance -= amount;
  toAccount.balance += amount;

  toAccount.save((err, obj) => {
      if (err !== null) {
          console.log(JSON.stringify(err));
          res.status(400).send(ERR.DB_MALFUNCTION);
          return;
      }
    });

  fromAccount.save((err, obj) => {
      if (err !== null) {
          console.log(JSON.stringify(err));
          res.status(400).send(ERR.DB_MALFUNCTION);
          return;
      }
        console.log(obj);
        res.send({ balance: fromAccount.balance });
    });

  addTransaction(amount, TR_TRANSFER, fromAccount.id, toAccount.id);
}

export async function handleWithdrawalReq(request, res) {
  const { id, withdrawal } = request;
  console.log("handleWithdrawalReq");
  console.log(id);
  console.log(withdrawal);

  let account = await Account.findOne({ id: id }).exec();

  if(account !== null) {

    if(account.balance < withdrawal) {
      res.status(400).send(ERR.INSUFFICIENT_BALANCE);
      return;
    }

    account.balance -= withdrawal;

    account.save((err, obj) => {
        if (err !== null) {
            console.log(JSON.stringify(err));
            console.log("sending error 400");
            res.status(400).send(ERR.DB_MALFUNCTION);
            return;
        }
        console.log(obj);
        addTransaction(withdrawal, TR_WITHDRAWAL, id, null);
        res.send({ balance: account.balance });
    });
  } else {
    console.log("sending error 400");
    res.status(400).send(ERR.INVALID_ID);
  }
}

export async function handleDepositReq(request, res) {
    const { id, deposit } = request;
    console.log("handleDepositReq");
    console.log(id);
    console.log(deposit);

    let account = await Account.findOne({ id: id }).exec();

    if(account !== null) {
      account.balance += deposit;
      account.save((err, obj) => {
          if (err !== null) {
              console.log(JSON.stringify(err));
              console.log("sending error 400");
              res.status(400).send(ERR.DB_MALFUNCTION);
              return;
          }
          console.log(obj);
          addTransaction(deposit, TR_DEPOSIT , null, id);
          console.log("sending " + account.balance);
          res.send({ balance: account.balance });
      });
    } else {
      console.log("sending error 400");
      res.status(400).send(ERR.INVALID_ID);
    }
}

export async function handleTransactionsReq(params, res) {
  const id = Number(params.id);
  const skip = Number(params.skip);
  const limit = Number(params.limit);

  console.log("id: " + id);

  const count = await Transaction.find().or([{ to: id }, { from: id }]).countDocuments();

  if(count === 0) {
    console.log("ERR.TRANSACTIONS_NOT_FOUND");
    res.status(400).send(ERR.TRANSACTIONS_NOT_FOUND);
    return;
  }

  console.log("count: " + count);

  const results =
  await Transaction.find().or([{ to: id }, { from: id }])
        .select(['-_id','amount','type','to','from','date'])
        .sort({date: -1})
        .skip(skip)
        .limit(limit)
        .exec();

  console.log(results);

  if(results.length > 0) {
    res.send({count:count, transactions:results});
  } else {
    res.status(400).send(ERR.TRANSACTIONS_NOT_FOUND);
  }
}

function addTransaction(amount, type, from, to) {

  const transaction = new Transaction({
    amount: amount,
    type: type,
    to: to,
    from: from,
    date: new Date()
  });

  transaction.save((err, obj) => {
    if (err !== null) {
        console.log("transaction err: ");
        console.log(err);
    }
    console.log("transaction obj: ");
    console.log(obj);
  });

}

export async function handleAdminLoginReq(request, res) {

  let { id, passwd } = request;
  console.log("id: " + id);
  console.log("passwd: " + passwd);

  if(id !== adminUsername) {
    res.status(400).send(ERR.INVALID_ID);
    return;
  }

  let check = await bcrypt.compare(passwd, adminPasswordHash);

  if(check) {
    const accessToken = jwt.sign({ username: adminUsername,  role: "client" }, tokenSecret, { expiresIn: tokenExpirationTime });
    console.log("Sending response.");
    res.json({ accessToken });
  } else {
    console.log("invalid password");
    res.status(400).send(ERR.INVALID_PASSWORD);
  }
}

export async function handleAdminStatsReq(req, res) {

  const traCount = await Transaction.find().countDocuments();
  const accCount = await Account.find().countDocuments();

  res.send({transactions:traCount, accounts:accCount});

}

function generateId(id_array_obj) {

    let id_array = Array.from(id_array_obj);

    if(id_array.length === 0) {
      return 1; // first id
    }

    id_array.sort(function(a, b) {
        return a - b;
    });
    for (let i = 0; i < 100000000; i++) {
        if (id_array[i] + 1 !== id_array[i + 1]) {
            return id_array[i] + 1;
        }
    }
}
