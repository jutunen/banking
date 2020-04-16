import React, {useState, useEffect} from "react";
import "./App.css";
import * as ID from "./ids.js";
import * as ERR from "./errors.js";
import {isValidSum} from "./App.js";
import * as store from "./restful-io.js";

export function DepositForm(props) {

  useEffect(() => { document.title = "Deposit";  }, []);

  const [deposit,setDeposit] = useState("");

  function handleDeposit(id, event) {

    if(props.requestIsPending) {
      return;
    }

    if (id === ID.INP_DEPOSIT) {
      setDeposit(event.target.value.trim());
    } else if (id === ID.BTN_DEPOSIT) {
      if (deposit.length === 0) {
        props.showMsg("Deposit amount missing!\nAdd amount!");
        return;
      }

      if (!isValidSum(deposit)) {
        props.showMsg("Invalid deposit!\nCheck deposit!");
        return;
      }

      props.setRequestIsPending(true);
      store.sendRequest("patch", "user/deposit", { deposit: Number(deposit) }, handleDepositResponse, props.accessToken, props.tokenExpirationHandler);
    }
  };

  function handleDepositResponse(response) {

    props.setRequestIsPending(false);
    setDeposit("");

    if(!response) {
      props.showMsg(ERR.MSG_CONN_FAILED);
      return;
    }

    props.setBalance(response.balance);
    props.showMsg("Deposit successfull!");
  }

  return (

    <div className="depositCont">
      <div className="depositSubCont">
        <div className="depositSubSubCont">
          Hello {props.name}, let's deposit some money into your account.
        </div>
        <div className="depositSubSubCont">
          <input
            className="rightMargin20px"
            value={deposit}
            onChange={ev => handleDeposit(ID.INP_DEPOSIT, ev)}
            type="text"
            placeholder="Amount"
            maxLength="6"
          />
          <button
            type="button"
            className="button"
            onClick={ev => handleDeposit(ID.BTN_DEPOSIT, ev)}>
            Submit
          </button>
        </div>
      </div>
    </div>

  );
}
