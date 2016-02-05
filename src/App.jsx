"use strict";
import React, { Component } from 'react';
import update from 'react/lib/update';

import {  requestPlaylistId,
          requestDefaultChannel,
          collectAllPagesCR,
          videoDetails,
          savePlaylist,
          removeVideos,
          revokeToken,
          savePlaylistItem,
        } from './yt-utils.jsx';

import VideoItem from './VideoItem.jsx';
import { NavBar } from './NavBar.jsx';
import { arrayShuffle } from './utils';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

class App extends Component {
  constructor() {
    super();
    this.state = {
      vids: [],
      isLoading: false,
      message: {text: "", type: "notice"},
      user: {}
    };
  }

  componentDidMount() {
    console.log("Component did mount");
    this.props.apiReady(this.loadVideos);
  }

  loadVideos = (user) => {
    console.log("Authorization Ready callback");
    this.setState({isLoading: true});
    console.log('user', user);
    collectAllPagesCR()
    .then(vids => {
      this.setState({
        isLoading: false,
        vids: vids,
        user: user
      })
    })
    .catch(e => {
        console.log("==ERROR==", e);
        this.setState({message: {text: `${e}`, type: "error"}});
      });
  };


  getSelected = () => {
    var sel = [];
    this.state.vids.forEach((v, i) => {
      if(v.selected) {
        sel.push({idx: i, vid: v});
      }
    });

    return sel;
  };


  durationCompare(a, b) {
    return a.extras.durationSecs - b.extras.durationSecs;
  }

  lengthCompareSel(a, b) {
    return a.vid.extras.durationSecs - b.vid.extras.durationSecs;
  }

  resortSelection = (sels, sortSelecFunc) => {
    var origOrder = sels.slice(0);
    var newOrder = sels.sort(sortSelecFunc);
    origOrder.forEach((obj, i) => {
      let {idx, vid} = obj;
      this.state.vids[idx] = newOrder[i].vid;
    });
  };

  vidsAndSelection = () => {
    var sels = this.getSelected();
    var _vids = this.state.vids;
    if(sels.length == 0) return;
    sels.forEach((obj, i) => {
      _vids[obj.idx] = null;
    });

    let selVids = sels.map(obj => obj.vid);
    _vids = _vids.filter(x=> x !== null);

    return [_vids, selVids];
  };

  sortByDuration = (evt) => {
    evt.preventDefault();
    var _vids = this.state.vids;
    var sels = this.getSelected();
    if(sels.length > 0) {
      this.resortSelection(sels, this.lengthCompareSel);
    }
    else {
      _vids.sort(this.durationCompare);
    }
    this.setState({
      vids: _vids
    });
  };

  sendToBottom = (evt) => {
    evt.preventDefault();
    let [_vids, selVids] = this.vidsAndSelection();
    this.setState({
      vids: _vids.concat(selVids)
    });
  };

  sendToTop = (evt) => {
    evt.preventDefault();
    let [_vids, selVids] = this.vidsAndSelection();
    this.setState({
      vids: selVids.concat(_vids)
    });
  };

  reverseOrder = (evt) =>  {
    evt.preventDefault();
    var _vids = this.state.vids;
    var sels = this.getSelected();
    if(sels.length > 0) {
      var origOrder = sels.slice(0);
      var newOrder = sels.reverse();
      origOrder.forEach((obj, i) => {
        let {idx, vid} = obj;
        this.state.vids[idx] = newOrder[i].vid;
      });
    }
    else {
      _vids.reverse();
    }

    this.setState({
      vids: [..._vids]
    });
  };

  sortByRandom = (evt) =>  {
    evt.preventDefault();
    var _vids = this.state.vids;
    var sels = this.getSelected();
    if(sels.length > 0) {
      var origSelection = sels.slice(0);
      var newOrder = arrayShuffle(sels);
      origSelection.forEach((obj, i) => {
        let {idx, vid} = obj;
        this.state.vids[idx] = newOrder[i].vid;
      });
    }
    else {
      _vids = arrayShuffle(_vids);
    }

    this.setState({
      vids: [..._vids]
    });
  };

  selectNone = (evt) => {
    evt.preventDefault();
    var vids = this.state.vids;
    vids.forEach((v, i) => {
      v.selected = false;
    });

    this.setState({
      vids: [...vids]
    });
  };

  savePlaylist = (evt) => {
    evt.preventDefault();
    console.log('Saving playlist');
    this.setState({isLoading: true});
    var promise = savePlaylist(this.state.vids);
    promise.then( res => this.setState({isLoading: false, message: {text: "Playlist saved", type: "notice"}}));
  };

