<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:vg="http://www.vangoghletters.org/ns/" exclude-result-prefixes="xs" version="2.0">

    <xsl:variable name="letno">
        <xsl:value-of select="//tei:idno[@type = 'jlb']/text()"/>
    </xsl:variable>
    
    <xsl:variable name="representations">
        <root>
            <option value="align"/>
            <option value="original"/>
            <option value="translated"/>
        </root>
    </xsl:variable>

    <xsl:variable name="annotatables">
        <root>
            <option value="repr"/>
            <option value="work"/>
            <option value="reprpluswork"/>
        </root>
    </xsl:variable>
    
    <xsl:template match="/">
        <xsl:variable name="current" select="."/>
        <xsl:for-each select="$representations//option">
            <xsl:message>repr <xsl:value-of select="@value"/></xsl:message>
            <xsl:variable name="representation" select="@value"/>
            <xsl:for-each select="$annotatables//option">
                <xsl:apply-templates select="$current//tei:text">
                    <xsl:with-param name="type" select="$representation"/>
                    <xsl:with-param name="annotatable" select="@value"/>
                </xsl:apply-templates>
            </xsl:for-each>
        </xsl:for-each>
<!--        <xsl:apply-templates select="//tei:text">
            <xsl:with-param name="type" select="'align'"/>
        </xsl:apply-templates>
        <xsl:apply-templates select="//tei:text">
            <xsl:with-param name="type" select="'original'"/>
        </xsl:apply-templates>
        <xsl:apply-templates select="//tei:text">
            <xsl:with-param name="type" select="'translated'"/>
        </xsl:apply-templates>
-->    </xsl:template>

    <xsl:template match="tei:text">
        <xsl:param name="type"/>
        <xsl:param name="annotatable"/>
        <xsl:message>type <xsl:value-of select="$type"/></xsl:message>
        <xsl:message>annotatable <xsl:value-of select="$annotatable"/></xsl:message>
        <xsl:variable name="href">
            <xsl:text>../</xsl:text>
            <xsl:value-of select="$annotatable"/>
            <xsl:text>/</xsl:text>
            <xsl:value-of select="$type"/>
            <xsl:text>.html</xsl:text>
        </xsl:variable>
        <xsl:result-document href="{$href}">
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
                    <link href="../css/demo.css" rel="stylesheet" type="text/css"/>
                    <link rel="stylesheet" href="../dist/swac.css"/>
                    <xsl:if test="$annotatable='reprpluswork'">
                        <link rel="alternate" type="text/n3" href="{concat($type,'.ttl')}"/>
                    </xsl:if>
                </head>
                <body>
                    <div class="horizontal">
                        <div class="annotation-target-observer">
                            <div>
                                <div>
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
                                    <p>Annotatable:
                                        <xsl:for-each select="$annotatables//option">
                                            <a>
                                                <xsl:attribute name="href">
                                                    <xsl:text>../</xsl:text>
                                                    <xsl:value-of select="@value"/>
                                                    <xsl:text>/</xsl:text>
                                                    <xsl:value-of select="$type"/>
                                                    <xsl:text>.html</xsl:text>
                                                </xsl:attribute>
                                                <xsl:value-of select="@value"/>
                                            </a>
                                            <xsl:if test="position() &lt; last()">
                                                <xsl:text> - </xsl:text>
                                            </xsl:if>
                                        </xsl:for-each>
                                    </p>
                                    <div class="content"
                                        vocab="http://boot.huygens.knaw.nl/vgdemo/vangoghannotationontology.ttl#"
                                        prefix="hi: http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#">
                                        <xsl:attribute name="typeOf">
                                            <xsl:choose>
                                                <xsl:when test="$annotatable='work'">
                                                    <xsl:text>Letter</xsl:text>
                                                </xsl:when>
                                                <xsl:otherwise>
                                                    <xsl:value-of select="vg:typeofbytype($type)"/>
                                                </xsl:otherwise>
                                            </xsl:choose>
                                        </xsl:attribute>
                                        <xsl:attribute name="resource">
                                            <xsl:choose>
                                                <xsl:when test="$annotatable='work'">
                                                    <xsl:value-of select="vg:letterurn()"/>
                                                </xsl:when>
                                                <xsl:otherwise>
                                                    <xsl:value-of select="vg:texturn($type)"/>
                                                </xsl:otherwise>
                                            </xsl:choose>
                                        </xsl:attribute>
                                        <xsl:apply-templates>
                                            <xsl:with-param name="type" select="$type"/>
                                            <xsl:with-param name="annotatable" select="$annotatable"/>
                                        </xsl:apply-templates>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="annotation-viewer" id="swac-viewer">prut1</div>
                        <script src="../load_annotator.js"/>
                    </div>
                    <script src="../dist/vendor.js"></script>
                    <script src="../dist/swac.js"></script>                </body>
            </html>
        </xsl:result-document>
        <xsl:if test="$annotatable='reprpluswork'">
            <xsl:variable name="ttlhref">
                <xsl:text>../</xsl:text>
                <xsl:value-of select="$annotatable"/>
                <xsl:text>/</xsl:text>
                <xsl:value-of select="$type"/>
                <xsl:text>.ttl</xsl:text>
            </xsl:variable>
            <xsl:result-document href="{$ttlhref}" method="text">
                <xsl:text>
