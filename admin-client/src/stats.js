import React, {useState, useEffect} from "react";
import "./App.css";
import axios from 'axios';
import * as ERR from "./errors.js";
import { urlPrefix, timeout } from "./restful-io.js";


export function StatsForm(props) {

  const [accounts, setAccounts] = useState(0);
  const [transactions, setTransactions] = useState(0);

  useEffect(() => { document.title = "Stats";  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if(!props.accessToken || props.requestIsPending) {
        return;
      }
      props.setRequestIsPending(true);
      try {
        const result = await axios.get(`${urlPrefix}admin/stats`,
                                        {
                                          headers: {
                                            'Authorization': `Bearer ${props.accessToken}`
                                          },
                                          timeout: timeout
                                        });
        console.log(result);
        console.log(result.data);
        setAccounts(result.data.accounts);
        setTransactions(result.data.transactions);
      } catch (err) {
        //console.log(err);
        if(!err.response) {
          props.setRequestIsPending(false);
          props.showMsg(ERR.MSG_CONN_FAILED);
          return;
        }
        if(err.response.data === ERR.TOKEN_EXPIRED) {
          //console.log("token expired!");
          props.tokenExpirationHandler();
        }
        return;
      }
      props.setRequestIsPending(false);
    };
    fetchData();
  }, []);

  return (

    <div className="transactionsCont">
      <p> Number of accounts: {accounts} </p>
      <p> Number of transactions: {transactions} </p>
    </div>

  );
}
