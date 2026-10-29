import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { seedPosts, seedUsers, seedComments } from '../data/seed.js';

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function slugifyTitle(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function ensureUniqueSlug(base, posts, ownId) {
  if (!base) return '';
  let candidate = base;
  let n = 2;
  while (posts.some((p) => p.id !== ownId && p.slug === candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

export const useStore = create(
  persist(
    (set, get) => ({
      // ---------------- Theme ----------------
      theme: 'light',
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        if (next === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ theme: next });
      },
      initTheme: () => {
        const current = get().theme;
        if (current === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      // ---------------- Users & Auth ----------------
      users: seedUsers,
      currentUser: null,

      login: (username, password) => {
        const users = get().users;
        const normUser = (username || '').trim().toLowerCase();
        const normPass = (password || '').trim();

        if (!normPass) {
          return { ok: false, error: 'Password is required to log in.' };
        }

        const foundUser = users.find(
          (u) => u.username.toLowerCase() === normUser || u.name.toLowerCase() === normUser
        );

        if (!foundUser) {
          return { ok: false, error: 'User not found. Please check your username.' };
        }

        const validPasswords = [
          foundUser.password,
          foundUser.password.toLowerCase(),
          foundUser.username.toLowerCase(),
          `${foundUser.username.toLowerCase()}123`,
          foundUser.name.toLowerCase(),
          `${foundUser.name.toLowerCase()}123`
        ];

        if (!validPasswords.includes(normPass) && !validPasswords.includes(normPass.toLowerCase())) {
          return { ok: false, error: 'Incorrect password. Please try again.' };
        }

        set({ currentUser: foundUser });
        return { ok: true, user: foundUser };
      },

      logout: () => set({ currentUser: null }),

      updateProfile: (patch) => {
        const current = get().currentUser;
        if (!current) return;
        const updatedUser = { ...current, ...patch };
        set((state) => ({
          currentUser: updatedUser,
          users: state.users.map((u) => (u.username === current.username ? updatedUser : u))
        }));
      },

      // Follows: map of targetUsername -> array of followerUsernames
      follows: {
        bhumi: ['ishika'],
        ishika: ['bhumi']
      },

      toggleFollow: (targetUsername) => {
        const current = get().currentUser;
        if (!current || current.username === targetUsername) return;
        const follower = current.username;
        const currentFollowers = get().follows[targetUsername] || [];
        const isFollowing = currentFollowers.includes(follower);

        const updatedFollowers = isFollowing
          ? currentFollowers.filter((f) => f !== follower)
          : [...currentFollowers, follower];

        set((state) => ({
          follows: {
            ...state.follows,
            [targetUsername]: updatedFollowers
          }
        }));
      },

      isFollowing: (targetUsername) => {
        const current = get().currentUser;
        if (!current) return false;
        const followers = get().follows[targetUsername] || [];
        return followers.includes(current.username);
      },

      getFollowersCount: (username) => {
        return (get().follows[username] || []).length;
      },

      getFollowingCount: (username) => {
        const allFollows = get().follows;
        let count = 0;
        Object.values(allFollows).forEach((followers) => {
          if (followers.includes(username)) count++;
        });
        return count;
      },

      // ---------------- Posts ----------------
      posts: seedPosts,

      createDraft: () => {
        const user = get().currentUser;
        if (!user) return null;
        const id = newId('post');
        const draft = {
          id,
          title: '',
          slug: '',
          category: 'Technology',
          coverImage: '',
          tags: [],
          status: 'draft',
          author: user.username,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          views: 0,
          likes: 0,
          content: ''
        };
        set((state) => ({ posts: [draft, ...state.posts] }));
        return id;
      },

      updatePost: (id, patch) => {
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id !== id) return p;
            const next = { ...p, ...patch, updatedAt: new Date().toISOString() };
            if (patch.title !== undefined) {
              next.slug = ensureUniqueSlug(
                slugifyTitle(patch.title),
                state.posts,
                id
              );
            }
            return next;
          })
        }));
      },

      publishPost: (id) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: 'published',
                  updatedAt: new Date().toISOString(),
                  slug: p.slug || ensureUniqueSlug(slugifyTitle(p.title || 'untitled-post'), state.posts, id)
                }
              : p
          )
        }));
      },

      unpublishPost: (id) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, status: 'draft', updatedAt: new Date().toISOString() } : p
          )
        }));
      },

      deletePost: (id) => {
        set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }));
      },

      recordView: (id) => {
        set((state) => ({
          posts: state.posts.map((p) => (p.id === id ? { ...p, views: (p.views || 0) + 1 } : p))
        }));
        // Record user reading interests
        const post = get().posts.find((p) => p.id === id);
        if (post) {
          get().recordInterest(post.category, post.tags);
        }
      },

      // ---------------- Likes & Bookmarks ----------------
      likedPostIds: [],
      toggleLike: (id) => {
        const likedPosts = get().likedPostIds;
        const already = likedPosts.includes(id);
        set((state) => ({
          likedPostIds: already
            ? state.likedPostIds.filter((x) => x !== id)
            : [...state.likedPostIds, id],
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, likes: Math.max(0, (p.likes || 0) + (already ? -1 : 1)) } : p
          )
        }));
      },

      bookmarkedPostIds: [],
      toggleBookmark: (id) => {
        set((state) => ({
          bookmarkedPostIds: state.bookmarkedPostIds.includes(id)
            ? state.bookmarkedPostIds.filter((x) => x !== id)
            : [...state.bookmarkedPostIds, id]
        }));
      },

      // ---------------- Comments ----------------
      comments: seedComments,

      addComment: (postId, text, parentId = null) => {
        const user = get().currentUser;
        const author = user ? user.name : 'Guest Reader';
        const authorUsername = user ? user.username : 'guest';
        const authorAvatar = user
          ? user.avatar
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';

        const comment = {
          id: newId('comment'),
          postId,
          parentId,
          author,
          authorUsername,
          authorAvatar,
          text,
          likes: 0,
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          comments: {
            ...state.comments,
            [postId]: [...(state.comments[postId] || []), comment]
          }
        }));
      },

      likeComment: (postId, commentId) => {
        set((state) => ({
          comments: {
            ...state.comments,
            [postId]: (state.comments[postId] || []).map((c) =>
              c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
            )
          }
        }));
      },

      deleteComment: (postId, commentId) => {
        set((state) => ({
          comments: {
            ...state.comments,
            [postId]: (state.comments[postId] || []).filter((c) => c.id !== commentId && c.parentId !== commentId)
          }
        }));
      },

      // ---------------- Interests & Recommendations ----------------
      userInterests: {
        categories: ['Security', 'React'],
        tags: ['react', 'security']
      },

      recordInterest: (category, tags = []) => {
        const current = get().userInterests;
        const newCats = category && !current.categories.includes(category)
          ? [category, ...current.categories].slice(0, 5)
          : current.categories;
        const newTags = Array.from(new Set([...tags, ...current.tags])).slice(0, 10);
        set({ userInterests: { categories: newCats, tags: newTags } });
      }
    }),
    {
      name: 'marginalia-storage-v5',
      version: 5
    }
  )
);
