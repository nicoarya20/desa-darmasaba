import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    const globalWithPrisma = global as typeof globalThis & {
        prisma: PrismaClient;
    };
    if (!globalWithPrisma.prisma) {
        globalWithPrisma.prisma = new PrismaClient();
    }
    prisma = globalWithPrisma.prisma;
}

// Handle uncaught errors
process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    await prisma.$disconnect();
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (error) => {
    console.error('Unhandled Rejection:', error);
    await prisma.$disconnect();
    process.exit(1);
});

// Handle graceful shutdown
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
    process.on('SIGINT', async () => {
        console.log('Received SIGINT signal. Closing database connections...');
        await prisma.$disconnect();
        // Allow natural exit
    });

    process.on('SIGTERM', async () => {
        console.log('Received SIGTERM signal. Closing database connections...');
        await prisma.$disconnect();
        // Allow natural exit
    });
}

export default prisma;