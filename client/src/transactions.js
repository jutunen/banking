import React, {useState, useEffect} from "react";
import "./App.css";
import axios from 'axios';
import * as ERR from "./errors.js";
import { urlPrefix, timeout } from "./restful-io.js";

const tr_types = ['','withdrawal','deposit','transfer'];

function convertDate(date) {
  let split = date.split('/')
  return split[1] + '.' + split[0] + '.' + split[2];
}

function TransactionTableRow(props) {
  let d = new Date(props.data.date);
  let type = tr_types[props.data.type];
  let account = "";
  if(props.data.type === 3) {
    if(props.data.from === props.id) {
      type = "transfer-out";
      account = props.data.to;
    } else {
      type = "transfer-in";
      account = props.data.from;
    }
  }

  return (
    <tr>
      <td>{d.getDate() + '.' + (d.getMonth() + 1 ) + '.' + d.getFullYear()}</td>
      <td>{type}</td>
      <td>{props.data.amount}</td>
      <td>{account}</td>
    </tr>
  )
}

function TransactionTable(props) {
  return (
    <table id="transactions">
      <tbody>
        <tr>
          <th>Date</th>
          <th>Transaction</th>
          <th>Amount</th>
          <th>Account ID</th>
        </tr>
        {props.data.map(x => {
          return (
            <TransactionTableRow
              id={props.id}
              data={x}
              key={x.date}>
            </TransactionTableRow>
          )
        })}
      </tbody>
    </table>
  )
}

function RightArrow() {
  return (
    <svg className="arrow" height="15" width="25">
      <path d="M0 7.5 L0 7.5 L0 0 L25 7.5 L0 15 L0 7.5 L0 7.5 Z" fill="gray" />
    </svg>
  );
}

function LeftArrow() {
  return (
    <svg className="arrow" height="15" width="25">
      <path d="M0 7.5 L0 7.5 L0 0 L25 7.5 L0 15 L0 7.5 L0 7.5 Z" fill="gray" transform="rotate(180,12.5,7.5)" />
    </svg>
  );
}

function SelectTableControl(props) {

  const pageCount = Math.ceil(props.count / props.limit);

  useEffect(() => {
    props.setSkip((props.page - 1) * props.limit );
  }, [props.page]);

  return (
    <div>
    <select id="selectTableControl" value={props.page} onChange={ev => {props.setPage(Number(ev.target.value))} }>
      {Array(pageCount).fill(1).map( (el, i) => <option key={i} value={i+1}>{i+1}</option> )}
    </select>
    </div>
  )
}

function ArrowsTableControl(props) {

  const prevPage = () => {
        if(props.page > 1) {
          props.setPage(props.page - 1);
        }
      }

  const nextPage = () => {
        if(props.page < pageCount) {
          props.setPage(props.page + 1);
        }
      }

  const pageCount = Math.ceil(props.count / props.limit);

  useEffect(() => {
    props.setSkip((props.page - 1) * props.limit );
  }, [props.page]);

  return (
    <div id="tableControl">
      <div tabIndex="0" className="arrowContainer" onClick={prevPage} onKeyPress={prevPage}>
        <LeftArrow/>
      </div>
      <div id="count">
        {props.page} / {pageCount}
      </div>
      <div tabIndex="0" className="arrowContainer" onClick={nextPage} onKeyPress={nextPage}>
        <RightArrow/>
      </div>
    </div>
  )
}

export function TransactionsForm(props) {

  const [transactions, setTransactions] = useState([]);
  const [count, setCount] = useState(0);
  const [skip, setSkip] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 8; // number of rows in the table

  useEffect(() => {
    const fetchData = async () => {
      if(!props.accessToken || props.requestIsPending) {
        return;
      }
      //console.log("Fetching!");
      props.setRequestIsPending(true);
      try {
        const result = await axios.get(`${urlPrefix}user/transactions/${skip}/${limit}`,
                                        {
                                          headers: {
                                            'Authorization': `Bearer ${props.accessToken}`
                                          },
                                          timeout: timeout
                                        });
        //console.log(result);
        setCount(result.data.count);
        setTransactions(result.data.transactions);
      } catch (err) {
        //console.log(err);
        if(!err.response) {
          props.setRequestIsPending(false);
          props.showMsg(ERR.MSG_CONN_FAILED);
          return;
        }
        if(err.response.data === ERR.TRANSACTIONS_NOT_FOUND) {
          props.setRequestIsPending(false);
          props.showMsg("Couldn't find any transactions!");
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
  }, [skip]);

  useEffect(() => { document.title = "Transactions";  }, []);

  return (
    <div className="transactionsCont">
      <div id="tableControlsContainer">
        <ArrowsTableControl
          count={count}
          limit={limit}
          setSkip={setSkip}
          page={page}
          setPage={setPage}
          />
        <SelectTableControl
          count={count}
          limit={limit}
          setSkip={setSkip}
          page={page}
          setPage={setPage}
          />
      </div>
      <TransactionTable
        data={transactions}
        id={props.id}
        />
    </div>
  );
}
