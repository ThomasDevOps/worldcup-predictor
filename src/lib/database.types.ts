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
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      match_status: MatchStatus
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
