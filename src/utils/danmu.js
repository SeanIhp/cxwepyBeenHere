
let Danmu = {};

Danmu.Settings = {
    laneType: 'TEXT',  // TEXT/IMAGE/ANY
    laneSpacing: 6,
    laneBaseHeight: 50,
    commentType: 'TEXT',  // BLANK/TEXT/IMAGE
    commentBaseHeight: 44,
    commentHeadSpace: 20,
    commentTailSpace: 150,
    timeslice: 18000,    // 动作持续时间(毫秒)
    maxCharacter: 40,    // 最大字数
};

Danmu.CommentInfo = {
    serial: -1,
    laneIndex: -1,
    type: Danmu.Settings.commentType,
    text: '',
    top: -9999,
    left: -9999,
    fontSize: 14,
    width: -1,
    height: Danmu.Settings.commentBaseHeight,
    longness: 0,        // 内容(前缀+主体+后缀)总长度
    status: 0,   // 0: 待机 1: 运行中 2：暂停 -1: 结束
};

Danmu.Lane = {
    index: -1,
    type: Danmu.Settings.laneType,
    topBase: -1,
    middleBase: -1,
    height: Danmu.Settings.laneBaseHeight,
    longness: 0,
    minLongness: 0,
    maxLongness: 0,
    distance: 0,    
    startTime: null,
}

export default Danmu;