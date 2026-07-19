/**
 * @file notificationController.js
 * Controller handling user notification retrieval and status updates.
 */

const prisma = require('../utils/prisma');

/**
 * Retrieves the up to 50 most recent notifications for the authenticated user.
 * 
 * @param {import('express').Request} req - Express request object containing authenticated user info
 * @param {import('express').Response} res - Express response object returning list of notifications
 * @returns {Promise<void>}
 */
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const notifications = await prisma.notification.findMany({
            where: { receiverId: userId },
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
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

/**
 * Marks a specific notification as read after validating ownership.
 * 
 * @param {import('express').Request} req - Express request object containing params.id and authenticated user info
 * @param {import('express').Response} res - Express response object returning success status
 * @returns {Promise<void>}
 */
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await prisma.notification.findFirst({
            where: { id, receiverId: userId }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await prisma.notification.update({
            where: { id },
            data: { read: true }
        });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error marking notification as read' });
    }
};

/**
 * Marks all unread notifications for the authenticated user as read.
 * 
 * @param {import('express').Request} req - Express request object containing authenticated user info
 * @param {import('express').Response} res - Express response object returning success status
 * @returns {Promise<void>}
 */
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await prisma.notification.updateMany({
            where: { receiverId: userId, read: false },
            data: { read: true }
        });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error marking all notifications as read' });
    }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
