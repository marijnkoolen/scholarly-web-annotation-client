/*

The TimeUtil is currently only used to generate time related facets for
1. the  FacetSearchComponent.js (based on SearchKit)
2. ElasticSearch dummy queries (see /js/queries)

TODO this function will probably be cleaned up and extended with other (more) useful time related functions

*/
import moment from 'moment';

const TimeUtil = {

    //generates ES year facets (TODO fix this ugly description)
    generateYearAggregation: function(dateField, startYear, endYear) {
        var ranges = [{
            key: "All"
        }];
        if(startYear < endYear) {

            for(let i=startYear;i<endYear;i++) {
                ranges.push({
                    from: new Date(i, 1, 1).getTime(),
                    to: new Date(i + 1, 1, 1).getTime(),
                    key: i + ''
                });
            }
        }
        return {
            ranges: ranges,
            field: dateField
        }
    },

    //FIXME merge this with the other function, they are too alike!
    generateYearAggregationSK: function(startYear, endYear) {
        var ranges = [{
            title: "All"
        }];
        if(startYear < endYear) {

            for(let i=startYear;i<endYear;i++) {
                ranges.push({
                    from: new Date(i, 1, 1).getTime(),
                    to: new Date(i + 1, 1, 1).getTime(),
                    title: i + ''
                });
            }
        }
        return ranges
    },

    formatTime : function(t) {
        if(t == -1) {
            return '00:00:00';
        }
        var pt = moment.duration(t * 1000);
        var h = pt.hours() < 10 ? '0' + pt.hours() : pt.hours();
        var m = pt.minutes() < 10 ? '0' + pt.minutes() : pt.minutes();
        var s = pt.seconds() < 10 ? '0' + pt.seconds() : pt.seconds();
        return h + ':' + m + ':' + s;
    },

    playerPosToMillis : function(sec) {//a double
        return parseInt(sec) * 1000;
    }

}

export default TimeUtil;
