export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MatchStatus = 'scheduled' | 'live' | 'finished'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          total_points: number
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          total_points?: number
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          total_points?: number
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          name: string
          country_code: string
          flag_url: string | null
          group_name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          country_code: string
          flag_url?: string | null
          group_name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          country_code?: string
          flag_url?: string | null
          group_name?: string
          created_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          home_team_id: string
          away_team_id: string
          match_date: string
          stage: string
          venue: string
          home_score: number | null
          away_score: number | null
          status: MatchStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          home_team_id: string
          away_team_id: string
          match_date: string
          stage: string
          venue: string
          home_score?: number | null
          away_score?: number | null
          status?: MatchStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          home_team_id?: string
          away_team_id?: string
          match_date?: string
          stage?: string
          venue?: string
          home_score?: number | null
          away_score?: number | null
          status?: MatchStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      predictions: {
        Row: {
          id: string
          user_id: string
          match_id: string
          predicted_home_score: number
          predicted_away_score: number
          points_earned: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          match_id: string
          predicted_home_score: number
          predicted_away_score: number
          points_earned?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          match_id?: string
          predicted_home_score?: number
          predicted_away_score?: number
          points_earned?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_match_id_fkey"
            columns: ["match_id"]
            referencedRelation: "matches"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_email_by_username: {
        Args: {
          username: string
        }
        Returns: string | null
      }
    }
    Enums: {
      match_status: MatchStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier use
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Team = Database['public']['Tables']['teams']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type Prediction = Database['public']['Tables']['predictions']['Row']

// Extended types with relations
export interface MatchWithTeams extends Match {
  home_team: Team
  away_team: Team
}

export interface PredictionWithMatch extends Prediction {
  match: MatchWithTeams
}

export interface PredictionWithUser extends Prediction {
  profile: Profile
}
