export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      affiliates: {
        Row: {
          active: boolean | null
          checkout_lifetime: string
          checkout_monthly: string
          created_at: string | null
          email: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          active?: boolean | null
          checkout_lifetime: string
          checkout_monthly: string
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          active?: boolean | null
          checkout_lifetime?: string
          checkout_monthly?: string
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      analysis_cache: {
        Row: {
          analysis: Json
          created_at: string
          id: string
          video_url: string
        }
        Insert: {
          analysis: Json
          created_at?: string
          id?: string
          video_url: string
        }
        Update: {
          analysis?: Json
          created_at?: string
          id?: string
          video_url?: string
        }
        Relationships: []
      }
      blocked_categories: {
        Row: {
          category: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      blocked_terms: {
        Row: {
          created_at: string
          id: string
          term: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          term: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          term?: string
          user_id?: string
        }
        Relationships: []
      }
      creator_profiles: {
        Row: {
          average_views: string | null
          brand_archetype: string | null
          brand_cause: string | null
          brand_competitor_weakness: string | null
          brand_enemy: string | null
          brand_origin_story: string | null
          brand_recognition: string | null
          brand_tribe: string | null
          content_style: string
          created_at: string
          goals: string | null
          id: string
          main_platforms: string[] | null
          niche: string
          profile_handle: string | null
          sub_niches: string[] | null
          target_audience: string
          tone_of_voice: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_views?: string | null
          brand_archetype?: string | null
          brand_cause?: string | null
          brand_competitor_weakness?: string | null
          brand_enemy?: string | null
          brand_origin_story?: string | null
          brand_recognition?: string | null
          brand_tribe?: string | null
          content_style?: string
          created_at?: string
          goals?: string | null
          id?: string
          main_platforms?: string[] | null
          niche?: string
          profile_handle?: string | null
          sub_niches?: string[] | null
          target_audience?: string
          tone_of_voice?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_views?: string | null
          brand_archetype?: string | null
          brand_cause?: string | null
          brand_competitor_weakness?: string | null
          brand_enemy?: string | null
          brand_origin_story?: string | null
          brand_recognition?: string | null
          brand_tribe?: string | null
          content_style?: string
          created_at?: string
          goals?: string | null
          id?: string
          main_platforms?: string[] | null
          niche?: string
          profile_handle?: string | null
          sub_niches?: string[] | null
          target_audience?: string
          tone_of_voice?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      oauth_integrations: {
        Row: {
          access_token: string | null
          connected_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          last_synced_at: string | null
          provider: string
          provider_user_id: string | null
          raw_payload: Json | null
          refresh_token: string | null
          scopes: string[] | null
          status: string
          token_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connected_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          last_synced_at?: string | null
          provider?: string
          provider_user_id?: string | null
          raw_payload?: Json | null
          refresh_token?: string | null
          scopes?: string[] | null
          status?: string
          token_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          connected_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          last_synced_at?: string | null
          provider?: string
          provider_user_id?: string | null
          raw_payload?: Json | null
          refresh_token?: string | null
          scopes?: string[] | null
          status?: string
          token_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      oauth_states: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          provider: string
          redirect_to: string | null
          state: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          provider?: string
          redirect_to?: string | null
          state: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          provider?: string
          redirect_to?: string | null
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      trend_clusters: {
        Row: {
          created_at: string
          id: string
          label: string
          trend_ids: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          trend_ids?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          trend_ids?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      trend_fetch_runs: {
        Row: {
          error_message: string | null
          finished_at: string | null
          id: string
          items_count: number | null
          raw_payload: Json | null
          source: string
          started_at: string
          status: string
        }
        Insert: {
          error_message?: string | null
          finished_at?: string | null
          id?: string
          items_count?: number | null
          raw_payload?: Json | null
          source: string
          started_at?: string
          status?: string
        }
        Update: {
          error_message?: string | null
          finished_at?: string | null
          id?: string
          items_count?: number | null
          raw_payload?: Json | null
          source?: string
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      trend_opportunities: {
        Row: {
          created_at: string
          cta: string | null
          hooks: string[] | null
          id: string
          narrative: string | null
          niche: string
          opportunity_score: number | null
          suggested_product_keywords: string[] | null
          trend_id: string
          updated_at: string
          video_ideas: string[] | null
          why_now: string | null
        }
        Insert: {
          created_at?: string
          cta?: string | null
          hooks?: string[] | null
          id?: string
          narrative?: string | null
          niche: string
          opportunity_score?: number | null
          suggested_product_keywords?: string[] | null
          trend_id: string
          updated_at?: string
          video_ideas?: string[] | null
          why_now?: string | null
        }
        Update: {
          created_at?: string
          cta?: string | null
          hooks?: string[] | null
          id?: string
          narrative?: string | null
          niche?: string
          opportunity_score?: number | null
          suggested_product_keywords?: string[] | null
          trend_id?: string
          updated_at?: string
          video_ideas?: string[] | null
          why_now?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trend_opportunities_trend_id_fkey"
            columns: ["trend_id"]
            isOneToOne: false
            referencedRelation: "trends"
            referencedColumns: ["id"]
          },
        ]
      }
      trend_settings: {
        Row: {
          active_sources: string[] | null
          alert_threshold: number | null
          created_at: string
          id: string
          ingestion_mode: string | null
          n8n_webhook_url: string | null
          priority_niches: string[] | null
          score_sensitivity: number | null
          update_frequency: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_sources?: string[] | null
          alert_threshold?: number | null
          created_at?: string
          id?: string
          ingestion_mode?: string | null
          n8n_webhook_url?: string | null
          priority_niches?: string[] | null
          score_sensitivity?: number | null
          update_frequency?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_sources?: string[] | null
          alert_threshold?: number | null
          created_at?: string
          id?: string
          ingestion_mode?: string | null
          n8n_webhook_url?: string | null
          priority_niches?: string[] | null
          score_sensitivity?: number | null
          update_frequency?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trend_snapshots: {
        Row: {
          created_at: string
          id: string
          overall_score: number | null
          snapshot_data: Json | null
          trend_id: string
          velocity_score: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          overall_score?: number | null
          snapshot_data?: Json | null
          trend_id: string
          velocity_score?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          overall_score?: number | null
          snapshot_data?: Json | null
          trend_id?: string
          velocity_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trend_snapshots_trend_id_fkey"
            columns: ["trend_id"]
            isOneToOne: false
            referencedRelation: "trends"
            referencedColumns: ["id"]
          },
        ]
      }
      trend_sources: {
        Row: {
          created_at: string
          external_id: string | null
          id: string
          normalized_score: number | null
          observed_at: string
          raw_payload: Json | null
          raw_score: number | null
          region: string
          signal_label: string
          source: string
          source_type: string
          trend_id: string
          url: string | null
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          id?: string
          normalized_score?: number | null
          observed_at?: string
          raw_payload?: Json | null
          raw_score?: number | null
          region?: string
          signal_label: string
          source: string
          source_type: string
          trend_id: string
          url?: string | null
        }
        Update: {
          created_at?: string
          external_id?: string | null
          id?: string
          normalized_score?: number | null
          observed_at?: string
          raw_payload?: Json | null
          raw_score?: number | null
          region?: string
          signal_label?: string
          source?: string
          source_type?: string
          trend_id?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trend_sources_trend_id_fkey"
            columns: ["trend_id"]
            isOneToOne: false
            referencedRelation: "trends"
            referencedColumns: ["id"]
          },
        ]
      }
      trend_watchlist: {
        Row: {
          created_at: string
          id: string
          trend_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          trend_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          trend_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trend_watchlist_trend_id_fkey"
            columns: ["trend_id"]
            isOneToOne: false
            referencedRelation: "trends"
            referencedColumns: ["id"]
          },
        ]
      }
      trends: {
        Row: {
          aliases: string[] | null
          category: string
          commerce_potential_score: number | null
          country: string
          created_at: string
          cross_source_score: number | null
          external_id: string | null
          first_seen_at: string
          id: string
          label: string
          last_seen_at: string
          niches: string[] | null
          novelty_score: number | null
          overall_score: number | null
          raw_payload: Json | null
          recommended_angles: string[] | null
          region: string
          related_terms: string[] | null
          risk_score: number | null
          saturation_score: number | null
          status: string
          suggested_ctas: string[] | null
          suggested_formats: string[] | null
          suggested_hooks: string[] | null
          summary: string | null
          updated_at: string
          velocity_score: number | null
          viral_potential_score: number | null
        }
        Insert: {
          aliases?: string[] | null
          category?: string
          commerce_potential_score?: number | null
          country?: string
          created_at?: string
          cross_source_score?: number | null
          external_id?: string | null
          first_seen_at?: string
          id?: string
          label: string
          last_seen_at?: string
          niches?: string[] | null
          novelty_score?: number | null
          overall_score?: number | null
          raw_payload?: Json | null
          recommended_angles?: string[] | null
          region?: string
          related_terms?: string[] | null
          risk_score?: number | null
          saturation_score?: number | null
          status?: string
          suggested_ctas?: string[] | null
          suggested_formats?: string[] | null
          suggested_hooks?: string[] | null
          summary?: string | null
          updated_at?: string
          velocity_score?: number | null
          viral_potential_score?: number | null
        }
        Update: {
          aliases?: string[] | null
          category?: string
          commerce_potential_score?: number | null
          country?: string
          created_at?: string
          cross_source_score?: number | null
          external_id?: string | null
          first_seen_at?: string
          id?: string
          label?: string
          last_seen_at?: string
          niches?: string[] | null
          novelty_score?: number | null
          overall_score?: number | null
          raw_payload?: Json | null
          recommended_angles?: string[] | null
          region?: string
          related_terms?: string[] | null
          risk_score?: number | null
          saturation_score?: number | null
          status?: string
          suggested_ctas?: string[] | null
          suggested_formats?: string[] | null
          suggested_hooks?: string[] | null
          summary?: string | null
          updated_at?: string
          velocity_score?: number | null
          viral_potential_score?: number | null
        }
        Relationships: []
      }
      user_history: {
        Row: {
          created_at: string | null
          id: string
          payload: Json | null
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payload?: Json | null
          tipo: string
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payload?: Json | null
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
