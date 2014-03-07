TVUtils.addFun("adtUtils");
adtUtils = {
    getJsHeader: function () {
        return '<script src="http://'+ atvDomain + '/js/utils.js" /><script src="http://' + atvDomain + '/js/adt.js" />';
    },
    getUA: function () {
        var header = {'User-Agent':'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25'};
        return header;
    },
    main: function (t, f) {
        switch (f) {
            default:
                break;      
        }
        adtUtils.makeUp();   
    },
    sanity: function (t) {
        if (/adt/.test(t)) {
            return 1;
        } else {
            return null;
        }
    },
    getLink: function (url){       
        TVUtils.makeRequest(url, "GET", adtUtils.getUA(), null, function(c) {
            var ft = /<title>(.+)<\/title>/.exec(c)[1];
            ft = ft.replace('好色龍的網路生活觀察日誌: ', '');
            var sum = c.substring(c.indexOf('<div class=\'post-header\'>'), c.indexOf('密碼'));
            sum = sum.replace(/<(.+)>|&#(\d+);|\r|\n/g, '');
            var pw = /密碼&#65306;(\d\d\d\d)/.exec(c)[1];
            var mUrl = /"no" src="(.+)" width=/.exec(c)[1];
            TVUtils.makeRequest(mUrl, "GET", adtUtils.getUA(), null, function(b) {
                var tmps = b.split(/<script>|<\/script>/);
                for (var i in tmps) {
                    if(/var medium/.test(tmps[i])) {
                        var evl = tmps[i];
                        evl = evl.substring(0,evl.indexOf('};')+2);
                        break;
                    }
                }
                eval(evl);
                mUrl = 'http://vlog.xuite.net/_ajax/default/media/ajax?act=checkPasswd&mediumId='+medium.MEDIA_ID+'&passwd='+pw;
                TVUtils.makeRequest(mUrl, "GET", adtUtils.getUA(), null, function(a) {
                    eval('var info ='+a);
                    var act = "TVUtils.realPlay('" + TVUtils.xmlchar(info.media.html5Url) + "','" + TVUtils.xmlchar(info.media.TITLE) + "','"+TVUtils.xmlchar(sum)+"',0, null)";
                    var astr = '<actionButton id="play" onSelect="' + act + ';"><title>PLAY!!!</title><image>resource://Play.png</image><focusedImage>resource://PlayFocused.png</focusedImage><badge>HD</badge></actionButton>';
                    var xml = '<atv><head>'+adtUtils.getJsHeader()+'</head><body><itemDetail id="playPick"><title>' + TVUtils.xmlchar(ft) + '</title><subtitle>' + TVUtils.xmlchar(info.media.TITLE) + '</subtitle><rating>PG</rating><summary>' + TVUtils.xmlchar(sum) + '</summary><image style="moviePoster">' + TVUtils.xmlchar('http://vlog.xuite.net/'+info.media.thumbnailUrl) + '</image><defaultImage>resource://Poster.png</defaultImage><footnote>' + TVUtils.xmlchar('探險活寶') + '</footnote><centerShelf><shelf id="centerShelf" columnCount="1" center="true"><sections><shelfSection><items>' + astr + '</items></shelfSection></sections></shelf></centerShelf></itemDetail></body></atv>';
                    atv.loadXML(atv.parseXML(xml));
                });
            });
        });
    },
    getProgList: function (f) {
        var url = 'http://hdx3.blogspot.com/search/label/Adventure%20Time';
        var info = [];
        TVUtils.makeRequest(url, "GET", adtUtils.getUA(), null, function(d) {
            var tmps = d.split("<div class='post-outer'>");
            var t, l;
            for (var i in tmps) {
                if (/Adventure Time - /.test(tmps[i])) {
                    t =  /'>(.+)<\/a>/.exec(tmps[i])[1];
                    t = t.replace('[美式卡通翻譯] Adventure Time - ', 'AT - ');
                    l = /<a href='(.+)'>/.exec(tmps[i])[1];
                    info.push({title:t, link:l});
                }
            };
            f(info);
        });
    },
    makeUp: function () {
        var f = function (info){ 
            var body = '';
            for (var i in info) {
                body += '<sixteenByNinePoster id="'+i+'" accessibilityLabel="" alwaysShowTitles="true" onSelect="adtUtils.getLink(\''+TVUtils.xmlchar(info[i].link)+'\')" onPlay="adtUtils.getLink(\''+TVUtils.xmlchar(info[i].link)+'\')"><title>'+TVUtils.xmlchar(info[i].title)+'</title><image>http://'+atvDomain+'/pic/movieP/atNone.jpg</image><defaultImage>resource://16X9.png</defaultImage></sixteenByNinePoster>';
            }
            var xml = '<?xml version="1.0" encoding="UTF-8"?><atv><head>'+adtUtils.getJsHeader()+'</head><body><scroller id="'+id_com+'"><items><collectionDivider alignment="left" accessibilityLabel=""><title>探險活寶</title></collectionDivider><grid id="gd_0" columnCount="5"><items>'+body+'</items></grid></items></scroller></body></atv>';          
            atv.loadXML(atv.parseXML(xml));
        };
        adtUtils.getProgList(f);
    }
}
