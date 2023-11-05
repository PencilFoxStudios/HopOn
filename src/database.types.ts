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
      games: {
        Row: {
          app_id: string
          created_at: string
          id: number
          multiplayer: boolean
          name: string
          type: string
        }
        Insert: {
          app_id: string
          created_at?: string
          id?: number
          multiplayer: boolean
          name: string
          type: string
        }
        Update: {
          app_id?: string
          created_at?: string
          id?: number
          multiplayer?: boolean
          name?: string
          type?: string
        }
        Relationships: []
      }
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
          cachedSteamGameIDs: string[]
          created_at: string
          discord_id: string
          id: number
          steam_id: string
        }
        Insert: {
          cachedSteamGameIDs?: string[]
          created_at?: string
          discord_id: string
          id?: number
          steam_id: string
        }
        Update: {
          cachedSteamGameIDs?: string[]
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
      get_games_in: {
        Args: {
          vals: string[]
        }
        Returns: {
          app_id: string
          created_at: string
          id: number
          multiplayer: boolean
          name: string
          type: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
