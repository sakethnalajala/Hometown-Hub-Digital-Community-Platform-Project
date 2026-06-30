import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import {
  DEMO_USER_ID,
  COMMUNITY_NAMES,
  JOB_TITLES,
  NEWS_CATEGORIES,
  EVENT_TYPES,
  TOURISM_TYPES,
  GOV_SERVICES,
  avatar,
  companyLogo,
  nextImage,
  randomPastDate,
  randomFutureDate,
  slugify,
} from './seed-helpers';

const prisma = new PrismaClient();

async function clearDatabase() {
  const tables = [
    'bookmark', 'commentLike', 'comment', 'postLike', 'postTag', 'post',
    'communityTag', 'communityMember', 'eventParticipant', 'event',
    'notification', 'report', 'refreshToken', 'passwordReset', 'auditLog',
    'productReview', 'product', 'job', 'newsArticle', 'tourismPlace', 'govService',
    'community', 'category', 'tag', 'user',
  ];
  for (const t of tables) {
    await (prisma as any)[t].deleteMany().catch(() => {});
  }
}

async function main() {
  console.log('🗑️  Clearing database...');
  await clearDatabase();

  const passwordHash = await bcrypt.hash('Demo@12345', 10);
  faker.seed(42);

  console.log('👥 Creating 300+ users...');
  const users: { id: string }[] = [];

  users.push(await prisma.user.create({
    data: {
      id: DEMO_USER_ID,
      name: 'Demo User',
      username: 'demouser',
      email: 'demo@hometownhub.com',
      passwordHash,
      hometown: 'New York',
      currentCity: 'New York City',
      phone: '+1 (555) 123-4567',
      profileImage: avatar('demo-user'),
      coverImage: nextImage(1200, 400),
      bio: 'Welcome to Hometown Hub! Demo account for testing all platform features.',
      interests: JSON.stringify(['Community', 'Events', 'Technology']),
      role: 'ADMIN',
      isVerified: true,
      isActive: true,
    },
  }));

  for (let i = 0; i < 299; i++) {
    const name = faker.person.fullName();
    const username = slugify(name) + i + faker.string.alphanumeric(3).toLowerCase();
    users.push(await prisma.user.create({
      data: {
        name,
        username: username.slice(0, 20),
        email: faker.internet.email().toLowerCase(),
        passwordHash,
        hometown: faker.location.city(),
        currentCity: faker.location.city(),
        phone: faker.phone.number(),
        profileImage: avatar(`${name}-${i}`),
        coverImage: nextImage(1200, 400),
        bio: faker.person.bio().slice(0, 200),
        interests: JSON.stringify(faker.helpers.arrayElements(
          ['Tech', 'Sports', 'Music', 'Travel', 'Food', 'Art', 'Business', 'Health'], 3
        )),
        role: 'USER',
        isVerified: faker.datatype.boolean({ probability: 0.7 }),
        isActive: true,
      },
    }));
    if ((i + 1) % 50 === 0) console.log(`   ${i + 1} users created...`);
  }

  console.log('📂 Creating categories...');
  const catNames = ['Technology', 'Business', 'Entertainment', 'Sports', 'Education', 'Health', 'Lifestyle', 'Arts', 'Travel', 'Food'];
  const categories = await Promise.all(catNames.map((name) =>
    prisma.category.create({ data: { name, slug: slugify(name) } })
  ));

  console.log('🏘️  Creating 30 communities...');
  const communities = [];
  for (let i = 0; i < COMMUNITY_NAMES.length; i++) {
    const name = COMMUNITY_NAMES[i];
    const owner = users[i % users.length];
    const memberSample = faker.helpers.arrayElements(users, faker.number.int({ min: 8, max: 25 }));
    const comm = await prisma.community.create({
      data: {
        name,
        slug: slugify(name) + (i > 0 ? `-${i}` : ''),
        description: `${name} — Connect with passionate members in your hometown. Share ideas, organize events, and build lasting relationships.`,
        city: faker.location.city(),
        bannerImage: nextImage(800, 300),
        logoImage: nextImage(200, 200),
        status: 'APPROVED',
        isPrivate: false,
        memberCount: memberSample.length + 1,
        postCount: faker.number.int({ min: 5, max: 50 }),
        categoryId: categories[i % categories.length].id,
        createdById: owner.id,
        rules: JSON.stringify(['Be respectful', 'No spam', 'Stay on topic']),
      },
    });
    communities.push(comm);
    await prisma.communityMember.create({
      data: { userId: owner.id, communityId: comm.id, role: 'ADMIN', status: 'APPROVED' },
    });
    for (const m of memberSample) {
      if (m.id !== owner.id) {
        await prisma.communityMember.create({
          data: { userId: m.id, communityId: comm.id, role: faker.helpers.arrayElement(['MEMBER', 'MODERATOR']), status: 'APPROVED' },
        }).catch(() => {});
      }
    }
  }

  console.log('💼 Creating 120 jobs...');
  const jobTypes = ['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'];
  for (let i = 0; i < 120; i++) {
    const title = JOB_TITLES[i % JOB_TITLES.length] + (i >= JOB_TITLES.length ? ` ${Math.floor(i / JOB_TITLES.length) + 1}` : '');
    const company = faker.company.name();
    await prisma.job.create({
      data: {
        title,
        company,
        companyLogo: companyLogo(company),
        salary: `₹${faker.number.int({ min: 3, max: 15 })}–${faker.number.int({ min: 16, max: 35 })} LPA`,
        location: faker.helpers.arrayElement(['Remote', faker.location.city(), 'Hybrid']),
        description: `${company} is hiring a ${title}. ${faker.lorem.paragraphs(2)} Requirements: ${faker.lorem.sentence()}`,
        skills: JSON.stringify(faker.helpers.arrayElements(
          ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Communication', 'Leadership', 'Excel', 'Design', 'Marketing'], 4
        )),
        authorId: users[i % users.length].id,
        createdAt: randomPastDate(60),
      },
    });
  }

  console.log('📰 Creating 120 news articles...');
  for (let i = 0; i < 120; i++) {
    const author = users[(i * 3) % users.length];
    const cat = NEWS_CATEGORIES[i % NEWS_CATEGORIES.length];
    await prisma.newsArticle.create({
      data: {
        title: faker.lorem.sentence({ min: 6, max: 12 }).replace('.', ''),
        content: faker.lorem.paragraphs(4),
        category: cat,
        image: nextImage(800, 450),
        authorId: author.id,
        views: faker.number.int({ min: 100, max: 50000 }),
        likes: faker.number.int({ min: 0, max: 2000 }),
        createdAt: randomPastDate(90),
      },
    });
  }

  console.log('📅 Creating 80 events...');
  for (let i = 0; i < 80; i++) {
    const org = users[(i * 2) % users.length];
    const comm = communities[i % communities.length];
    const type = EVENT_TYPES[i % EVENT_TYPES.length];
    const date = randomFutureDate(90);
    await prisma.event.create({
      data: {
        title: `${type}: ${faker.lorem.words(3)}`,
        description: faker.lorem.paragraphs(2),
        location: faker.location.streetAddress(),
        date,
        endDate: new Date(date.getTime() + 3 * 3600000),
        bannerImage: nextImage(800, 300),
        isOnline: faker.datatype.boolean({ probability: 0.15 }),
        maxParticipants: faker.number.int({ min: 50, max: 2000 }),
        status: 'UPCOMING',
        organizerId: org.id,
        communityId: comm.id,
      },
    });
  }

  console.log('🗺️  Creating tourism places...');
  for (let i = 0; i < 60; i++) {
    const type = TOURISM_TYPES[i % TOURISM_TYPES.length];
    await prisma.tourismPlace.create({
      data: {
        name: `${faker.location.city()} ${type.replace('_', ' ')}`,
        type,
        description: faker.lorem.paragraph(),
        location: faker.location.city(),
        rating: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
        images: JSON.stringify([nextImage(), nextImage(400, 300)]),
      },
    });
  }

  console.log('🏛️  Creating government services...');
  for (const svc of GOV_SERVICES) {
    await prisma.govService.create({
      data: {
        name: svc.name,
        category: svc.category,
        description: faker.lorem.sentence(),
        link: 'https://serviceonline.gov.in',
        icon: '🏛️',
      },
    });
  }

  console.log('🛒 Creating marketplace products...');
  const productCats = ['Electronics', 'Fashion', 'Home', 'Food', 'Art', 'Books', 'Garden', 'Sports', 'Health', 'Kids'];
  for (let i = 0; i < 50; i++) {
    const seller = users[(i * 5) % users.length];
    const product = await prisma.product.create({
      data: {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price({ min: 99, max: 9999 })),
        category: productCats[i % productCats.length],
        images: JSON.stringify([nextImage(400, 400)]),
        sellerId: seller.id,
        rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
      },
    });
    for (let r = 0; r < faker.number.int({ min: 1, max: 3 }); r++) {
      await prisma.productReview.create({
        data: {
          content: faker.lorem.sentence(),
          rating: faker.number.int({ min: 3, max: 5 }),
          productId: product.id,
          authorId: users[(i + r + 10) % users.length].id,
        },
      });
    }
  }

  console.log('📝 Creating posts and comments...');
  const commentTexts = [
    'Great post! Thanks for sharing.', 'This is really helpful.', 'Count me in!',
    'Has anyone tried this before?', 'Sharing with my friends!', 'Love this community.',
    'When is the next one?', 'Excellent initiative!', 'Well said!', 'Interesting perspective.',
  ];
  for (let i = 0; i < 200; i++) {
    const author = users[(i * 7) % users.length];
    const comm = communities[i % communities.length];
    const post = await prisma.post.create({
      data: {
        content: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
        images: JSON.stringify(faker.datatype.boolean({ probability: 0.3 }) ? [nextImage()] : []),
        type: i % 15 === 0 ? 'ANNOUNCEMENT' : 'TEXT',
        authorId: author.id,
        communityId: comm.id,
        likeCount: faker.number.int({ min: 0, max: 100 }),
        commentCount: faker.number.int({ min: 0, max: 30 }),
        shareCount: faker.number.int({ min: 0, max: 20 }),
        createdAt: randomPastDate(30),
      },
    });
    const commentCount = faker.number.int({ min: 2, max: 6 });
    for (let c = 0; c < commentCount; c++) {
      const commenter = users[(i + c + 1) % users.length];
      await prisma.comment.create({
        data: {
          content: commentTexts[(i + c) % commentTexts.length],
          authorId: commenter.id,
          postId: post.id,
          likeCount: faker.number.int({ min: 0, max: 10 }),
          createdAt: randomPastDate(20),
        },
      });
    }
  }

  console.log('🔔 Creating notifications...');
  for (let i = 0; i < 50; i++) {
    await prisma.notification.create({
      data: {
        type: faker.helpers.arrayElement(['POST_LIKE', 'COMMENT', 'EVENT_REMINDER', 'COMMUNITY_JOIN']),
        title: 'Activity Update',
        body: faker.lorem.sentence(),
        receiverId: DEMO_USER_ID,
        senderId: users[(i + 5) % users.length].id,
        isRead: i > 20,
        createdAt: randomPastDate(14),
      },
    });
  }

  console.log('👤 Joining demo user to communities...');
  for (let i = 0; i < Math.min(10, communities.length); i++) {
    await prisma.communityMember.create({
      data: { userId: DEMO_USER_ID, communityId: communities[i].id, role: 'MEMBER', status: 'APPROVED' },
    }).catch(() => {});
  }

  console.log('✅ Seed complete!');
  console.log(`   Users: ${users.length}`);
  console.log(`   Communities: ${communities.length}`);
  console.log('   Jobs: 120 | News: 120 | Events: 80 | Tourism: 60 | Products: 50 | Posts: 200');
  console.log('   Demo login: demo@hometownhub.com / Demo@12345');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
