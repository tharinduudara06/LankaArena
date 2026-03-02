import Notification from '../models/notifications.js';
import User from '../models/Users.js';
import mongoose from 'mongoose';

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      isRead, 
      type, 
      priority 
    } = req.query;

    const skip = (page - 1) * limit;
    
    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip),
      isRead: isRead ? isRead === 'true' : null,
      type: type || null,
      priority: priority || null
    };

    const notifications = await Notification.getUserNotifications(userId, userType, options);
    const totalCount = await Notification.countDocuments({ userId, userType });
    const unreadCount = await Notification.getUnreadCount(userId, userType);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Get unread count for a user
const getUnreadCount = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    const count = await Notification.getUnreadCount(userId, userType);
    
    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read for a user
const markAllAsRead = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    const result = await Notification.markAllAsRead(userId, userType);
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndDelete(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Create a new notification (for admin/system use)
const createNotification = async (req, res) => {
  try {
    const {
      userId,
      userType,
      type,
      priority = 'medium',
      title,
      message,
      data = {},
      relatedEntity = {},
      source = { type: 'system' }
    } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const notification = await Notification.createNotification({
      userId,
      userType,
      type,
      priority,
      title,
      message,
      data,
      relatedEntity,
      source
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};

// Bulk create notifications (for system-wide announcements)
const createBulkNotifications = async (req, res) => {
  try {
    const {
      userTypes = ['player', 'coach', 'admin', 'ground_manager', 'operation_manager'],
      type,
      priority = 'medium',
      title,
      message,
      data = {},
      source = { type: 'system' }
    } = req.body;

    const notifications = [];
    
    for (const userType of userTypes) {
      const users = await User.find({ userType });
      
      for (const user of users) {
        const notification = await Notification.createNotification({
          userId: user._id,
          userType,
          type,
          priority,
          title,
          message,
          data,
          source
        });
        notifications.push(notification);
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${notifications.length} notifications successfully`,
      data: { count: notifications.length }
    });
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bulk notifications',
      error: error.message
    });
  }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    
    const stats = await Notification.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId), userType } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
          byType: {
            $push: {
              type: '$type',
              isRead: '$isRead'
            }
          },
          byPriority: {
            $push: {
              priority: '$priority',
              isRead: '$isRead'
            }
          }
        }
      }
    ]);

    const typeStats = {};
    const priorityStats = {};

    if (stats.length > 0) {
      stats[0].byType.forEach(item => {
        if (!typeStats[item.type]) {
          typeStats[item.type] = { total: 0, unread: 0 };
        }
        typeStats[item.type].total++;
        if (!item.isRead) typeStats[item.type].unread++;
      });

      stats[0].byPriority.forEach(item => {
        if (!priorityStats[item.priority]) {
          priorityStats[item.priority] = { total: 0, unread: 0 };
        }
        priorityStats[item.priority].total++;
        if (!item.isRead) priorityStats[item.priority].unread++;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        total: stats[0]?.total || 0,
        unread: stats[0]?.unread || 0,
        byType: typeStats,
        byPriority: priorityStats
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics',
      error: error.message
    });
  }
};

// Get notifications for current user from session
const getCurrentUserNotifications = async (req, res) => {
  try {
    console.log('getCurrentUserNotifications called');
    console.log('Session user:', req.session.user);
    
    if (!req.session.user) {
      console.log('No user in session');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userId = req.session.user._id;
    let userType = req.session.user.role;
    
    // Handle service provider types
    if (req.session.user.role === 'service_provider') {
      if (req.session.user.SP_type === 'venue_owner') {
        userType = 'ground_manager';
      } else if (req.session.user.SP_type === 'equipment_provider') {
        userType = 'operation_manager';
      } else {
        userType = 'admin';
      }
    }
    
    // Ensure we have a valid user type
    if (!['player', 'coach', 'admin', 'ground_manager', 'operation_manager'].includes(userType)) {
      console.log('Invalid user type detected:', userType);
      userType = 'player'; // Default fallback
    }

    console.log('User ID:', userId);
    console.log('User Type:', userType);

    const { 
      page = 1, 
      limit = 20, 
      isRead, 
      type, 
      priority 
    } = req.query;

    const skip = (page - 1) * limit;
    
    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip),
      isRead: isRead ? isRead === 'true' : null,
      type: type || null,
      priority: priority || null
    };

    // Convert userId to ObjectId if it's a string
    const objectIdUserId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    
    const notifications = await Notification.getUserNotifications(objectIdUserId, userType, options);
    const totalCount = await Notification.countDocuments({ userId: objectIdUserId, userType });
    const unreadCount = await Notification.getUnreadCount(objectIdUserId, userType);

    console.log('Found notifications:', notifications.length);
    console.log('Total count:', totalCount);
    console.log('Unread count:', unreadCount);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching current user notifications:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get unread count for current user from session
const getCurrentUserUnreadCount = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userId = req.session.user._id;
    let userType = req.session.user.role;
    
    // Handle service provider types
    if (req.session.user.role === 'service_provider') {
      if (req.session.user.SP_type === 'venue_owner') {
        userType = 'ground_manager';
      } else if (req.session.user.SP_type === 'equipment_provider') {
        userType = 'operation_manager';
      } else {
        userType = 'admin';
      }
    }
    
    // Ensure we have a valid user type
    if (!['player', 'coach', 'admin', 'ground_manager', 'operation_manager'].includes(userType)) {
      userType = 'player'; // Default fallback
    }

    const count = await Notification.getUnreadCount(userId, userType);
    
    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Error fetching current user unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};

// Mark all notifications as read for current user from session
const markAllAsReadCurrentUser = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userId = req.session.user._id;
    let userType = req.session.user.role;
    
    // Handle service provider types
    if (req.session.user.role === 'service_provider') {
      if (req.session.user.SP_type === 'venue_owner') {
        userType = 'ground_manager';
      } else if (req.session.user.SP_type === 'equipment_provider') {
        userType = 'operation_manager';
      } else {
        userType = 'admin';
      }
    }
    
    // Ensure we have a valid user type
    if (!['player', 'coach', 'admin', 'ground_manager', 'operation_manager'].includes(userType)) {
      userType = 'player'; // Default fallback
    }

    const result = await Notification.markAllAsRead(userId, userType);
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Error marking all notifications as read for current user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

export {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  createBulkNotifications,
  getNotificationStats,
  getCurrentUserNotifications,
  getCurrentUserUnreadCount,
  markAllAsReadCurrentUser
};
