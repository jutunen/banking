const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const tokenSecret = "add_good_secret_here";
const tokenExpirationTime = 600; // seconds

import { client } from "./server.js";

export async function handleLoginReq(request, res) {
  let { id, passwd } = request;
  console.log("id: " + id);
  console.log("passwd: " + passwd);

  if (isNaN(Number(id))) {
    res.status(400).send("invalid id");
    return;
  }

  const query_1 = `SELECT name, pw_hash FROM customers WHERE customer_id = ${id}`;

  let dbRes;
  try {
    dbRes = await client.query(query_1);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(400).send("db malfunction");
    return;
  }

  console.log(dbRes.rows);

  if (dbRes.rows.length === 0) {
    res.status(400).send("invalid id");
    return;
  }

  const hash = dbRes.rows[0].pw_hash;
  const customer_name = dbRes.rows[0].name;

  console.log("hash from db: " + hash);
  console.log("customer name: " + customer_name);

  let check = await bcrypt.compare(passwd, hash);
  if (check) {
    const accessToken = jwt.sign(
      { username: id, role: "client" },
      tokenSecret,
      { expiresIn: tokenExpirationTime }
    );
    console.log("Sending response.");
    res.json({ accessToken });
  } else {
    console.log("invalid password");
    res.status(400).send("invalid password");
  }
}

