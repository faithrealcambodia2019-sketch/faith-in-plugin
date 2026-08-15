// Harness: load faith-in-backend.js with a fake jQuery + fake Firebase and
// exercise the transport end to end.
import fs from 'node:fs';
import vm from 'node:vm';

const src = fs.readFileSync(new URL('../public/assets/js/faith-in-backend.js', import.meta.url), 'utf8');

let transportFactory = null;
const $ = { ajaxTransport: (t, fn) => { transportFactory = fn; } };

class FakeFile { constructor(name, type, size){ this.name=name; this.type=type; this.size=size; } }
class FakeFormData {
  constructor(){ this._e = []; }
  append(k,v){ this._e.push([k,v]); }
  forEach(cb){ this._e.forEach(([k,v]) => cb(v,k,this)); }
}
globalThis.File = FakeFile;
globalThis.Blob = class {};
globalThis.ProgressEvent = class { constructor(t,o){ Object.assign(this,o); this.type=t; } };

// ---- fake Firestore (path-keyed, supports subcollections and where) ----
const store = {};            // "posts/id1" -> data
let idSeq = 0;
let failCompositeIndexOnce = false;
const SENTINEL = '__serverTimestamp__';
const key = p => p.join('/');

const dbMod = {
  getFirestore: () => ({}),
  doc: (db, ...path) => ({ path }),
  collection: (db, ...path) => ({ path }),
  getDoc: async (ref) => {
    const d = store[key(ref.path)];
    return { exists: () => !!d, data: () => d };
  },
  setDoc: async (ref, data, opts) => {
    const k = key(ref.path);
    store[k] = (opts && opts.merge && store[k]) ? { ...store[k], ...data } : data;
  },
  updateDoc: async (ref, upd) => {
    const cur = store[key(ref.path)];
    if (!cur) throw new Error('missing document');
    for (const [f, v] of Object.entries(upd)) {
      if (f.includes('.')) {
        const [a, b2] = f.split('.');
        cur[a] = cur[a] || {};
        if (v && v.__delete) delete cur[a][b2]; else cur[a][b2] = v;
      } else if (v && v.__increment) { cur[f] = (cur[f] || 0) + v.__increment; }
      else cur[f] = v;
    }
  },
  addDoc: async (col, data) => {
    const id = 'id' + (++idSeq);
    store[key(col.path.concat(id))] = data;
    return { id };
  },
  deleteDoc: async (ref) => { delete store[key(ref.path)]; },
  deleteField: () => ({ __delete: true }),
  increment: (n) => ({ __increment: n }),
  serverTimestamp: () => SENTINEL,
  where: (field, op, value) => ({ __where: { field, op, value } }),
  orderBy: () => ({}),
  limit: () => ({}),
  query: (col, ...clauses) => ({ col, clauses }),
  getDocs: async (q) => {
    const prefix = key(q.col.path) + '/';
    const wheres = (q.clauses || []).filter(c => c && c.__where).map(c => c.__where);
    if (failCompositeIndexOnce && wheres.length) {
      failCompositeIndexOnce = false;
      const error = new Error('The query requires an index.');
      error.code = 'failed-precondition';
      throw error;
    }
    const rows = Object.entries(store)
      .filter(([k]) => k.startsWith(prefix) && !k.slice(prefix.length).includes('/'))
      .map(([k, data]) => ({ id: k.slice(prefix.length), data: () => data }))
      .filter(r => wheres.every(w => r.data()[w.field] === w.value));
    return { forEach: (cb) => rows.forEach(cb) };
  }
};

const uploaded = [];   // files the fake /api/upload received
let uploadStatus = 200;
let uploadBody = null;

