<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:vg="http://www.vangoghletters.org/ns/" exclude-result-prefixes="xs" version="2.0">
    
    <xsl:template match="tei:ab" mode="rdf">
        <xsl:param name="configuration"/>
        <xsl:variable name="paraurn">
            <xsl:call-template name="paraurn">
                <xsl:with-param name="configuration" select="$configuration"/>
            </xsl:call-template>
        </xsl:variable>
        <xsl:variable name="paraurntext">
            <xsl:call-template name="paraurntext">
                <xsl:with-param name="configuration" select="$configuration"/>
            </xsl:call-template>
        </xsl:variable>
        <xsl:call-template name="vg:writettlline">
            <xsl:with-param name="s">
                <xsl:value-of select="vg:enclose($paraurn)"/>
            </xsl:with-param>
            <xsl:with-param name="p">rdf:type</xsl:with-param>
            <xsl:with-param name="o">vg:ParagraphInLetter</xsl:with-param>
        </xsl:call-template>
        <xsl:call-template name="vg:writettlline">
            <xsl:with-param name="s">
                <xsl:value-of select="vg:enclose($paraurn)"/>
            </xsl:with-param>
            <xsl:with-param name="p">
                <xsl:choose>
                    <xsl:when test="$configuration/@annotatable = 'docpluswork'">
                        <xsl:text>hi:hasFragmentIn</xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:text>hi:hasRepresentation</xsl:text>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:with-param>
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
        <xsl:apply-templates mode="rdf">
            <xsl:with-param name="configuration" select="$configuration"/>
        </xsl:apply-templates>
    </xsl:template>
    
    <xsl:template match="tei:div" mode="rdf">
        <xsl:param name="configuration"/>
        <xsl:if test="($configuration/@display = 'translated' and @type = 'translation')
            or (($configuration/@display = 'align' or $configuration/@display = 'original') and @type = 'original')">
            <xsl:apply-templates mode="rdf">
                <xsl:with-param name="configuration" select="$configuration"/>
            </xsl:apply-templates>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="tei:lb" mode="rdf">
        <xsl:param name="configuration"/>
        <xsl:if test="$configuration/@annotatable = 'docpluswork'">
            <xsl:variable name="line" select="@xml:id"/>
            <xsl:variable name="replacenode" select="ancestor::tei:text/descendant::tei:seg[@lb = $line and text()[normalize-space()]][1]"/>
            <xsl:variable name="lineurn">
                <xsl:for-each select="$replacenode">
                    <xsl:call-template name="lineurn">
                        <xsl:with-param name="configuration" select="$configuration"/>
                    </xsl:call-template>
                </xsl:for-each>
            </xsl:variable>
            <xsl:variable name="lineurntranscr">
                <xsl:for-each select="$replacenode">
                    <xsl:call-template name="lineurntranscr">
                        <xsl:with-param name="configuration" select="$configuration"/>
                    </xsl:call-template>
                </xsl:for-each>
            </xsl:variable>
            <xsl:variable name="page" select="@pb"/>
            <xsl:variable name="pageurn">
                <xsl:for-each select="./id($page,.)">
                    <xsl:call-template name="pageurn">
                        <xsl:with-param name="configuration" select="$configuration"/>
                    </xsl:call-template>
                </xsl:for-each>
            </xsl:variable>
            <xsl:call-template name="vg:writettlline">
                <xsl:with-param name="s">
                    <xsl:value-of select="vg:enclose($lineurn)"/>
                </xsl:with-param>
                <xsl:with-param name="p">rdf:type</xsl:with-param>
                <xsl:with-param name="o">vg:Line</xsl:with-param>
            </xsl:call-template>
            <xsl:call-template name="vg:writettlline">
                <xsl:with-param name="s" select="vg:enclose($pageurn)"/>
                <xsl:with-param name="p">hi:hasDocPart</xsl:with-param>
                <xsl:with-param name="o" select="vg:enclose($lineurn)"/>
            </xsl:call-template>
            <xsl:call-template name="vg:writettlline">
                <xsl:with-param name="s">
                    <xsl:value-of select="vg:enclose($lineurn)"/>
                </xsl:with-param>
                <xsl:with-param name="p">hi:hasFragmentIn</xsl:with-param>
                <xsl:with-param name="o">
                    <xsl:value-of select="vg:enclose($lineurntranscr)"/>
                </xsl:with-param>
            </xsl:call-template>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="tei:pb" mode="rdf">
        <xsl:param name="configuration"/>
        <xsl:variable name="pageurn">
            <xsl:call-template name="pageurn"/>
        </xsl:variable>
        <xsl:variable name="pageurntranscr">
            <xsl:call-template name="pageurntranscr"/>
        </xsl:variable>
        <xsl:call-template name="vg:writettlline">
            <xsl:with-param name="s">
                <xsl:value-of select="vg:enclose($pageurn)"/>
            </xsl:with-param>
            <xsl:with-param name="p">rdf:type</xsl:with-param>
            <xsl:with-param name="o">vg:Page</xsl:with-param>
        </xsl:call-template>
        <xsl:call-template name="vg:writettlline">
            <xsl:with-param name="s">
                <xsl:value-of select="vg:enclose($pageurn)"/>
            </xsl:with-param>
            <xsl:with-param name="p">hi:hasFragmentIn</xsl:with-param>
            <xsl:with-param name="o">
                <xsl:value-of select="vg:enclose($pageurntranscr)"/>
            </xsl:with-param>
        </xsl:call-template>
    </xsl:template>
    
    <xsl:template match="*" mode="rdf">
        <xsl:param name="configuration"/>
        <xsl:apply-templates mode="rdf">
            <xsl:with-param name="configuration" select="$configuration"/>
        </xsl:apply-templates>
    </xsl:template>
    
    <xsl:template match="text()" mode="rdf"/>
    
</xsl:stylesheet>
