import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

interface UserJson {
  fullName: string;
  username: string;
}

const BIOS = [
  "Wandering through lucid dreamscapes and celestial realms.",
  "Capturing midnight thoughts and surreal visions.",
  "Digital artist dreaming in neon cyan and deep violet.",
  "Exploring the subconscious boundaries of space and time.",
  "Fascinated by recurring dreams and astral travel.",
  "Architect of imaginary worlds and futuristic cities.",
  "Dreaming in code, living in color.",
  "Seeking connections through shared subconscious experiences.",
  "Lover of starry nights, ocean waves, and cosmic mystery.",
  "Documenting my lucid dreaming journey step by step.",
  "Stargazer, dream weaver, and story seeker.",
  "Lost in a world of floating islands and glowing flora.",
  "Quiet observer of nocturnal wonderlands.",
  "Chasing nightmares until they turn into stardust.",
  "Creating art from the fragments of my morning memories.",
  "Dreamer by night, creator by day.",
  "Searching for patterns in the geometry of dreams.",
  "Navigating cosmic currents and endless horizons.",
  "Believer in the magic of subconscious creativity.",
  "Welcome to my personal dream journal."
];

const DREAM_DESCRIPTIONS = [
  "A futuristic cyberpunk city illuminated by rain-soaked neon reflections.",
  "Floating islands suspended in a violet sky with glowing crystal waterfalls.",
  "An ancient library with endless spiral staircases reaching into infinity.",
  "Walking through a forest of towering bioluminescent trees under two moons.",
  "Soaring over a glass ocean reflecting distant galaxies and nebulae.",
  "A quiet cafe on Mars serving hot coffee as dust storms swirl outside.",
  "A majestic dragon made of stardust gliding through a aurora borealis.",
  "A surreal clock tower where time flows backward and shadows dance.",
  "An underwater sanctuary filled with glowing jellyfish and sunken ruins.",
  "A mirror maze reflecting different timelines and alternate versions of myself.",
  "Riding a train across a calm, endless sea toward a golden sunset.",
  "A hidden garden where flowers sing soft melodies when touched.",
  "A neon-lit arcade trapped inside a perpetual 1980s summer night.",
  "Floating inside a giant crystal cathedral filled with ambient light.",
  "A starry night sky where constellation animals come alive and roam.",
  "Exploring a cozy cabin on a snow-covered mountain peak under a pink sky.",
  "A labyrinth made of old books, each page glowing with magical runes.",
  "Wandering through an abandoned space station overtaken by alien flora.",
  "A majestic castle built entirely of iridescent clouds at twilight.",
  "Flying through a storm of golden autumn leaves over a quiet valley.",
  "A retro-futuristic metropolis where flying cars move along light highways.",
  "Standing on the edge of the world looking out into an ocean of stars.",
  "A serene bamboo grove illuminated by thousands of floating paper lanterns.",
  "A surreal desert where the sand shines like diamonds under moonlight.",
  "A crystal clear lake that reveals memories from childhood when gazed upon.",
  "An enchanted train station where trains travel between different dimensions.",
  "A massive tree whose roots span across small floating asteroids.",
  "A peaceful field of luminescent lavender waving in a celestial breeze.",
  "A cathedral of ice under the shimmering emerald hues of a polar aurora.",
  "A surreal dream where gravity rotates every time a bell tolls."
];

const THEMES = [
  "Cyberpunk", "Fantasy", "Lucid", "Cosmic", "Adventure",
  "Surreal", "Peaceful", "Nightmare", "Sci-Fi", "Nature",
  "Celestial", "Mystical", "Futuristic"
];

const COMMENT_TEXTS = [
  "This dreamscape is absolutely mesmerizing!",
  "I had a dream remarkably similar to this last week.",
  "The color palette and mood are incredible.",
  "Was this a lucid experience or spontaneous?",
  "The imagery of floating islands always hits differently.",
  "Truly atmospheric and beautiful work.",
  "Feels like a scene straight out of a sci-fi masterpiece.",
  "I love how vivid this memory is described.",
  "Lucid dreaming at its finest!",
  "So surreal yet comforting.",
  "This gave me chills in the best way possible.",
  "The bioluminescent details sound breathtaking.",
  "Dream match magic right here!",
  "I can almost hear the ambient music from this scene.",
  "Subconscious creativity is truly infinite."
];

const CHAT_MESSAGES = [
  "Hey! Saw your recent dream post, it was incredible.",
  "Thank you so much! Have you been having lucid dreams lately?",
  "Yes! I tried reality checks yesterday and it actually worked.",
  "That's awesome! What technique did you use?",
  "Mostly checking my watch and looking at my hands twice.",
  "Classic technique. Did the scenery stabilize after that?",
  "It did! The colors became hyper-vivid instantly.",
  "I had a cosmic floating island dream last night myself.",
  "No way! You should post the visual theme on Dream Match.",
  "Just uploaded it! Let me know what you think."
];

