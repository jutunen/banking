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

  const [loginId,setLoginId] = useState("");
  const [loginPasswd,setLoginPasswd] = useState("");

/*
  function handleLoginInput(id, event) {

    if(props.requestIsPending) {
      return;
    }

  };
*/

  function initiateLogin() {
    if (loginId.length === 0) {
      props.showMsg("Account ID is missing!\nAdd ID!");
      setLoginPasswd("");
      return;
    }

    if (loginPasswd.length === 0) {
      props.showMsg("Password is missing!\nAdd password!");
      return;
    }

    store.sendRequest("post", "admin", {id: loginId, passwd: loginPasswd}, handleLoginResponse);
    props.setRequestIsPending(true);
  }

  function handleLoginResponse(response, error) {

    props.setRequestIsPending(false);

    if(!response) {
      let errorMsg = ERR.MSG_CONN_FAILED;

      if(error === ERR.INVALID_PASSWORD) {
        errorMsg = "Wrong password.\nPlease check your password.";
      } else if( error === ERR.INVALID_ID) {
        errorMsg = "Login failed.\nPlease check your ID.";
      }

      setLoginPasswd("");
      props.showMsg(errorMsg);
      return;
    }

    props.setAccessToken(response.accessToken);
    window.location.hash = ID.VIEW_STATS;
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
            onChange={ev => setLoginId(ev.target.value.trim())}
          />
          <input
            type="password"
            className="width160px"
            placeholder="Password"
            name="pwd"
            value={loginPasswd}
            onChange={ev => setLoginPasswd(ev.target.value)}
          />
        </div>
        <div className="buttonsCont">
          <button
            type="button"
            className="button"
            name="login"
            onClick={ev => initiateLogin()}>
            Login
          </button>
        </div>
      </div>
    </>
  );
}
