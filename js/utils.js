var atvDomain = 'securea.mlb.com';
var id_com = 'ap.4';
var hashKey = 'abCom';
var mFunc = new Array();
var pUrl = 'https://'+atvDomain+'/uuidDefault.txt';

TVUtils = {
    err: function (msg, type) {
        type = type || 'Bug Log';
        atv.loadAndSwapXML(TVUtils.showMessage({title: type, message: msg}));        
    },
    addFun: function (func) {
        mFunc.push(func);
    },
    loIsKey: function (key) {
        var s = atv.localStorage.getItem(key);
        if (s == null||s == undefined|| s == '') {
            s = {};
            atv.localStorage.setItem(key, JSON.stringify(s));
            return null;
        }
        return 1;
    },
    loIns: function (key, index, value) {
        TVUtils.loIsKey(key);
        var s = JSON.parse(atv.localStorage.getItem(key));
        s[index] = value;
        atv.localStorage.setItem(key, JSON.stringify(s));
    },
    loGet: function (key, index) {
        TVUtils.loIsKey(key);
        var s = JSON.parse(atv.localStorage.getItem(key));
        return ((s[index] != undefined)?s[index]:null);
    },
    loDel: function (key, index) {
        if(index != null&&TVUtils.loIsKey(key) == 1) {
            var s = JSON.parse(atv.localStorage.getItem(key));
            delete s[index];
            atv.localStorage.setItem(key, JSON.stringify(s));
        } else {
            atv.localStorage.removeItem(key);
        }
    },
    loCmp: function (key, index, value) {
        if (TVUtils.loIsKey(key) == null) {
            return null;
        }
        var s = JSON.parse(atv.localStorage.getItem(key));
        if (TVUtils.loGet(key, index) != null) {
            return s[index].match(value);
        } else {
            return null;
        }
    },
    xmlchar: function (s) {
        return s.replace(/[&<>'"]/g, function (c) {
            return "&" + {
                "&": "amp",
                "<": "lt",
                ">": "gt",
                "'": "apos",
                '"': "quot"
            }[c] + ";"
        })
    },
    realPlay: function (url, name, desc, mlength, pl, suburl) {
        var ppos = atv.localStorage['playpos'];
        if (!ppos) ppos = new Array();
        var lastp = 0;
        for (var i = 0; i < ppos.length; i++) {
            if (ppos[i][0] == url) {
                lastp = ppos[i][1];
                break;
            }
        };
        if (!name) {
            name = '';
        }
        var sub = [];

        function startp() {
            if (pl) {
                c = {
                    "bookmark-time": lastp,
                    playlist: pl,
                    subtitle: sub,
                    type: "video-asset",
                    "media-asset": {
                        "media-url": url,
                        type: 'http-live-streaming',
                        title: name,
                        description: desc,
                        length: mlength
                    }
                };
            }else {
                c = {
                    "bookmark-time": lastp,
                    subtitle: sub,
                    type: "video-asset",
                    "media-asset": {
                        "media-url": url,
                        type: 'http-live-streaming',
                        title: name,
                        description: desc,
                        length: mlength
                    }
                };
            }
            atv.loadAndSwapPlist(c);
        };

        function subti(sts) {
            var sa = sts.split(',');
            var sec = sa[0];
            if (sa.length > 1) {
                ml = parseInt(sa[1], 10);
            } else
                ml = 0;
            var ta = sec.split(':');
            if (ta.length == 3) {
                secs = parseInt(ta[0], 10) * 3600 + parseInt(ta[1], 10) * 60 + parseInt(ta[2], 10);
            } else if (ta.length == 2) {
                secs = parseInt(ta[0], 10) * 60 + parseInt(ta[1], 10);
            } else
                secs = parseInt(ta[0], 10);
            return secs + (ml / 1000.0);
        };
        
        if (suburl == '' || suburl == null) {
            startp();
        } else {            
            TVUtils.makeRequest(suburl, "GET", null, null, function (d, c) {
                if (d != null) {
                    try {
                            d = d.replace(/content/, 'subinfo');
                            d = d.replace(/startTime/, 'startt');
                            d = d.replace(/duration/, 'endt');
                            d = d.replace(/startOfParagraph/, 'subid');
                            
                            var subt = JSON.parse(d).captions;
                            for (var i in subt) {
                                subt[i].subid = parseInt(i)+1;
                                subt[i].endt = subt[i].startt+subt[i].endt;        
                                subt[i].startt = subt[i].startt/1000;
                                subt[i].endt = subt[i].endt/1000;
                                sub.push([subt[i].subid, subt[i].startt, subt[i].endt, subt[i].subinfo]);
                            }
                            
                          TVUtils.err(sub[0][3]);
                        // lines = d.replace(/\r/g, '').split('\n\n');
                        // for (var i = 0; i < lines.length; i++) {
                            // subline = lines[i].split('\n');
                            // subid = subline.shift();
                            // if (!subid) continue;
                            // subtime = subline.shift();
                            // if (!subtime) continue;
                            // sta = subtime.split('-->');
                            // startt = subti(sta[0]);
                            // endt = subti(sta[1]);
                            // subinfo = subline.join('\n').replace('\\N', '\n');
                            // sub.push([subid, startt, endt, subinfo]);
                        //}
                    } catch (e) {
                        TVUtils.err(e);
                    };
                };
                startp();
            });
        }    
    },
    showProfile: function (){
        var key = 'profile';
        if(TVUtils.loGet(key, 'uuid')) {
            atv.loadXML(TVUtils.showMessage({
                            title: 'System Notice',
                            message: 'Profile: '+TVUtils.loGet(key, 'uuid')+'\n \
                                      psnURL: '+TVUtils.loGet(key, 'psnURL')+'\n \
                                      chlSrc:  '+TVUtils.loGet(key, 'chlSrc')+'\n \
                                      jstvChl: '+TVUtils.loGet(key, 'jstvChl'),
                            buttons: [{
                                label: 'OK',
                                script: 'atv.unloadPage()'
                            }]
            }));
            } else {
            atv.loadXML(TVUtils.showMessage({
                            title: 'System Notice',
                            message: 'No profile loading now... all configuration is local',
                            buttons: [{
                                label: 'OK',
                                script: 'atv.unloadPage()'
                            }]
            }));
        }
    },
    clearProfile: function () {
        var key = 'profile';
        TVUtils.loDel(key);
        atv.loadXML(TVUtils.showMessage({
                            title: 'System Notice',
                            message: 'UUID:'+atv.device.udid+' - Profile Clear !!!',
                            buttons: [{
                                label: 'OK',
                                script: 'atv.unloadPage()'
                            }]
            }));
    },
    loadProfile: function (){
		var key = 'profile';
        textEntry = new atv.TextEntry();
        textEntry.type = 'emailAddress';
        textEntry.instructions = "Enable Your Profile [0|1]";
        textEntry.label = '1 - enable, 0 - local';
        textEntry.defaultValue ='1';
        textEntry.show();
        textEntry.onSubmit = function (op) {
			TVUtils.makeRequest(pUrl, "GET", null, null, function(data){
				eval(data);
				var key = 'profile';
				if (profile.result == 'ok') {
					if (op == '1') { // using UUID
						for(var i in profile.deviceList) {
							if (profile.deviceList[i].uuid == atv.device.udid) {
								TVUtils.loIns(key, 'uuid', profile.deviceList[i].uuid);
								TVUtils.loIns(key, 'psnURL', profile.deviceList[i].psnURL);
								TVUtils.loIns(key, 'chlSrc', profile.deviceList[i].chlSrc);
								TVUtils.loIns(key, 'jstvChl', profile.deviceList[i].jstvChl);
								break;
							}
						}
					}
					if(op != '1') { // no UUID
						TVUtils.loIns(key, 'uuid', profile.uuid);
						TVUtils.loIns(key, 'psnURL', profile.psnURL);
						TVUtils.loIns(key, 'chlSrc', profile.chlSrc);
						TVUtils.loIns(key, 'jstvChl', profile.jstvChl);
					}
					atv.loadXML(TVUtils.showMessage({
							title: 'System Notice',
							message: 'Profile: '+TVUtils.loGet(key, 'uuid')+'\n \
									  psnURL: '+TVUtils.loGet(key, 'psnURL')+'\n \
									  chlSrc:  '+TVUtils.loGet(key, 'chlSrc')+'\n \
									  jstvChl: '+TVUtils.loGet(key, 'jstvChl'),
							buttons: [{
								label: 'OK',
								script: 'atv.unloadPage()'
							}]
					}));
				} else {
					TVUtils.loIns(key, 'psnURL', 'http://securea.mlb.com/pic');
					TVUtils.loIns(key, 'chlSrc', 'http://securea.mlb.com/chData.txt');
					TVUtils.loIns(key, 'jstvChl', 'http://securea.mlb.com/jstvData.txt');
					atv.loadXML(TVUtils.showMessage({
							title: 'System Notice',
							message: 'profile loading Fail,\nnow is using local setting\n \
									  psnURL: '+TVUtils.loGet(key, 'psnURL')+'\n \
									  chlSrc:  '+TVUtils.loGet(key, 'chlSrc')+'\n \
									  jstvChl: '+TVUtils.loGet(key, 'jstvChl'),
							buttons: [{
								label: 'OK',
								script: 'atv.unloadPage()'
							}]
					}));
				}
			});
		};
    },
    showMessage: function ($h) {
        var $h = $h || {}, title = $h.title || '',
            message = $h.message || '',
            footnote = $h.footnote || '',
            id = $h.id || 'bb.com';
        var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        if ($h.buttons != undefined) {
            var scriptTag = "";
            if ($h.script) {
                scriptTag += '<head>';
                $h.script.forEach(function (e) {
                    scriptTag += '<script src="' + e + '"/>';
                }, this);
                scriptTag += '</head>';
            };
            xml += '<atv>' + scriptTag + '<body><optionDialog id="' + id + '"><header><simpleHeader><title><![CDATA[' + title + ']]></title></simpleHeader></header><description><![CDATA[' + message + ']]></description>';
            xml += '<menu><sections><menuSection><items>';
            $h.buttons.forEach(function (button, i) {
                xml += '<oneLineMenuItem id="' + i + '" accessibilityLabel="' + button.label + '" onSelect="' + button.script + '"><label>' + button.label + '</label></oneLineMenuItem>';
            });
            xml += '</items></menuSection></sections></menu>';
            xml += '</optionDialog></body></atv>';
        } else {
            xml += '<atv><body><dialog id="' + id + '"><title><![CDATA[' + title + ']]></title><description><![CDATA[' + message + ']]></description></dialog></body></atv>';
        };
        return atv.parseXML(xml);
    },
    makeRequest: function (url, method, headers, body, callback, args) {
        if ( !url ) {
            throw "loadURL requires a url argument";
        }
        var method = method || "GET",
        headers = headers || {},
        body = body || "";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            try {
                if (xhr.readyState == 4 ) {
                    if ( xhr.status == 200) {
                        callback(xhr.responseText, args);
                    } else {
                        TVUtils.err('makeRequest ERROR'+xhr.status+'\n'+url);
                    }
                }
            } catch (e) {
                TVUtils.err('Abort: makeRequest ERROR' +e+'\n'+url);
                xhr.abort();
            }
        }
        xhr.open(method, url, false); //false: sync, true: async

        for(var key in headers) {
            xhr.setRequestHeader(key, headers[key]);
        }

        xhr.send();
        return xhr;
    }
}

function main (type, v) {
    if (type == '') {
        TVUtils.err("Please Using correct type");
        return;
    }
    
    for (var i in mFunc) {
        ret = eval(mFunc[i]+".sanity('"+type+"');");
        if (ret != null) {
            eval(mFunc[i]+".main('"+type+"','"+v+"');");
            break;
        }
    }

    if (ret != 1) {
        TVUtils.err("Please Using correct CH module");
        return;
    }

}