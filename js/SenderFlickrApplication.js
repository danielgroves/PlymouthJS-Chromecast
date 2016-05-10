/**
 * Applies event listeners to a array of html elements.
 * @param {Array} elements - An array of HTML elements to apply the event listener to. Normally to result of a call
 * to `document.querySelectorAll`
 * @param {string} eventName - The name of the event to listen to.
 * @param {function} callback - The function to call when the event is fired.
 */
function addEventListenerToElements(elements, eventName, callback) {
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener(eventName, callback);
  }
}

//
// Everything below this point is about generating HTML based on the result from the Flickr API.
//
// I will not document here on down as it is not Chromecast specific, but general javascript making use of the Flickr
// node API wrapper.
//

function SenderFlickrApplication(userId) {
  this.userId = userId;
}

SenderFlickrApplication.prototype.getPhotosets = function(callback) {
  var that = this;
  flickr.photosets.getList({
    user_id: this.userId
  }, function(error, result) {
    document.getElementById('flickr-container').innerHTML = '';
    var photosets = result.photosets.photoset;

    for (var i = 0; i < photosets.length; i++) {
      var photoset = photosets[i];

      if ((photosets.length - 1) === i && typeof callback === 'function') {
        new PhotosetHandler(that.userId, photoset, callback);
      } else {
        new PhotosetHandler(that.userId, photoset);
      }
    }
  });
}

SenderFlickrApplication.prototype.getAlbumThumbs = function(album_id, callback) {
  var that = this;
  flickr.photosets.getPhotos({
    photoset_id: album_id,
    user_id: this.userId
  }, function(error, result) {
    document.getElementById('flickr-container').innerHTML = '';
    var photos = result.photoset.photo;

    for (var i = 0; i < photos.length; i++) {
      var photoset = result.photoset.photo[i];

      if ((photos.length - 1) === i && typeof callback === 'function') {
        new PhotoThumbHandler(that.userId, photoset, callback);
      } else {
        new PhotoThumbHandler(that.userId, photoset);
      }
    }
  });
}

function PhotosetHandler(userId, photoset, callback) {
  this.userId = userId;
  this.photoset = photoset;
  this.background = null;
  this.callback = callback;

  this.getPhotos(photoset.id)
}

PhotosetHandler.prototype.getPhotos = function(photosetId) {
  var that = this;

  flickr.photosets.getPhotos({
    photoset_id: photosetId,
    user_id: that.userId
  }, function(error, result) {
    that.getPhotoSizes(result.photoset.photo[0].id);
  });
}

PhotosetHandler.prototype.getPhotoSizes = function(photoId) {
  var that = this;

  flickr.photos.getSizes({
    photo_id: photoId
  }, function(error, result) {
    that.background = result.sizes.size[9].source;
    that.injectHtml();
  });
}

PhotosetHandler.prototype.injectHtml = function() {
  var article = document.createElement('article');
  article.setAttribute('data-flickr-id', this.photoset.id);
  article.style.backgroundImage = "url(" + this.background + ")";
  article.classList.add('album');

  var heading = document.createElement('h1');
  heading.innerHTML = this.photoset.title._content;

  var description = document.createElement('p');
  description.innerHTML = this.photoset.description._content;

  article.appendChild(heading);
  article.appendChild(description);

  document.getElementById('flickr-container').appendChild(article);

  if (typeof this.callback === 'function') this.callback();
}

function PhotoThumbHandler(userId, photo, callback) {
  this.userId = userId;
  this.photo = photo;
  this.callback = callback;

  this.getPhoto(photo.id);
}

PhotoThumbHandler.prototype.getPhoto = function(photoId) {
  var that = this;
  flickr.photos.getSizes({
    photo_id: photoId
  }, function(error, result) {
    var imageUrl = result.sizes.size[4].source;

    that.injectHtml(photoId, imageUrl);
  });
}

PhotoThumbHandler.prototype.injectHtml = function(photoId, imageUrl) {
  var img = document.createElement('img');
  img.src = imageUrl;
  img.setAttribute('data-flickr-id', photoId);
  img.classList.add('thumb');

  var figure = document.createElement('figure');
  figure.appendChild(img);

  document.getElementById('flickr-container').appendChild(figure);

  if (typeof this.callback === 'function') this.callback();
}
