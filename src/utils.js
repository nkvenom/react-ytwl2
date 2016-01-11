function divmod(x, y) {
	return [
		Math.floor(x / y),
		x % y		
	]
}

function formatDuration(secs) {
	
	var hours=0, mins = 0;
	[hours, secs] = divmod(secs, 3600);
	[mins, secs] = divmod(secs, 60);	
	
	var res = '';
	if(hours > 0) {
		res += hours + ":";
	}
	if(mins === 0) {
		res += '00:';
	}
	else if(mins < 10) {
		res += '0' + mins + ':';
	}
	else {
		res += mins + ':';
	}
	if(secs === 0) {
		res += '00'
	}
	else if (secs < 10) {
		res += '0' + secs;
	}
	else {
		res += secs;
	}
	
	return res;
}

function arrayShuffle(array) {
  var idx = array.length, randomIndex;
  while (0 !== idx) {
    randomIndex = Math.floor(Math.random() * idx);
    idx -= 1;
	[array[idx], array[randomIndex]] = [array[randomIndex], array[idx]]; 
  }

  return array;
}

function arrayShuffle2(array) {
  var idx = array.length, randomIndex;
  var res = Array(array.length).fill();
  while (0 !== idx) {
    randomIndex = Math.floor(Math.random() * idx);
    idx -= 1;
	res[idx] = array[randomIndex];
  }

  return res;
}

export { formatDuration, arrayShuffle };