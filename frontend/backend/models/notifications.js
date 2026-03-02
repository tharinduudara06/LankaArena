import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // User who receives the notification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userType'
  },
  
  // Type of user (player, coach, admin, ground_manager, operation_manager)
  userType: {
    type: String,
    required: true,
    enum: ['player', 'coach', 'admin', 'ground_manager', 'operation_manager']
  },
  
  // Notification type
  type: {
    type: String,
    required: true,
    enum: [
      // Booking related
      'booking_confirmed',
      'booking_rejected',
      'booking_cancelled',
      'booking_reminder',
      
      // Match related
      'match_scheduled',
      'match_cancelled',
      'match_reminder',
      'match_result',
      'match_invitation',
      
      // Training/Session related
      'training_scheduled',
      'training_cancelled',
      'training_reminder',
      'session_reminder',
      
      // Equipment related
      'equipment_rental_confirmed',
      'equipment_rental_rejected',
      'equipment_return_reminder',
      'equipment_available',
      
      // Payment related
      'payment_received',
      'payment_failed',
      'payment_reminder',
      'refund_processed',
      
      // System/Admin related
      'account_approved',
      'account_suspended',
      'account_reactivated',
      'maintenance_scheduled',
      'venue_approved',
      'venue_rejected',
      'team_invitation',
      'team_removed',
      
      // General
      'welcome',
      'system_update',
      'announcement'
    ]
  },
  
  // Priority level
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Notification title
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  // Notification message
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Additional data (JSON object for extra information)
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Related entity IDs (for linking to specific bookings, matches, etc.)
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['booking', 'match', 'training', 'equipment', 'payment', 'venue', 'team', 'user']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false
  },
  
  // Read timestamp
  readAt: {
    type: Date
  },
  
  // Expiry date (optional)
  expiresAt: {
    type: Date
  },
  
  // Notification source (who/what created this notification)
  source: {
    type: {
      type: String,
      enum: ['system', 'user', 'admin', 'automatic'],
      default: 'system'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ userId: 1, userType: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for formatted time
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(notificationData) {
  try {
    const notification = new this(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }
};

// Static method to get notifications for user
notificationSchema.statics.getUserNotifications = async function(userId, userType, options = {}) {
  const {
    limit = 50,
    skip = 0,
    isRead = null,
    type = null,
    priority = null
  } = options;
  
  const query = { userId, userType };
  
  if (isRead !== null) query.isRead = isRead;
  if (type) query.type = type;
  if (priority) query.priority = priority;
  
  return await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('source.userId', 'name email');
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsRead = async function(userId, userType) {
  return await this.updateMany(
    { userId, userType, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId, userType) {
  return await this.countDocuments({ userId, userType, isRead: false });
};

export default mongoose.model('Notification', notificationSchema);
