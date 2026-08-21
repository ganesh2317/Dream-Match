/**
 * SAFE Database Seeding Script for Dream Match
 * Generates and seeds EXACTLY 123 fictional test users into the PostgreSQL database.
 * 
 * Safety Rules:
 * - TEST DATA ONLY
 * - NEVER delete, update, or alter existing users or application data
 * - Avoid duplicate usernames and emails
 * - Common hashed test password (never plaintext)
 * - Purely fictional accounts with diverse international names
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Ensure connection timeout settings for cloud Neon database
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('connect_timeout')) {
    const separator = process.env.DATABASE_URL.includes('?') ? '&' : '?';
    process.env.DATABASE_URL += `${separator}connect_timeout=30&pool_timeout=30`;
}

const prisma = new PrismaClient();

// Configuration
const TARGET_USER_COUNT = 123;
const COMMON_TEST_PASSWORD = 'DreamUser2026!';

// Name pools across diverse international regions
const CULTURES = [
    {
        region: 'Indian',
        firstNames: ['Rahul', 'Ananya', 'Arjun', 'Priya', 'Rohan', 'Kavya', 'Devendra', 'Ishaan', 'Diya', 'Aaditya', 'Meera', 'Siddharth', 'Neha', 'Vikram', 'Pooja', 'Tanvi', 'Yash', 'Sunita', 'Rajesh', 'Swati'],
        lastNames: ['Mehta', 'Sharma', 'Patel', 'Nair', 'Verma', 'Gupta', 'Singh', 'Joshi', 'Reddy', 'Kumar', 'Iyer', 'Kapoor', 'Saxena', 'Rao', 'Das', 'Kulkarni', 'Malhotra', 'Hegde', 'Pillai', 'Deshmukh']
    },
    {
        region: 'American',
        firstNames: ['Alex', 'Emily', 'Marcus', 'Sarah', 'Christopher', 'Olivia', 'Ethan', 'Madison', 'James', 'Chloe', 'Ryan', 'Hannah', 'Daniel', 'Grace', 'Matthew', 'Ava', 'Joshua', 'Ella', 'Benjamin', 'Harper'],
        lastNames: ['Johnson', 'Davis', 'Miller', 'Jenkins', 'Taylor', 'Wilson', 'Carter', 'Reed', 'Anderson', 'Brooks', 'White', 'Hall', 'Thomas', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark']
    },
    {
        region: 'European',
        firstNames: ['Lucas', 'Emma', 'Matteo', 'Sofia', 'Lars', 'Freja', 'Antoine', 'Clara', 'Jan', 'Elena', 'Henrik', 'Astrid', 'Marco', 'Chloe', 'Mikkel', 'Ingrid', 'Stefan', 'Nina', 'Hugo', 'Ines'],
        lastNames: ['Mueller', 'Dubois', 'Rossi', 'Garcia', 'Hansen', 'Lindqvist', 'Bernard', 'Fischer', 'Novak', 'Popa', 'Weber', 'Schneider', 'Conti', 'Larsen', 'Nielsen', 'Kovacs', 'Varga', 'Moreau', 'Janssens', 'Nilsson']
    },
    {
        region: 'Latin American',
        firstNames: ['Carlos', 'Isabella', 'Mateo', 'Valentina', 'Diego', 'Camila', 'Gabriel', 'Lucia', 'Santiago', 'Mariana', 'Alejandro', 'Sofia', 'Fernando', 'Natalia', 'Joaquin', 'Emilia', 'Rodrigo', 'Valerie', 'Andres', 'Renata'],
        lastNames: ['Gomez', 'Fernandez', 'Hernandez', 'Silva', 'Rodriguez', 'Torres', 'Santos', 'Morales', 'Castro', 'Ortiz', 'Alvarez', 'Romero', 'Gutierrez', 'Chavez', 'Ramos', 'Mendoza', 'Vargas', 'Castillo', 'Ruiz', 'Flores']
    },
    {
        region: 'Middle Eastern',
        firstNames: ['Tariq', 'Layla', 'Omar', 'Fatima', 'Youssef', 'Nour', 'Zayd', 'Yasmin', 'Bilal', 'Zainab', 'Hamza', 'Mariam', 'Karim', 'Rania', 'Mustafa', 'Amira', 'Khalid', 'Dana', 'Hassan', 'Huda'],
        lastNames: ['Mansoor', 'Haddad', 'Farooq', 'Zahra', 'Amrani', 'Hassan', 'Rahimi', 'Mirza', 'Kassam', 'Farsi', 'Mansour', 'Najjar', 'Qasim', 'Khoury', 'Saadi', 'Tahan', 'Bazzi', 'Khalil', 'Sleiman', 'Darwish']
    },
    {
        region: 'East Asian',
        firstNames: ['Kenji', 'Meiling', 'Minjae', 'Yuto', 'Lin', 'Hana', 'Hiroshi', 'Jiwoo', 'Xiao', 'Sakura', 'Jun', 'Xiaowei', 'Hyunwoo', 'Ren', 'Ting', 'Soyoung', 'Naoki', 'Yujin', 'Chen', 'Aoi'],
        lastNames: ['Takahashi', 'Chen', 'Park', 'Sato', 'Wei', 'Kim', 'Tanaka', 'Lee', 'Zhang', 'Watanabe', 'Suzuki', 'Lin', 'Wang', 'Liu', 'Yang', 'Wu', 'Huang', 'Zhou', 'Xu', 'Yamamoto']
    },
    {
        region: 'African',
        firstNames: ['Kwame', 'Amara', 'Tendai', 'Zuri', 'Kofi', 'Nia', 'Sekou', 'Thabo', 'Akeyo', 'Chidubem', 'Babatunde', 'Kemi', 'Tunde', 'Zola', 'Juma', 'Amina', 'Oumar', 'Fatima', 'Tsegaye', 'Makeba'],
        lastNames: ['Mensah', 'Okonkwo', 'Moyo', 'Abara', 'Osei', 'Kamau', 'Traore', 'Molefe', 'Diallo', 'Nnamdi', 'Adebayo', 'Ibrahim', 'Keita', 'Sow', 'Diop', 'Okafor', 'Ndlovu', 'Mbeki', 'Kenyatta', 'Asante']
    },
    {
        region: 'Other International',
        firstNames: ['Dmitry', 'Olga', 'Liam', 'Mateo', 'Anya', 'Sven', 'Freya', 'Boris', 'Natascha', 'Pavel', 'Ivan', 'Katya', 'Nikolai', 'Irina', 'Taras', 'Oksana', 'Jan', 'Maja', 'Stepan', 'Elena'],
        lastNames: ['Ivanov', 'Smirnova', 'OConnor', 'Kovacic', 'Petrova', 'Lindgren', 'Svoboda', 'Horvat', 'Jansen', 'Nagy', 'Dubov', 'Popovic', 'Molnar', 'Schmidt', 'Hansen', 'Kovac', 'Novak', 'Berger', 'Becker', 'Fischer']
    }
];

const BIOS = [
    "Passionate dream traveler & digital artist ✨",
    "Exploring lucid dreams and subconscious art 🌙",
    "Software developer by day, dream architect by night 🚀",
    "Coffee lover, stargazer, and story seeker 🌌",
    "Capturing surreal visual moments and thoughts 🎨",
    "Dream enthusiast mapping sleep psychology 💤",
    "Music producer crafting ambient dreamscapes 🎵",
    "Photographer chasing light, shadow, and imagination 📷",
    "Wanderer in real life and in dreams 🌍",
    "Visual storyteller building surreal worlds 🔮",
    "Astronomy buff & night sky dreamer ⭐",
    "Yoga practitioner & mindfulness advocate 🧘",
    "Bookworm sharing nocturnal adventures 📚",
    "Gamer and virtual worlds creator 🎮",
    "Philosopher exploring consciousness and vision 🧠",
    "Poet weaving dreams into prose ✍️",
    "Architect designing surreal landscapes 🏛️",
    "Acoustic dream spinner & musician 🎸",
    "Film buff fascinated by cinematic dreams 🎬",
    "Futurist imagining tomorrow's dreamscapes 🚀"
];

const GENDERS = ['male', 'female', 'other'];

/**
 * Format clean username from first and last name.
 * Keeps characters alphanumeric and underscore, capped between 3 and 20 chars.
 */
