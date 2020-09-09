import React from "react";
import "./App.css";
import * as ID from "./ids.js";
import { Spinner } from 'react-spinners-css';
import {animated, useTransition} from 'react-spring';

export function Modal(params) {

  const transitions = useTransition(params.show, null, {
  from: { opacity: 0, transform: 'scale(0.9)' },
  enter: { opacity: 1, transform: 'scale(1)' },
  leave: { opacity: 0, transform: 'scale(0.9)' },
  config: { duration: 100 }
  });

  return transitions.map(({ item, key, props }) =>
    item &&
      <animated.div key={key} style={props} className="modalBackground" onClick={ params.closeCb }>
        <div className="modal" onClick={ ev => ev.stopPropagation() }>
          <p> {params.modalText} </p>
          <button className="button" type="button" onClick={ params.closeCb }> Close </button>
        </div>
      </animated.div>
  )
}

export function MenuBar(props) {

  return (
    <div className="menuCont">
      <button
        disabled={props.requestIsPending}
        type="button"
        onClick={() => window.location.hash = ID.VIEW_DEPOSIT }
        className={
          props.view === ID.VIEW_DEPOSIT ? "selectedButton" : "button"
        }>
        Deposit
      </button>
      <button
        disabled={props.requestIsPending}
        type="button"
        onClick={() => window.location.hash = ID.VIEW_WITHDRAW }
        className={
          props.view === ID.VIEW_WITHDRAW ? "selectedButton" : "button"
        }>
        Withdraw
      </button>
      <button
        disabled={props.requestIsPending}
        type="button"
        onClick={() => window.location.hash = ID.VIEW_TRANSFER }
        className={
          props.view === ID.VIEW_TRANSFER ? "selectedButton" : "button"
        }>
        Transfer
      </button>
      <button
        disabled={props.requestIsPending}
        type="button"
        onClick={() => window.location.hash = ID.VIEW_TRANSACTIONS }
        className={
          props.view === ID.VIEW_TRANSACTIONS ? "selectedButton" : "button"
        }>
        Transactions
      </button>
      <div className="balance">
        Balance: {props.balance}
      </div>
      <button
        type="button"
        className="button"
        onClick={ev => props.callback(ID.BTN_MENU_EXIT, ev)}>
        Logout
      </button>
    </div>
  );
}

export function Heading(props) {
  return <div className="heading">Lorem Ipsum Banking</div>;
}

export function Footer(props) {
  return <div className="footer">You're logged in with login ID {props.id}. Your account ID is {props.account}</div>;
}

export function ProgressIndicator(props) {
  if (!props.visible) {
    return null;
  }

  return (
    <div style={{position:"absolute"}}>
      <Spinner />
    </div>
  );
}
