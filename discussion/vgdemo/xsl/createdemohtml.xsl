<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:vg="http://www.vangoghletters.org/ns/" exclude-result-prefixes="xs" version="2.0">

    <xsl:variable name="letno">
        <xsl:value-of select="//tei:idno[@type = 'jlb']/text()"/>
    </xsl:variable>

    <xsl:template match="/">
        <xsl:apply-templates select="//tei:text">
            <xsl:with-param name="type" select="'align'"/>
        </xsl:apply-templates>
        <xsl:apply-templates select="//tei:text">
            <xsl:with-param name="type" select="'original'"/>
        </xsl:apply-templates>
        <xsl:apply-templates select="//tei:text">
            <xsl:with-param name="type" select="'translated'"/>
        </xsl:apply-templates>
    </xsl:template>

    <xsl:template match="tei:text">
        <xsl:param name="type"/>
        <xsl:result-document href="{concat('../',concat($type,'.html'))}">
            <xsl:variable name="title">
                <xsl:text>Van Gogh letter </xsl:text>
                <xsl:value-of select="$letno"/>
                <xsl:text> - </xsl:text>
                <xsl:value-of select="$type"/>
            </xsl:variable>
            <html>
                <head>
                    <title>
                        <xsl:value-of select="$title"/>
                    </title>
                    <link href="./css/demo.css" rel="stylesheet" type="text/css"/>
                    <script src="https://code.jquery.com/jquery-2.2.4.js"/>
                    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"/>
                    <script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"/>
                    <link rel="stylesheet"
                        href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
                    />
                </head>
                <body>
                    <div class="horizontal">
                        <div class="annotation-target-observer">
                            <div
                                vocab="http://boot.huygens.knaw.nl/vgdemo/vangoghannotationontology.ttl#"
                                prefix="hi: http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#"
                                typeOf="Letter" about="{vg:letterurn()}">
                                <div property="hi:hasRepresentation" typeOf="{vg:typeofbytype($type)}" resource="{vg:texturn($type)}">
                                    <h1>
                                        <xsl:value-of select="$title"/>
                                    </h1>
                                    <h1>
                                        <xsl:value-of select="//tei:titleStmt/tei:title"/>
                                    </h1>
                                    <p>Versions: <a href="align.html">aligned</a> - <a
                                            href="original.html">original</a> - <a
                                            href="translated.html">translated</a>
                                    </p>
                                    <div class="content">
                                        <xsl:apply-templates>
                                            <xsl:with-param name="type" select="$type"/>
                                        </xsl:apply-templates>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="annotation-viewer" id="annotation-viewer">prut1</div>
                        <script src="./scholarly-web-annotator.js"/>
                        <script src="./load_annotator.js"/>
                    </div>
                </body>
            </html>
        </xsl:result-document>
    </xsl:template>

    <xsl:template match="vg:whiteline">
        <br/>
    </xsl:template>

    <xsl:template match="tei:c">
        <xsl:param name="type"/>
        <xsl:choose>
            <xsl:when test="$type = 'align'">
                <xsl:choose>
                    <xsl:when test="@type = 'kk'">
                        <subs>/</subs>
                    </xsl:when>
                    <xsl:when test="@type = 'kp'">_</xsl:when>
                    <xsl:when test="@type = 'shy'">-</xsl:when>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <xsl:choose>
                    <xsl:when test="@type = 'kk'">,</xsl:when>
                    <xsl:when test="@type = 'kp'">.</xsl:when>
                </xsl:choose>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="tei:lb">
        <xsl:param name="type"/>
        <xsl:if test="$type = 'align'">
            <xsl:text>
