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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      charging_points: {
        Row: {
          availability: string
          connector_type: string
          created_at: string
          firmware_version: string | null
          id: string
          last_session_at: string | null
          station_id: string
          updated_at: string
        }
        Insert: {
          availability?: string
          connector_type: string
          created_at?: string
          firmware_version?: string | null
          id?: string
          last_session_at?: string | null
          station_id: string
          updated_at?: string
        }
        Update: {
          availability?: string
          connector_type?: string
          created_at?: string
          firmware_version?: string | null
          id?: string
          last_session_at?: string | null
          station_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "charging_points_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "station_daily_revenue"
            referencedColumns: ["station_id"]
          },
          {
            foreignKeyName: "charging_points_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      costs: {
        Row: {
          campaign_name: string
          created_at: string
          id: string
          period_end: string
          period_start: string
          total_cost: number
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          campaign_name: string
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          total_cost: number
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          campaign_name?: string
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          total_cost?: number
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_name: string
          id: string
          persona: Database["public"]["Enums"]["persona_type"] | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          zone: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_name: string
          id?: string
          persona?: Database["public"]["Enums"]["persona_type"] | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          zone?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_name?: string
          id?: string
          persona?: Database["public"]["Enums"]["persona_type"] | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          config: Json | null
          created_at: string
          enabled: boolean | null
          id: string
          name: string
          persona_filter: Database["public"]["Enums"]["persona_type"][] | null
          rollout_percentage: number | null
          updated_at: string
          zone_filter: string[] | null
        }
        Insert: {
          config?: Json | null
          created_at?: string
          enabled?: boolean | null
          id?: string
          name: string
          persona_filter?: Database["public"]["Enums"]["persona_type"][] | null
          rollout_percentage?: number | null
          updated_at?: string
          zone_filter?: string[] | null
        }
        Update: {
          config?: Json | null
          created_at?: string
          enabled?: boolean | null
          id?: string
          name?: string
          persona_filter?: Database["public"]["Enums"]["persona_type"][] | null
          rollout_percentage?: number | null
          updated_at?: string
          zone_filter?: string[] | null
        }
        Relationships: []
      }
      hosts: {
        Row: {
          address: string
          auto_pricing_on: boolean | null
          base_price_per_kwh: number
          capacity_kw: number
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          status: string | null
          updated_at: string
          user_id: string
          zone: string
        }
        Insert: {
          address: string
          auto_pricing_on?: boolean | null
          base_price_per_kwh: number
          capacity_kw: number
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          status?: string | null
          updated_at?: string
          user_id: string
          zone: string
        }
        Update: {
          address?: string
          auto_pricing_on?: boolean | null
          base_price_per_kwh?: number
          capacity_kw?: number
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          zone?: string
        }
        Relationships: [
          {
            foreignKeyName: "hosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          credits_kwh: number | null
          first_name: string | null
          id: string
          onboarding_completed: boolean | null
          persona: Database["public"]["Enums"]["persona_type"] | null
          phone: string | null
          tutorial_completed: boolean | null
          updated_at: string
          zone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          credits_kwh?: number | null
          first_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          persona?: Database["public"]["Enums"]["persona_type"] | null
          phone?: string | null
          tutorial_completed?: boolean | null
          updated_at?: string
          zone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          credits_kwh?: number | null
          first_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          persona?: Database["public"]["Enums"]["persona_type"] | null
          phone?: string | null
          tutorial_completed?: boolean | null
          updated_at?: string
          zone?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          code: string
          completed_at: string | null
          created_at: string
          first_session_completed: boolean | null
          id: string
          referred_credited: boolean | null
          referred_id: string | null
          referrer_credited: boolean | null
          referrer_id: string
        }
        Insert: {
          code: string
          completed_at?: string | null
          created_at?: string
          first_session_completed?: boolean | null
          id?: string
          referred_credited?: boolean | null
          referred_id?: string | null
          referrer_credited?: boolean | null
          referrer_id: string
        }
        Update: {
          code?: string
          completed_at?: string | null
          created_at?: string
          first_session_completed?: boolean | null
          id?: string
          referred_credited?: boolean | null
          referred_id?: string | null
          referrer_credited?: boolean | null
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          completed_at: string | null
          created_at: string
          credits_used: number | null
          id: string
          is_priority: boolean | null
          kwh_requested: number
          price_per_kwh: number
          session_id: string
          status: Database["public"]["Enums"]["reservation_status"] | null
          total_price: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          credits_used?: number | null
          id?: string
          is_priority?: boolean | null
          kwh_requested: number
          price_per_kwh: number
          session_id: string
          status?: Database["public"]["Enums"]["reservation_status"] | null
          total_price: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          credits_used?: number | null
          id?: string
          is_priority?: boolean | null
          kwh_requested?: number
          price_per_kwh?: number
          session_id?: string
          status?: Database["public"]["Enums"]["reservation_status"] | null
          total_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          available_kw: number
          charging_point_id: string | null
          created_at: string
          dynamic_price_per_kwh: number | null
          end_time: string
          host_id: string
          id: string
          price_per_kwh: number
          reserved_by: string | null
          reserved_until: string | null
          start_time: string
          station_id: string | null
          status: Database["public"]["Enums"]["session_status"] | null
          updated_at: string
        }
        Insert: {
          available_kw: number
          charging_point_id?: string | null
          created_at?: string
          dynamic_price_per_kwh?: number | null
          end_time: string
          host_id: string
          id?: string
          price_per_kwh: number
          reserved_by?: string | null
          reserved_until?: string | null
          start_time: string
          station_id?: string | null
          status?: Database["public"]["Enums"]["session_status"] | null
          updated_at?: string
        }
        Update: {
          available_kw?: number
          charging_point_id?: string | null
          created_at?: string
          dynamic_price_per_kwh?: number | null
          end_time?: string
          host_id?: string
          id?: string
          price_per_kwh?: number
          reserved_by?: string | null
          reserved_until?: string | null
          start_time?: string
          station_id?: string | null
          status?: Database["public"]["Enums"]["session_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_charging_point_id_fkey"
            columns: ["charging_point_id"]
            isOneToOne: false
            referencedRelation: "charging_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_reserved_by_fkey"
            columns: ["reserved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "station_daily_revenue"
            referencedColumns: ["station_id"]
          },
          {
            foreignKeyName: "sessions_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      station_revenue: {
        Row: {
          auto_pricing_events: number | null
          created_at: string
          id: string
          period_end: string
          period_start: string
          sessions_count: number
          station_id: string
          total_kwh: number
          total_revenue: number
        }
        Insert: {
          auto_pricing_events?: number | null
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          sessions_count?: number
          station_id: string
          total_kwh?: number
          total_revenue?: number
        }
        Update: {
          auto_pricing_events?: number | null
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          sessions_count?: number
          station_id?: string
          total_kwh?: number
          total_revenue?: number
        }
        Relationships: [
          {
            foreignKeyName: "station_revenue_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "station_daily_revenue"
            referencedColumns: ["station_id"]
          },
          {
            foreignKeyName: "station_revenue_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      stations: {
        Row: {
          address: string
          auto_pricing_on: boolean | null
          base_price_per_kwh: number
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          owner_id: string
          photo_url: string | null
          power_kw: number
          status: string
          updated_at: string
        }
        Insert: {
          address: string
          auto_pricing_on?: boolean | null
          base_price_per_kwh: number
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_id: string
          photo_url?: string | null
          power_kw: number
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string
          auto_pricing_on?: boolean | null
          base_price_per_kwh?: number
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_id?: string
          photo_url?: string | null
          power_kw?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      station_daily_revenue: {
        Row: {
          avg_price_per_kwh: number | null
          date: string | null
          sessions_count: number | null
          station_id: string | null
          station_name: string | null
          total_kwh: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "user" | "host" | "partner"
      persona_type:
        | "amal"
        | "mehdi"
        | "youssef"
        | "fatma"
        | "hatem"
        | "sana"
        | "station_owner"
      reservation_status:
        | "pending"
        | "confirmed"
        | "active"
        | "completed"
        | "cancelled"
      session_status:
        | "available"
        | "reserved"
        | "active"
        | "completed"
        | "cancelled"
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
    Enums: {
      app_role: ["admin", "user", "host", "partner"],
      persona_type: [
        "amal",
        "mehdi",
        "youssef",
        "fatma",
        "hatem",
        "sana",
        "station_owner",
      ],
      reservation_status: [
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
      ],
      session_status: [
        "available",
        "reserved",
        "active",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
