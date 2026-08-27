/**
 * @file messageController.js
 * Controller handling user messaging, conversation history, and unread statuses.
 */

const prisma = require('../utils/prisma');

/**
 * Fetches all active conversations for the authenticated user ordered by recent activity.
 * 
 * @param {import('express').Request} req - Express request object containing authenticated user payload
 * @param {import('express').Response} res - Express response object returning conversation list
 * @returns {Promise<void>}
 */
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

        if (conversations.length === 0) {
            return res.json([]);
        }

        // Single batched query for all other users to eliminate N+1 overhead
        const otherUserIds = [...new Set(conversations.map(conv => conv.otherUserId))];
        const otherUsers = await prisma.user.findMany({
            where: { id: { in: otherUserIds } },
            select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true
            }
        });

        const userMap = new Map(otherUsers.map(u => [u.id, u]));

        const conversationsWithUsers = conversations.map(conv => ({
            ...conv,
            otherUser: userMap.get(conv.otherUserId) || null
        }));

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
            data: { read: true, readAt: new Date() }
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
        const { content, attachmentUrl, attachmentType } = req.body;

        if ((!content || content.trim() === '') && !attachmentUrl) {
            return res.status(400).json({ message: 'Message content or attachment is required' });
        }

        const messageContent = content ? content.trim() : (attachmentType === 'image' ? '📷 Image' : '📎 Attachment');

        // Find or create conversation for sender
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
                content: messageContent,
                attachmentUrl: attachmentUrl || null,
                attachmentType: attachmentType || null
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
                lastMessage: messageContent,
                lastMessageAt: now
            }
        });

        await prisma.conversation.update({
            where: { id: receiverConversation.id },
            data: {
                lastMessage: messageContent,
                lastMessageAt: now,
                unreadCount: { increment: 1 }
            }
        });

        // Broadcast to sockets
        const io = req.app.get('io');
        const userSockets = req.app.get('userSockets');
        if (io && userSockets) {
            const recipientSockets = userSockets.get(receiverId);
            if (recipientSockets) {
                recipientSockets.forEach(socketId => {
                    io.to(socketId).emit('message_received', message);
                });
            }
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

const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await prisma.conversation.aggregate({
            where: { userId },
            _sum: { unreadCount: true }
        });
        const unreadCount = result._sum.unreadCount || 0;
        res.json({ unreadCount });
    } catch (error) {
        console.error('Unread count error:', error);
        res.status(500).json({ message: 'Error calculating unread count' });
    }
};

const uploadAttachment = async (req, res) => {
    try {
        const { fileBase64, mimeType } = req.body;
        if (!fileBase64) {
            return res.status(400).json({ message: 'File data is required' });
        }

        const cleanBase64 = fileBase64.replace(/^data:\w+\/\w+;base64,/, '');

        const mediaBlob = await prisma.mediaBlob.create({
            data: {
                data: cleanBase64,
                mimeType: mimeType || 'image/png'
            }
        });

        const attachmentUrl = `/api/media/${mediaBlob.id}`;
        const attachmentType = (mimeType && mimeType.startsWith('image/')) ? 'image' : 'file';

        res.json({ success: true, attachmentUrl, attachmentType });
    } catch (error) {
        console.error('Attachment upload error:', error);
        res.status(500).json({ message: 'Error uploading attachment' });
    }
};

module.exports = { getConversations, getMessages, sendMessage, getUnreadCount, uploadAttachment };

