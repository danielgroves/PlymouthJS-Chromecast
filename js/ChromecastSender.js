window.Chromesender = function(appId) {
  'use strict';

  function castSessionListener() {
    console.debug("Cast session listener called.");
  }

  function castReceiverListener(event) {
    console.debug("Cast receiver listener called.")

    if (event != chrome.cast.ReceiverAvailability.AVAILABLE) {
      console.error("No chromecast devices available. ");
      return;
    }

    chrome.cast.requestSession(requestSessionEstablished, requestSessionError);
  }

  function requestSessionEstablished(session) {
    console.log("Request session established called.");
    console.debug(session);

    // Handle messages and shizzle here
  }

  function requestSessionError(error) {
    console.error("Initialisation error called. ");
    console.error(error);
  }

  function initialisationSuccess() {
    console.log("Initialisation success called. ");
  }

  function initialisationError(error) {
    console.error("Initialisation error called. ");
    console.error(error);
  }

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
