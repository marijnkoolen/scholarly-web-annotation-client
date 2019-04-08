<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="fn owl xs" 
    version="3.0" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:fn="http://www.w3.org/2005/xpath-functions" xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:hi="http://boot.huygens.knaw.nl/vgdemo1/editionannotationontology.ttl#"
    xmlns:vg="http://boot.huygens.knaw.nl/vgdemo1/vangoghannotationontology.ttl#"
    xmlns:owl="http://www.w3.org/2002/07/owl" xmlns:saxon="http://saxon.sf.net/"
    extension-element-prefixes="saxon">

    <xsl:variable name="root" select="."/>
    <xsl:variable name="docuri" select="fn:document-uri()"/>

    <xsl:variable name="processes">
        <processes>
            <process>
                <step path="tei:div[@type='original']" typeofw="vg:Letter" typeofr="hi:EditionText"
                    association="hi:hasRepresentation" matchPattern="([a-z]+).([0-9]+)"
                    replacementPattern="urn:vangogh/letter=$2"
                    replacementPatternr="urn:vangogh/letter=$2:repr=$1"/>
                <step path="tei:ab" typeofw="vg:ParagraphInLetter" typeofr="hi:EditionText"
                    propertyw="hi:hasWorkPart" propertyr="hi:hasTextPart"
                    association="hi:hasRepresentation" matchPattern="([a-z]+).([0-9]+).([0-9]+)"
                    replacementPattern="urn:vangogh/letter=$2:para=$3"
                    replacementPatternr="urn:vangogh/letter=$2:para=$3:repr=$1"
                />
            </process>
            <process>
                <step path="tei:div[@type='translation']" typeofw="vg:Letter"
                    typeofr="vg:TranslatedEditionText" association="hi:hasRepresentation"
                    matchPattern="([a-z]+).([0-9]+)"
                    replacementPattern="urn:vangogh/letter=$2"
                    replacementPatternr="urn:vangogh/letter=$2:repr=$1"/>
                <step path="tei:ab" typeofw="vg:ParagraphInLetter"
                    typeofr="vg:TranslatedEditionText" propertyw="hi:hasWorkPart"
                    propertyr="hi:hasTextPart" association="hi:hasRepresentation"
                    matchPattern="([a-z]+).([0-9]+).([0-9]+)"
                    replacementPattern="urn:vangogh/letter=$2:para=$3"
                    replacementPatternr="urn:vangogh/letter=$2:para=$3:repr=$1"
                />
            </process>
        </processes>
    </xsl:variable>

    <xsl:template match="/">
        <xsl:result-document href="let001plusrdfa.xml" method="xml">
            <xsl:text>&#10;</xsl:text>
<!--            <saxon:doctype>
                <dtd:doctype name="any" xmlns:dtd="http://saxon.sf.net/dtd"
                    xsl:exclude-result-prefixes="dtd">
                    <dtd:entity name="weo">'http://www.example.org/'</dtd:entity>
                </dtd:doctype>
            </saxon:doctype>
            <xsl:text>&#10;</xsl:text>
