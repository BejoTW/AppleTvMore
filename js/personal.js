TVUtils.addFun("personalUtils");
var personalUtils = {
    getJsHeader: function () {
        return '<script src="http://'+ atvDomain + '/js/utils.js" /><script src="http://' + atvDomain + '/js/personal.js" />';
    },
    main: function (t, f) {
        var key = 'profile';
        switch (f) {
            case 'chDBLink':
                personalUtils.chDBLink(key);
                return;
            case 'showInfo':
                personalUtils.showInfo(key);
                return;
            default:
                break;      
        }       
        var psnURL = TVUtils.loGet(key, 'psnURL');
        if(psnURL == null) {
            psnURL = 'http://'+atvDomain+'/pic/';
            TVUtils.loIns(key, 'psnURL', psnURL);
        }
        TVUtils.makeRequest(psnURL, "GET", null, null, function(c) {
            personalUtils.makeContent(psnURL, c); 
        });  
    },
    sanity: function (t) {
        if (/personal/.test(t)) {
            return 1;
        } else {
            return null;
        }
    },
    chDBLink: function (key) {
        textEntry = new atv.TextEntry();
        textEntry.type = 'emailAddress';
        textEntry.instructions = "Enter Your DB Server";
        textEntry.label = 'Address Link';
        textEntry.defaultValue = 'http://';
        textEntry.show();
        textEntry.onSubmit = function (word) {
            var psnURL = word+'/';
            TVUtils.loIns(key, 'psnURL', psnURL);
            atv.loadXML(TVUtils.showMessage({
                title: 'System Notice',
                message: 'DB link change to'+psnURL,
                buttons: [{
                    label: 'OK',
                    script: 'atv.unloadPage()'
                }]
            }));
            return;
        }  
    },
    showInfo: function (key){
        var psnURL = TVUtils.loGet(key, 'psnURL');
        atv.loadXML(TVUtils.showMessage({
                title: 'System Notice',
                message: 'DB link: '+psnURL,
                buttons: [{
                    label: 'OK',
                    script: 'atv.unloadPage()'
                }]
            }));
        return;
    },
    makeContent: function (url, text) {
        // http://domain.com/js/
        var sbase = 'http://'+atvDomain+'/js/';; 
        // http://domain.com/sponsor/advertise/
        var base = url.substring(0, url.lastIndexOf('/') + 1);
        // http://domain.com
        var host = url.substring(0, url.indexOf('/', 8));

        var srtlist = [], filelist = [], posters = '', photos = '', posters_count = 0, photos_count = 0;

        if(text != null) {
            // Split text to blocks
            var blocks = text.split('</tr>');
            if(blocks.length < 2) blocks = text.split('</li>');
            if(blocks.length < 2) blocks = text.split('<br>');
            if(blocks.length < 2) blocks = text.split('\n');

            // Parse dir, file or thumb items
            var dirs = [];
            var files = [];
            var thumbs = [];
            for(var i in blocks) {
                var re = new RegExp('<a href="(.*?)">(.*?)</a>', 'i');
                var rs = re.exec(blocks[i]);
                if(rs) {
                    var href = rs[1];
                    if(href.indexOf(':') == -1) {
                        if(href.charAt(0) == '/') href = host + href;
                        else href = base + href;
                    }

                    if(href.indexOf('.thumb.') != -1) {
                        thumbs.push(href);
                    }
                    else {
                        var name = rs[2].replace(/^\s+/, '').replace(/\s+$/, ''); // Trim prefix and sufix space
                        if((name.charAt(0) != '.') && (name.indexOf('Parent Directory') == -1)) {
                            if(href.charAt(href.length - 1) == '/') {
                                dirs.push([href, name]);
                            }
                            else {
                                files.push([href, name]);
                            }
                        }
                    }
                }
            }           
            var nothumb = false;
            function fetchThumb(thumbs, sbase, href, type) {
                // Fetch image
                var pos = href.lastIndexOf('/');
                var key = (pos != -1) ? href.substring(pos + 1) : href;
                for(var i in thumbs) {
                    if(thumbs[i].indexOf(key) != -1) {
                        return thumbs[i];
                    }
                }
                if(type != 'dir') nothumb = true;
                return type ? (host + '/pic/fileTypeIcon/' + type + '.png') : href;
            }

            function makePoster(thumbs, sbase, id, name, href, type, play, select) {
                // Make poster
                poster = '<moviePoster alwaysShowTitles="true" id="' + type + id + '" onPlay="' + play + '" onSelect="' + select + '">';
                poster += '<title>' + TVUtils.xmlchar(name) + '</title>';
                poster += '<image>' + TVUtils.xmlchar(fetchThumb(thumbs, sbase, href, type)) + '</image>';
                poster += '<defaultImage>resource://Poster.png</defaultImage>';
                poster += '</moviePoster>';
                return poster;
            }

            // Make dir item
            for(var i in dirs) {
                var href = dirs[i][0];
                var name = dirs[i][1];

                var action = 'personalUtils.loadFolder(\'' + TVUtils.xmlchar(href) + '\')';
                if(name.charAt(name.length - 1) == '/') name = name.substring(0, name.length - 1);
                posters += makePoster(thumbs, sbase, ++posters_count, name, href.substring(0, href.length - 1), 'dir', action, action);
            }

            // Make file item
            for(var i in files) {
                var href = files[i][0];
                var name = files[i][1];
                var type = href.substring(href.lastIndexOf('.') + 1).toLowerCase();
                if(type == 'mov' || type == 'mp4' || type == 'm4v' || type == 'mkv' || type == 'mpg' || type == 'avi' || type == 'm3u' || type == 'mp3' || type == 'aac') {
                    filelist.push(href);

                    var pos = name.lastIndexOf('.');
                    if(pos != -1) name = name.substring(0, pos);

                    var play = 'personalUtils.loadFiles(\'' + TVUtils.xmlchar(href) + '\')';
                    var select = 'personalUtils.loadFile(\'' + TVUtils.xmlchar(href) + '\')';
                    posters += makePoster(thumbs, sbase, ++posters_count, name, href, type, play, select);
                }
                else if(type == 'jpg' || type == 'png' || type == 'gif' || type == 'bmp') {
                    var id = type + ++photos_count;
                    photos += '<photo id="' + id + '" onSelect="onPhotoSelection(\'' + id + '\')" onPlay="onSlideshowStart(\'' + id + '\')">';
                    photos += '<assets><photoAsset width="0" height="0" src="' + TVUtils.xmlchar(fetchThumb(thumbs, sbase, href)) + '"/></assets>';
                    photos += '</photo>';
                }
                else if(type == 'srt') {
                    srtlist.push(href);
                }
            }
            // Request for thumbnail on server
            if(nothumb) {
                var uri = url.substring(url.indexOf('/', 8) + 1);
                var pos = uri.indexOf('?');
                if(pos != -1) uri = uri.substring(0, pos);
                pos = uri.indexOf('#');
                if(pos != -1) uri = uri.substring(0, pos);
                TVUtils.makeRequest('http://'+atvDomain+'/CGI/thumb.cgi?' + uri, "GET", null, null, function(d){
                });
            }
        }

        atv.sessionStorage['srtlist'] = srtlist;
        atv.sessionStorage['filelist'] = filelist;
        
        if(photos_count == 0 && posters_count == 0) {
            return TVUtils.err('ERROR:'+'url', 'personal');
        }
        // Geenrate XML
        var body;
        var head = personalUtils.getJsHeader();
        if(photos_count > posters_count) {
            head += '<script src="http://'+atvDomain+'/js/slide.js"/>';
            body = '<mediaBrowser id="browser" gridLayout="mixed">';
            body += '<header><headerWithCountAndButtons><title>' + personalUtils.urlTitle(url) + '</title><count>' + photos_count + '</count>';
            body += '<buttons><actionButton id="slideshow" onSelect="onSettingsSelection()" onPlay="onSlideshowStart()"><title>幻燈片撥放</title></actionButton></buttons>';
            body += '</headerWithCountAndButtons></header><items>' + photos + '</items></mediaBrowser>';
        }
        else {
            body = '<scroller id="scroller"><items><grid columnCount="5" id="grid"><items>' + posters + '</items></grid></items></scroller>';
        }
        return personalUtils.makeXMLtoATV(body, head);
    }, 
    makeXMLtoATV: function (body, head) {
        var xml = '<?xml version="1.0" encoding="UTF-8"?><atv>' + (head ? ('<head>' + head + '</head>') : '') + '<body>' + body + '</body></atv>';
        atv.loadXML(atv.parseXML(xml));
    },
    loadFolder: function (url) {
        TVUtils.makeRequest(url, "GET", null, null, function(d) {
            personalUtils.makeContent(url, d); 
        }); 
    },
    loadFile: function (url, list) {
        function subt(sts) {
            var sa = sts.split(',');
            var sec = sa[0];
            if(sa.length > 1) {
                ml = parseInt(sa[1], 10);
            }
            else ml = 0;
            ta = sec.split(':');
            if(ta.length == 3) {
                secs = parseInt(ta[0], 10) * 3600 + parseInt(ta[1], 10) * 60 + parseInt(ta[2], 10);
            }
            else if(ta.length == 2) {
                secs = parseInt(ta[0], 10) * 60 + parseInt(ta[1], 10);
            }
            else secs = parseInt(ta[0], 10);
            return secs + (ml / 1000.0);
        };

        var pos = url.lastIndexOf('.');
        var key = url.substring(0, pos);
        var srtlist = atv.sessionStorage['srtlist'];
        for(var i in srtlist) {
            var srt = srtlist[i];
            if((pos < srt.length) && (key == srt.substring(0, pos))) {
                TVUtils.makeRequest(srt, "GET", null, null, function(res){
                    var sub = [];
                    if(res) {
                        var lines = res.replace(/\r/g, '').split('\n\n');
                        for(var i = 0; i < lines.length; i++) {
                            var subline = lines[i].split('\n');
                            var subid = subline.shift();
                            if(!subid) continue;
                            var subtime = subline.shift();
                            if(!subtime) continue;
                            var sta = subtime.split('-->');
                            var startt = subt(sta[0]);
                            var endt = subt(sta[1]);
                            var subinfo = subline.join('\n').replace('\\N', '\n');
                            sub.push([subid, startt, endt, subinfo]);
                        }
                    }
                    personalUtils.playFile(url, list, sub);
                });
                return;
            }
        }

        personalUtils.playFile(url, list);
    },
    loadFiles: function (url) {
        var playlist = [];
        var behind = false;
        var filelist = atv.sessionStorage['filelist'];
        
        for(var i in filelist) {
            if(behind) {
                playlist.push(personalUtils.playItem(filelist[i], filelist.length - i));
            }
            else if(filelist[i] === url) {
                behind = true;
            }
        }

        personalUtils.loadFile(url, playlist);
    },
    playFile: function (url, list, sub) {
        var item = personalUtils.playItem(url, list ? (list.length + 1) : 0, sub ? (sub.length + 1) : 0);
        if(sub && sub.length) {
            item['subtitle'] = sub;
        }
        if(list && list.length) {
            item['playlist'] = list;
        }
        atv.loadPlist(item);
        atv.loadXML(TVUtils.showMessage({
                    title: 'LocalStorage',
                    message: '自家資源',
                    buttons: [{
                        label: 'OK',
                        script: 'atv.unloadPage()'
                    }]
                }));
    },
    urlTitle: function (url) {
        var dir = (url.charAt(url.length - 1) == '/');
        if (dir) 
            url = url.substring(0, url.length - 1);
        var title = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1));
        if(!dir) {
            var pos = title.lastIndexOf('.');
            if(pos != -1) {
                title = title.substring(0, pos);
            }
        }
        return title;
    },
    playItem: function (url, list_count, sub_count) {
        var desc = '文字位置：' + decodeURIComponent(url);
        if(sub_count) desc += '\n' + '外掛字幕：' + sub_count + ' 句';
        if(list_count) desc += '\n' + '撥放列表：' + list_count + ' 項';

        var item = {
            type: 'video-asset',
            'media-asset': {
                'media-url': url,
                type: 'http-live-streaming',
                title: personalUtils.urlTitle(url),
                description: desc,
            }
        };
        return item;
    }    
}
