import React, { Component } from 'react';
import {  requestPlaylistId,
          collectAllPagesCR,
          videoDetails,
          savePlaylist,
          savePlaylistItem,
        } from './yt-utils.jsx';

import { VideoItem } from './VideoItem.jsx';
import { NavBar } from './NavBar.jsx';
import { arrayShuffle } from './utils';
import { FAKE_DATA } from './fake-data';

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      vids: []
    };
  }

  componentDidMount() {
    console.log("Component did mount");
  }

  loadFakeVideos() {
    this.setState({
      vids: FAKE_DATA
    });
  }


  authorizationReady = () => {
    console.log("Authorization Ready callback");
    collectAllPagesCR()
    .then(vids => {
      this.setState({
        vids: vids
      })
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
    savePlaylist(this.state.vids);
  };

  // Arrow functions are for autobinding
  vidSelected = (idx) => {
    this.state.vids[idx].selected = !this.state.vids[idx].selected;
    this.setState({
      vids: this.state.vids
    });
  };

  render() {
    return (
    <div>
        <h1>Watch Later</h1>
        <NavBar>
          <li> <a href="#" onClick={this.reverseOrder}>Reverse</a> </li>
          <li> <a href="#" onClick={this.sortByDuration}>Sort By Length</a> </li>
          <li> <a href="#" onClick={this.sortByRandom}>Random</a> </li>
          <li> <a href="#" onClick={this.selectNone}>Select None</a> </li>
          <li> <a href="#" onClick={this.sendToBottom}>To Bottom</a> </li>
          <li> <a href="#" onClick={this.sendToTop}>To Top</a> </li>
          <li> <a href="#" onClick={this.savePlaylist}>Save</a> </li>
        </NavBar>

        <div>{this.state.vids.length > 0?
          <div className="vid-list">
            {this.state.vids.map((v, i) => <VideoItem key={i} index={i} snippet={v.snippet} extras={v.extras} sel={v.selected} onChecked={this.vidSelected}/>) }
          </div>
          :<div>Loading list</div>}
        </div>
    </div>
    );
  }
}
