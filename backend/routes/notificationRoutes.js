import express from 'express';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

// Test endpoint to check if notifications API is working
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Notifications API is working',
    session: req.session.user ? 'User logged in' : 'No user session'
  });
});

// Get notifications for current user (from session)
router.get('/current-user/notifications', notificationController.getCurrentUserNotifications);

// Get unread count for current user (from session)
router.get('/current-user/unread-count', notificationController.getCurrentUserUnreadCount);

// Get notifications for a specific user
router.get('/:userType/:userId', notificationController.getUserNotifications);

// Get unread count for a user
router.get('/:userType/:userId/unread-count', notificationController.getUnreadCount);

// Get notification statistics for a user
router.get('/:userType/:userId/stats', notificationController.getNotificationStats);

// Mark a specific notification as read
router.put('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read for a user
router.put('/:userType/:userId/mark-all-read', notificationController.markAllAsRead);

// Mark all notifications as read for current user (from session)
router.put('/current-user/mark-all-read', notificationController.markAllAsReadCurrentUser);

// Delete a notification
router.delete('/:notificationId', notificationController.deleteNotification);

// Create a new notification (admin/system use)
router.post('/create', notificationController.createNotification);

// Create bulk notifications (admin/system use)
router.post('/create-bulk', notificationController.createBulkNotifications);

export default router;
