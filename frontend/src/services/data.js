/*
  Lost & Found Management System - Data & Storage Service
  Implements full DSA Queue model (Lost Queue & 30-Day Found Queue),
  User Management, Claim Lifecycle, Dispute/Report System, and Audit Trail.
  All state persists in localStorage with initial sample seed data and safe quota-aware compression.
*/

const STORAGE_KEYS = {
  users: 'lf_users',
  items: 'lf_items',
  claims: 'lf_claims',
  disputes: 'lf_disputes',
  audit: 'lf_audit',
  session: 'lf_session',
  hasDismissedGuestPrompt: 'lf_dismissed_guest_prompt',
  nextItemId: 'lf_next_item_id',
  nextClaimId: 'lf_next_claim_id',
  nextUserId: 'lf_next_user_id',
  nextDisputeId: 'lf_next_dispute_id',
  seeded: 'lf_is_seeded_v3',
};

// Safe JSON loader
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn(`Error loading key ${key}:`, err);
    return fallback;
  }
}

// Safe JSON saver with quota protection
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Storage quota exceeded or error saving ${key}:`, err);
    // If quota error occurs, try to prune older audit logs or alerts
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      try {
        const audit = load(STORAGE_KEYS.audit, []);
        if (audit.length > 50) {
          save(STORAGE_KEYS.audit, audit.slice(0, 30));
          localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (innerErr) {
        console.error('Failed recovery from QuotaExceededError:', innerErr);
      }
    }
  }
}

function nextId(key, prefix = '', startVal = 1000) {
  const current = load(key, startVal);
  save(key, current + 1);
  return prefix ? `${prefix}${current}` : current;
}

// Client-side image compression helper using Canvas
export async function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.72) {
  return new Promise((resolve) => {
    // If it's already a small string URL or not a File, resolve directly
    if (typeof file === 'string') return resolve(file);
    if (!(file instanceof Blob)) return resolve('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed JPEG or WebP
        try {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          resolve(e.target.result);
        }
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

// Initial Seed Data with high quality curated items
function initializeSeedData() {
  if (localStorage.getItem(STORAGE_KEYS.seeded)) return;

  const demoUsers = {
    U1001: {
      userNumber: 'U1001',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@campus.edu',
      phone: '+91 98765 43210',
      passwordHash: 'password123',
      emailVerified: true,
      verificationCode: '749201',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    U1002: {
      userNumber: 'U1002',
      name: 'Priya Patel',
      email: 'priya.patel@campus.edu',
      phone: '+91 98123 45678',
      passwordHash: 'password123',
      emailVerified: true,
      verificationCode: '839210',
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
    U1003: {
      userNumber: 'U1003',
      name: 'Amit Kumar',
      email: 'amit.kumar@campus.edu',
      phone: '+91 97654 32109',
      passwordHash: 'password123',
      emailVerified: true,
      verificationCode: '192847',
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
  };

  const demoItems = {
    101: {
      id: 101,
      itemName: 'Black Leather Bifold Wallet',
      category: 'Personal',
      color: 'Black',
      description: 'Men\'s genuine leather wallet with silver embossed logo. Contains college library card and ID badges inside transparent slot.',
      foundLocation: 'Central Library, 2nd Floor Study Table #14',
      dateFound: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      reportedByUserNumber: 'U1001',
      photos: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=700&auto=format&fit=crop&q=80'
      ],
      status: 'Lost',
      claimedByUserNumber: null,
      foundAt: null,
      expiryDate: null,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    102: {
      id: 102,
      itemName: 'Apple AirPods Pro (2nd Gen) in White Case',
      category: 'Electronics',
      color: 'White',
      description: 'AirPods Pro charging case with small anime astronaut sticker on the back. Left earbud has slight scratch near the stem.',
      foundLocation: 'Campus Cafeteria, Booth #6 near Coffee Bar',
      dateFound: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      reportedByUserNumber: 'U1002',
      photos: [
        'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=700&auto=format&fit=crop&q=80'
      ],
      status: 'Lost',
      claimedByUserNumber: null,
      foundAt: null,
      expiryDate: null,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    103: {
      id: 103,
      itemName: 'Student ID Card & Dorm Key Ring',
      category: 'Keys & IDs',
      color: 'Blue & Silver',
      description: 'Blue university lanyard holding magnetic RFID access card and two brass dorm keys with a red carabiner.',
      foundLocation: 'Science Block B, Staircase Landing 3rd Floor',
      dateFound: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      reportedByUserNumber: 'U1003',
      photos: [
        'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=700&auto=format&fit=crop&q=80'
      ],
      status: 'Lost',
      claimedByUserNumber: null,
      foundAt: null,
      expiryDate: null,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    104: {
      id: 104,
      itemName: 'Hydro Flask 32oz Wide Mouth Water Bottle',
      category: 'Personal',
      color: 'Cobalt Blue',
      description: 'Cobalt blue insulated flask with black flex cap. Features several outdoor national park stickers and small dent on bottom rim.',
      foundLocation: 'Sports Complex, Indoor Badminton Court Bench',
      dateFound: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
      reportedByUserNumber: 'U1001',
      photos: [
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700&auto=format&fit=crop&q=80'
      ],
      status: 'Lost',
      claimedByUserNumber: null,
      foundAt: null,
      expiryDate: null,
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    105: {
      id: 105,
      itemName: 'Casio Vintage Digital Watch (A168)',
      category: 'Personal',
      color: 'Silver',
      description: 'Stainless steel band vintage digital watch with illuminator backlight. Screen has faint micro-scratches.',
      foundLocation: 'Auditorium Main Hall, Row G Seat 18',
      dateFound: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      reportedByUserNumber: 'U1002',
      photos: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=700&auto=format&fit=crop&q=80'
      ],
      status: 'Lost',
      claimedByUserNumber: null,
      foundAt: null,
      expiryDate: null,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    106: {
      id: 106,
      itemName: 'Dell XPS 130W USB-C Laptop Charger',
      category: 'Electronics',
      color: 'Black',
      description: 'Black power adapter brick with braided USB-C cable and white indicator light on the connector tip.',
      foundLocation: 'Computer Center Lab 4, Desk 22',
      dateFound: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
      reportedByUserNumber: 'U1001',
      photos: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80'
      ],
      status: 'Found',
      claimedByUserNumber: 'U1002',
      foundAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      expiryDate: new Date(Date.now() + 24 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    107: {
      id: 107,
      itemName: 'Sony WH-1000XM4 Wireless Noise Cancelling Headphones',
      category: 'Electronics',
      color: 'Silver / Grey',
      description: 'Grey over-ear headphones stored inside original hard zipper case with audio cable and airplane adapter.',
      foundLocation: 'Student Union Lounge, 1st Floor Couch',
      dateFound: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
      reportedByUserNumber: 'U1003',
      photos: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80'
      ],
      status: 'Found',
      claimedByUserNumber: 'U1003',
      foundAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      expiryDate: new Date(Date.now() + 22 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
  };

  const demoClaims = {
    C5001: {
      claimId: 'C5001',
      itemId: 106,
      userNumber: 'U1002',
      submittedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      status: 'Approved',
      proofDescription: 'I left my Dell charger plugged into the corner power strip in Lab 4. The serial number on the underside ends in 8849-A.',
      proofFiles: [],
    },
    C5002: {
      claimId: 'C5002',
      itemId: 107,
      userNumber: 'U1003',
      submittedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      status: 'Approved',
      proofDescription: 'Headphone case has a small blue guitar pick stored inside the zipper mesh pouch and paired device name is "Amit\'s XM4".',
      proofFiles: [],
    },
  };

  const demoAudit = [
    {
      logId: 'L1001',
      userNumber: 'U1001',
      action: 'REGISTER_USER',
      targetId: 'U1001',
      details: 'Account created: rahul.sharma@campus.edu',
      timestamp: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      logId: 'L1002',
      userNumber: 'U1001',
      action: 'VERIFY_EMAIL',
      targetId: 'U1001',
      details: 'Email verified successfully',
      timestamp: new Date(Date.now() - 15 * 86400000 + 120000).toISOString(),
    },
    {
      logId: 'L1003',
      userNumber: 'U1001',
      action: 'REPORT_ITEM',
      targetId: 'ITEM_101',
      details: 'Reported item: Black Leather Bifold Wallet',
      timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      logId: 'L1004',
      userNumber: 'U1002',
      action: 'CLAIM_ITEM',
      targetId: 'ITEM_106',
      details: 'Claim C5001 submitted for Dell XPS Charger (moved to Found Queue for 30 days)',
      timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
  ];

  save(STORAGE_KEYS.users, demoUsers);
  save(STORAGE_KEYS.items, demoItems);
  save(STORAGE_KEYS.claims, demoClaims);
  save(STORAGE_KEYS.disputes, {});
  save(STORAGE_KEYS.audit, demoAudit);
  save(STORAGE_KEYS.nextItemId, 108);
  save(STORAGE_KEYS.nextClaimId, 5003);
  save(STORAGE_KEYS.nextUserId, 1004);
  save(STORAGE_KEYS.nextDisputeId, 1001);
  save(STORAGE_KEYS.seeded, true);
}

// Run seed on import
initializeSeedData();

// --- Session ---

export function getSession() {
  return load(STORAGE_KEYS.session, null);
}

export function setSession(user) {
  save(STORAGE_KEYS.session, user);
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

// Guest Modal Dismissal state
export function hasDismissedGuestPrompt() {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.hasDismissedGuestPrompt) === 'true';
  } catch {
    return false;
  }
}

export function setDismissedGuestPrompt(dismissed = true) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.hasDismissedGuestPrompt, String(dismissed));
  } catch {}
}

// --- Users ---

export function registerUser({ name, email, phone, password }) {
  const users = load(STORAGE_KEYS.users, {});
  const existing = Object.values(users).find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (existing) return { error: 'An account with this email already exists.' };

  const userNumber = nextId(STORAGE_KEYS.nextUserId, 'U', 1000);
  const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
  const user = {
    userNumber,
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    passwordHash: password,
    emailVerified: false,
    verificationCode,
    createdAt: new Date().toISOString(),
  };

  users[userNumber] = user;
  save(STORAGE_KEYS.users, users);
  addAudit(userNumber, 'REGISTER_USER', userNumber, `User registered: ${user.email}`);

  return { user };
}

export function verifyEmail(userNumber, code) {
  const users = load(STORAGE_KEYS.users, {});
  const user = users[userNumber];
  if (!user) return { error: 'User not found.' };
  if (user.emailVerified) return { error: 'Email already verified.' };
  if (user.verificationCode !== code.trim()) return { error: 'Invalid verification code.' };

  user.emailVerified = true;
  users[userNumber] = user;
  save(STORAGE_KEYS.users, users);
  addAudit(userNumber, 'VERIFY_EMAIL', userNumber, 'Email verified successfully');

  return { user };
}

export function loginUser(email, password) {
  const users = load(STORAGE_KEYS.users, {});
  const user = Object.values(users).find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (!user) return { error: 'No account found with this email.' };
  if (user.passwordHash !== password) return { error: 'Incorrect password.' };
  if (!user.emailVerified) {
    return {
      error: 'Please verify your email address to activate your account.',
      unverified: true,
      userNumber: user.userNumber,
    };
  }

  const session = {
    userNumber: user.userNumber,
    name: user.name,
    email: user.email,
  };
  setSession(session);
  addAudit(user.userNumber, 'LOGIN', user.userNumber, 'User logged in to portal');

  return { session };
}

export function getUser(userNumber) {
  const users = load(STORAGE_KEYS.users, {});
  return users[userNumber] || null;
}

export function getAllUsers() {
  const users = load(STORAGE_KEYS.users, {});
  return Object.values(users).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// --- Items & Queue Lifecycle ---

export function runExpiry() {
  const items = load(STORAGE_KEYS.items, {});
  const now = Date.now();
  let changed = false;

  for (const id in items) {
    const item = items[id];
    if (item.status === 'Found' && item.expiryDate) {
      if (new Date(item.expiryDate).getTime() < now) {
        item.status = 'Expired';
        changed = true;
        addAudit('SYSTEM', 'EXPIRY_REMOVAL', 'ITEM_' + item.id, `Item #${item.id} 30-day retention expired. Moved from Found Queue.`);
      }
    }
  }
  if (changed) save(STORAGE_KEYS.items, items);
}

