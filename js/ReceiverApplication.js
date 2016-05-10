//
// Everything in the document is about generating HTML based on the result from the Flickr API. 
//
// I will not document here on down as it is not Chromecast specific, but general javascript making use of the Flickr
// node API wrapper.
//

var FlickrApiWrapper = function(apiKey, userId) {
  this.apiKey = apiKey;
  this.userId = userId;

  this.flickr = new Flickr({
    api_key: this.apiKey
  });
}

FlickrApiWrapper.prototype.showAlbumMeta = function(albumId, displayCallback) {
  var that = this;

  var result = {
    title: null,
    description: null,
    imageUrl: null
  };

  this.flickr.photosets.getInfo({
    photoset_id: albumId,
    user_id: this.userId
  }, function(error, data) {
    console.info("Retrieved album " + albumId + " for user " + that.userId);
    console.debug(data);

    result.title = data.photoset.title._content;
    result.description = data.photoset.description._content;

    that.flickr.photos.getSizes({
      photo_id: data.photoset.primary
    }, function(error, data) {
      console.info("Retrieved primary image for album " + albumId + " for user " + that.userId);
      console.debug(data);

      result.imageUrl = data.sizes.size[9].source;

      if (typeof displayCallback === 'function')
        displayCallback(result)
    });
  });
}

FlickrApiWrapper.prototype.showSingleImage = function(imageId, displayCallback) {
  this.flickr.photos.getSizes({
    photo_id: imageId
  }, function(error, data) {
    console.info("Image " + imageId);
    console.debug(data);

    var imageUrl = data.sizes.size[9].source;

    if (typeof displayCallback === 'function') displayCallback(imageUrl);
  });
}
