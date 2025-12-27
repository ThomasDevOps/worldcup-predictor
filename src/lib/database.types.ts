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
      bonus_questions: {
        Row: {
          id: string
          question_text: string
          answer_type: string
          points_value: number
          correct_answer: string | null
          deadline: string
          is_graded: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question_text: string
          answer_type?: string
          points_value?: number
          correct_answer?: string | null
          deadline: string
          is_graded?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question_text?: string
          answer_type?: string
          points_value?: number
          correct_answer?: string | null
          deadline?: string
          is_graded?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bonus_answers: {
        Row: {
          id: string
          user_id: string
          question_id: string
          answer: string
          points_earned: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          answer: string
          points_earned?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          answer?: string
          points_earned?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bonus_answers_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_answers_question_id_fkey"
            columns: ["question_id"]
            referencedRelation: "bonus_questions"
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
      reset_match_to_scheduled: {
        Args: {
          p_match_id: string
        }
        Returns: undefined
      }
      grade_bonus_question: {
        Args: {
          p_question_id: string
          p_correct_answer: string
        }
        Returns: undefined
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
export type BonusQuestion = Database['public']['Tables']['bonus_questions']['Row']
export type BonusAnswer = Database['public']['Tables']['bonus_answers']['Row']

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

export interface BonusAnswerWithQuestion extends BonusAnswer {
  bonus_question: BonusQuestion
}

export interface BonusQuestionWithAnswer extends BonusQuestion {
  bonus_answer?: BonusAnswer | null
}
