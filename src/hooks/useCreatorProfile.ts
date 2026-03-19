import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CreatorProfile {
  niche: string;
  sub_niches: string[];
  target_audience: string;
  content_style: string;
  main_platforms: string[];
  profile_handle: string;
  average_views: string;
  goals: string;
  tone_of_voice: string;
  brand_cause: string;
  brand_tribe: string;
  brand_enemy: string;
  brand_archetype: string;
  brand_origin_story: string;
  brand_recognition: string;
  brand_competitor_weakness: string;
}

const EMPTY_PROFILE: CreatorProfile = {
  niche: '',
  sub_niches: [],
  target_audience: '',
  content_style: '',
  main_platforms: ['tiktok'],
  profile_handle: '',
  average_views: '',
  goals: '',
  tone_of_voice: '',
  brand_cause: '',
  brand_tribe: '',
  brand_enemy: '',
  brand_archetype: '',
  brand_origin_story: '',
  brand_recognition: '',
  brand_competitor_weakness: '',
};

export function useCreatorProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CreatorProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const userId = user ? String(user.user_id) : null;

  const hasProfile = !!(profile.niche && profile.target_audience);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('creator_profiles' as any)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!cancelled && data && !error) {
        const d = data as any;
        setProfile({
          niche: d.niche ?? '',
          sub_niches: d.sub_niches ?? [],
          target_audience: d.target_audience ?? '',
          content_style: d.content_style ?? '',
          main_platforms: d.main_platforms ?? ['tiktok'],
          profile_handle: d.profile_handle ?? '',
          average_views: d.average_views ?? '',
          goals: d.goals ?? '',
          tone_of_voice: d.tone_of_voice ?? '',
          brand_cause: d.brand_cause ?? '',
          brand_tribe: d.brand_tribe ?? '',
          brand_enemy: d.brand_enemy ?? '',
          brand_archetype: d.brand_archetype ?? '',
          brand_origin_story: d.brand_origin_story ?? '',
          brand_recognition: d.brand_recognition ?? '',
          brand_competitor_weakness: d.brand_competitor_weakness ?? '',
        });
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [userId]);

  const saveProfile = useCallback(async (data: CreatorProfile) => {
    if (!userId) return;
    setSaving(true);
    const row = { user_id: userId, ...data, updated_at: new Date().toISOString() };
    const { error } = await supabase
      .from('creator_profiles' as any)
      .upsert(row as any, { onConflict: 'user_id' });
    if (!error) setProfile(data);
    setSaving(false);
    return error;
  }, [userId]);

  return { profile, hasProfile, loading, saving, saveProfile };
}
