/**
 * Sport Service
 * Utility functions for sport-related operations
 */

export const sportService = {
  /**
   * Get the icon for a sport
   * @param {string} sportName - The name of the sport
   * @param {string|null} sportIcon - The icon from the Sport model (if available)
   * @returns {string} The icon (MDI icon or custom icon)
   */
  getSportIcon(sportName, sportIcon = null) {
    // Return the icon from Sport model if available
    if (sportIcon) {
      return sportIcon
    }

    // Fallback MDI icons if Sport model doesn't have an icon
    const icons = {
      'Badminton': 'mdi-badminton',
      'Tennis': 'mdi-tennis',
      'Basketball': 'mdi-basketball',
      'Volleyball': 'mdi-volleyball',
      'Football': 'mdi-soccer',
      'Soccer': 'mdi-soccer',
      'Table Tennis': 'mdi-table-tennis',
      'Squash': 'mdi-racquetball',
      'Pickleball': 'mdi-table-tennis'
    }
    return icons[sportName] || 'mdi-stadium'
  },

  /**
   * Get the color for a sport
   * @param {string} sportName - The name of the sport
   * @returns {string} The color name
   */
  getSportColor(sportName) {
    const colors = {
      'Badminton': 'blue',
      'Tennis': 'green',
      'Basketball': 'orange',
      'Volleyball': 'red',
      'Football': 'teal',
      'Soccer': 'purple',
      'Table Tennis': 'pink',
      'Squash': 'indigo',
      'Pickleball': 'blue'
    }
    return colors[sportName] || 'grey'
  }
}
