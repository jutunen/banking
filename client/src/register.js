import React, {useState, useEffect} from "react";
import "./App.css";
import * as ID from "./ids.js";
import * as ERR from "./errors.js";
import base64url from "base64url";
import * as store from "./restful-io.js";
import {loremIpsum} from "./login.js";
import ReCAPTCHA from "react-google-recaptcha";

export function RegForm(props) {

  useEffect(() => { document.title = "Lorem Ipsum Banking";  }, []);

  const [regName,setRegName] = useState("");
  const [regPasswd,setRegPasswd] = useState("");
  const [regInitDeposit,setRegInitDeposit] = useState("");

  const recaptchaRef = React.useRef(null);

  function handleRegInput(id, event) {

    if(props.requestIsPending) {
      return;
    }

    if(id === ID.BTN_REG_BACK) {
      window.location.hash = ID.VIEW_AUTH;
    } else if (id === ID.INP_REG_NAME) {
      setRegName(event.target.value);
    } else if (id === ID.INP_REG_PASSWD) {
      setRegPasswd(event.target.value);
    } else if (id === ID.INP_REG_DEPOSIT) {
      setRegInitDeposit(event.target.value.trim());
    }
  };

  function initiateNewUserRegistration(token) {

    if (regName.length === 0) {
      props.showMsg("Name is missing!\nAdd name!");
      recaptchaRef.current.reset();
      return;
    }

    if (regPasswd.length === 0) {
      props.showMsg("Password is missing!\nAdd password!");
      recaptchaRef.current.reset();
      return;
    }

    if (regInitDeposit.length > 0) {
      if (isNaN(Number(regInitDeposit))) {
        props.showMsg("Invalid deposit!\nCheck deposit!");
        recaptchaRef.current.reset();
        return;
      }
    }

    const data = { name:regName,
                   deposit:regInitDeposit.length > 0 ? Number(regInitDeposit) : 0,
                   passwd:regPasswd,
                   token };

    store.sendRequest("post", "user", data, handleNewUserRegistrationResponse);
    recaptchaRef.current.reset();
    props.setRequestIsPending(true);
  }

  function handleNewUserRegistrationResponse(response) {

    props.setRequestIsPending(false);

    setRegName("");
    setRegPasswd("");
    setRegInitDeposit("");

    if(!response) {
      props.showMsg(ERR.MSG_CONN_FAILED);
      return;
    }

    props.setAccessToken(response.accessToken);

    let tokenPayload = base64url.decode(response.accessToken.split(".")[1]);
    tokenPayload = JSON.parse(tokenPayload);

    props.showMsg(
      "Registration successfull!\nRemember your new account ID: " + tokenPayload.username
    );

    props.initiateBalanceReq(response.accessToken);
  }

  return (
    <>
      {loremIpsum()}
      <form className="authCont" onSubmit={(e) => { e.preventDefault(); recaptchaRef.current.execute(); }}>
        <ReCAPTCHA
          ref={recaptchaRef}
          size="invisible"
          sitekey="add_site_key_here"
          onChange={initiateNewUserRegistration}
        />
        <div className="authFormCont">
          <div>Registration</div>
          <input
            value={regName}
            type="text"
            className="width160px"
            placeholder="Full name"
            onChange={ev => handleRegInput(ID.INP_REG_NAME, ev)}
          />
          <input
            value={regPasswd}
            type="password"
            className="width160px"
            placeholder="Password"
            onChange={ev => handleRegInput(ID.INP_REG_PASSWD, ev)}
          />
          <input
            value={regInitDeposit}
            type="text"
            className="width160px"
            placeholder="Initial cash deposit"
            onChange={ev => handleRegInput(ID.INP_REG_DEPOSIT, ev)}
            maxLength="6"
          />
        </div>
        <div className="buttonsCont">
          <input className="button" type="submit" value="Register" />
          <button
            type="button"
            className="button"
            onClick={ev => handleRegInput(ID.BTN_REG_BACK, ev)}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
