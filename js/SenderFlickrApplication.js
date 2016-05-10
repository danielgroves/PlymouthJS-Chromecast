function addEventListenerToElements(elements, eventName, callback) {
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener(eventName, callback);
  }
}

function SenderFlickrApplication(userId) {
  this.userId = userId;
  this.images = new Array();
}

SenderFlickrApplication.prototype.getPhotosets = function() {
  var that = this;
  flickr.photosets.getList({
    user_id: this.userId
  }, function(error, result) {
    document.getElementById('flickr-container').innerHTML = '';

    for(var i in result.photosets.photoset) {
      var photoset = result.photosets.photoset[i];
      that.images.push(new PhotosetHandler(that.userId, photoset));
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

function PhotosetHandler(userId, photoset) {
  this.userId = userId;
  this.photoset = photoset;
  this.background = null;

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

  document.getElementById('flickr-container').appendChild(img);

  if (typeof this.callback === 'function') this.callback();
}
