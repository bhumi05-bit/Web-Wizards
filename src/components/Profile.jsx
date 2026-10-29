import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/store.js';
import PostCard from './PostCard.jsx';
import { EmptyState } from './Skeleton.jsx';
import {
  UsersIcon,
  EditIcon,
  CheckIcon,
  XIcon,
  SparklesIcon
} from './Icons.jsx';
import UserAvatar from './UserAvatar.jsx';

export default function Profile() {
  const { username } = useParams();
  const currentUser = useStore((s) => s.currentUser);
  const users = useStore((s) => s.users);
  const posts = useStore((s) => s.posts);
  const follows = useStore((s) => s.follows);
  const toggleFollow = useStore((s) => s.toggleFollow);
  const isFollowing = useStore((s) => s.isFollowing);
  const getFollowersCount = useStore((s) => s.getFollowersCount);
  const getFollowingCount = useStore((s) => s.getFollowingCount);
  const updateProfile = useStore((s) => s.updateProfile);

  // If no username in params, fallback to currentUser
  const targetUsername = username || currentUser?.username;
  const user = users.find((u) => u.username === targetUsername);

  const [activeTab, setActiveTab] = useState('published'); // 'published' | 'drafts'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [role, setRole] = useState(user?.role || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <h2 className="font-serif text-3xl mb-3 text-ink dark:text-darkInk">Author Not Found</h2>
        <p className="text-sm text-inkMuted dark:text-darkInkMuted mb-6">
          The author profile you're looking for doesn't exist.
        </p>
        <Link to="/" className="text-sm text-moss dark:text-mossNeon underline">
          Return to Stories
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.username === user.username;
  const followed = isFollowing(user.username);
  const followersCount = getFollowersCount(user.username);
  const followingCount = getFollowingCount(user.username);

  // Filter posts
  const authorPosts = useMemo(() => {
    return posts.filter((p) => p.author === user.username);
  }, [posts, user.username]);

  const publishedPosts = authorPosts.filter((p) => p.status === 'published');
  const draftPosts = authorPosts.filter((p) => p.status === 'draft');
  const totalViews = publishedPosts.reduce((acc, p) => acc + (p.views || 0), 0);

  function handleSaveProfile(e) {
    e.preventDefault();
    updateProfile({
      name: name.trim() || user.name,
      bio: bio.trim(),
      avatar: avatar.trim() || user.avatar,
      role: role.trim(),
      location: location.trim(),
      website: website.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsEditModalOpen(false);
    }, 1200);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Profile Header Card */}
      <section className="relative overflow-hidden rounded-3xl border border-line dark:border-darkLine bg-white dark:bg-darkCard p-6 sm:p-10 shadow-2xs mb-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with status border */}
          <div className="relative group">
            <UserAvatar
              name={user.name}
              username={user.username}
              size="2xl"
              className="border-4 border-paper dark:border-darkBg shadow-md"
            />
            {isOwnProfile && (
              <button
                type="button"
                onClick={() => {
                  setName(user.name);
                  setBio(user.bio || '');
                  setRole(user.role || '');
                  setLocation(user.location || '');
                  setWebsite(user.website || '');
                  setIsEditModalOpen(true);
                }}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-moss dark:bg-emerald-600 text-white shadow-md hover:scale-105 transition-transform"
                title="Edit Profile"
              >
                <EditIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-darkInk">
                  {user.name}
                </h1>
                <span className="font-mono text-xs text-moss dark:text-mossNeon font-semibold">
                  @{user.username}
                </span>
              </div>

              {/* Follow / Edit Button */}
              {isOwnProfile ? (
                <button
                  type="button"
                  onClick={() => {
                    setName(user.name);
                    setBio(user.bio || '');
                    setAvatar(user.avatar || '');
                    setRole(user.role || '');
                    setLocation(user.location || '');
                    setWebsite(user.website || '');
                    setIsEditModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-line dark:border-darkLine hover:border-moss dark:hover:border-mossNeon text-xs font-medium text-ink dark:text-darkInk transition-all shadow-2xs"
                >
                  <EditIcon className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : currentUser ? (
                <button
                  type="button"
                  onClick={() => toggleFollow(user.username)}
                  className={`px-5 py-2 rounded-full text-xs font-medium transition-all shadow-2xs ${
                    followed
                      ? 'border border-line dark:border-darkLine bg-paper dark:bg-darkBg text-inkMuted dark:text-darkInkMuted'
                      : 'bg-moss dark:bg-emerald-600 hover:bg-mossDark text-white'
                  }`}
                >
                  {followed ? 'Following' : '+ Follow Author'}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-full bg-moss dark:bg-emerald-600 text-white text-xs font-medium shadow-2xs"
                >
                  Sign in to Follow
                </Link>
              )}
            </div>

            {/* Role & Bio */}
            {user.role && (
              <p className="text-xs font-medium text-ink/80 dark:text-darkInk/80 mb-2">
                {user.role} {user.location && `· ${user.location}`}
              </p>
            )}

            <p className="text-sm text-inkMuted dark:text-darkInkMuted leading-relaxed max-w-xl mb-4">
              {user.bio || 'Author has not written a bio yet.'}
            </p>

            {/* Stats Bar (Articles, Views, Followers, Following) */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-xs text-inkMuted dark:text-darkInkMuted pt-4 border-t border-line/60 dark:border-darkLine font-mono">
              <div>
                <strong className="text-ink dark:text-darkInk text-sm font-serif">
                  {publishedPosts.length}
                </strong>{' '}
                stories
              </div>
              <div>
                <strong className="text-ink dark:text-darkInk text-sm font-serif">
                  {totalViews}
                </strong>{' '}
                total views
              </div>
              <div>
                <strong className="text-ink dark:text-darkInk text-sm font-serif">
                  {followersCount}
                </strong>{' '}
                followers
              </div>
              <div>
                <strong className="text-ink dark:text-darkInk text-sm font-serif">
                  {followingCount}
                </strong>{' '}
                following
              </div>
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-moss dark:text-mossNeon hover:underline"
                >
                  {user.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs (Published Stories / Drafts) */}
      <div className="flex items-center gap-4 border-b border-line dark:border-darkLine mb-8">
        <button
          type="button"
          onClick={() => setActiveTab('published')}
          className={`pb-3 text-sm font-medium transition-all relative ${
            activeTab === 'published'
              ? 'text-moss dark:text-mossNeon font-bold'
              : 'text-inkMuted dark:text-darkInkMuted hover:text-ink'
          }`}
        >
          <span>Published Articles ({publishedPosts.length})</span>
          {activeTab === 'published' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-moss dark:bg-mossNeon rounded-full" />
          )}
        </button>

        {isOwnProfile && (
          <button
            type="button"
            onClick={() => setActiveTab('drafts')}
            className={`pb-3 text-sm font-medium transition-all relative ${
              activeTab === 'drafts'
                ? 'text-moss dark:text-mossNeon font-bold'
                : 'text-inkMuted dark:text-darkInkMuted hover:text-ink'
            }`}
          >
            <span>My Drafts ({draftPosts.length})</span>
            {activeTab === 'drafts' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-moss dark:bg-mossNeon rounded-full" />
            )}
          </button>
        )}
      </div>

      {/* Post Items */}
      {activeTab === 'published' && (
        <div>
          {publishedPosts.length === 0 ? (
            <EmptyState
              icon="📖"
              title="No published articles yet"
              description={`${user.name} hasn't published any stories yet. Check back soon!`}
            />
          ) : (
            <div className="space-y-4">
              {publishedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'drafts' && isOwnProfile && (
        <div>
          {draftPosts.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No drafts currently saved"
              description="Your drafts will be kept safe here until you are ready to publish them."
              actionLabel="Write a new draft"
              actionTo="/editor/new"
            />
          ) : (
            <div className="space-y-4">
              {draftPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-darkCard rounded-3xl border border-line dark:border-darkLine p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-bold text-ink dark:text-darkInk">
                Edit Profile
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-inkMuted hover:text-ink"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink dark:text-darkInk mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full text-xs rounded-xl border border-line dark:border-darkLine bg-paper dark:bg-darkBg text-ink dark:text-darkInk p-2.5 outline-none focus:border-moss"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink dark:text-darkInk mb-1">
                  Bio / About Me
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short summary of your background, interests, and engineering passion..."
                  className="w-full text-xs rounded-xl border border-line dark:border-darkLine bg-paper dark:bg-darkBg text-ink dark:text-darkInk p-2.5 outline-none focus:border-moss resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink dark:text-darkInk mb-1">
                  Role / Headline
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full text-xs rounded-xl border border-line dark:border-darkLine bg-paper dark:bg-darkBg text-ink dark:text-darkInk p-2.5 outline-none focus:border-moss"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink dark:text-darkInk mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, India"
                    className="w-full text-xs rounded-xl border border-line dark:border-darkLine bg-paper dark:bg-darkBg text-ink dark:text-darkInk p-2.5 outline-none focus:border-moss"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink dark:text-darkInk mb-1">
                    Website / Portfolio
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs rounded-xl border border-line dark:border-darkLine bg-paper dark:bg-darkBg text-ink dark:text-darkInk p-2.5 outline-none focus:border-moss"
                  />
                </div>
              </div>

              {savedSuccess && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckIcon className="w-4 h-4" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line dark:border-darkLine">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-line dark:border-darkLine text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-moss dark:bg-emerald-600 text-white text-xs font-medium hover:bg-mossDark transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
