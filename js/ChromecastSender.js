/**
 * Class for managing the cast session and passing messages backwards and
 * forewards.
 * @param {string} appId - The app id for the cast receiver application to
 * connect to.
 */
function Chromesender(appId, readyCallback) {
  'use strict';

  this.namespace = 'urn:x-cast:com.danielsgroves.plymouthjs';
  this.chromecast_session = null;

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

    chrome.cast.requestSession(requestSessionEstablished.bind(this), requestSessionError.bind(this));
  }

  /**
   * Callback called if the application successfully obtains a session.
   * @param {chrome.cast.Session} session - The session object.
   */
  function requestSessionEstablished(session) {
    console.log("Request session established called.");
    console.debug(session);

    this.chromecast_session = session;
    this.chromecast_session.addMessageListener(this.namespace, newChromecastMessage.bind(this));

    if (typeof readyCallback === 'function') readyCallback(session);
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

  function newChromecastMessage(namespace, message) {
    console.log("Message received on " + namespace + " -- " + message);
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
    var cast_configuration = new chrome.cast.ApiConfig(cast_session_request, castSessionListener.bind(this), castReceiverListener.bind(this));

    chrome.cast.initialize(cast_configuration, initialisationSuccess.bind(this), initialisationError.bind(this));
  }

  if (chrome.cast !== undefined && chrome.cast.isAvailable) {
    initialiseChromecast(true, null).bind(this);
  } else {
    window.__onGCastApiAvailable = initialiseChromecast.bind(this);
  }
};

/**
 * Sends a message to the receiver in the currently active cast session.
 * @param {Message} message - An instance of the message object.
 */
Chromesender.prototype.sendMessage = function(message) {
  function messageSuccess() { }

  function messageFailure() { }

  this.chromecast_session.sendMessage(this.namespace, message, messageSuccess, messageFailure);
}

/**
 * A message to send to the chromecast receiver.
 * @param {String} key - The unique key to determine how to interpret the message on the chromecast device.
 * @param {Object} value - Any JS object or derivative to be read on the remote end. If it is an object and not a normal
 * type such as a String, Boolean or Number is will be serialised as JSON.
 */
function Message(key, value) {
  this.key = key;
  this.value = value;
}

Message.prototype.to_json = function() {
  var message = {
    key: this.key,
    value: this.value
  }

  return message;
}
