// The client ID is obtained from the {{ Google Cloud Console }}
// at {{ https://cloud.google.com/console }}.
// If you run this code from a server other than http://localhost,
// you need to register your own client ID.
var OAUTH2_CLIENT_ID = '__YOUR_CLIENT_ID__';
var OAUTH2_SCOPES =
  'https://www.googleapis.com/auth/youtube.force-ssl profile';

// Upon loading, the Google APIs JS client automatically invokes this callback.
window.googleApiClientReady = function() {
  console.log("googleApiClientReady", gapi);
  gapi.auth.init(function() {
    window.setTimeout(checkAuth, 1);
  });
}

// Attempt the immediate OAuth 2.0 client flow as soon as the page loads.
// If the currently logged-in Google Account has previously authorized
// the client specified as the OAUTH2_CLIENT_ID, then the authorization
// succeeds with no user intervention. Otherwise, it fails and the
// user interface that prompts for authorization needs to display.
var  checkAuth = function() {
  if(OAUTH2_CLIENT_ID && OAUTH2_CLIENT_ID !== '__YOUR_CLIENT_ID__') {
    tryAuthorize();
  }
  else {
    window.fetch('client-id.txt')
    .then(resp => {
      return resp.text();
    })
    .then(text => {
      OAUTH2_CLIENT_ID = text.trim();
      tryAuthorize();
    })
    .catch(function(error) {
        console.log('There has been a problem retrieving the app client id: ' + error.message);
    });
  }
}

function tryAuthorize() {
  gapi.auth.authorize({
    client_id: OAUTH2_CLIENT_ID,
    scope: OAUTH2_SCOPES,
    immediate: false
  }, handleAuthResult);
}
// Handle the result of a gapi.auth.authorize() call.
function handleAuthResult(authResult) {
  console.log(authResult);
  if (authResult && !authResult.error) {
    // Authorization was successful. Hide authorization prompts and show
    // content that should be visible after authorization succeeds.
    $('.pre-auth').hide();
    $('.post-auth').show();
    loadAPIClientInterfaces();
  } else {
    // Make the #login-link clickable. Attempt a non-immediate OAuth 2.0
    // client flow. The current function is called when that flow completes.
    $('#login-link').click(function() {
      gapi.auth.authorize({
        client_id: OAUTH2_CLIENT_ID,
        scope: OAUTH2_SCOPES,
        immediate: false
        }, handleAuthResult);
    });
  }
}

function getUserData() {
  var restRequest = gapi.client.request({
    'path': '/plus/v1/people/me'
  });

return restRequest;
  /*
  restRequest.then(function(resp) {
    console.log(resp);
  }, function(reason) {
    console.log('Error: ' + reason.result.error.message);
  });

  */
}

// Load the client interfaces for the YouTube Analytics and Data APIs, which
// are required to use the Google APIs JS client. More info is available at
// https://developers.google.com/api-client-library/javascript/dev/dev_jscript#loading-the-client-library-and-the-api
function loadAPIClientInterfaces() {
  getUserData().
  then(user => {
    gapi.client.load('youtube', 'v3', function() {
      listeners.forEach(f => {
        console.log('user', user);
        f({
          displayName: user.result.displayName,
          url: user.result.url,
          picture: user.result.image.url
        });
      });
    });
  },
    err => console.log(err)
  );
}

var listeners = [];
function registerListener(func) {
  listeners.push(func);
}
