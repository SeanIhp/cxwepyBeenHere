
let SeanComm = {};

// 取指定范围的随机数（顾头不顾尾）
SeanComm.getRandom = function (start, end) {
  let length = end - start;
  let num = parseInt(Math.random() * (length) + start);
  return num;
};

SeanComm.fmtLocation = function (longitude, latitude) {
    if (typeof longitude === 'string' && typeof latitude === 'string') {
      longitude = parseFloat(longitude)
      latitude = parseFloat(latitude)
    }
  
    longitude = longitude.toFixed(2)
    latitude = latitude.toFixed(2)
  
    return {
      longitude: longitude.toString().split('.'),
      latitude: latitude.toString().split('.')
    }
};

export default SeanComm;