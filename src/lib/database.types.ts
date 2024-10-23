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
      user_settings: {
        Row: {
          id: number
          user_id: string
          email_notifications: boolean
          daily_reports: boolean
          weekly_reports: boolean
          security_alerts: boolean
          max_daily_emails: number
          smtp_host: string | null
          smtp_port: number | null
          smtp_user: string | null
          smtp_pass: string | null
          smtp_from: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          email_notifications?: boolean
          daily_reports?: boolean
          weekly_reports?: boolean
          security_alerts?: boolean
          max_daily_emails?: number
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          smtp_pass?: string | null
          smtp_from?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          email_notifications?: boolean
          daily_reports?: boolean
          weekly_reports?: boolean
          security_alerts?: boolean
          max_daily_emails?: number
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          smtp_pass?: string | null
          smtp_from?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}