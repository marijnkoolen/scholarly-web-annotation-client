<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="xs"
    version="3.0"
    xmlns:vg="http://www.vangoghletters.org/ns/"
    xmlns:tei="http://www.tei-c.org/ns/1.0">
    
    <xsl:include href="expandptrs.xsl"/>

    <xsl:variable name="root" select="."/>

    <xsl:variable name="processes">
        <processes>
            <process>
                <step path="tei:div[@type='original']" typeofw="vg:Letter" typeofr="hi:EditionText" association="hi:hasRepresentation"/>
                <step path="tei:ab" typeofw="vg:ParagraphInLetter" typeofr="hi:EditionText"  propertyw="hi:hasWorkPart" propertyr="hi:hasTextPart" association="hi:hasRepresentation"/>
            </process>
            <process>
                <step path="tei:div[@type='translation']" typeofw="vg:Letter" typeofr="vg:TranslatedEditionText" association="hi:hasRepresentation"/>
                <step path="tei:ab" typeofw="vg:ParagraphInLetter" typeofr="vg:TranslatedEditionText" propertyw="hi:hasWorkPart" propertyr="hi:hasTextPart" association="hi:hasRepresentation"/>
            </process>
        </processes>
    </xsl:variable>
    
    <xsl:template match="/">
        <xsl:result-document href="out.ttl" method="text">
            <xsl:text>#Generated on </xsl:text>
            <xsl:value-of select="current-dateTime()"/>
            <xsl:text>. From </xsl:text>
            <xsl:value-of select="document-uri()"/>
            <xsl:text>
@prefix hi: &lt;http://boot.huygens.knaw.nl/vgdemo1/editionannotationontology.ttl#> .
@prefix vg: &lt;http://boot.huygens.knaw.nl/vgdemo1/vangoghannotationontology.ttl#> .
@prefix rdf: &lt;http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
</xsl:text>
        <xsl:for-each select="$processes//process">
            <xsl:call-template name="process">
                <xsl:with-param name="stepnum" select="1"/>
                <xsl:with-param name="process" select="."/>
                <xsl:with-param name="parentnode" select="$root"/>
            </xsl:call-template>
        </xsl:for-each>
        </xsl:result-document>
    </xsl:template>

    <xsl:template name="process">
        <xsl:param name="process"/>
        <xsl:param name="stepnum"/>
        <xsl:param name="parentnode"/>
        <xsl:param name="parenturis"/>
        <xsl:variable name="startpath">
            <xsl:text>$parentnode//</xsl:text>
            <xsl:value-of select="$process/step[$stepnum]/@path"/>
        </xsl:variable>
        <xsl:variable name="xpathout">
            <xsl:evaluate xpath="$startpath">
                <xsl:with-param name="parentnode" select="$parentnode"/>
            </xsl:evaluate>
        </xsl:variable>
        <xsl:for-each select="$xpathout/*">
            <xsl:variable name="urls" select="vg:expandptrs($root,@ontRef)"/>
            <xsl:call-template name="vg:writettlline">
                <xsl:with-param name="s">
                    <xsl:value-of select="vg:enclose($urls[1])"/>
                </xsl:with-param>
                <xsl:with-param name="p">rdf:type</xsl:with-param>
                <xsl:with-param name="o"><xsl:value-of select="$process/step[$stepnum]/@typeofw"/></xsl:with-param>
            </xsl:call-template>
            <xsl:call-template name="vg:writettlline">
                <xsl:with-param name="s">
                    <xsl:value-of select="vg:enclose($urls[2])"/>
                </xsl:with-param>
                <xsl:with-param name="p">rdf:type</xsl:with-param>
                <xsl:with-param name="o"><xsl:value-of select="$process/step[$stepnum]/@typeofr"/></xsl:with-param>
            </xsl:call-template>
            <xsl:call-template name="vg:writettlline">
                <xsl:with-param name="s">
                    <xsl:value-of select="vg:enclose($urls[1])"/>
                </xsl:with-param>
                <xsl:with-param name="p"><xsl:value-of select="$process/step[$stepnum]/@association"/></xsl:with-param>
                <xsl:with-param name="o"><xsl:value-of select="vg:enclose($urls[2])"/></xsl:with-param>
            </xsl:call-template>
            <xsl:if test="$parenturis">
                <xsl:call-template name="vg:writettlline">
                    <xsl:with-param name="s">
                        <xsl:value-of select="vg:enclose($parenturis[1])"/>
                    </xsl:with-param>
                    <xsl:with-param name="p"><xsl:value-of select="$process/step[$stepnum]/@propertyw"/></xsl:with-param>
                    <xsl:with-param name="o"><xsl:value-of select="vg:enclose($urls[1])"/></xsl:with-param>
                </xsl:call-template>
                <xsl:call-template name="vg:writettlline">
                    <xsl:with-param name="s">
                        <xsl:value-of select="vg:enclose($parenturis[2])"/>
                    </xsl:with-param>
                    <xsl:with-param name="p"><xsl:value-of select="$process/step[$stepnum]/@propertyr"/></xsl:with-param>
                    <xsl:with-param name="o"><xsl:value-of select="vg:enclose($urls[2])"/></xsl:with-param>
                </xsl:call-template>
            </xsl:if>
            <xsl:if test="count($process/step) > $stepnum">
                <xsl:call-template name="process">
                    <xsl:with-param name="stepnum" select="$stepnum + 1"/>
                    <xsl:with-param name="process" select="$process"/>
                    <xsl:with-param name="parentnode" select="."/>
                    <xsl:with-param name="parenturis" select="$urls"/>
                </xsl:call-template>
            </xsl:if>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="vg:writettlline">
        <xsl:param name="s"/>
        <xsl:param name="p"/>
        <xsl:param name="o"/>
        <xsl:text>&#10;</xsl:text>
        <xsl:value-of select="$s"/>
        <xsl:text> </xsl:text>
        <xsl:value-of select="$p"/>
        <xsl:text> </xsl:text>
        <xsl:value-of select="$o"/>
        <xsl:text>.</xsl:text>
    </xsl:template>

    <xsl:function name="vg:enclose">
        <xsl:param name="in"/>
        <xsl:text>&lt;</xsl:text>
        <xsl:value-of select="$in"/>
        <xsl:text>&gt;</xsl:text>
    </xsl:function>

</xsl:stylesheet>