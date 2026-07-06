const prisma = require('../utils/prisma');

const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await prisma.conversation.findMany({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: { lastMessageAt: 'desc' }
        });

        // Fetch other user details for each conversation
        const conversationsWithUsers = await Promise.all(
            conversations.map(async (conv) => {
                const otherUser = await prisma.user.findUnique({
                    where: { id: conv.otherUserId },
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatarUrl: true
                    }
                });

                return {
                    ...conv,
                    otherUser
                };
            })
        );

        res.json(conversationsWithUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
};

const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { userId: otherUserId } = req.params;

        // Find or create conversation
        let conversation = await prisma.conversation.findUnique({
            where: {
                userId_otherUserId: {
                    userId,
                    otherUserId
                }
            }
        });

        if (!conversation) {
            try {
                conversation = await prisma.conversation.create({
                    data: {
                        userId,
                        otherUserId
                    }
                });
            } catch (e) {
                conversation = await prisma.conversation.findUnique({
                    where: {
                        userId_otherUserId: {
                            userId,
                            otherUserId
                        }
                    }
                });
            }

            // Create reverse conversation for the other user if it doesn't exist
            try {
                await prisma.conversation.create({
                    data: {
                        userId: otherUserId,
                        otherUserId: userId
                    }
                });
            } catch (e) {
                // Ignore key constraint failures if it already exists
            }
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Mark messages as read
        await prisma.message.updateMany({
            where: {
                senderId: otherUserId,
                receiverId: userId,
                read: false
            },
            data: { read: true }
        });

        // Reset unread count for current user's conversation
        await prisma.conversation.update({
            where: {
                userId_otherUserId: {
                    userId,
                    otherUserId
                }
            },
            data: { unreadCount: 0 }
        });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { userId: receiverId } = req.params;
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ message: 'Message content is required' });
        }

        // Find or create conversation for sender using high-perf findUnique
        let senderConversation = await prisma.conversation.findUnique({
            where: {
                userId_otherUserId: {
                    userId: senderId,
                    otherUserId: receiverId
                }
            }
        });

        if (!senderConversation) {
            try {
                senderConversation = await prisma.conversation.create({
                    data: {
                        userId: senderId,
                        otherUserId: receiverId
                    }
                });
            } catch (e) {
                senderConversation = await prisma.conversation.findUnique({
                    where: {
                        userId_otherUserId: {
                            userId: senderId,
                            otherUserId: receiverId
                        }
                    }
                });
            }
        }

        // Find or create conversation for receiver
        let receiverConversation = await prisma.conversation.findUnique({
            where: {
                userId_otherUserId: {
                    userId: receiverId,
                    otherUserId: senderId
                }
            }
        });

        if (!receiverConversation) {
            try {
                receiverConversation = await prisma.conversation.create({
                    data: {
                        userId: receiverId,
                        otherUserId: senderId
                    }
                });
            } catch (e) {
                receiverConversation = await prisma.conversation.findUnique({
                    where: {
                        userId_otherUserId: {
                            userId: receiverId,
                            otherUserId: senderId
                        }
                    }
                });
            }
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                conversationId: senderConversation.id,
                senderId,
                receiverId,
                content
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatarUrl: true
                    }
                }
            }
        });

        // Update both conversations
        const now = new Date();
        await prisma.conversation.update({
            where: { id: senderConversation.id },
            data: {
                lastMessage: content,
                lastMessageAt: now
            }
        });

        await prisma.conversation.update({
            where: { id: receiverConversation.id },
            data: {
                lastMessage: content,
                lastMessageAt: now,
                unreadCount: { increment: 1 }
            }
        });

        // Broadcast to sockets
        const io = req.app.get('io');
        const userSockets = req.app.get('userSockets');
        if (io && userSockets) {
            // Recipient
            const recipientSockets = userSockets.get(receiverId);
            if (recipientSockets) {
                recipientSockets.forEach(socketId => {
                    io.to(socketId).emit('message_received', message);
                });
            }
            // Sender (other sessions/tabs)
            const senderSockets = userSockets.get(senderId);
            if (senderSockets) {
                senderSockets.forEach(socketId => {
                    io.to(socketId).emit('message_received', message);
                });
            }
        }

        res.json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending message' });
    }
};

module.exports = { getConversations, getMessages, sendMessage };