// Fake XMLHttpRequest standing in for the browser's, so uploadAll() can be
// exercised end to end against a stubbed /api/upload.
class FakeXHR {
  constructor(){ this.upload = { onprogress: null }; this.status = 0; this.responseText = ''; }
  open(method, url){ this.method = method; this.url = url; }
  setRequestHeader(k, v){ (this.headers = this.headers || {})[k] = v; }
  send(form){
    const files = form._e.filter(([k]) => k === 'files').map(([, v]) => v);
    files.forEach(f => uploaded.push({
      path: 'faith-in/uid-abc/' + f.name,
      name: f.name,
      auth: this.headers && this.headers.Authorization
    }));
    if (this.upload.onprogress) this.upload.onprogress({ lengthComputable: true, loaded: 1, total: 1 });
    this.status = uploadStatus;
    this.responseText = JSON.stringify(uploadBody !== null ? uploadBody : {
      success: true,
      data: { items: files.map(f => ({
        url: 'https://blob.example/' + f.name,
        local_url: 'https://blob.example/' + f.name,
        preview_url: 'https://blob.example/' + f.name,
        drive_url: '',
        type: /^video\//.test(f.type) ? 'video' : (/^audio\//.test(f.type) ? 'audio' : 'image'),
        mime: f.type, name: f.name, size: f.size,
        path: 'faith-in/uid-abc/' + f.name
      })) }
    });
    if (this.onload) this.onload();
  }
}

const USER = { uid: 'uid-abc', email: 'Hun@Faithin.co', displayName: 'Hun Chet', photoURL: '', providerData: [{providerId:'password'}], getIdToken: async () => 'fake-id-token' };
const authMod = { getAuth: () => ({ currentUser: USER }), onAuthStateChanged: (a,cb)=>{cb(USER); return ()=>{};}, signOut: async()=>{} };
const appMod = { getApps: () => [], initializeApp: () => ({ name:'faith-in-auth' }) };

const ctx = {
  window: { cv_ajax: { ajax_url: '/api/compat', auth: { firebase_config: { apiKey:'k', projectId:'p' }, site_origin:'https://faithin.co' } }, jQuery: $, console },
  console, setTimeout, clearInterval, setInterval, FormData: FakeFormData, File: FakeFile, Blob: globalThis.Blob,
  ProgressEvent: globalThis.ProgressEvent, XMLHttpRequest: FakeXHR, Date, Math, Promise, Object, Array, String, JSON, parseInt, encodeURIComponent, decodeURIComponent
};
ctx.globalThis = ctx;
vm.createContext(ctx);
// Stub dynamic import for the Firebase modules.
const wrapped = src.replace(/import\((.*?)\)/g, '__imp($1)');
ctx.__imp = (u) => Promise.resolve(
  u.includes('firebase-app.js') ? appMod :
  u.includes('firebase-auth.js') ? authMod :
  dbMod
);
vm.runInContext(wrapped, ctx);

if (!transportFactory) { console.log('FAIL: transport not installed'); process.exit(1); }

function call(data) {
  return new Promise((resolve) => {
    const opts = { url: '/api/compat' };
    const t = transportFactory(opts, { url:'/api/compat', data });
    if (!t) return resolve({ __notIntercepted: true });
    t.send({}, (status, statusText, responses) => resolve(responses.json));
  });
}
function fd(pairs) {
  const f = new FakeFormData();
  for (const [k,v] of pairs) f.append(k,v);
  return f;
}

const postIds = () => Object.keys(store).filter(k=>k.startsWith('posts/')&&!k.slice(6).includes('/')).map(k=>k.slice(6));
const allPosts = () => postIds().map(id => store['posts/'+id]);
const postAt = i => allPosts()[i];

let pass = 0, fail = 0;
const check = (name, cond, extra) => { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name, extra ?? ''); } };

