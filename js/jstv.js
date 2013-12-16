TVUtils.addFun("jstvUtils");
var jstvChl = 'https://'+atvDomain+'/jstvData.txt';
var jstvUtils = {
    getJsHeader: function () {
        return '<script src="http://'+ atvDomain + '/js/utils.js" /><script src="http://' + atvDomain + '/js/jstv.js" /><script src="http://' + atvDomain + '/js/sha1.js" />';
    },
    main: function (t, f) {
        switch (f) {
            case 'cacheClear':
                jstvUtils.cacheClear(t);
                return;
            default:
                break;      
        }
        //Cache timeout check
        TVUtils.loIns(t, 'timeout', 1*60*60*1000); // 1 hr
    
        if (TVUtils.loGet(t, 'cachetime')) {
            var tc = parseInt(TVUtils.loGet(t, 'cachetime'), 10);
            var to = parseInt(TVUtils.loGet(t, 'timeout'), 10);
            var ti = parseInt((new Date).getTime(), 10);
            if (tc+to < ti) {
                TVUtils.loDel(t);
                atv.loadXML(TVUtils.showMessage({
                    title: 'System Notice',
                    message: 'Cache timeout\nSystem will renew',
                    buttons: [{
                        label: 'OK',
                        script: 'atv.unloadPage()'
                    }]
                }));
                return;
            }
        }
        
        var jstvChl = TVUtils.loGet('profile', 'jstvChl');
        if(jstvChl == null) {
            TVUtils.loIns('profile', 'jstvChl', 'https://dl.dropboxusercontent.com/u/25849981/jstvData.txt');
        }
        jstvUtils.makePage(t);
    
    },
    sanity: function (t) {
        if (/jstv/.test(t)) {
            return 1;
        } else {
            return null;
        }
    },
    aFix: function (s) {
    return s.replace(/[{}\s"]/g, function (c) {
        return {
            "{": "%7B",
            "}": "%7D",
            " ": "+",
            "\"": "%22"
        }[c]
        });
    },
    cacheClear: function (t) {
        TVUtils.loDel(t);
        atv.loadXML(TVUtils.showMessage({
            title: 'System Notice',
            message: 'Channel Info cache Clear!!!',
            buttons: [{
                label: 'OK',
                script: 'atv.unloadPage()'
            }]
        }));
    },
    onPlay: function (url) {
        var xml = '<?xml version="1.0" encoding="UTF-8"?><atv><body><videoPlayer id="'+id_com+'"><httpFileVideoAsset id="show-player"><mediaURL><![CDATA['+url+']]></mediaURL><title></title><description></description></httpFileVideoAsset></videoPlayer></body></atv>';
        atv.loadXML(atv.parseXML(xml));
    },
    getJustin: function (chl) {
        var url = 'http://www.justin.tv/'+chl;
        TVUtils.makeRequest(url, "GET", null, null, function(d) {
            if (!(/Password Required/.test(d))) {
                var title = /<meta name="title" content="(.+)" \/>/.exec(d)[1];
                var sum =  /<meta name="description" content="(.+)" \/>/.exec(d)[1];
            } else {
                var title = chl;
                var sum = 'No more summary due to Password loss';
            }
            var image = 'http://static-cdn.jtvnw.net/previews/live_user_'+chl+'-640x480.jpg';
            
            url = 'http://usher.justin.tv/stream/iphone_token/'+chl+'.json';
            TVUtils.makeRequest(url, "GET", null, null, function(c) {
                eval('var tmp ='+c);
                var hash = hex_hmac_sha1("Wd75Yj9sS26Lmhve", tmp[0].token);
                var link = 'http://usher.justin.tv/stream/multi_playlist/'+chl+'.m3u8?token='+hash+':'+tmp[0].token;
                
                var act = "TVUtils.realPlay('" + jstvUtils.aFix(link) + "','" + TVUtils.xmlchar(title) + "','"+TVUtils.xmlchar(sum)+"',0, null)";
                var astr = '<actionButton id="play" onSelect="' + act + ';"><title>PLAY!!!</title><image>resource://Play.png</image><focusedImage>resource://PlayFocused.png</focusedImage><badge>HD</badge></actionButton>';
                var xml = '<atv><head>'+jstvUtils.getJsHeader()+'</head><body><itemDetail id="playPick"><title>' + TVUtils.xmlchar(chl) + '</title><subtitle>' + TVUtils.xmlchar(title) + '</subtitle><rating>PG</rating><summary>' + TVUtils.xmlchar(sum) + '</summary><image style="moviePoster">' + TVUtils.xmlchar(image) + '</image><defaultImage>resource://Poster.png</defaultImage><footnote>' + TVUtils.xmlchar('JustinTV') + '</footnote><centerShelf><shelf id="centerShelf" columnCount="1" center="true"><sections><shelfSection><items>' + astr + '</items></shelfSection></sections></shelf></centerShelf></itemDetail></body></atv>';
                atv.loadXML(atv.parseXML(xml));
                return;
            }); 
        });
    },
    makePage: function (t) {
        var body = '';
        var image = '';
        var name = '';
        TVUtils.makeRequest(TVUtils.loGet('profile', 'jstvChl'), "GET", null, null, function(data){
            var hash = hex_hmac_sha1(hashKey, data);
            if (TVUtils.loCmp(t, 'hash', hash) != null) {
                body = TVUtils.loGet(t, 'subXml');
            } else {
                TVUtils.loIns(t, 'hash', hash);
                var all = data.split("\n");
                for (var i in all) {
                    if (all[i].length <= 1) {
                        break;
                    }
                    var token = all[i].split(";",2);
                    image = 'http://static-cdn.jtvnw.net/previews/live_user_'+token[0]+'-480x270.jpg';
                    if (token[1] == 'none') {
                        name = TVUtils.xmlchar(token[0]);
                    } else {
                        name = TVUtils.xmlchar(token[1]);
                    }
                    body += '<sixteenByNinePoster id="sf_0'+i+'" accessibilityLabel="" alwaysShowTitles="true" onSelect="jstvUtils.getJustin(\''+token[0]+'\')" ><title>'+name+'</title><image>'+image+'</image><defaultImage>resource://16X9.png</defaultImage></sixteenByNinePoster>';
                }
                
                TVUtils.loIns(t, 'subXml', body);
                TVUtils.loIns(t, 'cachetime', (new Date).getTime());
            }
            var xml = '<?xml version="1.0" encoding="UTF-8"?><atv><head>'+jstvUtils.getJsHeader()+'</head><body><scroller id="'+id_com+'"><items><collectionDivider alignment="left" accessibilityLabel=""><title>JustinTV</title></collectionDivider><grid id="gd_0" columnCount="5"><items>'+body+'</items></grid></items></scroller></body></atv>';
            // For cache
            return atv.loadXML(atv.parseXML(xml));                    
        });
    }
}
