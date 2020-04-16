import React, {useState, useEffect, useRef} from "react";
import "./App.css";
import * as ID from "./ids.js";
import * as store from "./restful-io.js";
import * as ERR from "./errors.js";
import {
  MenuBar,
  Heading,
  ProgressIndicator,
  Modal,
  Footer
} from "./components.js";
import {LoginForm} from "./login.js";
import {RegForm} from "./register.js";
import {DepositForm} from "./deposit.js";
import {WithdrawalForm} from "./withdraw.js";
import {TransferForm} from "./transfer.js";
import {TransactionsForm} from "./transactions.js";
import {useTransition, animated} from 'react-spring'

function App() {
  const [loginId,setLoginId] = useState("");
  const [view,setView] = useState(ID.VIEW_AUTH);
  const [balance,setBalance] = useState("");
  const [showModal,setShowModal] = useState(false);
  const [requestIsPending,setRequestIsPending] = useState(false);
  const [userName,setUserName] = useState("");
  const [modalText,setModalText] = useState("");
  const [accessToken,_setAccessToken] = useState("");

  const accessTokenRef = useRef(accessToken);

  const setAccessToken = state => {
    accessTokenRef.current = state;
    _setAccessToken(state);
  };

  useEffect(() => {
    // subscribe to hash changes
    window.location.hash = ID.VIEW_AUTH;
    window.addEventListener("hashchange", router);
    return () => window.removeEventListener("hashchange", router);
  },[]);

  useEffect(() => {
    // subscribe to hash changes
    window.addEventListener("popstate", poplistener);
    return () => window.removeEventListener("popstate", poplistener);
  });

  function poplistener(event) {
    //console.log("poplistener: ");
    console.log(event);
  }

  // HOX! setView must be called from within router only!
  // Outside router the view is changed by assigning it to window.location.hash
  // Assigning to window.location.hash will trigger hashchange event,
  // which will be handled by router function
  // PROBLEEMA: joskus harvoin ilmeisesti eventListener on poistettu useEffectin toimesta
  // niin että hashchange eventti jää kuulematta ja router kutsumatta, selaimen urli
  // päivittyy kyllä
  function router() {
    console.log("view on hashchange: " + view);
    console.log("The hash changed, new hash: " + window.location.hash);
    //console.log("window.location.pathname: " + window.location.pathname);

    const newView = window.location.hash.replace(/^#/, "");

    if(ID.VIEWS.includes(newView) && newView !== ID.VIEW_AUTH && newView !== ID.VIEW_REGIST) {
      if(accessTokenRef.current) {
        console.log("accessToken is valid!");
        /*if(requestIsPending) {
          return; //
        }*/
        setView(newView);
      } else {
        resetInputs();
        console.log("accessToken is invalid!");
        window.location.hash = ID.VIEW_AUTH;
        showMsg("You must login to proceed!");
      }
    } else if (newView === ID.VIEW_AUTH || newView === ID.VIEW_REGIST) {
      resetInputs();
      console.log("setting accessToken invalid!");
      setAccessToken("");
      setView(newView);
    } else {
      //window.location.hash = view; //view not visible unless ref is used
      //if url hash is not valid, go back to previous hash:
      window.history.back();
    }
  }

  function handleBalanceResponse(response, error) {

    setRequestIsPending(false);

    if(!response) {
      let errorMsg = ERR.MSG_CONN_FAILED;

      if(error === ERR.INVALID_PASSWORD) {
        errorMsg = "Wrong password.\nPlease check your password.";
      } else if( error === ERR.INVALID_ID) {
        errorMsg = "Login failed.\nPlease check your id.";
      }

      showMsg(errorMsg);
      return;
    }

    console.log("setting window.location.hash to deposit:");
    window.location.hash = ID.VIEW_DEPOSIT;
    setBalance(response.balance);
    setUserName(response.name);
    setLoginId(response.id);
  }

  function initiateBalanceReq(token) {
    store.sendRequest("get", "user/balance", null, handleBalanceResponse, token, tokenExpirationHandler);
    setRequestIsPending(true);
  }

  function resetInputs() {
    setBalance("");
    setUserName("");
    setLoginId("");
  }

  function handleMenuInput(id, event) {

    if (id === ID.BTN_MENU_EXIT) {
      resetInputs();
      setAccessToken("");
      window.location.hash = ID.VIEW_AUTH;
    }
  };

  function showMsg(msg) {
    setModalText(msg);
    setShowModal(true);
  };

  function tokenExpirationHandler(msg) {
    setRequestIsPending(false);
    resetInputs();
    setAccessToken("");
    window.location.hash = ID.VIEW_AUTH;
    if(!msg) {
      msg = "Your session expired!\nYou must login to proceed!\nWe're sorry!"
    }
    showMsg(msg);
  }

  function menuBarFunction(viewParam) {
    return (
      <MenuBar
        view={viewParam}
        balance={balance}
        callback={handleMenuInput}
        requestIsPending={requestIsPending}
      />
    )
  }

  const depositForm = () => {
    return (
      <div className="appCont" style={{ flexDirection:"column"}}>
        {menuBarFunction(view)}
        <DepositForm
          accessToken={accessToken}
          name={userName}
          showMsg={showMsg}
          setRequestIsPending={setRequestIsPending}
          tokenExpirationHandler={tokenExpirationHandler}
          setBalance={setBalance}
        />
        <Footer id={loginId} />
      </div>
    )
  }

  const withdrawalForm = () => {
    return (
      <div className="appCont" style={{ flexDirection:"column"}}>
        {menuBarFunction(view)}
        <WithdrawalForm
          accessToken={accessToken}
          name={userName}
          showMsg={showMsg}
          setRequestIsPending={setRequestIsPending}
          tokenExpirationHandler={tokenExpirationHandler}
          setBalance={setBalance}
        />
        <Footer id={loginId} />
      </div>
    )
  }

  const transferForm = () => {
    return (
      <div className="appCont" style={{ flexDirection:"column"}}>
        {menuBarFunction(view)}
        <TransferForm
          accessToken={accessToken}
          name={userName}
          showMsg={showMsg}
          setRequestIsPending={setRequestIsPending}
          tokenExpirationHandler={tokenExpirationHandler}
          setBalance={setBalance}
          loginId={loginId}
        />
        <Footer id={loginId} />
      </div>
    )
  }

  const transactionsForm = () => {
    return (
      <div className="appCont" style={{ flexDirection:"column"}}>
        {menuBarFunction(view)}
        <TransactionsForm
          id={loginId}
          name={userName}
          setRequestIsPending={setRequestIsPending}
          requestIsPending={requestIsPending}
          accessToken={accessToken}
          tokenExpirationHandler={tokenExpirationHandler}
          showMsg={showMsg}
        />
        <Footer id={loginId} />
      </div>
    )
  }

  const loginForm = () => {
    return (
      <div className="appCont" style={{ flexDirection:"row"}}>
        <LoginForm
          showMsg={showMsg}
          requestIsPending={requestIsPending}
          setRequestIsPending={setRequestIsPending}
          setAccessToken={setAccessToken}
          loginId={loginId}
          setLoginId={setLoginId}
          initiateBalanceReq={initiateBalanceReq}
        />
      </div>
    )
  }

  const registerForm = () => {
    return (
      <div className="appCont" style={{ flexDirection:"row"}}>
        <RegForm
          showMsg={showMsg}
          requestIsPending={requestIsPending}
          setRequestIsPending={setRequestIsPending}
          initiateBalanceReq={initiateBalanceReq}
          setAccessToken={setAccessToken}
        />
      </div>
    )
  }

  function returnForm(_view) {
    if(_view === ID.VIEW_DEPOSIT) {
      return depositForm;
    } else if( _view === ID.VIEW_WITHDRAW) {
      return withdrawalForm;
    } else if( _view === ID.VIEW_TRANSFER ) {
      return transferForm;
    } else if( _view === ID.VIEW_TRANSACTIONS ) {
      return transactionsForm;
    } else if( _view === ID.VIEW_REGIST ) {
      return registerForm;
    } else {
      return loginForm;
    }
  }

  //const transitions = useTransition(location, location => location, { from: { position:'absolute', opacity: 0, transform: 'translateX(100%)' }, enter: { opacity: 1, transform: 'translateX(0%)' }, leave: { opacity: 0, transform: 'translateX(-100%)' } });
  const transitions = useTransition(view, view => view, { from: { position:'absolute', opacity: 0 }, enter: { opacity: 1 }, leave: { opacity: 0 } });

  return (

    <div className="mainCont">
      {transitions.map(({ item, props, key }) => (
        <animated.div key={key} style={props}>
          <Heading />
          {returnForm(item)()}
        </animated.div>))}
        <Modal
          show={showModal}
          modalText={modalText}
          closeCb={() => setShowModal(false)}
        >
        </Modal>
      <ProgressIndicator
          visible={requestIsPending}
        />
    </div>
  );

}

export function isValidSum(sum) {
  sum = Number(sum);
  if (isNaN(sum) || sum <= 0) {
    return false;
  }
  return true;
}

export default App;
