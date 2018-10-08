<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:vg="http://www.vangoghletters.org/ns/"
    exclude-result-prefixes="xs"
    version="2.0">
    
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
        <xsl:result-document href="{concat('../html/',concat($type,'.html'))}">
            <xsl:variable name="title">
                <xsl:text>Van Gogh letter </xsl:text>
                <xsl:value-of select="//tei:idno[@type='jlb']/text()"/>
                <xsl:text> - </xsl:text>
                <xsl:value-of select="$type"/>
            </xsl:variable>
            <html>
                <head>
                    <title><xsl:value-of select="$title"/></title>
                </head>
                <body>
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
            <br/>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="tei:ab">
        <xsl:param name="type"/>
        <seg>
            <xsl:apply-templates>
                <xsl:with-param name="type" select="$type"/>            
            </xsl:apply-templates>
        </seg>
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