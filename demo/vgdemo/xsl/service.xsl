<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:vg="http://www.vangoghletters.org/ns/" exclude-result-prefixes="xs" version="2.0">

    
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
        <xsl:text>urn:vangogh/letter=</xsl:text>
        <xsl:value-of select="$letno"/>
    </xsl:function>
    
    <xsl:function name="vg:texturn">
        <xsl:param name="type"/>
        <xsl:value-of select="vg:letterurn()"/>
        <xsl:text>:repr=</xsl:text>
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
    
    <xsl:template name="lineurn">
        <!-- don't call with context node lb but with first non-whitespace seg with 
            certain lb value; this should insure that paragraph ancestor is correct -->
        <xsl:param name="type"/>
        <xsl:for-each select="id(@pb,.)">
            <xsl:call-template name="pageurn">
                <xsl:with-param name="type" select="$type"/>
            </xsl:call-template>
        </xsl:for-each>
        <xsl:text>:line=</xsl:text>
        <xsl:value-of select="@lb"/>
    </xsl:template>
    
    <xsl:template name="lineurntranscr">
        <xsl:param name="type"/>
        <xsl:call-template name="lineurn">
            <xsl:with-param name="type" select="$type"/>
        </xsl:call-template>
        <xsl:text>:para=</xsl:text>
        <xsl:for-each select="ancestor::tei:ab">
            <xsl:call-template name="paraid">
                <xsl:with-param name="type" select="$type"/>
            </xsl:call-template>
        </xsl:for-each>
        <xsl:text>:repr=transcript</xsl:text>
    </xsl:template>
    
    <xsl:template name="pageurn">
        <xsl:param name="type"/>
        <xsl:value-of select="vg:letterurn()"/>
        <xsl:text>:sheet=</xsl:text>
        <xsl:value-of select="@f"/>
        <xsl:text>:page=</xsl:text>
        <xsl:value-of select="@n"/>
    </xsl:template>
    
    <xsl:template name="pageurntranscr">
        <xsl:param name="type"/>
        <xsl:call-template name="pageurn">
            <xsl:with-param name="type" select="$type"/>
        </xsl:call-template>
        <xsl:text>:repr=transcript</xsl:text>
    </xsl:template>
    
    <xsl:template name="paraid">
        <xsl:param name="type"/>
        <xsl:variable name="num"><xsl:number level="any" count="tei:ab"/></xsl:variable>
        <xsl:choose>
            <xsl:when test="$type='translated'"><xsl:value-of select="$num -  count(//tei:ab[not(ancestor::tei:div[@type='notes'])]) div 2"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="$num"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template name="paraurn">
        <xsl:param name="type"/>
        <xsl:value-of select="vg:letterurn()"/>
        <xsl:text>:para=</xsl:text>
<!--        <xsl:variable name="num"><xsl:number level="any" count="tei:ab"/></xsl:variable>
        <xsl:choose>
            <xsl:when test="$type='translated'"><xsl:value-of select="$num -  count(//tei:ab[not(ancestor::tei:div[@type='notes'])]) div 2"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="$num"/></xsl:otherwise>
        </xsl:choose>-->
        <xsl:call-template name="paraid">
            <xsl:with-param name="type" select="$type"/>
        </xsl:call-template>
    </xsl:template>

    <xsl:template name="paraurntext">
        <xsl:param name="type"/>
        <xsl:call-template name="paraurn">
            <xsl:with-param name="type" select="$type"/>
        </xsl:call-template>
<!--        <xsl:value-of select="vg:letterurn()"/>
        <xsl:text>:para=</xsl:text>
        <xsl:variable name="num"><xsl:number level="any" count="tei:ab"/></xsl:variable>
        <xsl:choose>
            <xsl:when test="$type='translated'"><xsl:value-of select="$num -  count(//tei:ab[not(ancestor::tei:div[@type='notes'])]) div 2"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="$num"/></xsl:otherwise>
        </xsl:choose>-->        
        <xsl:text>:repr=</xsl:text>
        <xsl:value-of select="vg:texturnfrag($type)"/>
    </xsl:template>
    
</xsl:stylesheet>