function generateBaseUsername(firstName, lastName) {
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
    let base = `${cleanFirst}_${cleanLast}`;
    if (base.length > 20) {
        base = base.substring(0, 20);
    }
    if (base.length < 3) {
        base = `${base}_usr`.substring(0, 20);
    }
    return base;
}

/**
 * Generate a unique username that does not exist in usedUsernames set.
 */
function makeUniqueUsername(base, usedSet) {
    if (!usedSet.has(base.toLowerCase())) {
        return base;
    }

    let counter = 1;
    while (counter < 9999) {
        const suffix = String(counter);
        const maxBaseLength = 20 - suffix.length;
        const candidate = `${base.substring(0, maxBaseLength)}${suffix}`;
        if (!usedSet.has(candidate.toLowerCase())) {
            return candidate;
        }
        counter++;
    }
    
    // Fallback timestamp suffix
    const timeStr = String(Date.now()).slice(-4);
    return `${base.substring(0, 16)}${timeStr}`;
}

/**
 * Generate a unique email using @example.com domain.
 */
function makeUniqueEmail(username, usedSet) {
    let email = `${username}@example.com`.toLowerCase();
    if (!usedSet.has(email)) {
        return email;
    }

    let counter = 1;
    while (counter < 9999) {
        email = `${username}_${counter}@example.com`.toLowerCase();
        if (!usedSet.has(email)) {
            return email;
        }
        counter++;
    }

    return `${username}_${Date.now()}@example.com`.toLowerCase();
}

