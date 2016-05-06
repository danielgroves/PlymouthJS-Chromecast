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
