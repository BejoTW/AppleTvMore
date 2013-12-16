TVUtils.addFun("directUtils");
directUtils = {
    getJsHeader: function () {
        return '<script src="http://'+atvDomain+'/js/utils.js"/><script src="http://'+atvDomain+'/js/direct.js"/>';
    },
    main: function (t, f) {
        switch (f) {
            default:
                break;      
        }
        var key = 'profile'
        var chlSrc = TVUtils.loGet(key, 'chlSrc');
        if(chlSrc == null) {
            TVUtils.loIns(key, 'chlSrc', 'http://'+atvDomain+'/chData.txt');
        }
        directUtils.makePage();   
    },
    sanity: function (t) {
        if (/direct/.test(t)) {
            return 1;
        } else {
            return null;
        }
    },
    onPlay: function (url) {
        var xml = '<?xml version="1.0" encoding="UTF-8"?><atv><body><videoPlayer id="'+id_com+'"><httpFileVideoAsset id="show-player"><mediaURL><![CDATA['+url+']]></mediaURL><title></title><description></description></httpFileVideoAsset></videoPlayer></body></atv>';
        atv.loadXML(atv.parseXML(xml));
    },   
    loadPage: function (data) {
        atv.loadXML(atv.parseXML(data));
    },
    
    makePage: function () {
        var body = '';
        var image = '';
        TVUtils.makeRequest(TVUtils.loGet('profile', 'chlSrc'), "GET", null, null, function(data){
            var all = data.split("\n");
            for (var i in all) {
                if (all[i].length <= 1) {
                    break;
                }
                var token = all[i].split(";",3);
                token[1] = TVUtils.xmlchar(token[1]);
                image = 'http://'+atvDomain+'/pic/direct/channel.png';
                if (token[2]&&(token[2].search('none') == -1)) {
                    image = 'http://'+atvDomain+'/pic/direct/'+token[2];
                }
                body += '<sixteenByNinePoster id="sf_0'+i+'" accessibilityLabel="" alwaysShowTitles="true" onSelect="directUtils.onPlay(\''+token[1]+'\')" ><title>'+token[0]+'</title><image>'+image+'</image><defaultImage>resource://16X9.png</defaultImage></sixteenByNinePoster>';
            }
        });
        var xml = '<?xml version="1.0" encoding="UTF-8"?><atv><head>'+directUtils.getJsHeader()+'</head><body><scroller id="'+id_com+'"><items><collectionDivider alignment="left" accessibilityLabel=""><title>摸摸看</title></collectionDivider><grid id="gd_0" columnCount="5"><items>'+body+'</items></grid></items></scroller></body></atv>';
        
        return atv.loadXML(atv.parseXML(xml));
    }
}