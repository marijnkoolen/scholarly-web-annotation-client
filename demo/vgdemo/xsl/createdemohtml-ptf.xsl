<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:vg="http://www.vangoghletters.org/ns/" exclude-result-prefixes="xs" version="2.0">

    <xsl:include href="service.xsl"/>
    <xsl:include href="writerdf.xsl"/>
    
    <xsl:variable name="letno">
        <xsl:value-of select="//tei:idno[@type = 'jlb']/text()"/>
    </xsl:variable>
    
    <xsl:variable name="configurations">
        <root>
            <configuration display="align" annotatable="docpluswork"/>
            <configuration display="align" annotatable="work"/>
            <configuration display="original" annotatable="work"/>
            <configuration display="original" annotatable="reprpluswork"/>
            <configuration display="original" annotatable="repr"/>
            <configuration display="translated" annotatable="work"/>
            <configuration display="translated" annotatable="reprpluswork"/>
            <configuration display="translated" annotatable="repr"/>
        </root>
    </xsl:variable>
    
    <xsl:template match="/">
        <xsl:variable name="currentdoc" select="."/>
        <xsl:variable name="currentplus">
            <xsl:apply-templates mode="preprocess"/>
        </xsl:variable>
        <xsl:result-document href="currentplus.xml" method="xml">
            <xsl:copy-of select="$currentplus"/>
        </xsl:result-document>
        <xsl:for-each select="$configurations//configuration">
            <xsl:apply-templates select="$currentplus//tei:text">
                <xsl:with-param name="configuration" select="."/>
            </xsl:apply-templates>
        </xsl:for-each>
    </xsl:template>

    <xsl:template match="tei:text">
        <xsl:param name="configuration"/>
        <xsl:message>display <xsl:value-of select="$configuration/@display"/></xsl:message>
        <xsl:message>annotatable <xsl:value-of select="$configuration/@annotatable"/></xsl:message>
        <xsl:variable name="href">
            <xsl:text>../</xsl:text>
            <xsl:value-of select="$configuration/@annotatable"/>
            <xsl:text>/</xsl:text>
            <xsl:value-of select="$configuration/@display"/>
            <xsl:text>.html</xsl:text>
        </xsl:variable>
        <xsl:result-document href="{$href}">
            <xsl:variable name="title">
                <xsl:text>Van Gogh letter </xsl:text>
                <xsl:value-of select="$letno"/>
                (<xsl:value-of select="$configuration/@display"/>,
                <xsl:value-of select="$configuration/@annotatable"/>)
            </xsl:variable>
            <html>
                <head>
                    <title>
                        <xsl:value-of select="$title"/>
                    </title>
                    <link href="../css/demo.css" rel="stylesheet" type="text/css"/>
                    <link rel="stylesheet" href="../dist/swac.css"/>
                    <xsl:if test="$configuration/@annotatable='reprpluswork' or ($configuration/@display='align' and $configuration/@annotatable='docpluswork')">
                        <link rel="alternate" type="text/n3" href="{concat($configuration/@display,'.ttl')}"/>
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
                                    <xsl:if test="not($configuration/@annotatable = 'docpluswork')">
                                        <p>Displays with this annotation level: 
                                            <xsl:if test="$configuration/@annotatable = 'work'">
                                                <a href="align.html">aligned</a> -     
                                            </xsl:if>
                                            <a href="original.html">original</a> - <a
                                                href="translated.html">translated</a>
                                        </p>
                                    </xsl:if>
                                    <xsl:variable name="curdisplay" select="$configuration/@display"/>
                                    <p>Annotatable versions of this display:
                                        <xsl:for-each select="$configurations//configuration[@display = $curdisplay]">
                                            <a>
                                                <xsl:attribute name="href">
                                                    <xsl:text>../</xsl:text>
                                                    <xsl:value-of select="@annotatable"/>
                                                    <xsl:text>/</xsl:text>
                                                    <xsl:value-of select="$curdisplay"/>
                                                    <xsl:text>.html</xsl:text>
                                                </xsl:attribute>
                                                <xsl:value-of select="@annotatable"/>
                                            </a>
                                            <xsl:if test="position() &lt; last()">
                                                <xsl:text> - </xsl:text>
                                            </xsl:if>
                                        </xsl:for-each>
                                    </p>
                                    <div class="content"
                                        vocab="http://boot.huygens.knaw.nl/vgdemo/vangoghannotationontology.ttl#"
                                        prefix="hi: http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#
                                            efrbroo: http://erlangen-crm.org/efrbroo/">
                                        <xsl:attribute name="typeof">
                                            <xsl:choose>
                                                <xsl:when test="$configuration/@annotatable='work' or $configuration/@annotatable='docpluswork'">
                                                    <xsl:text>Letter</xsl:text>
                                                </xsl:when>
                                                <xsl:otherwise>
                                                    <xsl:value-of select="vg:typeofbytype($configuration)"/>
                                                </xsl:otherwise>
                                            </xsl:choose>
                                        </xsl:attribute>
                                        <xsl:attribute name="resource">
                                            <xsl:choose>
                                                <xsl:when test="$configuration/@annotatable='work'">
                                                    <xsl:value-of select="vg:letterurn()"/>
                                                </xsl:when>
                                                <xsl:otherwise>
                                                    <xsl:value-of select="vg:texturn($configuration)"/>
                                                </xsl:otherwise>
                                            </xsl:choose>
                                        </xsl:attribute>
                                        <xsl:apply-templates>
                                            <xsl:with-param name="configuration" select="$configuration"/>
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
        <xsl:if test="$configuration/@annotatable='reprpluswork' or $configuration/@annotatable='docpluswork'">
            <xsl:variable name="ttlhref">
                <xsl:text>../</xsl:text>
                <xsl:value-of select="$configuration/@annotatable"/>
                <xsl:text>/</xsl:text>
                <xsl:value-of select="$configuration/@display"/>
                <xsl:text>.ttl</xsl:text>
            </xsl:variable>
            <xsl:result-document href="{$ttlhref}" method="text">
                <xsl:text>
