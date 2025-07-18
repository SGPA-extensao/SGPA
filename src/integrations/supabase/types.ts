export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attendance: {
        Row: {
          check_in_date: string | null
          id: string
          member_id: string
        }
        Insert: {
          check_in_date?: string | null
          id?: string
          member_id: string
        }
        Update: {
          check_in_date?: string | null
          id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          }
        ]
      }
      members: {
        Row: {
          cpf_id: string
          created_at: string | null
          entry_date: string
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          plan_id: number
          status: boolean
          user_id: string | null
        }
        Insert: {
          cpf_id: string
          created_at?: string | null
          entry_date?: string
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          plan_id: number
          status?: boolean
          user_id?: string | null
        }
        Update: {
          cpf_id?: string
          created_at?: string | null
          entry_date?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          plan_id?: number
          status?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          member_id: string
          next_payment_date: string
          payment_date: string
          status: string
          receipt_url: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          member_id: string
          next_payment_date: string
          payment_date: string
          status: string
          receipt_url?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          member_id?: string
          next_payment_date?: string
          payment_date?: string
          status?: string
          receipt_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          }
        ]
      }
      plans: {
        Row: {
          description: string | null
          duration_months: number
          id: number
          name: string
          price: number
        }
        Insert: {
          description?: string | null
          duration_months: number
          id?: number
          name: string
          price: number
        }
        Update: {
          description?: string | null
          duration_months?: number
          id?: number
          name?: string
          price?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      agenda: {
        Row: {
          id: number
          title: string
          date: string
          time: string
          responsible: string
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          date: string
          time: string
          responsible: string
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          date?: string
          time?: string
          responsible?: string
          created_at?: string
        }
        Relationships: []
      }

      trainings: {
        Row: {
          id: string
          name: string
          description: string | null
          duration: string
          level: 'iniciante' | 'intermediario' | 'avancado'
          responsible: string
          members: string[]
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          duration: string
          level: 'iniciante' | 'intermediario' | 'avancado'
          responsible: string
          members: string[]
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          duration?: string
          level?: 'iniciante' | 'intermediario' | 'avancado'
          responsible?: string
          members?: string[]
          created_at?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

// ... O restante das helpers (Tables, TablesInsert, TablesUpdate, etc) fica igual ao seu original.

