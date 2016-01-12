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


async function requestRelatedPlaylists() {
  // See https://developers.google.com/youtube/v3/docs/channels/list
  var request = gapi.client.youtube.channels.list({
    mine: true,
    part: 'contentDetails'
  });

  var response = await request;
  if(response.result.items.length > 0) {
    return response.result.items[0].contentDetails.relatedPlaylists;
  }

  throw "Could not find any related playlists";
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
  var res = {};

  res.title = vid.snippet.title;
  res.snippetUrl = vid.snippet.thumbnails.default.url;
  res = Object.assign(res, detail);

  if(!res.extras) return res;
//  console.log(res.title, res.extras.channelTitle);
  res.channelTitle = res.extras.channelTitle? res.extras.channelTitle : '';
  res.durationSecs = res.extras.durationSecs;

  return res;
}

async function collectAllPagesCR() {
  var plVideos = [], nextPage, page = [];
  var playlists = await requestRelatedPlaylists();
  var watchlaterId = playlists.watchLater;
  do {
    [nextPage, page] = await requestSinglePage(watchlaterId, nextPage);
    var vidIds = page.map(v => v.snippet.resourceId.videoId);
    var vidsDetails = await videoDetails(vidIds);
    plVideos = plVideos.concat(page.map((v,i) => combineWithDetails(v, vidsDetails[i])));
  } while(nextPage);

  return plVideos;
}

// async function savePlaylistItem(plItem, position) {
async function savePlaylistItem(plItem, position) {
  console.log(`${position}: ${plItem.snippet.title}`)
  var requestOptions = {
    id: plItem.id,
    part: 'snippet',
    snippet: {
      playlistId: plItem.snippet.playlistId,
      resourceId: plItem.snippet.resourceId,
      position
    }
  };

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
    pli.snippet.position = i;
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

async function requestWatchLaterId() {
  var playlists = await requestRelatedPlaylists();
  // console.log("requestWatchLaterId", playlists);
  return playlists.watchLater;
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
  requestSinglePage,
  requestWatchLaterId,
  collectAllPagesCR,
  videoDetails,
  savePlaylist,
  savePlaylistItem
};