export function reportItem({
  itemName,
  category,
  color,
  description,
  foundLocation,
  dateFound,
  photos,
  reportedByUserNumber,
}) {
  try {
    const items = load(STORAGE_KEYS.items, {});
    const id = Number(nextId(STORAGE_KEYS.nextItemId, '', 100));
    const now = new Date().toISOString();

    const item = {
      id,
      itemName: itemName.trim(),
      category: category.trim(),
      color: color ? color.trim() : '',
      description: description.trim(),
      foundLocation: foundLocation.trim(),
      dateFound: dateFound || now.split('T')[0],
      reportedByUserNumber: reportedByUserNumber || 'GUEST',
      photos: Array.isArray(photos) ? photos : [],
      status: 'Lost', // Enters Lost Queue
      claimedByUserNumber: null,
      foundAt: null,
      expiryDate: null,
      createdAt: now,
    };

    items[id] = item;
    save(STORAGE_KEYS.items, items);
    addAudit(
      reportedByUserNumber || 'GUEST',
      'REPORT_ITEM',
      'ITEM_' + id,
      `Reported item #${id}: "${item.itemName}" at ${item.foundLocation}`
    );

    return { item };
  } catch (err) {
    console.error('Error reporting item:', err);
    return { error: 'Failed to save item report. Please check details and try again.' };
  }
}