async function seed123Users() {
    console.log("========================================");
    console.log("DREAM MATCH TEST USER SEED INITIALIZING");
    console.log("========================================");

    let skippedDuplicates = 0;
    let failedCount = 0;
    let createdCount = 0;
    let initialCount = 0;
    const sampleUsernames = [];

    try {
        // Step 1: Connect & inspect existing User table
        const existingUsers = await prisma.user.findMany({
            select: { id: true, username: true, email: true }
        });
        initialCount = existingUsers.length;
        console.log(`[SAFETY CHECK] Existing user records in database: ${initialCount}`);

        const usedUsernames = new Set(existingUsers.map(u => u.username.toLowerCase()));
        const usedEmails = new Set(existingUsers.filter(u => u.email).map(u => u.email.toLowerCase()));

        // Step 2: Hash common password once for performance
        console.log("Hashing common test password...");
        const hashedPassword = await bcrypt.hash(COMMON_TEST_PASSWORD, 10);

        // Step 3: Generate exactly 123 unique users
        console.log(`Generating payload for ${TARGET_USER_COUNT} fictional users...`);
        const usersToCreate = [];

        let cultureIndex = 0;
        let fnIndex = 0;
        let lnIndex = 0;

        while (usersToCreate.length < TARGET_USER_COUNT) {
            const culture = CULTURES[cultureIndex % CULTURES.length];
            const firstName = culture.firstNames[fnIndex % culture.firstNames.length];
            const lastName = culture.lastNames[lnIndex % culture.lastNames.length];
            const fullName = `${firstName} ${lastName}`;

            // Increment pointers for determinism & variety
            lnIndex++;
            if (lnIndex % culture.lastNames.length === 0) {
                fnIndex++;
            }
            if (fnIndex % culture.firstNames.length === 0 && lnIndex % culture.lastNames.length === 0) {
                cultureIndex++;
            }

            const rawBaseUsername = generateBaseUsername(firstName, lastName);
            const username = makeUniqueUsername(rawBaseUsername, usedUsernames);
            const email = makeUniqueEmail(username, usedEmails);

            // Record used username & email
            usedUsernames.add(username.toLowerCase());
            usedEmails.add(email.toLowerCase());

            const age = Math.floor(Math.random() * (35 - 18 + 1)) + 18; // 18 - 35
            const gender = GENDERS[usersToCreate.length % GENDERS.length];
            const bio = BIOS[usersToCreate.length % BIOS.length];
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

            usersToCreate.push({
                fullName,
                username,
                email,
                password: hashedPassword,
                age,
                gender,
                bio,
                avatarUrl,
                role: 'USER',
                status: 'ACTIVE',
                streakCount: 0
            });
        }

        console.log(`Batch inserting ${usersToCreate.length} users into PostgreSQL database...`);

        // Step 4: Insert users using Prisma transaction / createMany
        const batchResult = await prisma.user.createMany({
            data: usersToCreate,
            skipDuplicates: true
        });

        createdCount = batchResult.count;
        skippedDuplicates = TARGET_USER_COUNT - createdCount;

        // Populate sample usernames for reporting
        for (let i = 0; i < Math.min(5, usersToCreate.length); i++) {
            sampleUsernames.push(usersToCreate[i].username);
        }

    } catch (err) {
        console.error("[SEED ERROR] Database operation failed:", err.message);
        failedCount = TARGET_USER_COUNT - createdCount;
        throw err;
    } finally {
        await prisma.$disconnect();
    }

    // Step 5: Format and Output summary report
    console.log("\n========================================");
    console.log("DREAM MATCH TEST USER SEED");
    console.log("========================================");
    console.log(`Requested users: ${TARGET_USER_COUNT}`);
    console.log(`Successfully created: ${createdCount}`);
    console.log(`Skipped duplicates: ${skippedDuplicates}`);
    console.log(`Failed: ${failedCount}`);
    console.log("\n========================================");
    console.log("TEST LOGIN");
    console.log("========================================");
    console.log("Username examples:");
    sampleUsernames.forEach(u => console.log(` - ${u}`));
    console.log(`\nCommon password:`);
    console.log(COMMON_TEST_PASSWORD);
    console.log("========================================\n");

    return {
        requested: TARGET_USER_COUNT,
        created: createdCount,
        skipped: skippedDuplicates,
        failed: failedCount,
        sampleUsernames,
        password: COMMON_TEST_PASSWORD
    };
}

// Execute script if run directly from node CLI
if (require.main === module) {
    seed123Users()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = { seed123Users, COMMON_TEST_PASSWORD };
