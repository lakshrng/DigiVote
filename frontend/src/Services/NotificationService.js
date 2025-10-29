

const API_URL = 'https://your-backend-url.com/api'; // TODO: Replace with actual backend URL

export const NotificationService = {
  /**
   * Send notification to all students
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @returns {Promise} API response
   */
  sendToAll: async (title, message) => {
    try {
      const response = await fetch(`${API_URL}/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          message,
          type: 'ALL',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in sendToAll:', error);
      throw error;
    }
  },

  /**
   * Send notification to specific user
   * @param {string} userId - Target user ID
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   */
  sendToUser: async (userId, title, message) => {
    try {
      const response = await fetch(`${API_URL}/notifications/send-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          title,
          message,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in sendToUser:', error);
      throw error;
    }
  },

  /**
   * Get all notifications
   * @returns {Promise<Array>} List of notifications
   */
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  },

  /**
   * Get notification by ID
   * @param {string} notificationId
   * @returns {Promise<Object>} Notification details
   */
  getById: async (notificationId) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  },

  /**
   * Delete notification
   * @param {string} notificationId
   * @returns {Promise} API response
   */
  delete: async (notificationId) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  },

  /**
   * Schedule notification for later
   * @param {string} title
   * @param {string} message
   * @param {Date} scheduledTime
   */
  schedule: async (title, message, scheduledTime) => {
    try {
      const response = await fetch(`${API_URL}/notifications/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          message,
          scheduledTime: scheduledTime.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in schedule:', error);
      throw error;
    }
  },
};