@prefix hi: &lt;http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#> .
@prefix vg: &lt;http://boot.huygens.knaw.nl/vgdemo/vangoghannotationontology.ttl#> .
@prefix rdf: &lt;http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix efrbroo: &lt;http://erlangen-crm.org/efrbroo/> .
                </xsl:text>
                <xsl:call-template name="vg:writettlline">
                    <xsl:with-param name="s">
                        <xsl:value-of select="vg:enclose(vg:letterurn())"/>
                    </xsl:with-param>
                    <xsl:with-param name="p">rdf:type</xsl:with-param>
                    <xsl:with-param name="o">vg:Letter</xsl:with-param>
                </xsl:call-template>
                <xsl:choose>
                    <xsl:when test="$configuration/@annotatable='reprpluswork'">
                        <xsl:call-template name="vg:writettlline">
                            <xsl:with-param name="s">
                                <xsl:value-of select="vg:enclose(vg:letterurn())"/>
                            </xsl:with-param>
                            <xsl:with-param name="p">hi:hasRepresentation</xsl:with-param>
                            <xsl:with-param name="o">
                                <xsl:value-of select="vg:enclose(vg:texturn($configuration))"/>
                            </xsl:with-param>
                        </xsl:call-template>
                    </xsl:when>
                    <xsl:otherwise> <!--i.e.: docpluswork + align--> 
<!--                        <xsl:call-template name="vg:writettlline">
                            <xsl:with-param name="s">
                                <xsl:value-of select="vg:enclose(vg:letterurn())"/>
                            </xsl:with-param>
                            <xsl:with-param name="p">hi:hasRepresentation</xsl:with-param>
                            <xsl:with-param name="o">
                                <xsl:value-of select="vg:enclose(vg:texturn($configuration/@display))"/>
                            </xsl:with-param>
                        </xsl:call-template>