export function getLostItems() {
  runExpiry();
  const items = load(STORAGE_KEYS.items, {});
  return Object.values(items)
    .filter((i) => i.status === 'Lost')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getFoundItems() {
  runExpiry();
  const items = load(STORAGE_KEYS.items, {});
  return Object.values(items)
    .filter((i) => i.status === 'Found')
    .sort((a, b) => new Date(b.foundAt || b.createdAt) - new Date(a.foundAt || a.createdAt));
}

export function getItemById(id) {
  runExpiry();
  const items = load(STORAGE_KEYS.items, {});
  return items[id] || items[String(id)] || null;
}

export function searchItems(query) {
  runExpiry();
  const items = load(STORAGE_KEYS.items, {});
  if (!query || !query.trim()) return getLostItems();

  const q = query.toLowerCase().trim();
  return Object.values(items)
    .filter((i) => i.status === 'Lost')
    .filter((i) =>
      (i.itemName && i.itemName.toLowerCase().includes(q)) ||
      (i.category && i.category.toLowerCase().includes(q)) ||
      (i.color && i.color.toLowerCase().includes(q)) ||
      (i.description && i.description.toLowerCase().includes(q)) ||
      (i.foundLocation && i.foundLocation.toLowerCase().includes(q))
    );
}

export function filterItems({ category, location, color }) {
  runExpiry();
  const items = load(STORAGE_KEYS.items, {});
  return Object.values(items)
    .filter((i) => i.status === 'Lost')
    .filter((i) => {
      if (category && i.category.toLowerCase() !== category.toLowerCase()) return false;
      if (location && (!i.foundLocation || !i.foundLocation.toLowerCase().includes(location.toLowerCase()))) return false;
      if (color && (!i.color || !i.color.toLowerCase().includes(color.toLowerCase()))) return false;
      return true;
    });
}

export function getUserReports(userNumber) {
  const items = load(STORAGE_KEYS.items, {});
  return Object.values(items)
    .filter((i) => i.reportedByUserNumber === userNumber)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// --- Claims ---

export function submitClaim({ itemId, userNumber, proofDescription, proofFiles }) {
  const items = load(STORAGE_KEYS.items, {});
  const item = items[itemId] || items[String(itemId)];
  if (!item) return { error: 'Item not found in record system.' };
  if (item.status !== 'Lost') return { error: 'This item is already claimed or no longer in the Lost Queue.' };

  const claims = load(STORAGE_KEYS.claims, {});
  const claimId = nextId(STORAGE_KEYS.nextClaimId, 'C', 5000);
  const now = new Date().toISOString();

  const claim = {
    claimId,
    itemId: Number(itemId),
    userNumber,
    submittedAt: now,
    status: 'Approved',
    proofDescription: proofDescription.trim(),
    proofFiles: proofFiles || [],
  };
  claims[claimId] = claim;
  save(STORAGE_KEYS.claims, claims);

  // Move item from Lost Queue to Found Queue with 30-day retention
  const key = items[itemId] ? itemId : String(itemId);
  items[key].status = 'Found';
  items[key].claimedByUserNumber = userNumber;
  items[key].foundAt = now;

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);
  items[key].expiryDate = expiry.toISOString();
  save(STORAGE_KEYS.items, items);

  addAudit(
    userNumber,
    'CLAIM_ITEM',
    'ITEM_' + itemId,
    `Claim ${claimId} approved. Item moved to 30-day Found Queue (Expires ${expiry.toLocaleDateString()}).`
  );

  return { claim };
}

export function getUserClaims(userNumber) {
  const claims = load(STORAGE_KEYS.claims, {});
  return Object.values(claims)
    .filter((c) => c.userNumber === userNumber)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function getAllClaims() {
  const claims = load(STORAGE_KEYS.claims, {});
  return Object.values(claims).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function getClaimById(claimId) {
  const claims = load(STORAGE_KEYS.claims, {});
  return claims[claimId] || null;
}

// --- Disputes / Reports on Claimed Items ---

export function raiseClaimDispute({
  itemId,
  claimId,
  userNumber,
  reporterName,
  reporterContact,
  reason,
  evidenceDescription,
  proofFiles,
}) {
  try {
    const disputes = load(STORAGE_KEYS.disputes, {});
    const items = load(STORAGE_KEYS.items, {});
    const item = items[itemId] || items[String(itemId)];
    if (!item) return { error: 'Item not found.' };

    const reportId = nextId(STORAGE_KEYS.nextDisputeId, 'DSP-', 1000);
    const now = new Date().toISOString();

    const dispute = {
      reportId,
      itemId: Number(itemId),
      claimId: claimId || '',
      reportedByUserNumber: userNumber || 'GUEST',
      reporterName: reporterName ? reporterName.trim() : (userNumber ? `User ${userNumber}` : 'Anonymous User'),
      reporterContact: reporterContact ? reporterContact.trim() : '',
      reason: reason ? reason.trim() : 'Ownership Dispute',
      evidenceDescription: evidenceDescription ? evidenceDescription.trim() : '',
      proofFiles: proofFiles || [],
      status: 'Pending Investigation',
      createdAt: now,
    };

    disputes[reportId] = dispute;
    save(STORAGE_KEYS.disputes, disputes);

    // Flag item as disputed for quick status badge
    const key = items[itemId] ? itemId : String(itemId);
    items[key].isDisputed = true;
    save(STORAGE_KEYS.items, items);

    addAudit(
      userNumber || 'GUEST',
      'DISPUTE_CLAIM',
      'ITEM_' + itemId,
      `Dispute ${reportId} raised on claimed item #${itemId} (${item.itemName}) by ${dispute.reporterName}. Reason: ${dispute.reason}`
    );

    return { dispute };
  } catch (err) {
    console.error('Error raising dispute:', err);
    return { error: 'Failed to submit dispute report. Please try again.' };
  }
}

export function getDisputes() {
  const disputes = load(STORAGE_KEYS.disputes, {});
  return Object.values(disputes).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getDisputesByItemId(itemId) {
  const disputes = load(STORAGE_KEYS.disputes, {});
  return Object.values(disputes).filter((d) => Number(d.itemId) === Number(itemId));
}

export function resolveDispute(reportId, status = 'Resolved', resolutionNotes = '') {
  const disputes = load(STORAGE_KEYS.disputes, {});
  const dispute = disputes[reportId];
  if (!dispute) return { error: 'Dispute report not found.' };

  dispute.status = status;
  dispute.resolutionNotes = resolutionNotes;
  dispute.resolvedAt = new Date().toISOString();
  disputes[reportId] = dispute;
  save(STORAGE_KEYS.disputes, disputes);

  addAudit(
    'ADMIN',
    'RESOLVE_DISPUTE',
    reportId,
    `Dispute ${reportId} status updated to "${status}". Notes: ${resolutionNotes}`
  );

  return { dispute };
}

// --- Audit Trail ---

export function addAudit(userNumber, action, targetId, details = '') {
  const logs = load(STORAGE_KEYS.audit, []);
  logs.unshift({
    logId: 'L' + (1000 + logs.length + 1),
    userNumber: userNumber || 'GUEST',
    action,
    targetId,
    details,
    timestamp: new Date().toISOString(),
  });
  // Keep latest 200 logs
  if (logs.length > 200) logs.length = 200;
  save(STORAGE_KEYS.audit, logs);
}

export function getAuditLogs() {
  return load(STORAGE_KEYS.audit, []);
}

export function getUserAuditLogs(userNumber) {
  const logs = load(STORAGE_KEYS.audit, []);
  return logs.filter((l) => l.userNumber === userNumber);
}

// --- Admin / Stats ---

export function getAdminStats() {
  runExpiry();
  const items = load(STORAGE_KEYS.items, {});
  const users = load(STORAGE_KEYS.users, {});
  const claims = load(STORAGE_KEYS.claims, {});
  const disputes = load(STORAGE_KEYS.disputes, {});
  const audit = load(STORAGE_KEYS.audit, []);

  const allItems = Object.values(items);
  const lostCount = allItems.filter((i) => i.status === 'Lost').length;
  const foundCount = allItems.filter((i) => i.status === 'Found').length;
  const expiredCount = allItems.filter((i) => i.status === 'Expired').length;

  return {
    totalItems: allItems.length,
    lostCount,
    foundCount,
    expiredCount,
    usersCount: Object.keys(users).length,
    claimsCount: Object.keys(claims).length,
    disputesCount: Object.keys(disputes).length,
    auditLogsCount: audit.length,
  };
}

// --- Preset Categories & Locations ---

export function getCategories() {
  return [
    'Electronics',
    'Personal',
    'Keys & IDs',
    'Clothing',
    'Bags & Backpacks',
    'Books & Stationery',
    'Accessories & Jewelry',
    'Sports Equipment',
    'Documents',
    'Other',
  ];
}

export function getLocations() {
  const items = load(STORAGE_KEYS.items, {});
  const set = new Set([
    'Central Library',
    'Campus Cafeteria',
    'Sports Complex',
    'Science Block B',
    'Auditorium Main Hall',
    'Computer Center Lab',
    'Student Union Lounge',
    'Administrative Block',
  ]);
  Object.values(items).forEach((i) => {
    if (i.foundLocation) set.add(i.foundLocation);
  });
  return Array.from(set).sort();
}
