-- CreateIndex
CREATE INDEX IF NOT EXISTS "Dream_createdAt_idx" ON "Dream"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Dream_userId_createdAt_idx" ON "Dream"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Dream_status_idx" ON "Dream"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Like_dreamId_idx" ON "Like"("dreamId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Like_userId_idx" ON "Like"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Comment_dreamId_createdAt_idx" ON "Comment"("dreamId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_receiverId_createdAt_idx" ON "Notification"("receiverId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Conversation_userId_lastMessageAt_idx" ON "Conversation"("userId", "lastMessageAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Message_senderId_receiverId_idx" ON "Message"("senderId", "receiverId");