</xsl:text>
            <br/>
            <span class="linenumber">
                <xsl:number level="any" count="tei:lb"/>
            </span>
        </xsl:if>
    </xsl:template>

    <xsl:template match="tei:pb">
        <xsl:param name="type"/>
        <xsl:if test="$type = 'align'">
            <br/>
            <span class="linenumber">
                <xsl:number level="single" count="tei:lb"/>
            </span>
        </xsl:if>
        <span class="pagenumber">[<xsl:value-of select="@f"/>:<xsl:value-of select="@n"/>]</span>
    </xsl:template>

    <xsl:template match="tei:ab">
        <xsl:param name="type"/>
        <span class="para" typeOf="EditionText" property="hasTextPart">
            <xsl:attribute name="resource">
                <xsl:call-template name="paraurntext">
                    <xsl:with-param name="type" select="$type"/>
                </xsl:call-template>
            </xsl:attribute>
            <!--<span property="hi:isTextPartOf" resource="{vg:texturn($type)}"/>-->
            <span typeOf="ParagraphInLetter" property="hi:isRepresentationOf">
                <xsl:attribute name="resource">
                    <xsl:call-template name="paraurn">
                        <xsl:with-param name="type" select="$type"/>
                    </xsl:call-template>
                </xsl:attribute>
                <span resource="{vg:letterurn()}">
                    <span property="hi:hasWorkPart">
                        <xsl:attribute name="resource">
                            <xsl:call-template name="paraurn">
                                <xsl:with-param name="type" select="$type"/>
                            </xsl:call-template>
                        </xsl:attribute>
                    </span>
                </span>
                <xsl:apply-templates>
                    <xsl:with-param name="type" select="$type"/>
                </xsl:apply-templates>
            </span>
        </span>
        <!--<xsl:if test="not($type = 'align')">
            <br/>
        </xsl:if>-->
    </xsl:template>

    <xsl:template match="tei:div">
        <xsl:param name="type"/>
        <xsl:choose>
            <xsl:when test="$type = 'translated' and @type = 'translation'">
                <p>
                    <xsl:apply-templates>
                        <xsl:with-param name="type" select="$type"/>
                    </xsl:apply-templates>
                </p>
            </xsl:when>
            <xsl:when test="($type = 'align' or $type = 'original') and @type = 'original'">
                <p>
                    <xsl:apply-templates>
                        <xsl:with-param name="type" select="$type"/>
                    </xsl:apply-templates>
                </p>
            </xsl:when>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="*">
        <xsl:param name="type"/>
        <xsl:apply-templates>
            <xsl:with-param name="type" select="$type"/>
        </xsl:apply-templates>
    </xsl:template>

    <xsl:function name="vg:letterurn">
        <xsl:text>urn:vangogh:letter:</xsl:text>
        <xsl:value-of select="$letno"/>
    </xsl:function>

    <xsl:function name="vg:texturn">
        <xsl:param name="type"/>
        <xsl:value-of select="vg:letterurn()"/>
        <xsl:text>.</xsl:text>
        <xsl:value-of select="vg:texturnfrag($type)"/>
    </xsl:function>

    <xsl:function name="vg:texturnfrag">
        <xsl:param name="type"/>
        <xsl:choose>
            <xsl:when test="$type = 'align'">transcript</xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$type"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>
    
    <xsl:function name="vg:typeofbytype">
        <xsl:param name="type"/>
        <xsl:choose>
            <xsl:when test="$type = 'align'">EditionTranscript</xsl:when>
            <xsl:when test="$type = 'original'">EditionText</xsl:when>
            <xsl:when test="$type = 'translated'">TranslatedEditionText</xsl:when>
        </xsl:choose>
    </xsl:function>
    
    <xsl:template name="paraurn">
        <xsl:param name="type"/>
        <xsl:value-of select="vg:letterurn()"/>
        <xsl:text>.para.</xsl:text>
        <xsl:variable name="num"><xsl:number level="any" count="tei:ab"/></xsl:variable>
        <xsl:choose>
            <xsl:when test="$type='translated'"><xsl:value-of select="$num -  count(//tei:ab[not(ancestor::tei:div[@type='notes'])]) div 2"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="$num"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="paraurntext">
        <xsl:param name="type"/>
        <xsl:value-of select="vg:letterurn()"/>
        <xsl:text>.para.</xsl:text>
        <xsl:variable name="num"><xsl:number level="any" count="tei:ab"/></xsl:variable>
        <xsl:choose>
            <xsl:when test="$type='translated'"><xsl:value-of select="$num -  count(//tei:ab[not(ancestor::tei:div[@type='notes'])]) div 2"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="$num"/></xsl:otherwise>
        </xsl:choose>
        <xsl:text>.</xsl:text>
        <xsl:value-of select="vg:texturnfrag($type)"/>
    </xsl:template>
    
</xsl:stylesheet>