console.log('\n1) Session');
let r = await call({ action: 'cv_get_session', nonce: 'firebase' });
check('returns success', r.success === true, r);
check('logged in', r.data.logged_in === true);
check('name from displayName', r.data.name === 'Hun Chet', r.data.name);
check('user doc created', !!store['users/uid-abc']);
check('public profile projection created', !!store['publicProfiles/uid-abc']);
check('public profile excludes email', !('email' in store['publicProfiles/uid-abc']));
check('emailLower normalised', store['users/uid-abc'].emailLower === 'hun@faithin.co', store['users/uid-abc'].emailLower);
check('only allowed profile fields', Object.keys(store['users/uid-abc']).every(k => ['uid','email','emailLower','displayName','firstName','lastName','photoURL','provider','providers','appUserId','siteOrigin','createdAt','updatedAt','lastLoginAt','status'].includes(k)), Object.keys(store['users/uid-abc']));

console.log('\n2) Text post');
r = await call(fd([['action','cv_create_post'],['content','Praise God today'],['post_type','Text'],['post_visibility','public']]));
check('success', r.success === true, r);
check('post stored', Object.keys(store).filter(k=>k.startsWith('posts/')).length === 1);
check('authorUid set', postAt(0).authorUid === 'uid-abc');
check('reactions start empty', Object.keys(postAt(0).reactions).length === 0);
check('counters start at 0', postAt(0).comment_count === 0);
check('content preserved', postAt(0).content === 'Praise God today');

console.log('\n3) Empty post rejected');
r = await call(fd([['action','cv_create_post'],['content','   ']]));
check('rejected', r.success === false);
check('friendly message', /Write something/.test(r.data), r.data);

console.log('\n4) Image + video post');
r = await call(fd([['action','cv_create_post'],['content','Sunday service'],
  ['post_media[]', new FakeFile('photo.jpg','image/jpeg',1024)],
  ['post_media[]', new FakeFile('clip.mp4','video/mp4',2048)]]));
check('success', r.success === true, r);
check('2 files uploaded', uploaded.length === 2, uploaded);
check('path scoped to uid', uploaded[0].path.startsWith('faith-in/uid-abc/'), uploaded[0].path);
check('sends bearer token', uploaded[0].auth === 'Bearer fake-id-token', uploaded[0].auth);
const withMedia = allPosts().find(p => p.media_items.length === 2);
check('media_items saved', !!withMedia);
check('image typed', withMedia.media_items[0].type === 'image', withMedia.media_items[0].type);
check('video typed', withMedia.media_items[1].type === 'video', withMedia.media_items[1].type);
check('cover set from first media', !!withMedia.cover_image_url);

console.log('\n5) Oversize file rejected');
r = await call(fd([['action','cv_create_post'],['content','big'],['post_media[]', new FakeFile('huge.mp4','video/mp4', 40*1024*1024)]]));
check('rejected', r.success === false);
check('mentions 25MB limit', /25MB/.test(r.data), r.data);

console.log('\n6) Feed');
r = await call({ action: 'cv_get_posts' });
check('success', r.success === true);
check('returns items array', Array.isArray(r.data.items), r.data);
check('shaped for renderer', r.data.items[0].author && 'can_delete' in r.data.items[0]);
check('author can delete own', r.data.items[0].can_delete === true);
check('has time string', typeof r.data.items[0].time === 'string');

console.log('\n6b) Feed index compatibility');
failCompositeIndexOnce = true;
r = await call({ action: 'cv_get_posts' });
check('falls back without exposing index error', r.success === true, r);
check('fallback preserves visible posts', r.data.items.length > 0, r.data);

console.log('\n7) Reactions');
const pid = postIds()[0];
r = await call({ action:'cv_like_post', post_id: pid, reaction: 'like' });
check('like ok', r.success === true, r);
check('count 1', r.data.likes === 1, r.data);
check('stored under uid', store['posts/'+pid].reactions['uid-abc'] === 'like');
r = await call({ action:'cv_like_post', post_id: pid, reaction: 'like' });
check('same reaction toggles off', r.data.user_reaction === null, r.data);
check('removed from map', store['posts/'+pid].reactions['uid-abc'] === undefined);

