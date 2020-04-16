import React, {useState, useEffect, useRef} from "react";
import "./App.css";
import * as ID from "./ids.js";
import {
  MenuBar,
  Heading,
  ProgressIndicator,
  Modal,
  Footer
} from "./components.js";
import {LoginForm} from "./login.js";
import {StatsForm} from "./stats.js";
import {useTransition, animated} from 'react-spring'

function App() {

  const [view,setView] = useState(ID.VIEW_AUTH);
  const [showModal,setShowModal] = useState(false);
  const [requestIsPending,setRequestIsPending] = useState(false);
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

  function router() {
    console.log("view on hashchange: " + view);
    console.log("The hash changed, new hash: " + window.location.hash);

    const newView = window.location.hash.replace(/^#/, "");

    if(ID.VIEWS.includes(newView) && newView !== ID.VIEW_AUTH) {
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
    } else if (newView === ID.VIEW_AUTH) {
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

  function resetInputs() {
    //setLoginId("");
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
        callback={handleMenuInput}
        requestIsPending={requestIsPending}
      />
    )
  }

  const statsForm = () => {
    return (
      <div className="appCont" style={{ flexDirection:"column"}}>
        {menuBarFunction(view)}
        <StatsForm
          accessToken={accessToken}
          showMsg={showMsg}
          setRequestIsPending={setRequestIsPending}
          tokenExpirationHandler={tokenExpirationHandler}
        />
        <Footer id={"admin"} />
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
        />
      </div>
    )
  }

  function returnForm(_view) {
    if(_view === ID.VIEW_STATS) {
      return statsForm;
    } else {
      return loginForm;
    }
  }

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

export default App;
