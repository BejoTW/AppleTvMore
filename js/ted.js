TVUtils.addFun("tedUtils");
tedUtils = {
    getJsHeader: function () {
        return '<script src="http://'+ atvDomain + '/js/utils.js" /><script src="http://' + atvDomain + '/js/ted.js" />';
    },
    getUA: function () {
        var header = null;
        return header;
    },
    main: function (t, f) {
        switch (f) {
            default:
                break;      
        }
        tedUtils.makeUp();   
    },
    sanity: function (t) {
        if (/ted/.test(t)) {
            return 1;
        } else {
            return null;
        }
    },
    getLink: function (url){
        var sub = null, info = null;
        var info = [];
        TVUtils.makeRequest(url, "GET", null, null, function(c) {
            var t = /<title>(.+)| Video on TED.com<\/title>/.exec(c)[1];
            info.sum = /"description" content="(.+)(\s|")/.exec(c)[1];       
             
            eval('var talkDetails'+/var talkDetails(.+)<\/script>/.exec(c)[1]);
            
            info.title = /(.+)\|/.exec(t)[1];
            info.image = talkDetails.posterUrl;
            info.id = talkDetails.id;
            info.mediaSlug = talkDetails.mediaSlug;
            info.mSrc = talkDetails.htmlStreams[1].file;
            if (info.mSrc == null || info.mSrc == undefined) {
                info.mSrc = talkDetails.htmlStreams.file;
            }
            url = 'http://www.ted.com/download/links/slug/'+info.mediaSlug+'/type/talks/ext/mp4';
            TVUtils.makeRequest(url, "GET", null, null, function(d) {
                if (/option value="(.+)">English/.exec(d)) {
                    sub = /option value="(.+)">English/.exec(d)[1];
                }
                if (/option value="(.+)">Chinese, Traditional/.exec(d)) {
                    sub = /option value="(.+)">Chinese, Traditional/.exec(d)[1];
                }
                if (sub != null) {                 
                    info.mSrc = 'http://download.ted.com/talks/'+info.mediaSlug+'-480p'+'-'+sub+'.mp4?apikey=TEDDOWNLOAD';
                }
                
                var act = "TVUtils.realPlay('" + TVUtils.xmlchar(info.mSrc) + "','" + TVUtils.xmlchar(info.title) + "','"+TVUtils.xmlchar(info.sum)+"',0, null)";
                // var act = "TVUtils.realPlay('" + TVUtils.xmlchar(info.mSrc) + "','" + TVUtils.xmlchar(info.title) + "','"+TVUtils.xmlchar(info.sum)+"',0, null, 'http://www.ted.com/talks/subtitles/id/1798/lang/zh-tw')";
                var astr = '<actionButton id="play" onSelect="' + act + ';"><title>PLAY!!!</title><image>resource://Play.png</image><focusedImage>resource://PlayFocused.png</focusedImage><badge>HD</badge></actionButton>';
                var xml = '<atv><head>'+tedUtils.getJsHeader()+'</head><body><itemDetail id="playPick"><title>' + TVUtils.xmlchar(info.title) + '</title><subtitle>TED Talk Newest 100</subtitle><rating>PG</rating><summary>' + TVUtils.xmlchar(info.sum) + '</summary><image style="moviePoster">' + TVUtils.xmlchar(info.image) + '</image><defaultImage>resource://Poster.png</defaultImage><footnote>' + TVUtils.xmlchar('TED Talk') + '</footnote><centerShelf><shelf id="centerShelf" columnCount="1" center="true"><sections><shelfSection><items>' + astr + '</items></shelfSection></sections></shelf></centerShelf></itemDetail></body></atv>';
                atv.loadXML(atv.parseXML(xml));
            });
        });
    },
    getProgList: function (f) {
        var url = 'http://www.ted.com/talks/quick-list';
        var info = [];
        TVUtils.makeRequest(url, "GET", tedUtils.getUA(), null, function(d) {
            var tmps = d.split(/<tr>|<\/tr>/);
            var info = [];
            var tmp = null;
            for (var i in tmps) {
                if (/TEDDOWNLOAD/.test(tmps[i])) {
                    tmp = /<a href="(.+)">(.+)<\/a>/.exec(tmps[i]);
                    info.push({title:tmp[2], link:'http://www.ted.com/'+tmp[1]});
                }
            }
            f(info);
        });
    },
    makeUp: function () {
        var f = function (info){ 
            var body = '';
            for (var i in info) {
                body += '<sixteenByNinePoster id="'+i+'" accessibilityLabel="" alwaysShowTitles="true" onSelect="tedUtils.getLink(\''+TVUtils.xmlchar(info[i].link)+'\')" onPlay="tedUtils.getLink(\''+TVUtils.xmlchar(info[i].link)+'\')"><title>'+TVUtils.xmlchar(info[i].title)+'</title><image>http://'+atvDomain+'/pic/movieP/ted.jpg</image><defaultImage>resource://16X9.png</defaultImage></sixteenByNinePoster>';
            }
            var xml = '<?xml version="1.0" encoding="UTF-8"?><atv><head>'+tedUtils.getJsHeader()+'</head><body><scroller id="'+id_com+'"><items><collectionDivider alignment="left" accessibilityLabel=""><title>TED</title></collectionDivider><grid id="gd_0" columnCount="5"><items>'+body+'</items></grid></items></scroller></body></atv>';          
            atv.loadXML(atv.parseXML(xml));
        };
        tedUtils.getProgList(f);
    }
}