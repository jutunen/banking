import React, {useState, useEffect} from "react";
import "./App.css";
import * as ID from "./ids.js";
import * as ERR from "./errors.js";
import {isValidSum} from "./App.js";
import * as store from "./restful-io.js";

export function WithdrawalForm(props) {

  useEffect(() => { document.title = "Withdraw";  }, []);

  const [withdrawal,setWithdrawal] = useState("");

  function handleWithdrawal(id, event) {

    if(props.requestIsPending) {
      return;
    }

    if (id === ID.INP_WITHDRAW) {
      setWithdrawal(event.target.value.trim());
    } else if (id === ID.BTN_WITHDRAW) {
      if (withdrawal.length === 0) {
        props.showMsg("Withdrawal amount missing!\nAdd amount!");
        return;
      }

      if (!isValidSum(withdrawal)) {
        props.showMsg("Invalid withdrawal amount!\nCheck amount!");
        return;
      }

      props.setRequestIsPending(true);
      store.sendRequest("patch", "user/withdraw", { withdrawal: Number(withdrawal) }, handleWithdrawalResponse, props.accessToken, props.tokenExpirationHandler);
    }
  };

  function handleWithdrawalResponse(response, error) {

    props.setRequestIsPending(false);

    if(!response) {
      let errorMsg = ERR.MSG_CONN_FAILED;

      if(error === ERR.INSUFFICIENT_BALANCE) {
        errorMsg = "Insufficient balance.\nWithdrawal failed.";
      }

      props.showMsg(errorMsg);
      return;
    }

    setWithdrawal("");
    props.setBalance(response.balance);
    props.showMsg("Withdrawal successfull!");
  }

  return (

    <div className="depositCont">
      <div className="depositSubCont">
        <div className="depositSubSubCont">
          Hello {props.name}, let's withdraw some money from your account.
        </div>
        <div className="depositSubSubCont">
          <input
            className="rightMargin20px"
            value={withdrawal}
            onChange={ev => handleWithdrawal(ID.INP_WITHDRAW, ev)}
            type="text"
            placeholder="Amount"
            maxLength="6"
          />
          <button
            type="button"
            className="button"
            onClick={ev => handleWithdrawal(ID.BTN_WITHDRAW, ev)}>
            Submit
          </button>
        </div>
      </div>
    </div>

  );
}