-->            <xsl:comment><xsl:text>#Generated on </xsl:text>
            <xsl:value-of select="current-dateTime()"/>
            <xsl:text>.</xsl:text>
            <xsl:text>&#10;</xsl:text>
            <xsl:text>From </xsl:text>
            <xsl:value-of select="$docuri"/></xsl:comment>
            <xsl:apply-templates mode="copy"/>
        </xsl:result-document>
    </xsl:template>

    <xsl:template match="@* | node()" mode="copy">
        <xsl:copy>
            <xsl:apply-templates select="@* | node()" mode="copy"/>
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="tei:body" mode="copy">
        <tei:body vocab="http://boot.huygens.knaw.nl/vgdemo1/vangoghannotationontology.ttl#" 
            prefix="hi: http://boot.huygens.knaw.nl/vgdemo1/editionannotationontology.ttl# vg: http://boot.huygens.knaw.nl/vgdemo1/vangoghannotationontology.ttl#">
            <xsl:apply-templates select="@* | node()" mode="copy"/>
        </tei:body>
    </xsl:template>

    <xsl:template match="tei:div" mode="copy">
        <xsl:copy>
            <xsl:apply-templates select="@*" mode="copy"/>
            <xsl:variable name="urls"
                select="
                    vg:expandptr(@xml:id,
                    $processes//process[1]/step[1]/@matchPattern,
                    $processes//process[1]/step[1]/@replacementPattern,
                    $processes//process[1]/step[1]/@replacementPatternr)"/>
            <xsl:attribute name="about">
                <xsl:value-of select="vg:entity-abbrev($urls[1])"/>
            </xsl:attribute>
            <xsl:attribute name="typeof">
                <xsl:choose>
                    <xsl:when test="fn:contains(@xml:id,'original')">
                        <xsl:value-of select="$processes//process[1]/step[1]/@typeofw"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="$processes//process[2]/step[1]/@typeofw"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            <xsl:apply-templates select="descendant::tei:ab" mode="work"/>
            <tei:div>
                <xsl:attribute name="resource">
                    <xsl:value-of select="vg:entity-abbrev($urls[2])"/>
                </xsl:attribute>
                <xsl:attribute name="property">
                    <xsl:value-of select="$processes//process[1]/step[1]/@association"/>
                </xsl:attribute>
                <xsl:attribute name="typeof">
                    <xsl:choose>
                        <xsl:when test="fn:contains(@xml:id,'original')">
                            <xsl:value-of select="$processes//process[1]/step[1]/@typeofr"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="$processes//process[2]/step[1]/@typeofr"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:attribute>
                <xsl:apply-templates select="descendant::tei:ab" mode="repr"/>
                <xsl:apply-templates select="node()" mode="copy"/>
            </tei:div>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="tei:ab[ancestor::tei:div[@type = 'original' or @type = 'translation']]"
        mode="copy">
        <xsl:copy>
            <xsl:apply-templates select="@*" mode="copy"/>
            <xsl:variable name="urls"
                select="
                vg:expandptr(@xml:id,
                $processes//process[1]/step[2]/@matchPattern,
                $processes//process[1]/step[2]/@replacementPattern,
                $processes//process[1]/step[2]/@replacementPatternr)"/>
            <xsl:attribute name="about">
                <xsl:value-of select="vg:entity-abbrev($urls[1])"/>
            </xsl:attribute>
            <xsl:attribute name="typeof">
                <xsl:choose>
                    <xsl:when test="fn:contains(@xml:id,'original')">
                        <xsl:value-of select="$processes//process[1]/step[2]/@typeofw"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="$processes//process[2]/step[2]/@typeofw"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            <tei:seg>
                <xsl:attribute name="resource">
                    <xsl:value-of select="vg:entity-abbrev($urls[2])"/>
                </xsl:attribute>
                <xsl:attribute name="property">
                    <xsl:value-of select="$processes//process[1]/step[1]/@association"/>
                </xsl:attribute>
                <xsl:attribute name="typeof">
                    <xsl:choose>
                        <xsl:when test="fn:contains(@xml:id,'original')">
                            <xsl:value-of select="$processes//process[1]/step[2]/@typeofr"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="$processes//process[2]/step[2]/@typeofr"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:attribute>
                <xsl:apply-templates select="node()" mode="copy"/>
            </tei:seg>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="tei:ab" mode="work">
            <xsl:variable name="urls"
                select="vg:expandptr(@xml:id,
                $processes//process[1]/step[2]/@matchPattern,
                $processes//process[1]/step[2]/@replacementPattern,
                $processes//process[1]/step[2]/@replacementPatternr)"/>
            <tei:seg>
                <xsl:attribute name="resource">
                    <xsl:value-of select="vg:entity-abbrev($urls[1])"/>
                </xsl:attribute>
                <xsl:attribute name="property">
                    <xsl:value-of select="$processes//process[1]/step[2]/@propertyw"/>
                </xsl:attribute>
            </tei:seg>
    </xsl:template>
    
    <xsl:template match="tei:ab" mode="repr">
        <xsl:variable name="urls"
            select="vg:expandptr(@xml:id,
            $processes//process[1]/step[2]/@matchPattern,
            $processes//process[1]/step[2]/@replacementPattern,
            $processes//process[1]/step[2]/@replacementPatternr)"/>
        <tei:seg>
            <xsl:attribute name="resource">
                <xsl:value-of select="vg:entity-abbrev($urls[2])"/>
            </xsl:attribute>
            <xsl:attribute name="property">
                <xsl:value-of select="$processes//process[1]/step[2]/@propertyr"/>
            </xsl:attribute>
        </tei:seg>
    </xsl:template>
    
    <xsl:function name="vg:enclose">
        <xsl:param name="in"/>
        <xsl:text>&lt;</xsl:text>
        <xsl:value-of select="$in"/>
        <xsl:text>&gt;</xsl:text>
    </xsl:function>

    <xsl:function name="vg:unenclose">
        <xsl:param name="in"/>
        <xsl:choose>
            <xsl:when test="fn:starts-with($in, '&lt;') and fn:ends-with($in, '&gt;')">
                <xsl:value-of select="fn:substring($in, 2, fn:string-length($in) - 2)"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$in"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>

    <xsl:function name="vg:entity-abbrev">
        <xsl:param name="in"/>
        <xsl:choose>
            <xsl:when test="fn:starts-with($in, 'http://www.example.org/')">
                <xsl:text>&amp;weo;</xsl:text>
                <xsl:value-of select="fn:substring($in, 24)"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$in"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>

    <xsl:function name="vg:expandptr">
        <xsl:param name="id"/>
        <xsl:param name="mp"/>
        <xsl:param name="rp"/>
        <xsl:param name="rpr"/>
<!--        <xsl:message>
            <xsl:value-of select="$id"/>
            <xsl:text>&#10;</xsl:text>
            <xsl:value-of select="$mp"/>
            <xsl:text>&#10;</xsl:text>
            <xsl:value-of select="$rp"/>
            <xsl:text>&#10;</xsl:text>
            <xsl:value-of select="$rpr"/>
        </xsl:message>-->
        <xsl:variable name="short" select="substring-after($id, '.')"/>
        <xsl:sequence>
            <xsl:value-of select="fn:replace($short, $mp, $rp)"/>
            <xsl:value-of select="fn:replace($short, $mp, $rpr)"/>
        </xsl:sequence>
    </xsl:function>



</xsl:stylesheet>
