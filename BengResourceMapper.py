import requests
import json

class BengResourceMapper():

    def __init__(self, config):
        self.config = config

    def loadResource(self, resourceUrl):
        resp = requests.get(resourceUrl)
        if resp.status_code == 200:
            data = json.loads(resp.text)
            #print json.dumps(data, indent=4, sort_keys=True)
            return self.parseResourceData(data, 'bg:sortdate')
        return None

    def parseResourceData(self, result, currentDateField):
        creativeWorks = self.__extractCreativeWorks(self.formatSearchResult(result))
        creativeWorks['rawData'] = result
        return creativeWorks


    def formatSearchResult(self, result):
        if(result and result['_source']):
            formattedResult = json.loads(json.dumps(result['_source']))
            return formattedResult

        return None

    def __generateURN(self, identifier, type):
        return 'urn:%s:%s' % (type, identifier)


    def __extractCreativeWorks(self, result):
        creativeWorks = {}
        title = None
        genre = None
        broadcaster = None
        partOf = None

        #first check the series
        if 'bga:series' in result:
            series = result['bga:series']
            if 'bg:maintitles' in series and 'bg:title' in series['bg:maintitles']:
                title = ' '.join(series['bg:maintitles']['bg:title'])
            if 'bg:genres' in series and 'bg:genre' in series['bg:genres']:
                genre = series['bg:genres']['bg:genre']

            #add the creative work
            creativeWorks['series'] = {
                'urn' : self.__generateURN(series['dc:identifier'], 'series'),
                'title' : title,
                'genre' : genre
            }

        #then check the season
        if 'bga:season' in result:
            season = result['bga:season']
            if 'bg:maintitles' in season and 'bg:title' in season['bg:maintitles']:
                title = ' '.join(season['bg:maintitles']['bg:title'])

            if 'dcterms:isPartOf' in season and 'dc:identifier' in season['dcterms:isPartOf']:
                partOf = season['dcterms:isPartOf']['dc:identifier']

            #add the creative work
            creativeWorks['season'] = {
                'urn' : self.__generateURN(season['dc:identifier'], 'season'),
                'title' : title,
                'partOf' : partOf
            }

        #then check the program
        if 'bg:maintitles' in result and 'bg:title' in result['bg:maintitles']:
            title = ' '.join(result['bg:maintitles']['bg:title'])
            if 'bg:subtitles' in result and 'bg:title' in result['bg:subtitles']:
                title = '%s - %s' % (title, ' '.join(result['bg:subtitles']['bg:title']))

            if 'bg:genres' in result and 'bg:genre' in result['bg:genres']:
                genre = result['bg:genres']['bg:genre']

            if 'dcterms:isPartOf' in result and 'dc:identifier' in result['dcterms:isPartOf']:
                partOf = result['dcterms:isPartOf']['dc:identifier']

            if 'bg:publications' in result and 'bg:publication' in result['bg:publications']:
                if 'bg:broadcasters' in result['bg:publications']['bg:publication']:
                    broadcaster = result['bg:publications']['bg:publication']['bg:broadcasters']['bg:broadcaster']

            #get the content related metadata
            representations = self.__extractRepresentations(result)

            creativeWorks['program'] = {
                'id' : result['dc:identifier'],
                'urn' : self.__generateURN(result['dc:identifier'], 'program'),
                'title' : title,
                'fullTitle' : self.__extractTitle(result),
                'summary' : self.__extractDescription(result),
                'genre' : genre,
                'broadcaster' : broadcaster,
                'broadcastDate' : self.__extractDate(result, None),
                'partOf' : partOf,
                'source' : self.__extractSourceURL(result),
                'representations' : representations
            }

        return creativeWorks

    def __extractTitle(self, result):
        title = None
        #first check the series title
        if 'bga:series' in result:
            series = result['bga:series']
            if 'bg:maintitles' in series and 'bg:title' in series['bg:maintitles']:
                title = ' / '.join(series['bg:maintitles']['bg:title'])

        #then check the season title
        if 'bga:season' in result:
            season = result['bga:season']
            if 'bg:maintitles' in season and 'bg:title' in season['bg:maintitles']:
                if title:
                    title = title + ' '
                title = '%s%s' % (title, ' / '.join(season['bg:maintitles']['bg:title']))

        #then check the expression title
        if 'bg:maintitles' in result and 'bg:title' in result['bg:maintitles']:
            if title:
                title = title + ': '
            title = '%s%s' % (title, ' / '.join(result['bg:maintitles']['bg:title']))
            if 'bg:subtitles' in result and 'bg:title' in result['bg:subtitles']:
                title = '%s - %s' % (title, ' '.join(result['bg:subtitles']['bg:title']))

        return title

    #if there is a summary return this, otherwise return the broadcaster & genre (if available)
    def __extractDescription(self, result):
        if 'bg:museum-description' in result:
            return result['bg:museum-description']
        elif 'bg:summary' in result:
            return result['bg:summary']
        else:
            return '%s %s' % (result.get('broadcaster', ''), result.get('genre', ''))

        return None

    def __extractDate(self, result, currentDateField):
        if 'bg:publications' in result and 'bg:publication' in result['bg:publications']:
            if currentDateField and currentDateField in result:
                #(apparently) make sure this works for nested fields?
                return result[currentDateField]
            elif 'bg:sortdate' in result['bg:publications']['bg:publication']:
                return result['bg:publications']['bg:publication']['bg:sortdate']

        return None

    def __extractRepresentations(self, result):
        representations = None
        mediaTypes = None

        guci = None
        dmguid = None
        mimeType = 'video/mp4'

        #determine whether the content is radio or not
        if 'bga:series' in result:
            series = result['bga:series']
            if 'bg:distributionchannel' in series and result['bga:series']['bg:distributionchannel'].lower() == 'radio':
                mimeType = 'audio/mp3'
            elif 'bg:catalog' in series and series['bg:catalog'] == 'Foto':
                mimeType = 'image/jpeg'

        #look through the carriers    to fetch the dmguid / guci needed to build the play-out URL
        if 'bg:carriers' in result:
            temp = result['bg:carriers']
            if 'bg:carrier' in temp:
                carriers = temp['bg:carrier']
                if 'bg:carriertype' in carriers:
                    carriers = [carriers]

                #TODO ugly
                tempCarriers = []
                for c in carriers:
                    if 'bg:carriertype' in c and c['bg:carriertype'] == 'media archive':
                        tempCarriers.append(c)
                carriers = tempCarriers

                if len(carriers) > 0:
                    guci = carriers[0]['bg:carrierreference']
                    dmguid = carriers[0]['bg:dmguid']

        #finally assign the results to the representations (also fill in the found media types)
        if mimeType == 'audio/mp3' and dmguid:
            representations = [{
                'source' : '%s/%s' % (self.config['BENG_AUDIO_BASE_URL'], dmguid),
                'mimeType' : mimeType,
                'assetId' : dmguid
            }]
            mediaTypes = ['audio']
        elif mimeType == 'video/mp4' and guci:
            representations = [{
                'source' : '%s/%s' % (self.config['BENG_VIDEO_BASE_URL'], guci),
                'mimeType' : mimeType,
                'assetId' : guci
            }]
            mediaTypes = ['video']
        elif mimeType == 'image/jpeg':
            mediaTypes = ['image']

        return representations

    def __extractSourceURL(self, result):
        if 'dc:relation' in result:
            return result['dc:relation']
        return None
