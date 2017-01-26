

const StringUtil = {

    // Functions complementing trim, trimLeft and trimRight
    // for consecutive inline elements
    collapseRightWhitespace : function(text) {
        return text[text.length-1] === " " ? text.replace(/\s+$/, " ") : text;
    },

    collapseLeftWhitespace : function(text) {
        return text[0] === " " ? text.replace(/^\s+/, " ") : text;
    },

    collapse : function(text) {
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

}

export default StringUtil;
