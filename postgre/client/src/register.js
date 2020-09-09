import React, {useState, useEffect} from "react";
import "./App.css";
import * as ID from "./ids.js";
import * as ERR from "./errors.js";
import base64url from "base64url";
import * as store from "./restful-io.js";
import {loremIpsum} from "./login.js";

export function RegForm(props) {

  useEffect(() => { document.title = "Lorem Ipsum Banking";  }, []);

  const [regName,setRegName] = useState("");
  const [regPasswd,setRegPasswd] = useState("");

  function handleRegInput(id, event) {

    if(props.requestIsPending) {
      return;
    }

    if(id === ID.BTN_REG_BACK) {
      window.location.hash = ID.VIEW_AUTH;
    } else if (id === ID.BTN_REG_REG) {
      initiateNewUserRegistration();
    } else if (id === ID.INP_REG_NAME) {
      setRegName(event.target.value);
    } else if (id === ID.INP_REG_PASSWD) {
      setRegPasswd(event.target.value);
    }
  };

  function initiateNewUserRegistration() {

    if (regName.length === 0) {
      props.showMsg("Name is missing!\nAdd name!");
      return;
    }

    if (regPasswd.length === 0) {
      props.showMsg("Password is missing!\nAdd password!");
      return;
    }

    store.sendRequest("post", "user/user", {name:regName, passwd:regPasswd}, handleNewUserRegistrationResponse);
    props.setRequestIsPending(true);
  }

  function handleNewUserRegistrationResponse(response) {

    console.log("handleNewUserRegistrationResponse");
    console.log(response);

    props.setRequestIsPending(false);

    setRegName("");
    setRegPasswd("");

    if(!response) {
      props.showMsg(ERR.MSG_CONN_FAILED);
      return;
    }

    props.setAccessToken(response.accessToken);

    let tokenPayload = base64url.decode(response.accessToken.split(".")[1]);
    tokenPayload = JSON.parse(tokenPayload);

    props.setLoginId(tokenPayload.username);

    props.showMsg(
      "Registration successfull!\nRemember your new user ID: " + tokenPayload.username
    );

    props.initiateCreateAccountReq(response.accessToken);
  }

  return (
    <>
      {loremIpsum()}
      <div className="authCont">
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
        </div>
        <div className="buttonsCont">
          <button
            type="button"
            className="button"
            onClick={ev => handleRegInput(ID.BTN_REG_REG, ev)}>
            Register
          </button>
          <button
            type="button"
            className="button"
            onClick={ev => handleRegInput(ID.BTN_REG_BACK, ev)}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
