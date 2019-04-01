<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="xs"
    version="2.0"
    xmlns:vg="http://www.vangoghletters.org/ns/"
    xmlns:tei="http://www.tei-c.org/ns/1.0">
    
    <!-- Test stylesheet: test de expandptrs functie -->
    
    <xsl:include href="expandptrs.xsl"/>
    
    <xsl:template match="/">
        <xsl:variable name="root" select="."/>
        <xsl:for-each select="//*[@ontRef]">
            <xsl:for-each select="vg:expandptrs($root,@ontRef)">
                <xsl:text> </xsl:text>
                <xsl:copy/>
            </xsl:for-each>
        </xsl:for-each>
    </xsl:template>
</xsl:stylesheet>