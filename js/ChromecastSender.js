/**
 * Class for managing the cast session and passing messages backwards and
 * forewards.
 * @param {string} appId - The app id for the cast receiver application to
 * connect to.
 */
window.Chromesender = function(appId) {
  'use strict';

  /**
   * This callback is used to notify the sender application of an existing
   * cast session that is available to join.
   * @param {chrome.cast.Session} session - The existing session that is
   * available.
   */
  function castSessionListener(session) {
    console.log("castSessionListener called.");
    console.log(session);
  }

  /**
   * Callback for when the cast SDK has checked for available cast devices that
   * are authorised to support your app ID.
   * @param {chrome.cast.ReceiverAvailability} - Dictates if compatible
   * receivers are currently available.
   */
  function castReceiverListener(ready) {
    console.debug("Cast receiver listener called.")

    if (ready != chrome.cast.ReceiverAvailability.AVAILABLE) {
      console.error("No chromecast devices available. ");
      return;
    }

    chrome.cast.requestSession(requestSessionEstablished, requestSessionError);
  }

  /**
   * Callback called if the application successfully obtains a session.
   * @param {chrome.cast.Session} session - The session object.
   */
  function requestSessionEstablished(session) {
    console.log("Request session established called.");
    console.debug(session);

    // Handle messages and shizzle here
  }

  /**
   * Callback called if the application fails to obtain a cast session.
   * @param {chrome.cast.Error} error - The Cast SDK error state.
   */
  function requestSessionError(error) {
    console.error("Initialisation error called. ");
    console.error(error);
  }

  /**
   * Callback called when the SDK has been successfully initialised by calling
   * `chrome.cast.initialize`.
   */
  function initialisationSuccess() {
    console.log("Initialisation success called. ");
  }

  /**
   * Callback called if the SDK has errored while initialising after calling
   * `chrome.cast.initialize`.
   * @param {chrome.cast.Error} error - The error state of the Cast SDK.
   */
  function initialisationError(error) {
    console.error("Initialisation error called. ");
    console.error(error);
  }

  /**
   * Inialises the Chromecast SDK and requests a new cast session.
   * @param {bool} loaded - Has the SDK finished initialising?
   * @param {object} error - Error object describing what has blocked the SDK
   * from loading successfully.
   */
  function initialiseChromecast(loaded, error) {
    if (!loaded) {
      console.error(error);
    }

    var cast_session_request = new chrome.cast.SessionRequest(appId);
    var cast_configuration = new chrome.cast.ApiConfig(cast_session_request, castSessionListener, castReceiverListener);

    chrome.cast.initialize(cast_configuration, initialisationSuccess, initialisationError);
  }

  if (chrome.cast !== undefined && chrome.cast.isAvailable) {
    initialiseChromecast(true, null);
  } else {
    window.__onGCastApiAvailable = initialiseChromecast;
  }
};
