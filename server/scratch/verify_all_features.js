/**
 * Dream Match — Full End-to-End Feature Verification
 * Run against live production: TEST_URL=https://dream-match.onrender.com node scratch/verify_all_features.js
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

function assert(condition, label) {
    if (!condition) throw new Error(`FAILED: ${label}`);
}

async function api(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, options);
    return res;
}

async function register(suffix) {
    const username = `tv_${String(Date.now()).slice(-8)}${suffix}`;
    const res = await api('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fullName: 'Test Verify User',
            username,
            password: 'Password123!',
            email: `${username}@verify.test`
        })
    });
    if (!res.ok) throw new Error(`Register failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return { token: data.token, username, userId: data.user?.id };
}

async function authedJson(path, token, body, method = 'POST') {
    const res = await api(path, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {})
    });
    return { res, data: res.ok ? await res.json() : null, text: !res.ok ? await res.text() : null };
}

async function authedGet(path, token) {
    const res = await api(path, { headers: { Authorization: `Bearer ${token}` } });
    return { res, data: res.ok ? await res.json() : null };
}

// ─────────────────────────────────────────────────────────────────────────────

async function runVerification() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   Dream Match — Full End-to-End Feature Verification');
    console.log(`   Target: ${BASE_URL}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // ── 1. Registration ──────────────────────────────────────────────────────
    const user1 = await register('a');
    let token = user1.token;
    console.log(`✅  [1] User Registration             username=${user1.username}`);

    // Register a second user for block/unblock and match-pass tests
    const user2 = await register('b');
    console.log(`✅  [1] Second User Registration      username=${user2.username}`);

    // ── 2. Change Password + Session Invalidation ────────────────────────────
    const { res: cpRes } = await authedJson('/api/auth/change-password', token, {
        currentPassword: 'Password123!',
        newPassword: 'NewPassword456!'
    });
    assert(cpRes.ok, `Password change returned ${cpRes.status}`);
    console.log('✅  [2] Password Change               bcrypt verify & hash');

    const revokedRes = await api('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    assert(revokedRes.status === 401, `Old token should be 401, got ${revokedRes.status}`);
    console.log('✅  [2] Session Invalidation          old JWT rejected (HTTP 401)');

    const loginRes = await api('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user1.username, password: 'NewPassword456!' })
    });
    assert(loginRes.ok, `Re-login failed: ${loginRes.status}`);
    const loginData = await loginRes.json();
    token = loginData.token;
    const myUserId = loginData.user?.id;
    console.log('✅  [2] Re-login with New Password    ok');

    // ── 3. Persistent Avatar Upload (MediaBlob → /api/media/:id) ────────────
    const samplePng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const { res: avRes, data: avData } = await authedJson('/api/users/avatar', token, {
        imageBase64: samplePng, mimeType: 'image/png'
    });
    assert(avRes.ok, `Avatar upload: ${avRes.status}`);
    console.log(`✅  [3] Avatar Upload                 url=${avData.avatarUrl}`);

    const mediaRes = await api(avData.avatarUrl);
    assert(mediaRes.ok, `Media serve: ${mediaRes.status}`);
    assert(mediaRes.headers.get('content-type') === 'image/png', 'content-type not image/png');
    const buf = await mediaRes.arrayBuffer();
    assert(buf.byteLength > 0, 'empty media body');
    console.log(`✅  [3] Media Binary Serving          ${buf.byteLength} bytes, content-type=image/png`);

    // ── 4. Chat Attachment Upload (MediaBlob → /api/media/:id) ───────────────
    const { res: attRes, data: attData } = await authedJson('/api/messages/attachment', token, {
        fileBase64: samplePng, mimeType: 'image/png'
    });
    assert(attRes.ok, `Attachment upload: ${attRes.status}`);
    console.log(`✅  [4] Chat Attachment Upload        url=${attData.attachmentUrl}`);

    // ── 5. Unread Messages Count ─────────────────────────────────────────────
    const { res: urRes, data: urData } = await authedGet('/api/messages/unread-count', token);
    assert(urRes.ok, `Unread count: ${urRes.status}`);
    console.log(`✅  [5] Unread Messages Count         count=${urData.unreadCount}`);

    // ── 6. Create a dream so we have a real dreamId to test with ─────────────
    const { res: dreamRes, data: dreamData } = await authedJson('/api/dreams', token, {
        title: 'Verify Test Dream',
        description: 'A glowing crystal forest at midnight.',
        theme: 'fantasy'
    });
    assert(dreamRes.ok, `Dream creation: ${dreamRes.status} ${JSON.stringify(dreamData)}`);
    const dreamId = dreamData.id;
    console.log(`✅  [6] Dream Creation                dreamId=${dreamId}`);

    // ── 7. Save Dream → appear in GET /api/dreams/saved ─────────────────────
    const { res: saveRes, data: saveData } = await authedJson(`/api/dreams/${dreamId}/save`, token, undefined);
    assert(saveRes.ok, `Dream save toggle: ${saveRes.status}`);
    assert(saveData.saved === true, `Expected saved=true, got ${saveData.saved}`);
    console.log(`✅  [7] Save Dream (toggle on)        saved=${saveData.saved}`);

    const { res: savedListRes, data: savedList } = await authedGet('/api/dreams/saved', token);
    assert(savedListRes.ok, `GET /api/dreams/saved: ${savedListRes.status}`);
    const foundInSaved = savedList.some(d => d.id === dreamId);
    assert(foundInSaved, `dreamId ${dreamId} not found in saved list (${savedList.length} items)`);
    console.log(`✅  [7] Dream appears in GET /api/dreams/saved (${savedList.length} saved dreams)`);

    // Unsave it and confirm it's gone
    const { res: unsaveRes, data: unsaveData } = await authedJson(`/api/dreams/${dreamId}/save`, token, undefined);
    assert(unsaveRes.ok, `Dream unsave: ${unsaveRes.status}`);
    assert(unsaveData.saved === false, `Expected saved=false after unsave, got ${unsaveData.saved}`);
    console.log(`✅  [7] Unsave Dream (toggle off)     saved=${unsaveData.saved}`);

    const { res: savedListRes2, data: savedList2 } = await authedGet('/api/dreams/saved', token);
    assert(savedListRes2.ok, `GET /api/dreams/saved after unsave: ${savedListRes2.status}`);
    const stillInSaved = savedList2.some(d => d.id === dreamId);
    assert(!stillInSaved, `dreamId ${dreamId} still present in saved list after unsave`);
    console.log(`✅  [7] Dream removed from GET /api/dreams/saved after unsave`);

    // ── 8. Fetch Comments via GET /api/dreams/:id/comments ──────────────────
    const { res: commentsRes, data: comments } = await authedGet(`/api/dreams/${dreamId}/comments`, token);
    assert(commentsRes.ok, `GET comments: ${commentsRes.status}`);
    assert(Array.isArray(comments), 'comments response is not an array');
    console.log(`✅  [8] GET /api/dreams/:id/comments  returned ${comments.length} comments (array)`);

    // Post a comment then re-fetch to confirm it appears
    const { res: postCommentRes } = await authedJson(`/api/dreams/${dreamId}/comment`, token, {
        text: 'Test comment from verify script'
    });
    assert(postCommentRes.ok, `POST comment: ${postCommentRes.status}`);
    const { res: commentsRes2, data: comments2 } = await authedGet(`/api/dreams/${dreamId}/comments`, token);
    assert(commentsRes2.ok, `GET comments after post: ${commentsRes2.status}`);
    assert(comments2.length > comments.length, 'comment count did not increase after posting');
    console.log(`✅  [8] POST comment + re-fetch       count went ${comments.length} → ${comments2.length}`);

    // ── 9. Pass a Match via POST /api/dreams/matches/pass ───────────────────
    // We need user2's userId — fetch it via profile
    const { res: profRes, data: profData } = await authedGet(`/api/users/profile/${user2.username}`, token);
    assert(profRes.ok, `Fetch user2 profile: ${profRes.status}`);
    const targetId = profData.id;
    console.log(`       (user2 id resolved: ${targetId})`);

    const { res: passRes, data: passData } = await authedJson('/api/dreams/matches/pass', token, { targetId });
    assert(passRes.ok, `Pass match: ${passRes.status}`);
    assert(passData.success === true, `Expected success=true, got ${JSON.stringify(passData)}`);
    console.log(`✅  [9] Pass Match                    success=${passData.success}, message="${passData.message}"`);

    // Idempotent: passing the same user again should also succeed (upsert)
    const { res: passRes2 } = await authedJson('/api/dreams/matches/pass', token, { targetId });
    assert(passRes2.ok, `Pass match idempotent: ${passRes2.status}`);
    console.log(`✅  [9] Pass Match (idempotent)       second call also HTTP ${passRes2.status}`);

    // ── 10. Block / Unblock User ─────────────────────────────────────────────
    const { res: blockRes, data: blockData } = await authedJson(`/api/users/block/${targetId}`, token, undefined);
    assert(blockRes.ok, `Block user: ${blockRes.status}`);
    console.log(`✅ [10] Block User                    ${JSON.stringify(blockData)}`);

    const { res: blockedListRes, data: blockedList } = await authedGet('/api/users/blocked', token);
    assert(blockedListRes.ok, `GET /api/users/blocked: ${blockedListRes.status}`);
    const foundBlocked = blockedList.some(u => u.id === targetId || u.blockedId === targetId);
    assert(foundBlocked, `targetId ${targetId} not found in blocked list`);
    console.log(`✅ [10] GET /api/users/blocked        found target (${blockedList.length} blocked users)`);

    const { res: unblockRes, data: unblockData } = await authedJson(`/api/users/unblock/${targetId}`, token, undefined);
    assert(unblockRes.ok, `Unblock user: ${unblockRes.status}`);
    console.log(`✅ [10] Unblock User                  ${JSON.stringify(unblockData)}`);

    const { res: blockedListRes2, data: blockedList2 } = await authedGet('/api/users/blocked', token);
    assert(blockedListRes2.ok, `GET /api/users/blocked after unblock: ${blockedListRes2.status}`);
    const stillBlocked = blockedList2.some(u => u.id === targetId || u.blockedId === targetId);
    assert(!stillBlocked, `targetId ${targetId} still in blocked list after unblock`);
    console.log(`✅ [10] GET /api/users/blocked after unblock — target gone (${blockedList2.length} remaining)`);

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   ✅  ALL 10 FEATURE CHECKS PASSED ON LIVE PRODUCTION');
    console.log('═══════════════════════════════════════════════════════════\n');
}

runVerification().catch(err => {
    console.error('\n❌  Verification failed:', err.message);
    process.exit(1);
});
