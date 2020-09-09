import React, {useState, useEffect} from "react";
import "./App.css";
import * as ID from "./ids.js";
import * as ERR from "./errors.js";
import {isValidSum} from "./App.js";
import * as store from "./restful-io.js";

export function TransferForm(props) {

  useEffect(() => { document.title = "Transfer";  }, []);

  const [transferAmount,setTransferAmount] = useState("");
  const [transferAccount,setTransferAccount] = useState("");

  function handleTransfer(id, event) {

    if(props.requestIsPending) {
      return;
    }

    if (id === ID.INP_TRANSFER_ID) {
      setTransferAccount(event.target.value.trim());
    } else if (id === ID.INP_TRANSFER_SUM) {
      setTransferAmount(event.target.value.trim());
    } else if (id === ID.BTN_TRANSFER) {
      if (transferAmount.length === 0) {
        props.showMsg("Transfer amount missing!\nAdd amount!");
        return;
      }

      if (transferAccount.length === 0) {
        props.showMsg("Account ID missing!\nAdd account ID!");
        return;
      }

      if (!isValidSum(transferAccount)) {
        props.showMsg("Invalid account ID!\nCheck account ID!");
        return;
      }

      if (!isValidSum(transferAmount)) {
        props.showMsg("Invalid amount!\nCheck amount!");
        return;
      }

      if (Number(transferAccount) === props.loginId) {
        props.showMsg(
          "You can't transfer to your own account.\nCheck account ID!"
        );
        return;
      }

      props.setRequestIsPending(true);
      store.sendRequest("patch", "user/transfer", {amount: Number(transferAmount), account: Number(transferAccount)}, handleTransferResponse, props.accessToken, props.tokenExpirationHandler);
    }
  };

  function handleTransferResponse(response, error) {

    props.setRequestIsPending(false);

    if (!response) {

      let errorMsg = ERR.MSG_CONN_FAILED;

      if(error === ERR.INVALID_TYPE) {
        errorMsg = "Invalid account ID.\nTransfer failed.";
      }
      else if(error === ERR.ID_NOT_FOUND) {
        errorMsg = "Account does not exist.\nTransfer failed.";
      }
      else if(error === ERR.INSUFFICIENT_BALANCE) {
        errorMsg = "Insufficient balance.\nTransfer failed.";
      }

      props.showMsg(errorMsg);
      return;
    }

    props.setBalance(response.balance);
    setTransferAmount("");
    setTransferAccount("");
    props.showMsg("Transfer successfull!");
  };

  return (
    <div className="depositCont">
      <div className="transferSubCont">
        <div className="depositSubSubCont">
          Hello {props.name}, let's transfer some money from your account.
        </div>
        <div className="depositSubSubCont">
          Transfer destination account ID:
          <input
            className="rightMargin20px width100px leftMargin10px"
            value={transferAccount}
            onChange={ev => handleTransfer(ID.INP_TRANSFER_ID, ev)}
            type="text"
            placeholder="Account ID"
          />
        </div>
        <div className="depositSubSubCont">
          Amount to be transfered:
          <input
            className="rightMargin20px width100px leftMargin10px"
            value={transferAmount}
            onChange={ev => handleTransfer(ID.INP_TRANSFER_SUM, ev)}
            type="text"
            placeholder="Amount"
            maxLength="6"
          />
          <button
            type="button"
            className="button"
            onClick={ev => handleTransfer(ID.BTN_TRANSFER, ev)}>
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
}
