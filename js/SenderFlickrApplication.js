function SenderFlickrApplication(userId) {
  this.userId = userId;
  this.images = new Array();
}

SenderFlickrApplication.prototype.getPhotosets = function() {
  var that = this;
  flickr.photosets.getList({
    user_id: this.userId
  }, function(error, result) {
    for(var i in result.photosets.photoset) {
      var photoset = result.photosets.photoset[i];
      that.images.push(new PhotosetHandler(that.userId, photoset));
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

  var heading = document.createElement('h1');
  heading.innerHTML = this.photoset.title._content;

  var description = document.createElement('p');
  description.innerHTML = this.photoset.description._content;

  article.appendChild(heading);
  article.appendChild(description);

  document.getElementById('flickr-container').appendChild(article);
}