-->                        <xsl:variable name="docurn">
                            <xsl:value-of select="vg:letterurn()"/>
                            <xsl:text>:doc=0</xsl:text>
                        </xsl:variable>
                        <xsl:call-template name="vg:writettlline">
                            <xsl:with-param name="s">
                                <xsl:value-of select="vg:enclose($docurn)"/>
                            </xsl:with-param>
                            <xsl:with-param name="p">rdf:type</xsl:with-param>
                            <xsl:with-param name="o">hi:Document</xsl:with-param>
                        </xsl:call-template>
                        <xsl:variable name="curnode" select="."/>
                        <xsl:for-each select="distinct-values(descendant::tei:pb/@f)">
                            <xsl:variable name="fol" select="."/>
                            <xsl:variable name="sheeturn">
                                <xsl:value-of select="$docurn"/>
                                <xsl:text>:sheet=</xsl:text>
                                <xsl:value-of select="$fol"/>
                            </xsl:variable>
                            <xsl:call-template name="vg:writettlline">
                                <xsl:with-param name="s">
                                    <xsl:value-of select="vg:enclose($sheeturn)"/>
                                </xsl:with-param>
                                <xsl:with-param name="p">rdf:type</xsl:with-param>
                                <xsl:with-param name="o">hi:DocumentZone</xsl:with-param>
                            </xsl:call-template>
                            <xsl:call-template name="vg:writettlline">
                                <xsl:with-param name="s">
                                    <xsl:value-of select="vg:enclose($docurn)"/>
                                </xsl:with-param>
                                <xsl:with-param name="p">hi:hasDocPart</xsl:with-param>
                                <xsl:with-param name="o" select="vg:enclose($sheeturn)"/>
                            </xsl:call-template>
                            <xsl:for-each select="$curnode//tei:pb[@f=$fol]">
                                <xsl:variable name="pageurn">
                                    <xsl:call-template name="pageurn"/>
                                </xsl:variable>
                                <xsl:call-template name="vg:writettlline">
                                    <xsl:with-param name="s">
                                        <xsl:value-of select="vg:enclose($sheeturn)"/>
                                    </xsl:with-param>
                                    <xsl:with-param name="p">hi:hasDocPart</xsl:with-param>
                                    <xsl:with-param name="o" select="vg:enclose($pageurn)"/>
                                </xsl:call-template>
                            </xsl:for-each>
                        </xsl:for-each>
                    </xsl:otherwise>
                </xsl:choose>
                <xsl:apply-templates mode="rdf">
                    <xsl:with-param name="configuration" select="$configuration"/>
                </xsl:apply-templates>
            </xsl:result-document>
        </xsl:if>
    </xsl:template>

    <xsl:template match="vg:whiteline">
        <br/>
    </xsl:template>

    <xsl:template match="tei:ab">
        <xsl:param name="configuration"/>
        <span class="para">
            <xsl:attribute name="typeof">
                <xsl:choose>
                    <xsl:when test="$configuration/@annotatable='work'">
                        <xsl:text>ParagraphInLetter</xsl:text>
                    </xsl:when>
                    <xsl:when test="$configuration/@display='align'">
                        <xsl:text>hi:PositionedTextFrag</xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:text>EditionText</xsl:text>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            <xsl:attribute name="property">
                <xsl:choose>
                    <xsl:when test="$configuration/@annotatable='work'">
                        <xsl:text>hi:hasWorkPart</xsl:text>
                    </xsl:when>
                    <xsl:when test="$configuration/@annotatable='docpluswork'">
                        <xsl:text>efrbroo:R15_has_fragment</xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:text>hi:hasTextPart</xsl:text>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            <xsl:attribute name="resource">
                <xsl:choose>
                    <xsl:when test="$configuration/@annotatable='work'">
                        <xsl:call-template name="paraurn">
                            <xsl:with-param name="configuration" select="$configuration"/>
                        </xsl:call-template>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:call-template name="paraurntext">
                            <xsl:with-param name="configuration" select="$configuration"/>
                        </xsl:call-template>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            <xsl:choose>
                <xsl:when test="$configuration/@annotatable = 'docpluswork'"> 
                    <xsl:variable name="curnode" select="."/>
                    <xsl:for-each select="distinct-values(.//tei:seg/@lb)">
                        <xsl:variable name="line" select="."/>
                        <xsl:message><xsl:value-of select="$line"/></xsl:message>
                        <xsl:variable name="lb" select="$curnode/id($line,$curnode)"/>
                        <xsl:apply-templates select="$lb">
                            <xsl:with-param name="configuration" select="$configuration"/>
                            <xsl:with-param name="ptfmode" select="true()"/>
                        </xsl:apply-templates>
                        <span>
                            <xsl:variable name="lineurntranscr">