const GENDERS = ["Female", "Male", "Non-binary"];

async function main() {
  console.log("🚀 Starting Dream Match Prisma Database Seeding...");

  // 1. Clean existing database contents in correct dependency order
  console.log("🧹 Cleaning existing data...");
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.match.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.videoBlob.deleteMany();
  await prisma.dream.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.pendingVerification.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Database cleared.");

  // 2. Read users.json
  const usersJsonPath = path.join(__dirname, 'users.json');
  const usersRawData = fs.readFileSync(usersJsonPath, 'utf-8');
  const usersList: UserJson[] = JSON.parse(usersRawData);
  console.log(`📄 Read ${usersList.length} users from users.json`);

  // Hash common password Test@123
  const hashedPassword = bcrypt.hashSync('Test@123', 10);

  // 3. Prepare 100 users from users.json
  const userRecords: any[] = usersList.map((u, i) => {
    const username = u.username.trim();
    const fullName = u.fullName.trim();
    return {
      id: randomUUID(),
      username: username,
      fullName: fullName,
      email: `${username.toLowerCase()}@dreammatch.ai`,
      password: hashedPassword,
      gender: GENDERS[i % GENDERS.length],
      age: 18 + ((i * 7) % 45),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
      bio: BIOS[i % BIOS.length],
      streakCount: (i * 3) % 28,
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - (i * 3600000 * 6)),
      updatedAt: new Date()
    };
  });

  // 4. Prepare ADMIN account
  const adminUser = {
    id: randomUUID(),
    username: 'admin',
    fullName: 'System Administrator',
    email: 'admin@dreammatch.ai',
    password: hashedPassword,
    gender: 'Other',
    age: 30,
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=7c3aed&color=fff',
    bio: 'Master controller of the Dreamscape Matrix.',
    streakCount: 100,
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const allUsers = [adminUser, ...userRecords];
  console.log(`👤 Inserting ${allUsers.length} total users (100 users + 1 admin)...`);
  await prisma.user.createMany({ data: allUsers });
  console.log("✅ Users created.");

  // 5. Generate 300 Dreams
  console.log("🌌 Generating 300 Dreams...");
  const dreamRecords: any[] = [];
  for (let i = 0; i < 300; i++) {
    const author = allUsers[i % allUsers.length];
    const description = DREAM_DESCRIPTIONS[i % DREAM_DESCRIPTIONS.length];
    const theme = THEMES[i % THEMES.length];
    dreamRecords.push({
      id: randomUUID(),
      userId: author.id,
      description: `${description} #${theme}`,
      imageUrl: `https://picsum.photos/seed/dream_${i + 1}/512/896`,
      videoUrl: i % 10 === 0 ? `/api/videos/demo_video_${i}.mp4` : null,
      theme: theme,
      views: 15 + ((i * 29) % 3200),
      status: 'VISIBLE',
      isFeatured: i % 15 === 0,
      createdAt: new Date(Date.now() - (30 - (i % 30)) * 86400000 + (i * 12345) % 86400000)
    });
  }
  await prisma.dream.createMany({ data: dreamRecords });
  console.log("✅ 300 Dreams created.");

  // 6. Generate 1000 Follows
  console.log("👥 Generating 1000 Follows...");
  const followPairs = new Set<string>();
  const followRecords: any[] = [];
  while (followRecords.length < 1000) {
    const followerIdx = Math.floor(Math.random() * allUsers.length);
    const followingIdx = Math.floor(Math.random() * allUsers.length);
    if (followerIdx !== followingIdx) {
      const followerId = allUsers[followerIdx].id;
      const followingId = allUsers[followingIdx].id;
      const key = `${followerId}:${followingId}`;
      if (!followPairs.has(key)) {
        followPairs.add(key);
        followRecords.push({
          followerId,
          followingId,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 20 * 86400000))
        });
      }
    }
  }
  await prisma.follow.createMany({ data: followRecords });
  console.log("✅ 1000 Follows created.");

  // 7. Generate 2500 Likes
  console.log("❤️ Generating 2500 Likes...");
  const likePairs = new Set<string>();
  const likeRecords: any[] = [];
  while (likeRecords.length < 2500) {
    const userIdx = Math.floor(Math.random() * allUsers.length);
    const dreamIdx = Math.floor(Math.random() * dreamRecords.length);
    const userId = allUsers[userIdx].id;
    const dreamId = dreamRecords[dreamIdx].id;
    const key = `${userId}:${dreamId}`;
    if (!likePairs.has(key)) {
      likePairs.add(key);
      likeRecords.push({
        id: randomUUID(),
        userId,
        dreamId,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 25 * 86400000))
      });
    }
  }
  await prisma.like.createMany({ data: likeRecords });
  console.log("✅ 2500 Likes created.");

  // 8. Generate 500 Comments
  console.log("💬 Generating 500 Comments...");
  const commentRecords: any[] = [];
  for (let i = 0; i < 500; i++) {
    const userIdx = (i * 3) % allUsers.length;
    const dreamIdx = (i * 7) % dreamRecords.length;
    commentRecords.push({
      id: randomUUID(),
      text: COMMENT_TEXTS[i % COMMENT_TEXTS.length],
      userId: allUsers[userIdx].id,
      dreamId: dreamRecords[dreamIdx].id,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 15 * 86400000))
    });
  }
  await prisma.comment.createMany({ data: commentRecords });
  console.log("✅ 500 Comments created.");

  // 9. Generate 150 Conversations & 1500 Messages
  console.log("💬 Generating 150 Conversations & 1500 Messages...");
  const convPairs = new Set<string>();
  const conversationRecords: any[] = [];
  while (conversationRecords.length < 150) {
    const u1Idx = Math.floor(Math.random() * allUsers.length);
    const u2Idx = Math.floor(Math.random() * allUsers.length);
    if (u1Idx !== u2Idx) {
      const u1Id = allUsers[u1Idx].id;
      const u2Id = allUsers[u2Idx].id;
      const key = u1Id < u2Id ? `${u1Id}:${u2Id}` : `${u2Id}:${u1Id}`;
      if (!convPairs.has(key)) {
        convPairs.add(key);
        conversationRecords.push({
          id: randomUUID(),
          userId: u1Id,
          otherUserId: u2Id,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 10 * 86400000)),
          updatedAt: new Date()
        });
      }
    }
  }

  const messageRecords: any[] = [];

  for (const conv of conversationRecords) {
    const msgCount = 10; // 10 messages per conversation = 1500 total messages
    let lastMsgContent = "";
    let lastMsgDate = conv.createdAt;

    for (let m = 0; m < msgCount; m++) {
      const isSenderUser = m % 2 === 0;
      const senderId = isSenderUser ? conv.userId : conv.otherUserId;
      const receiverId = isSenderUser ? conv.otherUserId : conv.userId;
      const content = CHAT_MESSAGES[m % CHAT_MESSAGES.length];
      const msgDate = new Date(conv.createdAt.getTime() + (m + 1) * 300000);

      messageRecords.push({
        id: randomUUID(),
        conversationId: conv.id,
        senderId,
        receiverId,
        content,
        read: m < msgCount - 2, // last 2 unread
        createdAt: msgDate
      });

      lastMsgContent = content;
      lastMsgDate = msgDate;
    }

    conv.lastMessage = lastMsgContent;
    conv.lastMessageAt = lastMsgDate;
  }

  await prisma.conversation.createMany({ data: conversationRecords });
  await prisma.message.createMany({ data: messageRecords });
  console.log("✅ 150 Conversations & 1500 Messages created.");

  // 10. Generate Notifications
  console.log("🔔 Generating Notifications...");
  const notificationRecords: any[] = [];
  // Generate 500 notifications based on likes and follows
  for (let i = 0; i < 500; i++) {
    const type = ["LIKE", "FOLLOW", "COMMENT"][i % 3];
    const sender = allUsers[(i * 5) % allUsers.length];
    const receiver = allUsers[(i * 5 + 3) % allUsers.length];
    const dream = dreamRecords[(i * 3) % dreamRecords.length];

    if (sender.id !== receiver.id) {
      let msg = "";
      if (type === "LIKE") msg = `${sender.fullName} liked your dream.`;
      else if (type === "FOLLOW") msg = `${sender.fullName} started following you.`;
      else msg = `${sender.fullName} commented on your dream.`;

      notificationRecords.push({
        id: randomUUID(),
        type,
        senderId: sender.id,
        receiverId: receiver.id,
        dreamId: type !== "FOLLOW" ? dream.id : null,
        message: msg,
        read: i % 2 === 0,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 15 * 86400000))
      });
    }
  }
  await prisma.notification.createMany({ data: notificationRecords });
  console.log("✅ Notifications created.");

  console.log("\n🎉 SEEDING COMPLETE!");
  console.log("==========================================");
  console.log(`👤 Users Created:         ${allUsers.length} (100 users + 1 admin)`);
  console.log(`🌌 Dreams Created:        ${dreamRecords.length}`);
  console.log(`👥 Follows Created:       ${followRecords.length}`);
  console.log(`❤️ Likes Created:         ${likeRecords.length}`);
  console.log(`💬 Comments Created:      ${commentRecords.length}`);
  console.log(`💬 Conversations Created: ${conversationRecords.length}`);
  console.log(`📨 Messages Created:      ${messageRecords.length}`);
  console.log(`🔔 Notifications Created: ${notificationRecords.length}`);
  console.log("==========================================");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
