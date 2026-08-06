-- Add giveaway_reminder to dgl_activity_type for Jarvis Giveaway Reminder
-- announcements. Additive only — does not recreate or modify existing values.

alter type public.dgl_activity_type
  add value if not exists 'giveaway_reminder';
