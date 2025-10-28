/**
 * Markdown Parser Utility
 *
 * Parses markdown content into structured sections and extracts key points
 * for use in expandable work items and insights.
 */

/**
 * Parse markdown content by ### headings into structured sections
 * @param {string} markdown - Markdown content with ### heading structure
 * @returns {Object} Object with section names as keys and content as values
 *
 * Example input:
 * ### The Challenge
 * Content here...
 *
 * ### The Solution
 * More content...
 *
 * Returns: { 'the-challenge': 'Content here...', 'the-solution': 'More content...' }
 */
export const parseExplorationContent = (markdown) => {
  if (!markdown || typeof markdown !== 'string') {
    return {};
  }

  const sections = {};

  // Split by ### headings (level 3 headings)
  const parts = markdown.split(/^###\s+/m);

  // First part before any heading is ignored
  parts.slice(1).forEach(part => {
    const lines = part.split('\n');
    const title = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();

    if (title && content) {
      // Create a key from the title (lowercase, hyphenated)
      const key = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      sections[key] = content;
    }
  });

  return sections;
};

/**
 * Extract key points from markdown sections
 * Returns the first substantial paragraph from each section (max 3)
 *
 * @param {Object} sections - Parsed sections from parseExplorationContent
 * @returns {Array<Object>} Array of {section, text} objects
 */
export const extractKeyPoints = (sections) => {
  if (!sections || typeof sections !== 'object') {
    return [];
  }

  const points = [];

  Object.entries(sections).forEach(([key, content]) => {
    // Skip empty content
    if (!content) return;

    // Split into paragraphs
    const paragraphs = content
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    // Find first substantial paragraph (not a bullet list)
    const substantialParagraph = paragraphs.find(p => {
      // Skip if it's a bullet list
      if (p.startsWith('-') || p.startsWith('*')) return false;
      // Skip if it's too short
      if (p.length < 20) return false;
      return true;
    });

    if (substantialParagraph) {
      // Clean up markdown formatting
      const cleaned = substantialParagraph
        .replace(/\*\*/g, '') // Remove bold
        .replace(/\*/g, '') // Remove italic
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
        .trim();

      // Take first sentence or first ~100 chars
      let text = cleaned;
      const firstSentence = cleaned.match(/^[^.!?]+[.!?]/);
      if (firstSentence && firstSentence[0].length < 150) {
        text = firstSentence[0];
      } else if (cleaned.length > 120) {
        text = cleaned.substring(0, 120).trim() + '...';
      }

      points.push({
        section: key,
        text: text
      });
    }
  });

  // Return max 3 key points
  return points.slice(0, 3);
};

/**
 * Parse insight content into display sections
 * Formats currentState, analysis, and proposal for inline expansion
 *
 * @param {Object} insight - Insight object with currentState, analysis, proposal
 * @returns {Object} Formatted sections ready for display
 */
export const parseInsightContent = (insight) => {
  if (!insight) return {};

  const sections = {};

  if (insight.currentState) {
    sections['current-state'] = insight.currentState;
  }

  if (insight.analysis) {
    sections['analysis'] = insight.analysis;
  }

  if (insight.proposal) {
    sections['proposal'] = insight.proposal;
  }

  return sections;
};

/**
 * Parse product content into display sections
 * Formats description and integrationRequirements for inline expansion
 *
 * @param {Object} product - Product object with description, integrationRequirements
 * @returns {Object} Formatted sections ready for display
 */
export const parseProductContent = (product) => {
  if (!product) return {};

  const sections = {};

  // Parse main description
  if (product.description) {
    sections['description'] = product.description;
  }

  // Add integration requirements
  if (product.integrationRequirements) {
    sections['integration'] = product.integrationRequirements;
  }

  return sections;
};

/**
 * Extract key points from product description
 * Returns the first substantial content from each ### section
 *
 * @param {string} description - Product description markdown
 * @returns {Array<Object>} Array of {section, text} objects
 */
export const extractProductKeyPoints = (description) => {
  if (!description || typeof description !== 'string') {
    return [];
  }

  const sections = parseExplorationContent(description);
  return extractKeyPoints(sections);
};

/**
 * Get section display name from key
 * Converts 'the-challenge' to 'The Challenge'
 *
 * @param {string} key - Section key (e.g., 'the-challenge')
 * @returns {string} Display name (e.g., 'The Challenge')
 */
export const getSectionDisplayName = (key) => {
  if (!key) return '';

  return key
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
