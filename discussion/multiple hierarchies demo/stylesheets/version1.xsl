<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="xs tei hi"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:hi="http://huygens.knaw.nl/"
    version="2.0"
    extension-element-prefixes="hi">
    
    <xsl:output method="html"/>
    
    <xsl:variable name="dirname" select="concat('version',substring-after(substring-before(base-uri(document('')),'.'),'/version'))"/>
    
    <xsl:template match="/">
        <xsl:apply-templates mode="text" select="//tei:group/tei:text"/>
<!--        <xsl:for-each select="//tei:pb">
            <xsl:apply-templates mode="page"/>
        </xsl:for-each>
-->    </xsl:template>
    
    <xsl:template match="*" mode="text">
        <xsl:number level="any" count="*"/>
        <xsl:apply-templates mode="text"/>
    </xsl:template>
    
    <xsl:template match="tei:l" mode="text">
        <br />
        <span typeof="IgnorableElement" class="verselinenum">
            <xsl:value-of select="@n"/>
        </span>
        <span class="pagelinenum">
            <xsl:variable name="lbs">
                <xsl:choose>
                    <xsl:when test="preceding::tei:l">
                        <xsl:copy-of select="(preceding::tei:l[1]/following::tei:lb[not(ancestor::tei:l)] intersect preceding::tei:lb[not(ancestor::tei:l)])
                                              union descendant::tei:lb"></xsl:copy-of>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:copy-of select="preceding::tei:lb[not(ancestor::tei:l)]
                                            union descendant::tei:lb"></xsl:copy-of>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <xsl:for-each select="$lbs/*">
                <span typeof="PageLine" resource="{hi:urn(.)}">
                    <xsl:value-of select="@n"/>
                </span>
                <xsl:if test="not(position()=last())">
                    <xsl:text>/</xsl:text>
                </xsl:if>
            </xsl:for-each>
        </span>
        <span typeof="Line" property="hasPart" resource="{hi:urn(.)}">
            <xsl:apply-templates/>
        </span>
    </xsl:template>
    
    <xsl:template match="tei:pb" mode="text">
        <span typeof="Page" resource="{hi:urn(.)}" class="pagenum">
            <xsl:text>[</xsl:text>
            <a href="{hi:filename(.)}"><xsl:value-of select="@n"/></a>
            <xsl:text>]</xsl:text>
        </span>
    </xsl:template>
    
    <xsl:template match="tei:text" mode="text">
        <xsl:message>
            <xsl:value-of select="@n"/>
            <xsl:value-of select="hi:filename(.)"/>
        </xsl:message>
        <xsl:result-document href="{hi:fileurl(.)}" encoding="utf-8">
        <html>
            <head>
                <title>RDFa demo, text view</title>
                <link href="text.css" rel="stylesheet" type="text/css"/>
                <script src="https://code.jquery.com/jquery-2.2.4.js"></script>
                <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
                <script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
                <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"/>
            </head>
            <body>
                <h2>RDFa demo, text view, text: <xsl:value-of select="@n"/> </h2>
                <div class="horizontal">
                    <div class="annotation-target-observer">
<!--                        <saxon:assign name="foliumurn">
                            <xsl:text>urn:serrure:folium:</xsl:text>
                            <xsl:value-of select="$n"/>
                        </saxon:assign>
-->                     <div class="text" typeof="Text" vocab="http://boot.huygens.knaw.nl/annotate/mvnontology.ttl#" about="{hi:urn(.)}">
                                <p>
                                <span typeof="IgnorableElement">
                                    <a name="{@xml:id}"/>
                                    <xsl:text> Text </xsl:text>
                                    <xsl:value-of select="@n"/>
                                </span>
                                    <!--<xsl:apply-templates select="." mode="nextprev"/>-->
                                    <xsl:apply-templates mode="text"/>
                                </p>
                    </div>
                    </div>
                    <div class="annotation-viewer" id="annotation-viewer">prut1</div>
                </div>
                <script src="./scholarly-web-annotator.js"></script>
                <script src="./load_annotator.js"></script>
            </body>
        </html>
        </xsl:result-document>
    </xsl:template>
    
    <xsl:function name="hi:fileurl">
        <xsl:param name="node"/>
        <xsl:value-of select="$dirname"/>
        <xsl:text>/</xsl:text>
        <xsl:value-of select="hi:filename($node)"/>
    </xsl:function>
    
    <xsl:function name="hi:filename">
        <xsl:param name="node"/>
        <xsl:value-of select="local-name($node)"/>
        <xsl:text>-</xsl:text>
        <xsl:value-of select="$node/@n"/>
        <xsl:text>.html</xsl:text>
    </xsl:function>
    
    <xsl:function name="hi:urn">
        <xsl:param name="node"/>
        <xsl:variable name="locname" select="local-name($node)"/>
        <xsl:variable name="n" select="$node/@n"/>
        <xsl:text>urn:rdfademo:</xsl:text>
        <xsl:choose>
            <xsl:when test="$locname = 'pb' or $locname = 'lb'">
                <xsl:text>page:</xsl:text>
                <xsl:choose>
                    <xsl:when test="$locname = 'pb'">
                        <xsl:value-of select="$n"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="$node/preceding::tei:pb[1]/@n"/>
                        <xsl:text>:pageline:</xsl:text>
                        <xsl:value-of select="$n"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text>text:</xsl:text>
                <xsl:choose>
                    <xsl:when test="$locname = 'text'">
                        <xsl:value-of select="$n"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="$node/ancestor::tei:text[1]/@n"/>
                        <xsl:text>:verseline:</xsl:text>
                        <xsl:value-of select="$n"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>
    
</xsl:stylesheet>