@prefix hi: &lt;http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#> .
@prefix vg: &lt;http://boot.huygens.knaw.nl/vgdemo/vangoghannotationontology.ttl#> .
@prefix rdf: &lt;http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
                </xsl:text>
                <xsl:call-template name="vg:writettlline">
                    <xsl:with-param name="s">
                        <xsl:value-of select="vg:enclose(vg:letterurn())"/>
                    </xsl:with-param>
                    <xsl:with-param name="p">rdf:type</xsl:with-param>
                    <xsl:with-param name="o">vg:Letter</xsl:with-param>
                </xsl:call-template>
                <xsl:call-template name="vg:writettlline">
                    <xsl:with-param name="s">
                        <xsl:value-of select="vg:enclose(vg:letterurn())"/>
                    </xsl:with-param>
                    <xsl:with-param name="p">hi:hasRepresentation</xsl:with-param>
                    <xsl:with-param name="o">
                        <xsl:value-of select="vg:enclose(vg:texturn($type))"/>
                    </xsl:with-param>
                </xsl:call-template>
                <xsl:apply-templates mode="rdf">
                    <xsl:with-param name="type" select="$type"/>
                </xsl:apply-templates>
            </xsl:result-document>
        </xsl:if>
    </xsl:template>

    <xsl:template match="vg:whiteline">
        <br/>
    </xsl:template>

    <xsl:template match="tei:ab">
        <xsl:param name="type"/>
        <xsl:param name="annotatable"/>
        <span class="para" typeOf="" property="hasTextPart">
            <xsl:attribute name="typeOf">
                <xsl:choose>
                    <xsl:when test="$annotatable='work'">
                        <xsl:text>ParagraphInLetter</xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:text>EditionText</xsl:text>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            <xsl:attribute name="property">
                <xsl:choose>
                    <xsl:when test="$annotatable='work'">
                        <xsl:text>hi:hasWorkPart</xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:text>hasTextPart</xsl:text>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            <xsl:attribute name="resource">
                <xsl:choose>
                    <xsl:when test="$annotatable='work'">
                        <xsl:call-template name="paraurn">
                            <xsl:with-param name="type" select="$type"/>
                        </xsl:call-template>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:call-template name="paraurntext">
                            <xsl:with-param name="type" select="$type"/>
                        </xsl:call-template>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            <xsl:apply-templates>
                <xsl:with-param name="type" select="$type"/>
                <xsl:with-param name="annotatable" select="$annotatable"/>
            </xsl:apply-templates>
        </span>
        <!--<xsl:if test="not($type = 'align')">
            <br/>
        </xsl:if>-->
    </xsl:template>
    
    <xsl:template match="tei:ab" mode="rdf">
        <xsl:param name="type"/>
        <xsl:variable name="paraurn">
            <xsl:call-template name="paraurn">
                <xsl:with-param name="type" select="$type"/>
            </xsl:call-template>
        </xsl:variable>
        <xsl:variable name="paraurntext">
            <xsl:call-template name="paraurntext">
                <xsl:with-param name="type" select="$type"/>
            </xsl:call-template>
        </xsl:variable>
        <xsl:call-template name="vg:writettlline">
            <xsl:with-param name="s">
                <xsl:value-of select="vg:enclose($paraurn)"/>
            </xsl:with-param>
            <xsl:with-param name="p">rdf:type</xsl:with-param>
            <xsl:with-param name="o">ParagraphInLetter</xsl:with-param>
        </xsl:call-template>
        <xsl:call-template name="vg:writettlline">
            <xsl:with-param name="s">
                <xsl:value-of select="vg:enclose($paraurn)"/>
            </xsl:with-param>
            <xsl:with-param name="p">hi:hasRepresentation</xsl:with-param>
            <xsl:with-param name="o">
                <xsl:value-of select="vg:enclose($paraurntext)"/>
            </xsl:with-param>
        </xsl:call-template>
        <xsl:call-template name="vg:writettlline">
            <xsl:with-param name="s">
                <xsl:value-of select="vg:enclose(vg:letterurn())"/>
            </xsl:with-param>
            <xsl:with-param name="p">hi:hasWorkPart</xsl:with-param>
            <xsl:with-param name="o">
                <xsl:value-of select="vg:enclose($paraurn)"/>
            </xsl:with-param>
        </xsl:call-template>
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

    <xsl:template match="tei:div">
        <xsl:param name="type"/>
        <xsl:param name="annotatable"/>
        <xsl:choose>
            <xsl:when test="$type = 'translated' and @type = 'translation'">
                <p>
                    <xsl:apply-templates>
                        <xsl:with-param name="type" select="$type"/>
                        <xsl:with-param name="annotatable" select="$annotatable"/>
                    </xsl:apply-templates>
                </p>
            </xsl:when>
            <xsl:when test="($type = 'align' or $type = 'original') and @type = 'original'">
                <p>
                    <xsl:apply-templates>
                        <xsl:with-param name="type" select="$type"/>
                        <xsl:with-param name="annotatable" select="$annotatable"/>
                    </xsl:apply-templates>
                </p>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="tei:div" mode="rdf">
        <xsl:param name="type"/>
        <xsl:param name="annotatable"/>
        <xsl:if test="($type = 'translated' and @type = 'translation')
            or (($type = 'align' or $type = 'original') and @type = 'original')">
            <xsl:apply-templates mode="rdf">
                <xsl:with-param name="type" select="$type"/>
                <xsl:with-param name="annotatable" select="$annotatable"/>
            </xsl:apply-templates>
        </xsl:if>
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
        <span typeof="hi:ignorableElement" class="pagenumber">[<xsl:value-of select="@f"/>:<xsl:value-of select="@n"/>]</span>
    </xsl:template>
    
    <xsl:template match="tei:rs[@type='pers']">
        <xsl:param name="type"/>
        <xsl:param name="annotatable"/>
        <a href="http://vangoghletters.org/vg/persons.html" typeof="hi:ignorableTag" >
            <xsl:apply-templates>
                <xsl:with-param name="type" select="$type"/>
                <xsl:with-param name="annotatable" select="$annotatable"/>
            </xsl:apply-templates>
        </a>
    </xsl:template>

    <xsl:template match="tei:supplied">
        <xsl:param name="type"/>
        <xsl:param name="annotatable"/>
        <span typeOf="hi:ignorableElement">[</span>
        <xsl:apply-templates mode="rdf">
            <xsl:with-param name="type" select="$type"/>
            <xsl:with-param name="annotatable" select="$annotatable"/>
        </xsl:apply-templates>
        <span typeOf="hi:ignorableElement">]</span>
    </xsl:template>
    
    <xsl:template match="*">
        <xsl:param name="type"/>
        <xsl:param name="annotatable"/>
        <xsl:apply-templates>
            <xsl:with-param name="type" select="$type"/>
            <xsl:with-param name="annotatable" select="$annotatable"/>
        </xsl:apply-templates>
    </xsl:template>

    <xsl:template match="*" mode="rdf">
        <xsl:param name="type"/>
        <xsl:apply-templates mode="rdf">
            <xsl:with-param name="type" select="$type"/>
        </xsl:apply-templates>
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
