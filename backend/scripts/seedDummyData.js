/**
 * Seed script: Populates database with comprehensive dummy data
 * Run: npm run seed:dummy
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/Users.js';
import Venue from '../models/Venue.js';
import Team from '../models/team.js';
import Player from '../models/player.js';
import Booking from '../models/bookings.js';
import Schedule from '../models/schedule.js';
import Rental from '../models/rental.js';
import Match from '../models/matche.js';
import Equipment from '../models/equipment.js';
import Maintenance from '../models/maintenance.js';
import Notification from '../models/notifications.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lankaArena';

// Helper function to get random element from array
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to get random date in future
const randomFutureDate = (daysAhead = 30) => {
  const now = new Date();
  const future = new Date(now.getTime() + Math.random() * daysAhead * 24 * 60 * 60 * 1000);
  return future;
};

// Helper function to get random date in past
const randomPastDate = (daysAgo = 30) => {
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * daysAgo * 24 * 60 * 60 * 1000);
  return past;
};

async function seedDummyData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Venue.deleteMany({});
    await Team.deleteMany({});
    await Player.deleteMany({});
    await Booking.deleteMany({});
    await Schedule.deleteMany({});
    await Rental.deleteMany({});
    await Match.deleteMany({});
    await Equipment.deleteMany({});
    await Maintenance.deleteMany({});
    await Notification.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // 1. Create Users
    console.log('👥 Creating users...');
    const users = [];

    // Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@lankaarena.com',
      mobile: '0770000000',
      password: 'Admin123!',
      role: 'admin',
      status: 'active',
      isDeleted: false
    });
    users.push(admin);
    console.log(`  ✓ Created admin: ${admin.email}`);

    // Ground Managers
    const groundManagers = [];
    const gmNames = ['Kamal Perera', 'Nimal Silva', 'Sunil Fernando', 'Rohan Wijesinghe'];
    for (let i = 0; i < 4; i++) {
      const gm = await User.create({
        name: gmNames[i],
        email: `gm${i + 1}@lankaarena.com`,
        mobile: `077${1000000 + i}`,
        password: 'Password123!',
        role: 'ground_manager',
        status: 'active',
        isDeleted: false
      });
      groundManagers.push(gm);
      users.push(gm);
      console.log(`  ✓ Created ground manager: ${gm.email}`);
    }

    // Operation Managers
    const opManagers = [];
    const omNames = ['Dilshan Jayasuriya', 'Tharindu Karunaratne'];
    for (let i = 0; i < 2; i++) {
      const om = await User.create({
        name: omNames[i],
        email: `om${i + 1}@lankaarena.com`,
        mobile: `077${2000000 + i}`,
        password: 'Password123!',
        role: 'operation_manager',
        status: 'active',
        isDeleted: false
      });
      opManagers.push(om);
      users.push(om);
      console.log(`  ✓ Created operation manager: ${om.email}`);
    }

    // Coaches
    const coaches = [];
    const coachNames = ['Chaminda Vaas', 'Muttiah Muralitharan', 'Kumar Sangakkara', 'Mahela Jayawardene'];
    for (let i = 0; i < 4; i++) {
      const coach = await User.create({
        name: coachNames[i],
        email: `coach${i + 1}@lankaarena.com`,
        mobile: `077${3000000 + i}`,
        password: 'Password123!',
        role: 'coach',
        status: 'active',
        SP_type: random(['Cricket', 'Football', 'Rugby', 'Basketball']),
        isDeleted: false
      });
      coaches.push(coach);
      users.push(coach);
      console.log(`  ✓ Created coach: ${coach.email}`);
    }

    // Players
    const players = [];
    const playerNames = [
      'Dasun Shanaka', 'Wanindu Hasaranga', 'Pathum Nissanka', 'Charith Asalanka',
      'Dhananjaya de Silva', 'Kusal Mendis', 'Angelo Mathews', 'Dushmantha Chameera',
      'Lahiru Kumara', 'Kasun Rajitha', 'Dimuth Karunaratne', 'Dinesh Chandimal',
      'Niroshan Dickwella', 'Isuru Udana', 'Thisara Perera', 'Akila Dananjaya'
    ];
    for (let i = 0; i < 16; i++) {
      const player = await User.create({
        name: playerNames[i],
        email: `player${i + 1}@lankaarena.com`,
        mobile: `077${4000000 + i}`,
        password: 'Password123!',
        role: 'player',
        status: 'active',
        isDeleted: false
      });
      players.push(player);
      users.push(player);
      console.log(`  ✓ Created player: ${player.email}`);
    }
    console.log(`✅ Created ${users.length} users\n`);

    // 2. Create Venues
    console.log('🏟️  Creating venues...');
    const venues = [];
    const venueData = [
      { name: 'R. Premadasa Stadium', city: 'Colombo', address: 'Khettarama Road, Maligawatta', price: 50000, facilities: ['Parking', 'Changing Rooms', 'Floodlights', 'Scoreboard'] },
      { name: 'Sinhalese Sports Club', city: 'Colombo', address: 'Maitland Place, Colombo 07', price: 40000, facilities: ['Parking', 'Cafeteria', 'Changing Rooms'] },
      { name: 'Nondescripts Cricket Club', city: 'Colombo', address: 'Bauddhaloka Mawatha, Colombo 07', price: 35000, facilities: ['Parking', 'Changing Rooms', 'Floodlights'] },
      { name: 'Colombo Cricket Club', city: 'Colombo', address: 'Maitland Crescent, Colombo 07', price: 30000, facilities: ['Parking', 'Changing Rooms'] },
      { name: 'Galle International Stadium', city: 'Galle', address: 'Esplanade Road, Galle', price: 45000, facilities: ['Parking', 'Changing Rooms', 'Floodlights', 'Scoreboard', 'VIP Lounge'] },
      { name: 'Pallekele International Stadium', city: 'Kandy', address: 'Pallekele, Kandy', price: 40000, facilities: ['Parking', 'Changing Rooms', 'Floodlights'] }
    ];

    for (let i = 0; i < venueData.length; i++) {
      const venue = await Venue.create({
        name: venueData[i].name,
        location: {
          address: venueData[i].address,
          city: venueData[i].city
        },
        price: venueData[i].price,
        facilities: venueData[i].facilities,
        ground_manager: groundManagers[i % groundManagers.length]._id,
        status: random(['active', 'active', 'active', 'under_maintenance']),
        photo: {
          filename: `venue${i + 1}.jpg`,
          filepath: `/uploads/venues/venue${i + 1}.jpg`
        },
        isDeleted: false
      });
      venues.push(venue);
      console.log(`  ✓ Created venue: ${venue.name}`);
    }
    console.log(`✅ Created ${venues.length} venues\n`);

    // 3. Create Teams
    console.log('👥 Creating teams...');
    const teams = [];
    const sports = ['Cricket', 'Football', 'Rugby', 'Basketball'];
    const teamNames = [
      ['Lions CC', 'Eagles CC', 'Tigers CC'],
      ['Colombo FC', 'Kandy United', 'Galle Stars'],
      ['Lankan Lions', 'Hill Country Bulls'],
      ['Colombo Giants', 'Kandy Warriors']
    ];

    let playerIndex = 0;
    for (let sportIndex = 0; sportIndex < sports.length; sportIndex++) {
      const sport = sports[sportIndex];
      const coach = coaches[sportIndex];
      const teamNamesForSport = teamNames[sportIndex];

      for (let t = 0; t < teamNamesForSport.length; t++) {
        const teamPlayers = players.slice(playerIndex, playerIndex + 4);
        playerIndex += 4;

        const team = await Team.create({
          name: teamNamesForSport[t],
          sport: sport,
          coach: coach._id,
          player: teamPlayers.map(p => p._id),
          uniformImage: [`uniform_${sport.toLowerCase()}_${t + 1}.jpg`],
          won: Math.floor(Math.random() * 10)
        });
        teams.push(team);
        console.log(`  ✓ Created team: ${team.name} (${sport})`);
      }
    }
    console.log(`✅ Created ${teams.length} teams\n`);

    // 4. Create Player records
    console.log('⚽ Creating player records...');
    let teamIndex = 0;
    for (const player of players) {
      const team = teams[teamIndex % teams.length];
      await Player.create({
        playerid: player._id,
        jersey: String(Math.floor(Math.random() * 99) + 1),
        position: random(['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper', 'Forward', 'Midfielder', 'Defender', 'Goalkeeper', 'Guard', 'Forward', 'Center']),
        age: Math.floor(Math.random() * 15) + 20,
        height: Math.floor(Math.random() * 30) + 165,
        weight: Math.floor(Math.random() * 20) + 65,
        team: team._id
      });
      teamIndex++;
    }
    console.log(`✅ Created ${players.length} player records\n`);

    // 5. Create Bookings
    console.log('📅 Creating bookings...');
    const bookingStatuses = ['pending', 'confirmed', 'confirmed', 'confirmed', 'cancelled'];
    const paymentMethods = ['credit-card', 'paypal', 'cash'];
    const paymentStatuses = ['Not-paid', 'Paid', 'Paid', 'Paid'];

    for (let i = 0; i < 20; i++) {
      const venue = random(venues);
      const user = random(users.filter(u => ['player', 'coach'].includes(u.role)));
      const date = randomFutureDate(60);
      const startTime = new Date(date);
      startTime.setHours(Math.floor(Math.random() * 12) + 8, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 2);

      await Booking.create({
        venue: venue._id,
        from: user._id,
        date: date,
        startTime: startTime,
        endTime: endTime,
        status: random(bookingStatuses),
        method: random(paymentMethods),
        isPaid: random(paymentStatuses),
        price: venue.price
      });
    }
    console.log('✅ Created 20 bookings\n');

    // 6. Create Schedules
    console.log('📋 Creating schedules...');
    const scheduleStatuses = ['upcoming', 'upcoming', 'completed', 'Cancelled'];
    const scheduleTitles = [
      'Morning Training Session',
      'Evening Practice',
      'Team Building Exercise',
      'Fitness Training',
      'Tactical Session',
      'Match Preparation'
    ];

    for (let i = 0; i < 15; i++) {
      const coach = random(coaches);
      const venue = random(venues);
      const date = randomFutureDate(45);
      const startTime = new Date(date);
      startTime.setHours(Math.floor(Math.random() * 12) + 6, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 2);

      await Schedule.create({
        coachid: coach._id,
        venueid: venue._id,
        title: random(scheduleTitles),
        date: date,
        startTime: startTime,
        endTime: endTime,
        notes: `Training session notes ${i + 1}`,
        status: random(scheduleStatuses),
        isDeleted: false
      });
    }
    console.log('✅ Created 15 schedules\n');

    // 7. Create Equipment
    console.log('🏋️  Creating equipment...');
    const equipmentData = [
      { item: 'Cricket Bat', serialNo: 'CB001', status: 'available', price: 5000, quantity: 10 },
      { item: 'Cricket Ball', serialNo: 'CBL001', status: 'available', price: 500, quantity: 50 },
      { item: 'Football', serialNo: 'FB001', status: 'available', price: 3000, quantity: 20 },
      { item: 'Rugby Ball', serialNo: 'RB001', status: 'available', price: 4000, quantity: 15 },
      { item: 'Basketball', serialNo: 'BB001', status: 'available', price: 3500, quantity: 12 },
      { item: 'Tennis Racket', serialNo: 'TR001', status: 'available', price: 6000, quantity: 8 },
      { item: 'Badminton Racket', serialNo: 'BR001', status: 'available', price: 2500, quantity: 15 },
      { item: 'Table Tennis Paddle', serialNo: 'TTP001', status: 'available', price: 2000, quantity: 10 },
      { item: 'Volleyball', serialNo: 'VB001', status: 'available', price: 3000, quantity: 10 },
      { item: 'Hockey Stick', serialNo: 'HS001', status: 'available', price: 4500, quantity: 12 }
    ];

    const equipment = [];
    for (const eq of equipmentData) {
      const eqItem = await Equipment.create({
        ...eq,
        image: `equipment_${eq.item.toLowerCase().replace(' ', '_')}.jpg`,
        isDeleted: false
      });
      equipment.push(eqItem);
      console.log(`  ✓ Created equipment: ${eq.item}`);
    }
    console.log(`✅ Created ${equipment.length} equipment items\n`);

    // 8. Create Rentals
    console.log('📦 Creating rentals...');
    const rentalStatuses = ['upcoming', 'active', 'completed', 'cancelled'];

    for (let i = 0; i < 12; i++) {
      const eq = random(equipment);
      const user = random(users.filter(u => ['player', 'coach'].includes(u.role)));
      const rentDate = randomFutureDate(30);
      const startTime = new Date(rentDate);
      startTime.setHours(Math.floor(Math.random() * 12) + 8, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 4);

      await Rental.create({
        equipment: eq._id,
        user: user._id,
        quantity: Math.floor(Math.random() * 3) + 1,
        fullPrice: eq.price * (Math.floor(Math.random() * 3) + 1),
        rentDate: rentDate,
        startTime: startTime,
        endTime: endTime,
        status: random(rentalStatuses)
      });
    }
    console.log('✅ Created 12 rentals\n');

    // 9. Create Matches
    console.log('🏆 Creating matches...');
    const matchStatuses = ['pending', 'accepted', 'accepted', 'completed', 'cancelled'];
    const timeSlots = [
      { start: '09:00', end: '12:00' },
      { start: '14:00', end: '17:00' },
      { start: '18:00', end: '21:00' }
    ];

    for (let i = 0; i < 10; i++) {
      const team1 = random(teams);
      let team2 = random(teams);
      while (team2._id.toString() === team1._id.toString()) {
        team2 = random(teams);
      }
      const venue = random(venues);
      const matchDate = randomFutureDate(60);
      const timeSlot = random(timeSlots);

      await Match.create({
        myteam: team1._id,
        opponent: team2._id,
        matchDate: matchDate,
        startTime: timeSlot.start,
        endTime: timeSlot.end,
        ground: venue._id,
        notes: `Match between ${team1.name} and ${team2.name}`,
        status: random(matchStatuses)
      });
    }
    console.log('✅ Created 10 matches\n');

    // 10. Create Maintenance Records
    console.log('🔧 Creating maintenance records...');
    const maintenanceTitles = [
      'Grass Cutting',
      'Field Marking',
      'Lighting Repair',
      'Drainage System Check',
      'Scoreboard Maintenance',
      'Seating Area Cleaning',
      'Parking Lot Repaving'
    ];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const maintenanceStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];

    for (let i = 0; i < 8; i++) {
      const venue = random(venues);
      const gm = venue.ground_manager;

      const scheduledDate = randomFutureDate(30);
      const startTime = String(Math.floor(Math.random() * 12) + 8).padStart(2, '0') + ':00';
      const endTime = String(Math.floor(Math.random() * 4) + parseInt(startTime.split(':')[0]) + 2).padStart(2, '0') + ':00';

      await Maintenance.create({
        venue: venue._id,
        ground_manager: gm,
        title: random(maintenanceTitles),
        description: `Maintenance work for ${venue.name}: ${random(maintenanceTitles)}`,
        scheduledDate: scheduledDate,
        startTime: startTime,
        endTime: endTime,
        status: random(maintenanceStatuses),
        priority: random(priorities),
        estimatedCost: Math.floor(Math.random() * 50000) + 5000,
        actualCost: Math.floor(Math.random() * 50000) + 5000,
        assignedTo: `Contractor ${i + 1}`,
        notes: `Maintenance notes for ${venue.name}`,
        isDeleted: false
      });
    }
    console.log('✅ Created 8 maintenance records\n');

    // 11. Create Notifications
    console.log('🔔 Creating notifications...');
    const notificationTypes = [
      'booking_confirmed', 'booking_reminder', 'match_scheduled',
      'training_scheduled', 'equipment_rental_confirmed', 'payment_received',
      'account_approved', 'welcome', 'system_update'
    ];
    const notificationPriorities = ['low', 'medium', 'high', 'urgent'];

    for (let i = 0; i < 30; i++) {
      const user = random(users);
      const userType = user.role === 'ground_manager' ? 'ground_manager' :
                       user.role === 'operation_manager' ? 'operation_manager' :
                       user.role === 'coach' ? 'coach' :
                       user.role === 'player' ? 'player' : 'admin';

      await Notification.create({
        userId: user._id,
        userType: userType,
        type: random(notificationTypes),
        priority: random(notificationPriorities),
        title: `Notification ${i + 1} for ${user.name}`,
        message: `This is a notification message for ${user.name}. Details about the notification.`,
        isRead: Math.random() > 0.5,
        source: {
          type: random(['system', 'admin', 'automatic']),
          userId: admin._id
        }
      });
    }
    console.log('✅ Created 30 notifications\n');

    console.log('\n🎉 Dummy data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Venues: ${venues.length}`);
    console.log(`   Teams: ${teams.length}`);
    console.log(`   Players: ${players.length}`);
    console.log(`   Bookings: 20`);
    console.log(`   Schedules: 15`);
    console.log(`   Equipment: ${equipment.length}`);
    console.log(`   Rentals: 12`);
    console.log(`   Matches: 10`);
    console.log(`   Maintenance: 8`);
    console.log(`   Notifications: 30`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDummyData();
