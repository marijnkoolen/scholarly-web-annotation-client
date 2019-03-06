<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="xs"
    version="2.0"
    xmlns:fn="http://www.w3.org/2005/xpath-functions"
    xmlns:vg="http://www.vangoghletters.org/ns/"
    xmlns:tei="http://www.tei-c.org/ns/1.0">
    
    <xsl:function name="vg:expandptrs">
        <xsl:param name="root"/>
        <xsl:param name="in"/>
        <xsl:variable name="pref" select="substring-before($in,':')"/>
        <xsl:variable name="short" select="substring-after($in,':')"/>
        <xsl:sequence>
            <xsl:for-each select="$root//tei:prefixDef[@ident=$pref]">
                <xsl:variable name="matchpattern">
                    <xsl:text>^</xsl:text>
                    <xsl:value-of select="@matchPattern"/>
                    <xsl:text>$</xsl:text>
                </xsl:variable>
                <xsl:if test="fn:matches($short,$matchpattern)">
                    <xsl:value-of select="fn:replace($short,$matchpattern,@replacementPattern)"/>
                </xsl:if>
            </xsl:for-each>
        </xsl:sequence>
    </xsl:function>
    
</xsl:stylesheet>