  removeVideos = (evt) => {
    console.log('Removing selected videos');
    evt.preventDefault();

    const vids = this.state.vids;
    var sels = this.getSelected();
    if(sels.length > 0) {
      this.setState({ isLoading: true});
      var promise = removeSelectedVids(vids, sels);
      console.log('resVids', promise);
      var that = this;
      promise.then(resVids => {
        console.log(resVids);
        that.setState({ isLoading: false, vids: resVids });
      });
    }
  };

  // Arrow functions are for autobinding
  vidSelected = (idx) => {
    this.state.vids[idx].selected = !this.state.vids[idx].selected;
    this.setState({
      vids: this.state.vids
    });
  };

  moveVideo = (draggedIdx, hoverIdx) => {
      const vids = this.state.vids;
      const draggedVideo = vids[draggedIdx];
      vids.splice(draggedIdx, 1);
      vids.splice(hoverIdx, 0, draggedVideo);
      this.setState({
        vids: [...vids]
      });
  };

  logout = () => {
    revokeToken();
  };

  render() {
    var { isLoading, user } = this.state;
    console.log("MSG= ", this.state.message);
    return (
      <div>
          {isLoading?
            <div className="loading-spinner"><img src="img/ajax-loader.gif" /> </div>
          : null}

        <h1>Watch Later</h1>

        {this.state.message.text != ""?<div className="alert alert-danger" role="alert">
            <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
            {this.state.message.text}
          </div>
        :null}
        <NavBar
          userName={user? user.displayName: ''}
          url={user? user.url: ''}
          picture={user? user.picture: ''}
          >

          <li>
            <button type="button" className="btn btn-default btn-md" onClick={this.removeVideos} >
              <span className="glyphicon glyphicon-trash"> </span> Remove selected
            </button>
          </li>
          <li>
              <button type="buttom" className="btn btn-default btn-md" onClick={this.reverseOrder} alt="Reverse order">
                <span className="glyphicon glyphicon-sort"></span>
                  Reverse Order
              </button>
          </li>
          <li>
              <button type="buttom" className="btn btn-default btn-md" onClick={this.sortByDuration}>
                <span className="glyphicon glyphicon-sort-by-attributes"></span>
                Sort By Length
              </button>
          </li>
          <li>
              <button type="buttom" className="btn btn-default btn-md" onClick={this.sortByRandom}>
                <span className="glyphicon glyphicon-random"></span>
                Random
              </button>
          </li>
          <li>
              <button type="buttom" className="btn btn-default btn-md" onClick={this.selectNone} alt="Select None">
                <span className="glyphicon glyphicon-unchecked"></span>
                Select None
              </button>
          </li>
          <li>
              <button type="buttom" className="btn btn-default btn-md" onClick={this.sendToBottom}>
                <span className="glyphicon glyphicon-chevron-up"></span>
                To Bottom
              </button>
          </li>
          <li>
              <button type="buttom" className="btn btn-default btn-md" onClick={this.sendToTop}>
                <span className="glyphicon glyphicon-chevron-down"></span>
                To Top
              </button>
          </li>
          <li>
              <button type="buttom" className="btn btn-default btn-md" onClick={this.savePlaylist} alt="Save">
                <span className="glyphicon glyphicon-floppy-disk"></span>
                Save
              </button>
          </li>
          <li>
              <button type="buttom" className="btn btn-default btn-md" onClick={this.logout}>Logout</button>
          </li>
        </NavBar>
        <div>{this.state.vids.length > 0?
          <div className="vid-list">
            {this.state.vids.map((v, i) => <VideoItem key={i}
                      index={i}
                      title={v.title}
                      snippetUrl={v.snippetUrl}
                      channelTitle={v.channelTitle}
                      durationSecs={v.durationSecs}
                      sel={v.selected}
                      onChecked={this.vidSelected}
                      moveVideo={this.moveVideo} />) }
          </div>
          :<div>Loading list</div>}
        </div>
    </div>
    );
  }
}

async function removeSelectedVids(vids, sels) {
  var iniTime = new Date().getTime();
  console.log(`00: Removing vids`)
  var deleted = await removeVideos(sels.map(it => it.vid));
  console.log(`${new Date().getTime() - iniTime}: Removed`)
  let resVids = [];
  let deletedIdx = sels.map(s => s.idx);
  console.log(deletedIdx);
  for(let i = 0; i < vids.length; i++) {
    if(deletedIdx.includes(i) === false) {
      resVids.push(vids[i]);
    }
  }

  return resVids;
}

// Because decorators are still not supported in babel 6
var DragDropContextHTML5BackendApp = DragDropContext(HTML5Backend)(App);
export default DragDropContextHTML5BackendApp;
