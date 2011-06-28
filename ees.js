function str_replace(search, replace, subject, count) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Gabriel Paderni
    // +   improved by: Philip Peterson
    // +   improved by: Simon Willison (http://simonwillison.net)
    // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   bugfixed by: Anton Ongson
    // +      input by: Onno Marsman
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    tweaked by: Onno Marsman
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   input by: Oleg Eremeev
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Oleg Eremeev
    // %          note 1: The count parameter must be passed as a string in order
    // %          note 1:  to find a global variable in which the result will be given
    // *     example 1: str_replace(' ', '.', 'Kevin van Zonneveld');
    // *     returns 1: 'Kevin.van.Zonneveld'
    // *     example 2: str_replace(['{name}', 'l'], ['hello', 'm'], '{name}, lars');
    // *     returns 2: 'hemmo, mars'
    var i = 0,
        j = 0,
        temp = '',
        repl = '',
        sl = 0,
        fl = 0,
        f = [].concat(search),
        r = [].concat(replace),
        s = subject,
        ra = Object.prototype.toString.call(r) === '[object Array]',
        sa = Object.prototype.toString.call(s) === '[object Array]';
    s = [].concat(s);
    if (count) {
        this.window[count] = 0;
    }

    for (i = 0, sl = s.length; i < sl; i++) {
        if (s[i] === '') {
            continue;
        }
        for (j = 0, fl = f.length; j < fl; j++) {
            temp = s[i] + '';
            repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
            s[i] = (temp).split(f[j]).join(repl);
            if (count && s[i] !== temp) {
                this.window[count] += (temp.length - s[i].length) / f[j].length;
            }
        }
    }
    return sa ? s : s[0];
}

//endlessEntityStream

// Can't forget my namespace
//var endlessEntityStream = window.endlessEntityStream || {};
function endlessEntityStream(conf) {
    var self = this;
    self.conf = {};
    self.conf.loading = false;
    self.conf.debug = conf.debug || false;
    self.conf.identifier = conf.identifier || 'EES_%id%';
    self.conf.url = conf.url;
    self.conf.count = conf.count;
    self.conf.prevId = conf.initalId;
    self.conf.template = conf.template;
    self.load(conf.startCount);
    $(window).scroll(function(){
        self.check();
    });
}

endlessEntityStream.prototype.setLoading = function(bool) {
    var self = this;
    self.conf.loading = bool ? true : false;
};

endlessEntityStream.prototype.getLoading = function() {
    var self = this;
    return self.conf.loading;
};

endlessEntityStream.prototype.setPrevId = function(prevId) {
    var self = this;
    self.conf.prevId = prevId;
};

endlessEntityStream.prototype.getPrevId = function() {
    var self = this;
    return self.conf.prevId;
};

endlessEntityStream.prototype.load = function(count) {
    var self = this;
    self.setLoading(true);
    url = self.conf.url;
    url = url.replace('%id%',self.conf.prevId);
    url = url.replace('%count%',self.conf.count);
    url = url.replace('%mathrnd%',Math.random().toString().replace('0.',''));
    if(self.conf.debug) {
        console.log('Loading: ' + url);
    }
    $.get(url,
        function(data){
            if (data != "") {
                var entities = $.parseJSON(data);
                for(var entity in entities.shots) {
                    if(self.conf.debug) {
                        console.log('Entity: ' + entities.shots[entity].id);
                    }
                    var identifier = self.conf.identifier.replace('%id%', entities.shots[entity].id);
                    var previousIdentifier = self.conf.identifier.replace('%id%', self.getPrevId());
                    var html = self.conf.template;
                    $.each(entities.shots[entity], function(index,value) {
                        html = str_replace('%' + index + '%', value , html);
                    });
                    html = html.replace('%identifier%', identifier);
                    if(self.conf.debug) {
                        console.log('Entity-HTML: ' + html);
                        console.log('Entity-Identifier: ' + identifier);
                        console.log('Entity-Previous-Identifier: ' + previousIdentifier);
                        console.log('Entity-Previous-Element:');
                        console.log($('#' + previousIdentifier));
                    }
                    $('#' + previousIdentifier).after(html);
                    self.setPrevId(entities.shots[entity].id);
                }
                if(entities.lastShot) {
                    self.setLoading(true);
                } else {
                    self.setLoading(false);
                    self.check();
                }
            }
        }
    );
};

endlessEntityStream.prototype.check = function() {
    var self = this;
    if($(window).scrollTop() == $(document).height() - $(window).height() || ($(window).scrollTop() + 500) >= $(document).height() - $(window).height()) {
        if(!self.getLoading()) {
            self.load(self.count);
        }
    }
};