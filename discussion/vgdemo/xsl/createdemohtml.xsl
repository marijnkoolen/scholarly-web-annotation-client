<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:vg="http://www.vangoghletters.org/ns/"
    exclude-result-prefixes="xs"
    version="2.0">
    
    <xsl:variable name="letno">
        <xsl:value-of select="//tei:idno[@type='jlb']/text()"/>
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
                    <title><xsl:value-of select="$title"/></title>
                    <link href="./css/demo.css" rel="stylesheet" type="text/css"/>
                    <script src="https://code.jquery.com/jquery-2.2.4.js"></script>
                    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
                    <script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
                    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"/>
                </head>
                <body>
                    <div class="horizontal">
                        <div class="annotation-target-observer">
                            <div vocab="http://boot.huygens.knaw.nl/vgdemo/vangoghannotationontology.ttl#" typeOf="Letter">
                                <xsl:attribute name="about">
                                    <xsl:text>urn:vangogh:letter:</xsl:text>
                                    <xsl:value-of select="$letno"/>
                                </xsl:attribute>
                            <h1><xsl:value-of select="$title"/></h1>
                            <h1><xsl:value-of select="//tei:titleStmt/tei:title"/></h1>
                            <p>Versions: 
                                <a href='align.html'>aligned</a> - <a href='original.html'>original</a> - <a href='translated.html'>translated</a>
                            </p>
                            <div class="content">
                                <xsl:apply-templates>
                                    <xsl:with-param name="type" select="$type"/>            
                                </xsl:apply-templates>
                            </div>
                        </div>
                        </div>
                        <div class="annotation-viewer" id="annotation-viewer">prut1</div>
                        <script src="./scholarly-web-annotator.js"></script>
                        <script src="./load_annotator.js"></script>
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
            <xsl:when test="$type='align'">
                <xsl:choose>
                    <xsl:when test="@type='kk'"><subs>/</subs></xsl:when>
                    <xsl:when test="@type='kp'">_</xsl:when>
                    <xsl:when test="@type='shy'">-</xsl:when>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <xsl:choose>
                    <xsl:when test="@type='kk'">,</xsl:when>
                    <xsl:when test="@type='kp'">.</xsl:when>
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
            <span class="linenumber"><xsl:number level="any" count="tei:lb"/></span>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="tei:pb">
        <xsl:param name="type"/>
        <xsl:if test="$type = 'align'">
            <br/>
            <span class="linenumber"><xsl:number level="single" count="tei:lb"/></span>
        </xsl:if>
        <span class="pagenumber">[<xsl:value-of select="@f"/>:<xsl:value-of select="@n"/>]</span>
    </xsl:template>
    
    <xsl:template match="tei:ab">
        <xsl:param name="type"/>
        <span class="para">
            <xsl:apply-templates>
                <xsl:with-param name="type" select="$type"/>            
            </xsl:apply-templates>
        </span>
        <!--<xsl:if test="not($type = 'align')">
            <br/>
        </xsl:if>-->
    </xsl:template>
    
    <xsl:template match="tei:div">
        <xsl:param name="type"/>
        <xsl:choose>
            <xsl:when test="$type='translated' and @type='translation'">
                <p><xsl:apply-templates>
                    <xsl:with-param name="type" select="$type"/>            
                </xsl:apply-templates></p>
            </xsl:when>
            <xsl:when test="($type='align' or $type='original') and @type='original'">
                <p><xsl:apply-templates>
                    <xsl:with-param name="type" select="$type"/>            
                </xsl:apply-templates></p>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="*">
        <xsl:param name="type"/>
        <xsl:apply-templates>
            <xsl:with-param name="type" select="$type"/>            
        </xsl:apply-templates>
    </xsl:template>
    
</xsl:stylesheet>