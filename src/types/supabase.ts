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
      email_accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          password: string
          smtp_host: string
          smtp_port: number
          use_tls: boolean
          daily_limit: number
          sent_today: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          password: string
          smtp_host: string
          smtp_port: number
          use_tls?: boolean
          daily_limit: number
          sent_today?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['email_accounts']['Insert']>
      }
      leads: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          company: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          company: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }
      templates: {
        Row: {
          id: string
          user_id: string
          name: string
          subject: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          subject: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['templates']['Insert']>
      }
      campaigns: {
        Row: {
          id: string
          user_id: string
          name: string
          template_id: string
          lead_list_ids: string[]
          email_account_ids: string[]
          schedule: {
            start_time: string
            end_time: string
            days: string[]
          }
          status: 'draft' | 'active' | 'completed' | 'paused'
          metrics: {
            sent: number
            successful: number
            failed: number
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          template_id: string
          lead_list_ids: string[]
          email_account_ids: string[]
          schedule?: {
            start_time: string
            end_time: string
            days: string[]
          }
          status?: 'draft' | 'active' | 'completed' | 'paused'
          metrics?: {
            sent: number
            successful: number
            failed: number
          }
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['campaigns']['Insert']>
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          settings: Json
          smtp_config: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          settings?: Json
          smtp_config?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['user_settings']['Insert']>
      }
    }
  }
}