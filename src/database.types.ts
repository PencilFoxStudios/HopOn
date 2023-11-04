export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      servers: {
        Row: {
          created_at: string
          guild_id: string
          id: number
        }
        Insert: {
          created_at?: string
          guild_id: string
          id?: number
        }
        Update: {
          created_at?: string
          guild_id?: string
          id?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          discord_id: string
          id: number
          steam_id: string
        }
        Insert: {
          created_at?: string
          discord_id: string
          id?: number
          steam_id: string
        }
        Update: {
          created_at?: string
          discord_id?: string
          id?: number
          steam_id?: string
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