<!--                                <xsl:for-each select="$lb">-->
                                <xsl:for-each select="$curnode/descendant::tei:seg[@lb = $line and text()[normalize-space()]][1]">
                                    <xsl:call-template name="lineurntranscr">
                                        <xsl:with-param name="configuration" select="$configuration"/>
                                    </xsl:call-template>
                                </xsl:for-each>
                            </xsl:variable>
                            <xsl:attribute name="typeof" select="'hi:PositionedTextFrag'"/>
                            <xsl:attribute name="resource">
                                <xsl:value-of select="$lineurntranscr"/>
                            </xsl:attribute>
                            <xsl:attribute name="property">
                                <xsl:text>efrbroo:R15_has_fragment</xsl:text>
                            </xsl:attribute>
                            <xsl:apply-templates select="$curnode/*[descendant-or-self::*/@lb = $line]">
                                <xsl:with-param name="configuration" select="$configuration"/>
                            </xsl:apply-templates>
                        </span>
                    </xsl:for-each>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:apply-templates>
                        <xsl:with-param name="configuration" select="$configuration"/>
                        
                    </xsl:apply-templates>
                </xsl:otherwise>
            </xsl:choose>
        </span>
    </xsl:template>
    
    <xsl:template match="tei:c">
        <xsl:param name="configuration"/>
        <xsl:choose>
            <xsl:when test="$configuration/@display = 'align'">
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
        <xsl:param name="configuration"/>
        <xsl:if test="($configuration/@display = 'translated' and @type = 'translation')
            or (($configuration/@display = 'align' or $configuration/@display = 'original') and @type = 'original')">
            <p>
                <xsl:choose>
                    <xsl:when test="$configuration/@annotatable = 'docpluswork'"> 
                        <xsl:variable name="curnode" select="."/>
                        <xsl:for-each select="distinct-values(.//tei:seg[text()[normalize-space()]]/@pb)">
                            <xsl:variable name="pageid" select="."/>
                            <xsl:message>pageid <xsl:value-of select="$pageid"/></xsl:message>
                            <xsl:variable name="pb" select="$curnode/id($pageid,$curnode)"/>
                            <xsl:apply-templates select="$pb">
                                <xsl:with-param name="configuration" select="$configuration"/>
                                <xsl:with-param name="ptfmode" select="true()"/>
                            </xsl:apply-templates>
                            <span>
                                <xsl:variable name="pageurntranscr">
                                    <xsl:for-each select="$pb">
                                        <!-- i.e.: non-whitespace text node -->
                                        <xsl:call-template name="pageurntranscr">
                                            <xsl:with-param name="configuration" select="$configuration"/>
                                        </xsl:call-template>
                                    </xsl:for-each>
                                </xsl:variable>
                                <xsl:attribute name="typeof" select="'hi:PositionedTextFrag'"/>
                                <xsl:attribute name="resource">
                                    <xsl:value-of select="$pageurntranscr"/>
                                </xsl:attribute>
                                <xsl:attribute name="property">
                                    <xsl:text>efrbroo:R15_has_fragment</xsl:text>
                                </xsl:attribute>
                                <xsl:apply-templates select="$curnode/*[descendant-or-self::*/@pb = $pageid]">
                                    <xsl:with-param name="configuration" select="$configuration"/>
                                </xsl:apply-templates>
                            </span>
                        </xsl:for-each>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:apply-templates>
                            <xsl:with-param name="configuration" select="$configuration"/>
                        </xsl:apply-templates>
                    </xsl:otherwise>
                </xsl:choose>
            </p>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="tei:lb">
        <xsl:param name="configuration"/>
        <xsl:param name="ptfmode" select="false()"/>
        <xsl:if test="$configuration/@display = 'align' and ($ptfmode = true() or $configuration/@annotatable = 'work')"> 
            <xsl:text>
