// Basic matching for demo purposes
// In a real app, this would query the DB for users with similar text
const mockMatches = [
    { id: '1', username: 'LucidDreamer', avatarUrl: 'https://ui-avatars.com/api/?name=Lucid&background=random' },
    { id: '2', username: 'SkyWalker', avatarUrl: 'https://ui-avatars.com/api/?name=Sky&background=random' },
];

export const getMockMatches = () => mockMatches;