export function authenticateJWT(req, res, next) {
  console.log("req.headers: ");
  console.log(req.headers);
  const authHeader = req.headers.authorization;
  console.log("authHeader: ");
  console.log(authHeader);

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    console.log("token: ");
    console.log(token);

    jwt.verify(token, tokenSecret, (err, user) => {
      if (err) {
        console.log(err);
        console.log("sending 403");
        if (err.name === "TokenExpiredError") {
          res.status(403).send("token expired");
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
    console.log("sending 401");
    res.sendStatus(401);
  }
}

async function checkIdExistence(id, res) {
  // check that customer id exists
  const query_1 = `SELECT COUNT(*) FROM customers WHERE customer_id = ${id}`;

  let dbRes;
  try {
    dbRes = await client.query(query_1);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(400).send("db malfunction");
    return false;
  }

  const customerCount = parseInt(dbRes.rows[0].count);
  console.log("customerCount: " + customerCount);

  if (customerCount === 0) {
    res.status(400).send("invalid customer id");
    return false;
  }

  return true;
}

export async function handleAccountInfoReq(req, res) {
  let id = req;

  console.log(" *** handleAccountInfoReq:");
  console.log("req: " + req);

  let idExists = await checkIdExistence(id, res);
  if (!idExists) {
    return;
  }

  //get accounts belonging to customer
  const query_1 = `SELECT account_id, balance, name, accounts.customer_id FROM accounts INNER JOIN customers on accounts.customer_id = customers.customer_id WHERE customers.customer_id = ${id}`;

  let dbRes;
  try {
    dbRes = await client.query(query_1);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(400).send("db malfunction");
    return;
  }

  console.log(JSON.stringify(dbRes.rows));

  res.status(200).send(dbRes.rows[0]);
}

export async function handleCreateAccountReq(req, res) {
  console.log(" *** handleCreateAccountReq:");
  console.log("req: ");
  console.log(req);
  console.log(JSON.stringify(req));

  let { id } = req;

  console.log("id: " + id);

  let idExists = await checkIdExistence(id, res);
  if (!idExists) {
    return;
  }

  // do not allow more than 3 accounts per customer id
  const query_2 = `SELECT COUNT(*) FROM accounts WHERE customer_id = ${id}`;

  console.log(query_2);

  let dbRes;
  try {
    dbRes = await client.query(query_2);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(400).send("query_2 db malfunction");
    return;
  }

  const accountCount = parseInt(dbRes.rows[0].count);

  if (accountCount > 3) {
    res.status(400).send("max account count reached");
    return;
  }

  //console.log(JSON.stringify(dbRes));
  //console.log(dbRes.rows[0].count);
  console.log("accountCount: " + accountCount);

  const query_3 = `INSERT INTO accounts (account_id, customer_id, balance) VALUES (DEFAULT,${id},0) RETURNING account_id`;

  try {
    dbRes = await client.query(query_3);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(400).send("query_3 db malfunction");
    return;
  }

  const account_id = dbRes.rows[0].account_id;
  console.log("account_id: " + account_id);

  res.status(200).send({ account_id: account_id });
  //res.send({ account_id: account_id });
}

export async function handleNewUserReq(request, res) {
  let { name, passwd } = request;

  console.log(" *** handleNewUserReq:");
  console.log("passwd: " + passwd);

  let salt, hash;

  try {
    salt = await bcrypt.genSalt(10);
  } catch (err) {
    console.log(JSON.stringify(err));
  }

  try {
    hash = await bcrypt.hash(passwd, salt);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(400).send("hash generation malfunction");
    return;
  }

  const query = `INSERT INTO customers (customer_id,name,pw_hash) VALUES (DEFAULT,'${name}','${hash}') RETURNING customer_id`;

  let dbRes;
  try {
    dbRes = await client.query(query);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(400).send("db malfunction");
    return;
  }

  console.log(JSON.stringify(dbRes.rows));
  const customer_id = dbRes.rows[0].customer_id;
  console.log("customer_id: " + customer_id);

  const accessToken = jwt.sign(
    { username: customer_id, role: "client" },
    tokenSecret,
    { expiresIn: tokenExpirationTime }
  );

  res.json({ accessToken });
}

export async function handleDepositReq(request, res) {
  let { id, deposit } = request;

  deposit = parseFloat(deposit);

  console.log(" *** handleDepositReq:");
  console.log("deposit: " + deposit);
  console.log("id: " + id);

  const query = `SELECT account_id FROM accounts WHERE customer_id = ${id}`;

  let dbRes;
  try {
    dbRes = await client.query(query);
  } catch (err) {
    console.log(JSON.stringify(err));
  }

  const account_id = dbRes.rows[0].account_id;
  console.log("account_id: " + account_id);

  // this won't allow multiple accounts per customer:
  const query_2 = `SELECT balance FROM accounts WHERE customer_id = ${id}`;

  try {
    dbRes = await client.query(query_2);
  } catch (err) {
    console.log(JSON.stringify(err));
  }

  const balance = parseFloat(dbRes.rows[0].balance);
  console.log("balance: " + balance);
  const newBalance = balance + deposit;

  // this won't allow multiple accounts per customer:
  const query_3 = `UPDATE accounts SET balance = ${newBalance} WHERE customer_id = ${id}`;

  try {
    dbRes = await client.query(query_3);
  } catch (err) {
    console.log(JSON.stringify(err));
  }

  console.log(JSON.stringify(dbRes));

  const query_4 = `INSERT INTO transactions (transaction_id, type, to_account, from_account, amount, date) VALUES (DEFAULT,1,${account_id},NULL,${deposit},NOW())`;

  try {
    dbRes = await client.query(query_4);
  } catch (err) {
    console.log(JSON.stringify(err));
  }

  res.send({ balance: newBalance });
}

export async function handleWithdrawalReq(request, res) {
  let { id, withdrawal } = request;

  withdrawal = parseFloat(withdrawal);

  console.log(" *** handleWithdrawalReq:");
  console.log("withdrawal: " + withdrawal);
  console.log("id: " + id);

  const query = `SELECT account_id FROM accounts WHERE customer_id = ${id}`;

  let dbRes;
  try {
    dbRes = await client.query(query);
  } catch (err) {
    console.log(JSON.stringify(err));
  }

  const account_id = dbRes.rows[0].account_id;
  console.log("account_id: " + account_id);

  // this won't allow multiple accounts per customer:
  const query_2 = `SELECT balance FROM accounts WHERE customer_id = ${id}`;

  try {
    dbRes = await client.query(query_2);
  } catch (err) {
    console.log(JSON.stringify(err));
  }

  const balance = parseFloat(dbRes.rows[0].balance);
  console.log("balance: " + balance);
  const newBalance = balance - withdrawal;

  if (newBalance < 0) {
    res.status(400).send("withdrawal exceeds balance");
    return;
  }

  // this won't allow multiple accounts per customer:
  const query_3 = `UPDATE accounts SET balance = ${newBalance} WHERE customer_id = ${id}`;

  try {
    dbRes = await client.query(query_3);
  } catch (err) {
    console.log(JSON.stringify(err));
  }

  console.log(JSON.stringify(dbRes));

  const query_4 = `INSERT INTO transactions (transaction_id, type, to_account, from_account, amount, date) VALUES (DEFAULT,2,NULL,${account_id},${withdrawal},NOW())`;

  try {
    dbRes = await client.query(query_4);
  } catch (err) {
    console.log(JSON.stringify(err));
  }

  res.send({ balance: newBalance });
}

export async function handleTransferReq(request, res) {
  let { id, account, amount } = request;

  const query = `SELECT account_id FROM accounts WHERE customer_id = ${id}`;

  let dbRes;
  try {
    dbRes = await client.query(query);
  } catch (err) {
    console.log(JSON.stringify(err));
  }

  const fromAccount = dbRes.rows[0].account_id;
  console.log("fromAccount: " + fromAccount);

  amount = parseFloat(amount);

  const toAccount = account;

  // check that toAccount exists
  const query_2 = `SELECT EXISTS(SELECT 1 FROM accounts WHERE account_id = ${toAccount})`;

  try {
    dbRes = await client.query(query_2);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(400).send("db malfunction");
    return false;
  }

  const exists = dbRes.rows[0].exists;
  console.log("exists: " + exists);

  if (!exists) {
    res.status(400).send("account does not exist");
    return;
  }

  // get fromAccount balance
  const query_3 = `SELECT balance FROM accounts WHERE account_id = ${fromAccount}`;

  try {
    dbRes = await client.query(query_3);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(400).send("db malfunction");
    return false;
  }

  let balance = parseFloat(dbRes.rows[0].balance);
  console.log("balance: " + balance);

  const newFromAccountBalance = balance - amount;

  if (newFromAccountBalance < 0) {
    res.status(400).send("transfer exceeds balance");
    return;
  }

  // get toAccount balance
  const query_4 = `SELECT balance FROM accounts WHERE account_id = ${toAccount}`;

  try {
    dbRes = await client.query(query_4);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(400).send("db malfunction");
    return false;
  }

  balance = parseFloat(dbRes.rows[0].balance);
  console.log("balance: " + balance);

  const newToAccountBalance = balance + amount;

  // update fromAccount balance
  const query_5 = `UPDATE accounts SET balance = ${newFromAccountBalance} WHERE account_id = ${fromAccount}`;

  try {
    dbRes = await client.query(query_5);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(400).send("db malfunction");
    return false;
  }

  console.log(JSON.stringify(dbRes));

  // update toAccount balance
  const query_6 = `UPDATE accounts SET balance = ${newToAccountBalance} WHERE account_id = ${toAccount}`;

  try {
    dbRes = await client.query(query_6);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(400).send("db malfunction");
    return false;
  }

  console.log(JSON.stringify(dbRes));

  const query_7 = `INSERT INTO transactions (transaction_id, type, to_account, from_account, amount, date) VALUES (DEFAULT,3,${toAccount},${fromAccount},${amount},NOW())`;

  try {
    dbRes = await client.query(query_7);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(400).send("db malfunction");
    return false;
  }

  res.send({ balance: newFromAccountBalance });
}

export async function handleTransactionsReq(params, res) {
  const id = Number(params.id);
  const skip = Number(params.skip);
  const limit = Number(params.limit);

  console.log("id: " + id);
  console.log("skip: " + skip);
  console.log("limit: " + limit);

  const query = `SELECT account_id FROM accounts WHERE customer_id = ${id}`;

  let dbRes;
  try {
    dbRes = await client.query(query);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(400).send("db malfunction");
    return false;
  }

  const account_id = dbRes.rows[0].account_id;
  console.log("account_id: " + account_id);

  const query_2 = `SELECT COUNT(*) FROM transactions WHERE to_account = ${account_id} OR from_account = ${account_id}`;

  try {
    dbRes = await client.query(query_2);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(400).send("db malfunction");
    return false;
  }

  const transactionCount = parseInt(dbRes.rows[0].count);
  console.log("transactionCount: " + transactionCount);

  const query_3 = `SELECT type, to_account as "to", from_account as "from", amount, date FROM transactions WHERE to_account = ${account_id} OR from_account = ${account_id} ORDER BY date DESC LIMIT ${limit} OFFSET ${skip}`;

  try {
    dbRes = await client.query(query_3);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(400).send("db malfunction");
    return false;
  }

  console.log(dbRes.rows);

  res.send({ count: transactionCount, transactions: dbRes.rows });
}
