

const StringUtil = {

    // Functions complementing trim, trimLeft and trimRight
    // for consecutive inline elements
    collapseRightWhitespace : function(text) {
        return text[text.length-1] === " " ? text.replace(/\s+$/, " ") : text;
    },

    collapseLeftWhitespace : function(text) {
        return /\s/.test(text[0]) ? text.replace(/^\s+/, " ") : text;
    },

    collapseWhitespace : function(text) {
        return StringUtil.collapseRightWhitespace(StringUtil.collapseLeftWhitespace(text));
    },

    alignRawAndDisplayStrings : function(rawString, displayString) {
        var map = {};
        var rawIndex = 0;
        for (var displayIndex = 0; displayIndex < displayString.length; displayIndex++) {
            let displayChar = displayString[displayIndex];
            if (displayChar === "\n") {
                // skip newline added by display block style
                map[displayIndex] = -1;
                continue;
            }
            var rawChar = rawString[rawIndex];
            while (rawChar !== displayChar && rawIndex < rawString.length) {
                if (displayChar.match(/\s/) && rawChar.match(/\S/)) {
                    break;
                }
                // rawChar is not represented in displayString
                // move to next char in rawString
                rawIndex++;
                rawChar = rawString[rawIndex];
            }
            if (displayChar.match(/\s/) && rawChar.match(/\S/)) {
                // skip whitespace added by display inline style
                map[displayIndex] = -1;
                continue;
            }
            map[displayIndex] = rawIndex;
            rawIndex++;
            if (rawIndex > rawString.length) {
                break;
            }
        }
        var completeAlignment = (Object.keys(map).length === displayString.length) ? true: false;
        return {mapsTo: map, complete: completeAlignment};
    },

    isURL : (string) => {
        var pattern = new RegExp('^(https?:\\/\\/)'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
        'localhost|'+ // OR localhost
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?'+ // port
        '(\\/[-a-z\\d%@_.~+&:]*)*'+ // path
        '(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return pattern.test(string);
    },

};

export default StringUtil;
