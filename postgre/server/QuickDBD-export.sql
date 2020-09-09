-- Exported from QuickDBD: https://www.quickdatabasediagrams.com/
-- NOTE! If you have used non-SQL datatypes in your design, you will have to change these here.

-- Modify this code to update the DB schema diagram.
-- To reset the sample schema, replace everything with
-- two dots ('..' - without quotes).

CREATE TABLE "customers" (
    "customer_id" serial   NOT NULL,
    "name" text   NOT NULL,
    "pw_hash" text   NOT NULL,
    CONSTRAINT "pk_customers" PRIMARY KEY (
        "customer_id"
     )
);

CREATE TABLE "accounts" (
    "account_id" serial   NOT NULL,
    "customer_id" int   NOT NULL,
    "balance" numeric(12,2)  NOT NULL,
    CONSTRAINT "pk_accounts" PRIMARY KEY (
        "account_id"
     )
);

CREATE TABLE "transactions" (
    "transaction_id" serial   NOT NULL,
    "type" int   NOT NULL,
    "to_account" int,
    "from_account" int,
    "amount" numeric(12,2)   NOT NULL,
    "date" timestamp   NOT NULL
);

CREATE TABLE "ta_types" (
    "type_id" serial   NOT NULL,
    "type_descr" text   NOT NULL,
    CONSTRAINT "pk_ta_types" PRIMARY KEY (
        "type_id"
     )
);

ALTER TABLE "accounts" ADD CONSTRAINT "fk_accounts_customer_id" FOREIGN KEY("customer_id")
REFERENCES "customers" ("customer_id");

ALTER TABLE "transactions" ADD CONSTRAINT "fk_transactions_type" FOREIGN KEY("type")
REFERENCES "ta_types" ("type_id");

ALTER TABLE "transactions" ADD CONSTRAINT "fk_transactions_to_account" FOREIGN KEY("to_account")
REFERENCES "accounts" ("account_id");

ALTER TABLE "transactions" ADD CONSTRAINT "fk_transactions_from_account" FOREIGN KEY("from_account")
REFERENCES "accounts" ("account_id");

INSERT INTO ta_types (type_id, type_descr) VALUES (DEFAULT,'deposit');

INSERT INTO ta_types (type_id, type_descr) VALUES (DEFAULT,'withdrawal');

INSERT INTO ta_types (type_id, type_descr) VALUES (DEFAULT,'transfer');
