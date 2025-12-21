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
        let conversation = await prisma.conversation.findFirst({
            where: {
                userId,
                otherUserId
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    userId,
                    otherUserId
                }
            });

            // Create reverse conversation for the other user
            await prisma.conversation.create({
                data: {
                    userId: otherUserId,
                    otherUserId: userId
                }
            });
        }

        const messages = await prisma.message.findMany({
            where: { conversationId: conversation.id },
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
                conversationId: conversation.id,
                receiverId: userId,
                read: false
            },
            data: { read: true }
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

        // Find or create conversation for sender
        let senderConversation = await prisma.conversation.findFirst({
            where: {
                userId: senderId,
                otherUserId: receiverId
            }
        });

        if (!senderConversation) {
            senderConversation = await prisma.conversation.create({
                data: {
                    userId: senderId,
                    otherUserId: receiverId
                }
            });
        }

        // Find or create conversation for receiver
        let receiverConversation = await prisma.conversation.findFirst({
            where: {
                userId: receiverId,
                otherUserId: senderId
            }
        });

        if (!receiverConversation) {
            receiverConversation = await prisma.conversation.create({
                data: {
                    userId: receiverId,
                    otherUserId: senderId
                }
            });
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

        res.json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending message' });
    }
};

module.exports = { getConversations, getMessages, sendMessage };
