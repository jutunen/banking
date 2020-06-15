
import * as ERR from "./errors.js";
import axios from 'axios';

export const urlPrefix = 'https://jussin.site/bankkiapi/';
//export const urlPrefix = 'http://localhost:5000/';
export const timeout = 6000 // milliseconds

export function sendRequest(method, urlEnding, data, respHandler, token, tokenExpirationHandler) {

  axios({
    method: method,
    url: urlPrefix + urlEnding,
    data: data,
    headers: token ? { 'Authorization': `Bearer ${token}` } : null,
    timeout: timeout
  })
  .then(function (response) {
    respHandler(response.data);
  })
  .catch(function (error) {
    if(error.response) {
      if(error.response.data === ERR.TOKEN_EXPIRED) {
        tokenExpirationHandler();
      } else {
        respHandler(null, error.response.data);
      }
    } else {
      respHandler();
    }
  });
}
