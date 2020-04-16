import React, {useState, useEffect} from "react";
import "./App.css";
import * as ID from "./ids.js";
import * as store from "./restful-io.js";
import * as ERR from "./errors.js";

export function loremIpsum() {
  return (
    <div className="loremCont">
      Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Sed posuere
      interdum sem. Quisque ligula eros ullamcorper quis, lacinia quis
      facilisis sed sapien. Mauris varius diam vitae arcu. Sed arcu lectus
      auctor vitae, consectetuer et venenatis eget velit.
    </div>
  )
}

export function LoginForm(props) {

  useEffect(() => { document.title = "Lorem Ipsum Banking";  }, []);

  const [loginPasswd,setLoginPasswd] = useState("");

  function handleLoginInput(id, event) {

    if(props.requestIsPending) {
      return;
    }

    if (id === ID.BTN_AUTH_REG) {
      window.location.hash = ID.VIEW_REGIST;
    } else if (id === ID.INP_AUTH_UID) {
      props.setLoginId(Number(event.target.value.trim()));
    } else if (id === ID.INP_AUTH_PASSWD) {
      setLoginPasswd(event.target.value);
    } else if (id === ID.BTN_AUTH_ENTER) {
      initiateLogin();
    }
  };

  function initiateLogin() {
    if (props.loginId.length === 0) {
      props.showMsg("Account ID is missing!\nAdd ID!");
      setLoginPasswd("");
      return;
    }

    if (isNaN(props.loginId)) {
      props.showMsg("Account ID must be number!");
      setLoginPasswd("");
      return;
    }

    if (loginPasswd.length === 0) {
      props.showMsg("Password is missing!\nAdd password!");
      return;
    }

    store.sendRequest("post", "auth", {id: props.loginId, passwd: loginPasswd}, handleLoginResponse);
    props.setRequestIsPending(true);
  }

  function handleLoginResponse(response, error) {

    props.setRequestIsPending(false);

    if(!response) {
      let errorMsg = ERR.MSG_CONN_FAILED;

      if(error === ERR.INVALID_PASSWORD) {
        errorMsg = "Wrong password.\nPlease check your password.";
      } else if( error === ERR.ID_NOT_FOUND) {
        errorMsg = "Login failed.\nPlease check your ID.";
      }

      setLoginPasswd("");
      props.showMsg(errorMsg);
      return;
    }

    props.setAccessToken(response.accessToken);
    props.initiateBalanceReq(response.accessToken);
  }

  return (
    <>
      {loremIpsum()}
      <div className="authCont">
        <div className="authFormCont">
          <div>Login</div>
          <input
            type="text"
            className="width160px"
            placeholder="Account ID"
            name="uid"
            onChange={ev => handleLoginInput(ID.INP_AUTH_UID, ev)}
          />
          <input
            type="password"
            className="width160px"
            placeholder="Password"
            name="pwd"
            value={loginPasswd}
            onChange={ev => handleLoginInput(ID.INP_AUTH_PASSWD, ev)}
          />
        </div>
        <div className="buttonsCont">
          <button
            type="button"
            className="button"
            name="login"
            onClick={ev => handleLoginInput(ID.BTN_AUTH_ENTER, ev)}>
            Login
          </button>
          <button
            type="button"
            className="button"
            onClick={ev => handleLoginInput(ID.BTN_AUTH_REG, ev)}>
            Register
          </button>
        </div>
      </div>
    </>
  );
}
