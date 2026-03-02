// Test script to add some sample payment data
const mongoose = require('mongoose');

// Connect to MongoDB
const MONGO_URI = "mongodb+srv://isuru:isuru12@cluster0.5a3mksu.mongodb.net/lankaArena";

async function addTestData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Import models
    const User = mongoose.model('user', new mongoose.Schema({
      name: String,
      email: String,
      mobile: String,
      password: String,
      role: String,
      status: String,
      SP_type: String,
      isDeleted: Boolean
    }));

    const Venue = mongoose.model('venue', new mongoose.Schema({
      name: String,
      location: {
        address: String,
        city: String
      },
      price: Number,
      facilities: [String],
      ground_manager: mongoose.Schema.Types.ObjectId,
      isDeleted: Boolean
    }));

    const Booking = mongoose.model('booking', new mongoose.Schema({
      venue: mongoose.Schema.Types.ObjectId,
      status: String,
      date: Date,
      method: String,
      isPaid: String,
      price: Number,
      from: mongoose.Schema.Types.ObjectId,
      startTime: Date,
      endTime: Date
    }));

    // Create a test ground manager
    const testGM = await User.findOneAndUpdate(
      { email: 'testgm@example.com' },
      {
        name: 'Test Ground Manager',
        email: 'testgm@example.com',
        mobile: '0771234567',
        password: 'password123',
        role: 'service_provider',
        status: 'approved',
        SP_type: 'venue_owner',
        isDeleted: false
      },
      { upsert: true, new: true }
    );

    console.log('Test ground manager:', testGM._id);

    // Create a test venue
    const testVenue = await Venue.findOneAndUpdate(
      { name: 'Test Cricket Ground' },
      {
        name: 'Test Cricket Ground',
        location: {
          address: '123 Test Street',
          city: 'Colombo'
        },
        price: 5000,
        facilities: ['Parking', 'Changing Rooms'],
        ground_manager: testGM._id,
        isDeleted: false
      },
      { upsert: true, new: true }
    );

    console.log('Test venue:', testVenue._id);

    // Create a test player
    const testPlayer = await User.findOneAndUpdate(
      { email: 'testplayer@example.com' },
      {
        name: 'Test Player',
        email: 'testplayer@example.com',
        mobile: '0777654321',
        password: 'password123',
        role: 'player',
        status: 'approved',
        isDeleted: false
      },
      { upsert: true, new: true }
    );

    console.log('Test player:', testPlayer._id);

    // Create some test bookings with different payment statuses
    const testBookings = [
      {
        venue: testVenue._id,
        status: 'confirmed',
        date: new Date('2024-01-15'),
        method: 'credit-card',
        isPaid: 'Paid',
        price: 5000,
        from: testPlayer._id,
        startTime: new Date('2024-01-15T09:00:00'),
        endTime: new Date('2024-01-15T11:00:00')
      },
      {
        venue: testVenue._id,
        status: 'confirmed',
        date: new Date('2024-01-20'),
        method: 'bank-transfer',
        isPaid: 'Paid',
        price: 7500,
        from: testPlayer._id,
        startTime: new Date('2024-01-20T14:00:00'),
        endTime: new Date('2024-01-20T16:00:00')
      },
      {
        venue: testVenue._id,
        status: 'pending',
        date: new Date('2024-01-25'),
        method: 'cash',
        isPaid: 'Not-paid',
        price: 3000,
        from: testPlayer._id,
        startTime: new Date('2024-01-25T10:00:00'),
        endTime: new Date('2024-01-25T12:00:00')
      },
      {
        venue: testVenue._id,
        status: 'cancelled',
        date: new Date('2024-01-30'),
        method: 'credit-card',
        isPaid: 'Failed',
        price: 4000,
        from: testPlayer._id,
        startTime: new Date('2024-01-30T15:00:00'),
        endTime: new Date('2024-01-30T17:00:00')
      }
    ];

    for (const booking of testBookings) {
      await Booking.findOneAndUpdate(
        { 
          venue: booking.venue, 
          from: booking.from, 
          date: booking.date 
        },
        booking,
        { upsert: true, new: true }
      );
    }

    console.log('Test data added successfully!');
    console.log('You can now log in with:');
    console.log('Email: testgm@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error adding test data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

addTestData();
