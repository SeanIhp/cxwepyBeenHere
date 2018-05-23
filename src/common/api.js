import m_contacts from '../mocks/contact';
import m_history from '../mocks/history';
import m_reply from '../mocks/reply';
import global from './global';

import wepy from 'wepy';
import SeanComm from '../utils/utils';
var QQMapWX = require('../utils/qqmap-wx-jssdk.min.js');

export default {
    getRandomReply (id) {
        let template = m_reply[id];
        if (!template)
            template = m_reply['other'];

        let index = Math.random() * template.length >> 0;

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(template[index]);
            });
        });

    },
    getContact () {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(m_contacts);
            });
        });
    },

    getUserInfo () {
        return new Promise((resolve, reject) => {
            let cache = global.getUserInfo();
            if (cache) {
                resolve(cache);
            } else {
                wepy.login().then((res) => {
                    wepy.getUserInfo().then((res) => {
                        // console.log('getuserinfo success');
                        // console.log(res)
                        global.setUserInfo(res.userInfo);
                        resolve(res.userInfo);
                    }).catch(reject);
                }).catch(reject);
            }
        });
    },

    getWxUserInfo(_globalData, _data) {
        return new Promise((resolve, reject) => {
            let cache = global.getUserInfo();
            if (cache) {
                resolve(cache);
            } else {
                wepy.login().then((res) => {
                    wepy.getUserInfo().then((res) => {
                        // console.log('getuserinfo success');
                        // console.log(res);
                        // console.log(res.userInfo);
                        _globalData.userInfo = res.userInfo;
                        // console.log(':::: globalData: ', _globalData);
                        resolve(res.userInfo);
                    }).catch(reject);
                }).catch(reject);
            }
        });
    },

    // getWxLocation(_globalData, _pushLocation) {
    getWxLocation(_globalData, _data) {
        if (_globalData.qqmapsdk == null) {
            _globalData.qqmapsdk = new QQMapWX({
                key: 'U2GBZ-QWSRO-YCNWX-SICFH-GL2GO-CXFWE'
            });
        }
        let _location = {
            timestamp: null,
            latitudeOrgi: null,
            longitudeOrgi: null,
            speed: null,
            accuracy: null,
            longitude: null,
            latitude: null,
            point: null,
            address: null
        };
        wx.getLocation({
            //type: 'wgs84',
            type: 'gcj02',
            success: function(res) {
                _location.latitudeOrgi = res.latitude;
                _location.longitudeOrgi = res.longitude;
                _location.speed = res.speed;
                _location.accuracy = res.accuracy;
                // console.log('getLocation success: ', res);
            },
            complete: function(res) {
                var _lati = res.latitude;
                var _longi = res.longitude;
                _globalData.qqmapsdk.reverseGeocoder({
                    location: {
                        latitude: _lati,
                        longitude: _longi
                    },
                    success: function (res) {
                        // self.setData({
                        //     location: {
                        //         hasLocation: true,
                        //         point: SeanComm.fmtLocation(_longitude, _latitude),
                        //         longitude: res.result.ad_info.location.lng,
                        //         latitude: res.result.ad_info.location.lat,
                        //         address: res.result.address
                        //     }
                        // });
                        // console.log('reverseGeocoder acomplished!!!: ', res);
                        _location.timestamp = new Date().getTime();
                        _location.point = SeanComm.fmtLocation(_lati, _longi);
                        _location.longitude = res.result.ad_info.location.lng;
                        _location.latitude = res.result.ad_info.location.lat;
                        _location.address = res.result.address;
                        // if (!!_globalData) {
                        //     _globalData.location = _location;
                        // }
                        // if (!!_data) {
                        //     _data.location = _location;
                        //     _data.$apply();
                        // }
                        // console.log('reverseGeocoder _globalData: ', _globalData, _data);
                        // if (!!_pushLocation) {
                        //     _pushLocation();
                        // }
                        // if (!!_pushLocation && !!_obj) {
                        //     _pushLocation(_obj);
                        // }
                    },
                    fail: function (res) {
                        // console.log('reverseGeocoder fail: ', res);
                        _globalData.location = _location;
                    },
                    complete: function (res) {
                        // console.log('reverseGeocoder complete: ', res);
                        _globalData.location = _location;
                    }
                });
                // self.$apply();
            }
        });
        
        // return new Promise((resolve, reject) => {
        //     let cache = global.getUserInfo();
        //     if (cache) {
        //         resolve(cache);
        //     } else {
        //         wepy.login().then((res) => {
        //             wepy.getUserInfo().then((res) => {
        //                 console.log('getuserinfo success');
        //                 console.log(res);
        //                 console.log(res.userInfo);
        //                 _globalData.userInfo = res.userInfo;
        //                 console.log(':::: globalData: ', _globalData);
        //                 resolve(res.userInfo);
        //             }).catch(reject);
        //         }).catch(reject);
        //     }
        // });
    },

    

    // select * from history h
    // left join contact c
    // on (h.from == c.id or h.to == c.id)
    // where h.from = :id or h.to = :id or :id = '';
    // order by h.time asc;
    getHistory (id) {
        let history = wepy.getStorageSync('_wechat_history_') || m_history;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let sorted = history.sort((a, b) => a.time - b.time);
                if (!id)
                    resolve(this.leftJoin(sorted, m_contacts))
                else {
                    resolve(this.leftJoin(sorted.filter((v) => v.from === id || v.to === id), m_contacts));
                }
            });
        });
    },
    // select *, (select msg from history h2 where h2.from = c.id or h2.to = c.id order by time desc limit 1) as lastmsg
    // from history h
    // left join contact c
    // on (h.from == c.id or h.to == c.id)
    // where h.from = :id or h.to = :id or :id = '';
    // order by h.time desc;
    getMessageList () {
        let history = wepy.getStorageSync('_wechat_history_') || m_history;
        return new Promise((resolve, reject) => {
            let distince = [];
            let rst = [];
            let sorted = history.sort((a, b) => b.time - a.time);
            sorted.forEach((v) => {
                if (v.from !== 'me' && distince.indexOf(v.from) === -1) {
                    distince.push(v.from);
                }
                if (v.to !== 'me' && distince.indexOf(v.to) === -1) {
                    distince.push(v.to);
                }
            });

            distince.forEach((v) => {
                let pmsg = sorted.filter((msg) => msg.to === v || msg.from === v);
                let lastmsg = pmsg.length ? pmsg[0].msg : '';

                rst.push({
                    id: v,
                    lastmsg: lastmsg,
                });
            });

            setTimeout(() => {
                resolve(this.leftJoin(rst, m_contacts));
            });
        });
    },

    leftJoin(original, contacts) {

        let contactObj = global.getContact();
        let rst = [];

        original.forEach((v) => {
            if (!v.id) {
                v.id = (v.from !== 'me') ? v.from : v.to;
            }
            if (v.id) {
                if (v.id !== 'me') {
                    v.name = contactObj[v.id].name;
                    v.icon = (wepy.env === 'web' ? './mocks/users/' : '../mocks/users/') + contactObj[v.id].id + '.png';
                }
                rst.push(v);
            }
        });
        return rst;
    },

    sendMsg (to, msg, type = 'text') {
        return this.msg('me', to, msg, type);
    },

    replyMsg (frm, msg, type = 'text') {
        return this.msg(frm, 'me', msg, type);
    },

    msg (frm, to, msg, type = 'text') {
        let history = wepy.getStorageSync('_wechat_history_') || m_history;
        let msgObj = {
            to: to,
            msg: msg,
            type: type,
            from: frm,
            time: +new Date()
        };

        history.push(msgObj);

        return new Promise((resolve, reject) => {
            wepy.setStorage({key: '_wechat_history_', data: history}).then(() => {
                resolve(msgObj);
            }).catch(reject);
        });
    },

    clearMsg (id) {
        return wepy.clearStorage();
    }

}