</xsl:text>
            <br/>
            <span class="linenumber" typeof="hi:IgnorableElement" >
                <xsl:number level="any" count="tei:lb"/>
            </span>
        </xsl:if>
    </xsl:template>

    <xsl:template match="tei:pb">
        <xsl:param name="configuration"/>
        <xsl:param name="ptfmode" select="false()"/>
        <xsl:if test="$configuration/@display = 'align' and ($ptfmode = true() or $configuration/@annotatable = 'work')">
            <br/>
            <span class="linenumber">
                <xsl:number level="single" count="tei:lb"/>
            </span>
        </xsl:if>
        <xsl:if test="$configuration/@display != 'align' or $ptfmode = true() or $configuration/@annotatable = 'work'">
            <span typeof="hi:IgnorableElement" class="pagenumber">
                <xsl:text>[</xsl:text>
                <span>
    <!--                <xsl:if test="$configuration/@display='align' and not($configuration/@annotatable='work')">
                        <xsl:variable name="pageurntranscr">
                            <xsl:call-template name="pageurntranscr"/>
                        </xsl:variable>
                        <xsl:attribute name="typeof" select="'hi:PositionedTextFrag'"/>
                        <xsl:attribute name="resource">
                            <xsl:value-of select="$pageurntranscr"/>
                        </xsl:attribute>
                    </xsl:if>                
    -->                <xsl:value-of select="@f"/>:<xsl:value-of select="@n"/>
                </span>
                <xsl:text>]</xsl:text>
            </span>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="tei:rs[@type='pers']">
        <xsl:param name="configuration"/>
        <a href="http://vangoghletters.org/vg/persons.html" typeof="hi:IgnorableTag" >
            <xsl:apply-templates>
                <xsl:with-param name="configuration" select="$configuration"/>
            </xsl:apply-templates>
        </a>
    </xsl:template>

    <xsl:template match="tei:supplied">
        <xsl:param name="configuration"/>
        <span typeof="hi:IgnorableElement">[</span>
        <xsl:apply-templates>
            <xsl:with-param name="configuration" select="$configuration"/>
        </xsl:apply-templates>
        <span typef="hi:IgnorableElement">]</span>
    </xsl:template>
    
    <xsl:template match="*">
        <xsl:param name="configuration"/>
        <xsl:apply-templates>
            <xsl:with-param name="configuration" select="$configuration"/>
        </xsl:apply-templates>
    </xsl:template>

    <xsl:template match="*|@*" mode="preprocess">
        <xsl:copy>
            <xsl:if test="ancestor::tei:div[@type='original'] and not(ancestor::tei:div[@type='textualNotes'])">
                <xsl:attribute name="lb" select="preceding::tei:lb[1]/@xml:id"/>
                <xsl:attribute name="pb" select="preceding::tei:pb[1]/@xml:id"/>
            </xsl:if>
            <xsl:apply-templates select="@*|node()" mode="preprocess"/>
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="text()" mode="preprocess">
        <xsl:choose>
            <xsl:when test="ancestor::tei:div[@type='original'] and not(ancestor::tei:div[@type='textualNotes'])">
                <tei:seg lb="{preceding::tei:lb[1]/@xml:id}" pb="{preceding::tei:pb[1]/@xml:id}">
                    <xsl:copy/>
                </tei:seg>
            </xsl:when>
            <xsl:otherwise>
                <xsl:copy/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
</xsl:stylesheet>
