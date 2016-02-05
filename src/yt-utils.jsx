"use strict";
import moment from 'moment';

function requestPlaylistId() {
  // See https://developers.google.com/youtube/v3/docs/channels/list
  var request = gapi.client.youtube.channels.list({
    mine: true,
    part: 'contentDetails'
  });

  return new Promise(function(resolve, reject) {
    request.execute(function(res) {
      resolve(res.result.items[0].contentDetails.relatedPlaylists.uploads);
    });
  });
}

async function requestDefaultChannel() {

  try {
    var request = gapi.client.youtube.channels.list({
      forUsername: 'Google',
      part: 'contentDetails'
    });

    var response = await request;
    console.log('requestDefaultChannel', response);
    if(response.result.items.length > 0) {
      return response.result.items[0].contentDetails.relatedPlaylists;
    }
  }
  catch(e) {
    throw e;
  }
}

async function revokeToken() {
  console.log("Trying to revoke token");
  window.fetch(' https://accounts.google.com/o/oauth2/revoke?token=' + gapi.auth.getToken().access_token)
  .then(x => console.log(x));
}
async function requestSinglePage(playlistId, pageToken) {
  var requestOptions = {
    playlistId: playlistId,
    part: 'snippet',
    maxResults: 20
  };
  if (pageToken) {
    requestOptions.pageToken = pageToken;
  }

  var request = gapi.client.youtube.playlistItems.list(requestOptions);
  var response = await request;
  return [response.result.nextPageToken, response.result.items];
}

function combineWithDetails(vid, detail) {
  var result = {};

  result.id = vid.id;
  result.title = vid.snippet.title;
  result.playlistId = vid.snippet.playlistId;
  result.resourceId = vid.snippet.resourceId;

  // Posible deleted video
  if(!vid.snippet.thumbnails) {
    return result;
  }
  result.snippetUrl = vid.snippet.thumbnails.default.url;
  result = Object.assign(result, detail);

  if(!result.extras) return result;
  result.channelTitle = result.extras.channelTitle? result.extras.channelTitle : '';
  result.durationSecs = result.extras.durationSecs;

  return result;
}

async function requestRelatedPlaylists() {
  // See https://developers.google.com/youtube/v3/docs/channels/list

  try {
    var request = gapi.client.youtube.channels.list({
      mine: true,
      part: 'snippet,contentDetails' //'contentDetails'
    });

    var response = await request;
    console.log('requestRelatedPlaylists=', response);
    if(response.result.items.length > 0) {
      return response.result.items[0].contentDetails.relatedPlaylists;
    }
  }
  catch(e) {
    throw e;
  }
}

async function requestWatchLaterId() {

  var request = gapi.client.youtube.channels.list({
    mine: true,
    part: 'snippet,contentDetails' //'contentDetails'
  });

  var response = await request;
  console.log('requestWatchLaterId=', response);

  if(response.result.items.length > 0) {
    return response.result.items[0].contentDetails.relatedPlaylists.watchLater;
  }

  throw "The user has no watchlater playlist, try with another account";
}

async function collectAllPagesCR() {
  var plVideos = [], nextPage, page = [];
  var watchlaterId = await requestWatchLaterId();
  do {
    [nextPage, page] = await requestSinglePage(watchlaterId, nextPage);
    var vidIds = page.map(v => v.snippet.resourceId.videoId);
    var vidsDetails = await videoDetails(vidIds);
    plVideos = plVideos.concat(page.map((v,i) => combineWithDetails(v, vidsDetails[i])));
  } while(nextPage);


  return plVideos;
}

async function savePlaylistItem(plItem, position) {
  console.log(`${position}: ${plItem.title}`);
  console.log(plItem);
  var requestOptions = {
    id: plItem.id,
    part: 'snippet',
    snippet: {
      playlistId: plItem.playlistId,
      resourceId: plItem.resourceId,
      position
    }
  };

  console.log("requestOptions", requestOptions);
  var request = gapi.client.youtube.playlistItems.update(requestOptions);

  var res = await request;
  return res;
}

async function savePlaylist(plItems) {
  console.log("yt-savePlaylist");

  for(let i = 0; i < plItems.length; i++) {
    let pli = plItems[i];
    var r = await savePlaylistItem(pli, i);

    // Update the current object with the new position
    pli.position = i;
  }

  return 0;
}

async function removePlaylistItem(plItem) {

  console.log(plItem, plItem.id);
  var requestOptions = {
    id: plItem.id
  };

  var request = gapi.client.youtube.playlistItems.delete(requestOptions);
  var res = await request;

  return res;
}

async function removeVideos(plItems) {
  console.log("yt-removeVideos");
  for(let i = 0; i < plItems.length; i++) {
    let pli = plItems[i];

    await removePlaylistItem(pli);
  }

  return 0;
}

async function videoDetails(...vidIds) {
  // TODO: use the topicDetails info for something
  var requestOptions = {
      id: vidIds.join(','),
      part: 'snippet,contentDetails,statistics,topicDetails',
      maxResults: 20
    };

  // duration: result.items[0].contentDetails
  // likeCount: result.items[0].statistics
  var request = gapi.client.youtube.videos.list(requestOptions);
  var response = await request;
  // console.log(response);
  let result = response.result.items.map((v, i) => {
    let videoId = v.id;
    let duration = v.contentDetails.duration;
    let likeCount = v.statistics.likeCount;
    let viewCount = v.statistics.viewCount;

    return {
      videoId,
      selected: false,
      extras: {
        duration,
        durationSecs: moment.duration(duration).asSeconds(),
        likeCount,
        viewCount,
        channelTitle: v.snippet.channelTitle
      }
    };
  });

  return result;
}



async function videoCategories() {
  var requestOptions = {
      part: 'snippet',
      regionCode: 'CO'
    };

    var request = gapi.client.youtube.videoCategories.list(requestOptions);
    var response = await request;
    return response.items;
}

export  {
  requestPlaylistId,
  requestDefaultChannel,
  requestSinglePage,
  requestWatchLaterId,
  collectAllPagesCR,
  videoDetails,
  savePlaylist,
  savePlaylistItem,
  removeVideos,
  revokeToken
};
