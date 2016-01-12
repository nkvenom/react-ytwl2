import React, { Component } from 'react';
import moment from  'moment';
import { formatDuration } from './utils';
import { DragSource } from 'react-dnd';
import { DropTarget } from 'react-dnd';
import ItemTypes from './ItemTypes'

const videoSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index
    };
  }
};

const videoTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props.moveVideo(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  }
};


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

var DragSource1 = DragSource(ItemTypes.YTVIDEO, videoSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(VideoItem);

var DropTarget1 = DropTarget(ItemTypes.YTVIDEO, videoTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))(DragSource1);

export default DropTarget1;