console.log('\n8) Comments');
r = await call({ action:'cv_create_post_comment', post_id: pid, comment: 'Amen' });
check('success', r.success === true, r);
check('comment_count incremented', store['posts/'+pid].comment_count === 1, store['posts/'+pid].comment_count);
r = await call({ action:'cv_create_post_comment', post_id: pid, comment: '' });
check('empty comment rejected', r.success === false);

console.log('\n9) Delete');
r = await call({ action:'cv_delete_post', post_id: pid });
check('success', r.success === true);
check('gone from store', !store['posts/'+pid]);

console.log('\n10) Unimplemented action');
r = await call({ action:'cv_bible_ai_image' });
check('does not 501', r.success === false);
check('friendly message', /still being built/.test(r.data), r.data);

console.log('\n11) Resource library');
r = await call(fd([['action','cv_upload_resource'],['title','Romans study guide'],['category','Bible Study'],['format','pdf'],
  ['resource_file', new FakeFile('romans.pdf','application/pdf',5000)]]));
check('publish ok', r.success === true, r);
check('stored', Object.keys(store).some(k=>k.startsWith('resources/')));
const rid = Object.keys(store).find(k=>k.startsWith('resources/')).slice(10);
check('counters start at 0', store['resources/'+rid].download_count === 0 && store['resources/'+rid].view_count === 0);
r = await call(fd([['action','cv_upload_resource'],['title',''],['resource_file', new FakeFile('x.pdf','application/pdf',10)]]));
check('title required', r.success === false && /title/.test(r.data), r.data);
r = await call(fd([['action','cv_upload_resource'],['title','No file']]));
check('file required', r.success === false && /file/.test(r.data), r.data);
r = await call({ action:'cv_get_resources' });
check('library lists it', r.data.items.length === 1 && r.data.items[0].title === 'Romans study guide', r.data.items);
check('shaped for renderer', 'download_url' in r.data.items[0] && 'can_delete' in r.data.items[0]);
r = await call({ action:'cv_download_resource', resource_id: rid });
check('download returns url', !!r.data.url);
check('download counted', store['resources/'+rid].download_count === 1);

console.log('\n12) Prayer requests');
r = await call({ action:'cv_create_prayer', content:'Please pray for my mother' });
check('created', r.success === true, r);
const prid = Object.keys(store).find(k=>k.startsWith('prayers/')).slice(8);
check('prayed map empty', Object.keys(store['prayers/'+prid].prayed).length === 0);
r = await call({ action:'cv_create_prayer', content:'  ' });
check('empty rejected', r.success === false);
r = await call({ action:'cv_update_prayer', prayer_id: prid });
check('mark prayed', r.data.prayed_count === 1 && r.data.has_prayed === true, r.data);
r = await call({ action:'cv_update_prayer', prayer_id: prid });
check('toggles off', r.data.prayed_count === 0 && r.data.has_prayed === false, r.data);
r = await call({ action:'cv_get_prayers' });
check('listed', r.data.items.length === 1 && r.data.items[0].can_delete === true);

console.log('\n13) Ministry jobs');
r = await call({ action:'cv_create_job', job_title:'Youth Pastor', job_organization:'All Nations', job_location:'Phnom Penh', job_contact_email:'jobs@allnations.example' });
check('created', r.success === true, r);
const jid = Object.keys(store).find(k=>k.startsWith('jobs/')).slice(5);
check('never self-promotes', store['jobs/'+jid].featured === false);
r = await call({ action:'cv_create_job', job_title:'', job_organization:'X' });
check('title required', r.success === false);
r = await call({ action:'cv_create_job', job_title:'Y' });
check('organisation required', r.success === false);
r = await call({ action:'cv_get_jobs' });
check('listed', r.data.items.length === 1 && r.data.items[0].organization === 'All Nations');
r = await call({ action:'cv_delete_job', job_id: jid });
check('deleted', r.success === true && !store['jobs/'+jid]);

