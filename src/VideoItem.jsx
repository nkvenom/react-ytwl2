import React, { Component } from 'react';
import moment from  'moment';
import { formatDuration } from './utils';


class VideoItem extends Component {

  constructor() {
    super();
  }
  
  onClick = (e) => {
    this.props.onChecked(this.props.index);
  };
  
  render()
  {
    var {snippet, extras, sel, onChecked} = this.props;  
  
    return (
    <div className="vid-item vid1">
        <div className="vid-item-controls">
          <input type="checkbox" checked={sel} onClick={this.onClick} /> 
        </div>
        <div className="vid-item-thumb">
          <img src={snippet.thumbnails.default.url} width="120" height="90" alt="Thumbnail" />
        </div>
        <div className="vid-item-details">
          <div className="vid-item-title">{snippet.title}</div>
          <div className="vid-item-channel">{extras.channelTitle}</div>
          <div className="vid-item-duration">{ formatDuration(extras.durationSecs) }</div> 
        </div>
    </div>
    );
  }
}

export { VideoItem };
