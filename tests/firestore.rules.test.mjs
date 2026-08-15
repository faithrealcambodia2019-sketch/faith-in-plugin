import fs from "node:fs";
import test, { after, before } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

const projectId = "faith-in-rules-test";
const rules = fs.readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
let environment;

const now = () => Timestamp.now();

function account(uid, email, extra = {}) {
  return {
    uid,
    email,
    emailLower: email.toLowerCase(),
    displayName: uid === "alice" ? "Alice" : "Bob",
    firstName: "",
    lastName: "",
    photoURL: "",
    provider: "password",
    providers: ["password"],
    appUserId: uid === "alice" ? 1 : 2,
    siteOrigin: "https://faithin.co",
    createdAt: now(),
    updatedAt: now(),
    lastLoginAt: now(),
    status: "active",
    ...extra,
  };
}

function publicProfile(uid, extra = {}) {
  return {
    uid,
    displayName: uid === "alice" ? "Alice" : "Bob",
    photoURL: "",
    appUserId: uid === "alice" ? 1 : 2,
    createdAt: now(),
    updatedAt: now(),
    ...extra,
  };
}

function post(uid, visibility = "public", extra = {}) {
  return {
    authorUid: uid,
    author: { uid, name: uid === "alice" ? "Alice" : "Bob", avatar_url: "" },
    type: "Text",
    title: "",
    excerpt: "",
    content: "A safe post",
    article_title: "",
    article_excerpt: "",
    article_body: "",
    media_items: [],
    cover_image_url: "",
    visibility,
    blessing_bg_color: "",
    allow_download: true,
    reactions: {},
    comment_count: 0,
    share_count: 0,
    repost_count: 0,
    createdAt: now(),
    updatedAt: now(),
    ...extra,
  };
}

before(async () => {
  environment = await initializeTestEnvironment({ projectId, firestore: { rules } });
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "users/alice"), account("alice", "alice@example.com"));
    await setDoc(doc(db, "users/bob"), account("bob", "bob@example.com"));
  });
});

after(async () => {
  await environment.cleanup();
});

test("account documents are private to their owner", async () => {
  const alice = environment.authenticatedContext("alice", { email: "alice@example.com" }).firestore();
  const bob = environment.authenticatedContext("bob", { email: "bob@example.com" }).firestore();
  const anonymous = environment.unauthenticatedContext().firestore();

  await assertSucceeds(getDoc(doc(alice, "users/alice")));
  await assertFails(getDoc(doc(bob, "users/alice")));
  await assertFails(getDoc(doc(anonymous, "users/alice")));
});

test("providers without a shared email can create only an email-empty account", async () => {
  const github = environment.authenticatedContext("github-user").firestore();
  await assertSucceeds(
    setDoc(doc(github, "users/github-user"), {
      ...account("github-user", ""),
      provider: "github",
      providers: ["github.com"],
    }),
  );
  await assertFails(
    setDoc(doc(github, "users/forged-user"), account("forged-user", "victim@example.com")),
  );
});

test("public profiles exclude email and cannot self-award verification", async () => {
  const alice = environment.authenticatedContext("alice", { email: "alice@example.com" }).firestore();
  const bob = environment.authenticatedContext("bob", { email: "bob@example.com" }).firestore();

  await assertSucceeds(setDoc(doc(alice, "publicProfiles/alice"), publicProfile("alice")));
  await assertSucceeds(getDoc(doc(bob, "publicProfiles/alice")));
  await assertFails(
    setDoc(doc(alice, "publicProfiles/alice"), publicProfile("alice", { email: "alice@example.com" })),
  );
  await assertFails(
    setDoc(
      doc(alice, "publicProfiles/alice"),
      publicProfile("alice", { verification: { show: true, type: "blue" } }),
    ),
  );
  await assertFails(
    updateDoc(doc(alice, "users/alice"), { verification: { show: true, type: "blue" } }),
  );
});

test("private posts are owner-only and ownership is immutable", async () => {
  const alice = environment.authenticatedContext("alice", { email: "alice@example.com" }).firestore();
  const bob = environment.authenticatedContext("bob", { email: "bob@example.com" }).firestore();

  await assertSucceeds(setDoc(doc(alice, "posts/public"), post("alice")));
  await assertSucceeds(setDoc(doc(alice, "posts/private"), post("alice", "private")));
  await assertSucceeds(getDoc(doc(bob, "posts/public")));
  await assertFails(getDoc(doc(bob, "posts/private")));
  await assertSucceeds(getDoc(doc(alice, "posts/private")));
  await assertFails(updateDoc(doc(bob, "posts/public"), { content: "stolen" }));
  await assertFails(updateDoc(doc(alice, "posts/public"), { authorUid: "bob" }));
});

test("engagement can only change the caller reaction or increment one counter", async () => {
  const bob = environment.authenticatedContext("bob", { email: "bob@example.com" }).firestore();

  await assertSucceeds(updateDoc(doc(bob, "posts/public"), { "reactions.bob": "support" }));
  await assertFails(updateDoc(doc(bob, "posts/public"), { "reactions.alice": "like" }));
  await assertFails(updateDoc(doc(bob, "posts/public"), { share_count: 100 }));
  await assertSucceeds(updateDoc(doc(bob, "posts/public"), { share_count: 1 }));
});

test("follow ids and outbound job links are validated", async () => {
  const alice = environment.authenticatedContext("alice", { email: "alice@example.com" }).firestore();

  const follow = { followerUid: "alice", targetUid: "bob", createdAt: now() };
  await assertFails(setDoc(doc(alice, "follows/wrong-id"), follow));
  await assertSucceeds(setDoc(doc(alice, "follows/alice__bob"), follow));

  const baseJob = {
    authorUid: "alice",
    title: "Pastor",
    organization: "Faith Church",
    location: "Phnom Penh",
    job_type: "Full-time",
    description: "Serve the congregation.",
    apply_url: "https://faith.example/jobs/1",
    contact_email: "",
    featured: false,
    createdAt: now(),
    updatedAt: now(),
  };
  await assertSucceeds(setDoc(doc(alice, "jobs/safe"), baseJob));
  await assertFails(setDoc(doc(alice, "jobs/script"), { ...baseJob, apply_url: "javascript:alert(1)" }));
  await assertFails(setDoc(doc(alice, "jobs/no-contact"), { ...baseJob, apply_url: "" }));
});