console.log('\n14) Members and following');
store['publicProfiles/uid-friend'] = { uid:'uid-friend', displayName:'Sok Dara', appUserId: 4242, church:'Grace Church', photoURL:'' };
r = await call({ action:'cv_find_users', search:'dara' });
check('search finds member', r.data.items.length === 1 && r.data.items[0].name === 'Sok Dara', r.data.items);
check('excludes self', !r.data.items.some(u => u.uid === 'uid-abc'));
r = await call({ action:'cv_find_users', search:'grace' });
check('searches church too', r.data.items.length === 1);
r = await call({ action:'cv_find_users', search:'zzzz' });
check('no false matches', r.data.items.length === 0);
r = await call({ action:'cv_social_follow_user', target_uid:'uid-friend' });
check('follow ok', r.success === true && r.data.following === true, r);
check('edge stored under follower', store['follows/uid-abc__uid-friend'].followerUid === 'uid-abc');
r = await call({ action:'cv_social_follow_user', target_uid:'uid-abc' });
check('cannot follow self', r.success === false, r.data);
r = await call({ action:'cv_find_users', search:'dara' });
check('is_following reflected', r.data.items[0].is_following === true);
r = await call({ action:'cv_get_suggested_users' });
check('suggestions exclude followed', !r.data.items.some(u=>u.uid==='uid-friend'));
r = await call({ action:'cv_social_get_following' });
check('following list', r.data.items.length === 1 && r.data.items[0].uid === 'uid-friend', r.data.items);
r = await call({ action:'cv_social_unfollow_user', target_uid:'uid-friend' });
check('unfollow ok', r.data.following === false && !store['follows/uid-abc__uid-friend']);

console.log('\n15) Bookmarks, settings, verification, notes');
const bpid = postIds()[0];
r = await call({ action:'cv_toggle_bookmark', post_id: bpid });
check('bookmark on', r.data.bookmarked === true && !!store['users/uid-abc/bookmarks/'+bpid]);
r = await call({ action:'cv_toggle_bookmark', post_id: bpid });
check('bookmark off', r.data.bookmarked === false && !store['users/uid-abc/bookmarks/'+bpid]);
r = await call({ action:'cv_update_user_settings', theme:'dark', lang:'Khmer' });
check('settings saved', r.data.settings.theme === 'dark' && store['users/uid-abc'].settings.lang === 'Khmer', r.data);
r = await call({ action:'cv_request_verification', note:'I pastor All Nations' });
check('verification requested', r.data.request.status === 'pending');
r = await call({ action:'cv_get_verification_status' });
check('status returns request + tiers', r.data.request.status === 'pending' && r.data.tiers.length === 3);
r = await call({ action:'cv_bible_save_notes', notes: JSON.stringify({Doctrine:'Grace'}) });
check('notes saved', r.success === true && store['users/uid-abc/bible/sermonNotes'].notes.Doctrine === 'Grace');
r = await call({ action:'cv_bible_get_notes' });
check('notes read back', r.data.notes.Doctrine === 'Grace');

console.log('\n16) Upload failure handling');
uploadStatus = 401;
uploadBody = { success: false, data: 'Your session has expired. Please log in again.' };
r = await call(fd([['action','cv_create_post'],['content','x'],['post_media[]', new FakeFile('a.jpg','image/jpeg',10)]]));
check('surfaces server message', r.success === false && /session has expired/.test(r.data), r.data);
uploadStatus = 500; uploadBody = null;
r = await call(fd([['action','cv_stage_post_media'],['post_media[]', new FakeFile('b.jpg','image/jpeg',10)]]));
check('generic message on 500', r.success === false && /Upload failed/.test(r.data), r.data);
uploadStatus = 200; uploadBody = null;
r = await call(fd([['action','cv_create_post'],['content','big'],['post_media[]', new FakeFile('huge.mp4','video/mp4', 40*1024*1024)]]));
check('oversize rejected before upload', r.success === false && /25MB/.test(r.data), r.data);

console.log('\n17) Non-cv request passes through');
const t = transportFactory({ url:'https://example.com/thing' }, { url:'https://example.com/thing', data:{} });
check('not intercepted', t === undefined);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
