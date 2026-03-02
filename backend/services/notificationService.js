import Notification from '../models/notifications.js';
import User from '../models/Users.js';

class NotificationService {
  // Create a single notification
  static async createNotification(notificationData) {
    try {
      const notification = await Notification.createNotification(notificationData);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create notifications for booking events
  static async createBookingNotification(userId, userType, bookingData, action) {
    const notifications = [];
    
    switch (action) {
      case 'confirmed':
        notifications.push({
          userId,
          userType,
          type: 'booking_confirmed',
          priority: 'high',
          title: 'Booking Confirmed',
          message: `Your ground booking for "${bookingData.venueName}" on ${bookingData.date} at ${bookingData.time} has been confirmed.`,
          data: {
            venueName: bookingData.venueName,
            date: bookingData.date,
            time: bookingData.time,
            bookingId: bookingData.bookingId
          },
          relatedEntity: {
            entityType: 'booking',
            entityId: bookingData.bookingId
          }
        });
        break;
        
      case 'rejected':
        notifications.push({
          userId,
          userType,
          type: 'booking_rejected',
          priority: 'medium',
          title: 'Booking Rejected',
          message: `Your booking request for "${bookingData.venueName}" on ${bookingData.date} has been rejected. ${bookingData.reason || 'Please try another time slot.'}`,
          data: {
            venueName: bookingData.venueName,
            date: bookingData.date,
            reason: bookingData.reason,
            bookingId: bookingData.bookingId
          },
          relatedEntity: {
            entityType: 'booking',
            entityId: bookingData.bookingId
          }
        });
        break;
        
      case 'cancelled':
        notifications.push({
          userId,
          userType,
          type: 'booking_cancelled',
          priority: 'medium',
          title: 'Booking Cancelled',
          message: `Your booking for "${bookingData.venueName}" on ${bookingData.date} has been cancelled. ${bookingData.reason || ''}`,
          data: {
            venueName: bookingData.venueName,
            date: bookingData.date,
            reason: bookingData.reason,
            bookingId: bookingData.bookingId
          },
          relatedEntity: {
            entityType: 'booking',
            entityId: bookingData.bookingId
          }
        });
        break;
        
      case 'reminder':
        notifications.push({
          userId,
          userType,
          type: 'booking_reminder',
          priority: 'medium',
          title: 'Booking Reminder',
          message: `Reminder: Your ground booking for "${bookingData.venueName}" is scheduled for tomorrow at ${bookingData.time}.`,
          data: {
            venueName: bookingData.venueName,
            time: bookingData.time,
            bookingId: bookingData.bookingId
          },
          relatedEntity: {
            entityType: 'booking',
            entityId: bookingData.bookingId
          }
        });
        break;
    }
    
    for (const notificationData of notifications) {
      await this.createNotification(notificationData);
    }
  }

  // Create notifications for match events
  static async createMatchNotification(userId, userType, matchData, action) {
    const notifications = [];
    
    switch (action) {
      case 'scheduled':
        notifications.push({
          userId,
          userType,
          type: 'match_scheduled',
          priority: 'high',
          title: 'New Match Scheduled',
          message: `You have been added to a new match: "${matchData.team1} vs ${matchData.team2}" on ${matchData.date} at ${matchData.time}.`,
          data: {
            team1: matchData.team1,
            team2: matchData.team2,
            date: matchData.date,
            time: matchData.time,
            venue: matchData.venue,
            matchId: matchData.matchId
          },
          relatedEntity: {
            entityType: 'match',
            entityId: matchData.matchId
          }
        });
        break;
        
      case 'cancelled':
        notifications.push({
          userId,
          userType,
          type: 'match_cancelled',
          priority: 'high',
          title: 'Match Cancelled',
          message: `The match "${matchData.team1} vs ${matchData.team2}" scheduled for ${matchData.date} has been cancelled. ${matchData.reason || ''}`,
          data: {
            team1: matchData.team1,
            team2: matchData.team2,
            date: matchData.date,
            reason: matchData.reason,
            matchId: matchData.matchId
          },
          relatedEntity: {
            entityType: 'match',
            entityId: matchData.matchId
          }
        });
        break;
        
      case 'reminder':
        notifications.push({
          userId,
          userType,
          type: 'match_reminder',
          priority: 'high',
          title: 'Match Reminder',
          message: `Reminder: Your match "${matchData.team1} vs ${matchData.team2}" is scheduled for tomorrow at ${matchData.time}.`,
          data: {
            team1: matchData.team1,
            team2: matchData.team2,
            time: matchData.time,
            venue: matchData.venue,
            matchId: matchData.matchId
          },
          relatedEntity: {
            entityType: 'match',
            entityId: matchData.matchId
          }
        });
        break;
        
      case 'result':
        console.log('Creating match result notification with data:', matchData);
        console.log('Team1 value:', matchData.team1);
        console.log('Team2 value:', matchData.team2);
        console.log('Result message:', matchData.resultMessage);
        notifications.push({
          userId,
          userType,
          type: 'match_result',
          priority: 'high',
          title: 'Match Result',
          message: `Match Result: ${matchData.team1 || 'Unknown Team'} vs ${matchData.team2 || 'Unknown Team'}. ${matchData.resultMessage || ''}`,
          data: {
            team1: matchData.team1,
            team2: matchData.team2,
            score1: matchData.score1,
            score2: matchData.score2,
            resultMessage: matchData.resultMessage,
            matchId: matchData.matchId
          },
          relatedEntity: {
            entityType: 'match',
            entityId: matchData.matchId
          }
        });
        break;
    }
    
    for (const notificationData of notifications) {
      await this.createNotification(notificationData);
    }
  }

  // Create notifications for training session events
  static async createTrainingNotification(userId, userType, trainingData, action) {
    const notifications = [];
    
    switch (action) {
      case 'scheduled':
        notifications.push({
          userId,
          userType,
          type: 'training_scheduled',
          priority: 'medium',
          title: 'Training Session Scheduled',
          message: `Your training session with ${trainingData.coachName} is scheduled for ${trainingData.date} at ${trainingData.time}.`,
          data: {
            coachName: trainingData.coachName,
            date: trainingData.date,
            time: trainingData.time,
            venue: trainingData.venue,
            sessionId: trainingData.sessionId
          },
          relatedEntity: {
            entityType: 'training',
            entityId: trainingData.sessionId
          }
        });
        break;
        
      case 'cancelled':
        notifications.push({
          userId,
          userType,
          type: 'training_cancelled',
          priority: 'medium',
          title: 'Training Session Cancelled',
          message: `Your training session with ${trainingData.coachName} scheduled for ${trainingData.date} has been cancelled. ${trainingData.reason || ''}`,
          data: {
            coachName: trainingData.coachName,
            date: trainingData.date,
            reason: trainingData.reason,
            sessionId: trainingData.sessionId
          },
          relatedEntity: {
            entityType: 'training',
            entityId: trainingData.sessionId
          }
        });
        break;
        
      case 'reminder':
        notifications.push({
          userId,
          userType,
          type: 'training_reminder',
          priority: 'medium',
          title: 'Training Session Reminder',
          message: `Reminder: Your training session with ${trainingData.coachName} is scheduled for tomorrow at ${trainingData.time}.`,
          data: {
            coachName: trainingData.coachName,
            time: trainingData.time,
            venue: trainingData.venue,
            sessionId: trainingData.sessionId
          },
          relatedEntity: {
            entityType: 'training',
            entityId: trainingData.sessionId
          }
        });
        break;
    }
    
    for (const notificationData of notifications) {
      await this.createNotification(notificationData);
    }
  }

  // Create notifications for equipment rental events
  static async createEquipmentNotification(userId, userType, equipmentData, action) {
    const notifications = [];
    
    switch (action) {
      case 'confirmed':
        notifications.push({
          userId,
          userType,
          type: 'equipment_rental_confirmed',
          priority: 'medium',
          title: 'Equipment Rental Confirmed',
          message: `Your equipment rental for "${equipmentData.equipmentName}" has been confirmed and is ready for pickup.`,
          data: {
            equipmentName: equipmentData.equipmentName,
            rentalId: equipmentData.rentalId,
            pickupDate: equipmentData.pickupDate
          },
          relatedEntity: {
            entityType: 'equipment',
            entityId: equipmentData.rentalId
          }
        });
        break;
        
      case 'rejected':
        notifications.push({
          userId,
          userType,
          type: 'equipment_rental_rejected',
          priority: 'medium',
          title: 'Equipment Rental Rejected',
          message: `Your equipment rental request for "${equipmentData.equipmentName}" has been rejected. ${equipmentData.reason || 'Please try again later.'}`,
          data: {
            equipmentName: equipmentData.equipmentName,
            reason: equipmentData.reason,
            rentalId: equipmentData.rentalId
          },
          relatedEntity: {
            entityType: 'equipment',
            entityId: equipmentData.rentalId
          }
        });
        break;
        
      case 'return_reminder':
        notifications.push({
          userId,
          userType,
          type: 'equipment_return_reminder',
          priority: 'low',
          title: 'Equipment Return Reminder',
          message: `Your rented equipment "${equipmentData.equipmentName}" is due for return tomorrow. Please visit the equipment center.`,
          data: {
            equipmentName: equipmentData.equipmentName,
            returnDate: equipmentData.returnDate,
            rentalId: equipmentData.rentalId
          },
          relatedEntity: {
            entityType: 'equipment',
            entityId: equipmentData.rentalId
          }
        });
        break;
    }
    
    for (const notificationData of notifications) {
      await this.createNotification(notificationData);
    }
  }

  // Create notifications for payment events
  static async createPaymentNotification(userId, userType, paymentData, action) {
    const notifications = [];
    
    switch (action) {
      case 'received':
        notifications.push({
          userId,
          userType,
          type: 'payment_received',
          priority: 'medium',
          title: 'Payment Received',
          message: `Your payment of $${paymentData.amount} for ${paymentData.description} has been received successfully.`,
          data: {
            amount: paymentData.amount,
            description: paymentData.description,
            paymentId: paymentData.paymentId,
            transactionId: paymentData.transactionId
          },
          relatedEntity: {
            entityType: 'payment',
            entityId: paymentData.paymentId
          }
        });
        break;
        
      case 'failed':
        notifications.push({
          userId,
          userType,
          type: 'payment_failed',
          priority: 'high',
          title: 'Payment Failed',
          message: `Your payment of $${paymentData.amount} for ${paymentData.description} has failed. Please try again.`,
          data: {
            amount: paymentData.amount,
            description: paymentData.description,
            paymentId: paymentData.paymentId,
            reason: paymentData.reason
          },
          relatedEntity: {
            entityType: 'payment',
            entityId: paymentData.paymentId
          }
        });
        break;
        
      case 'refund':
        notifications.push({
          userId,
          userType,
          type: 'refund_processed',
          priority: 'medium',
          title: 'Refund Processed',
          message: `Your refund of $${paymentData.amount} for ${paymentData.description} has been processed and will be credited to your account.`,
          data: {
            amount: paymentData.amount,
            description: paymentData.description,
            refundId: paymentData.refundId,
            paymentId: paymentData.paymentId
          },
          relatedEntity: {
            entityType: 'payment',
            entityId: paymentData.paymentId
          }
        });
        break;
    }
    
    for (const notificationData of notifications) {
      await this.createNotification(notificationData);
    }
  }

  // Create system-wide announcements
  static async createAnnouncement(userTypes, announcementData) {
    try {
      const notifications = [];
      
      for (const userType of userTypes) {
        const users = await User.find({ userType });
        
        for (const user of users) {
          notifications.push({
            userId: user._id,
            userType,
            type: 'announcement',
            priority: announcementData.priority || 'medium',
            title: announcementData.title,
            message: announcementData.message,
            data: announcementData.data || {},
            source: {
              type: 'system',
              userId: announcementData.sourceUserId
            }
          });
        }
      }
      
      // Create all notifications in parallel
      await Promise.all(notifications.map(notificationData => 
        this.createNotification(notificationData)
      ));
      
      return { success: true, count: notifications.length };
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  // Create welcome notification for new users
  static async createWelcomeNotification(userId, userType, userName) {
    return await this.createNotification({
      userId,
      userType,
      type: 'welcome',
      priority: 'low',
      title: 'Welcome to LankaArena!',
      message: `Welcome ${userName}! We're excited to have you on board. Explore our platform and start booking your favorite sports activities.`,
      data: {
        userName,
        userType
      },
      source: {
        type: 'system'
      }
    });
  }
}

export default NotificationService;
