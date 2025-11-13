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
      certificate_templates: {
        Row: {
          background_url: string | null
          category_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          template_config: Json | null
          template_html: string
          updated_at: string | null
        }
        Insert: {
          background_url?: string | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          template_config?: Json | null
          template_html: string
          updated_at?: string | null
        }
        Update: {
          background_url?: string | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          template_config?: Json | null
          template_html?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificate_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "form_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_url: string | null
          id: string
          issued_at: string | null
          membership_id: string
          user_id: string
        }
        Insert: {
          certificate_url?: string | null
          id?: string
          issued_at?: string | null
          membership_id: string
          user_id: string
        }
        Update: {
          certificate_url?: string | null
          id?: string
          issued_at?: string | null
          membership_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      editable_pages: {
        Row: {
          created_at: string
          id: string
          is_published: boolean | null
          page_key: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean | null
          page_key: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean | null
          page_key?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      education_tv_videos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          position: number
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          position?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          position?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      email_verifications: {
        Row: {
          code: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string
          event_date: string
          id: string
          image_url: string | null
          is_published: boolean | null
          location: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          event_date: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          location?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          event_date?: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          location?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      footer_legal_links: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          label: string
          position: number
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          position?: number
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          position?: number
          url?: string
        }
        Relationships: []
      }
      footer_quick_links: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          label: string
          position: number
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          position?: number
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          position?: number
          url?: string
        }
        Relationships: []
      }
      footer_social_links: {
        Row: {
          created_at: string | null
          icon_name: string
          id: string
          is_active: boolean | null
          platform: string
          position: number
          url: string
        }
        Insert: {
          created_at?: string | null
          icon_name: string
          id?: string
          is_active?: boolean | null
          platform: string
          position?: number
          url: string
        }
        Update: {
          created_at?: string | null
          icon_name?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          position?: number
          url?: string
        }
        Relationships: []
      }
      form_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          position: number
          price: number
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          position?: number
          price?: number
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          position?: number
          price?: number
          type?: string
        }
        Relationships: []
      }
      form_questions: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          is_required: boolean | null
          options: Json | null
          position: number
          question_text: string
          question_type: string
          repeatable_config: Json | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          position?: number
          question_text: string
          question_type: string
          repeatable_config?: Json | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          position?: number
          question_text?: string
          question_type?: string
          repeatable_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "form_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          category_id: string
          id: string
          membership_id: string
          submission_data: Json
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          category_id: string
          id?: string
          membership_id: string
          submission_data: Json
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: string
          id?: string
          membership_id?: string
          submission_data?: Json
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "form_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      header_links: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          label: string
          position: number
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          position?: number
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          position?: number
          url?: string
        }
        Relationships: []
      }
      membership_serials: {
        Row: {
          category_id: string
          last_serial: number
          updated_at: string | null
        }
        Insert: {
          category_id: string
          last_serial?: number
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          last_serial?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      memberships: {
        Row: {
          amount: number | null
          category_id: string | null
          created_at: string | null
          gnacops_id: string
          id: string
          payment_status: string
          region: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          category_id?: string | null
          created_at?: string | null
          gnacops_id: string
          id?: string
          payment_status?: string
          region?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          category_id?: string | null
          created_at?: string | null
          gnacops_id?: string
          id?: string
          payment_status?: string
          region?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "form_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_blocks: {
        Row: {
          block_data: Json
          block_type: string
          created_at: string
          id: string
          page_id: string
          position: number
          updated_at: string
        }
        Insert: {
          block_data?: Json
          block_type: string
          created_at?: string
          id?: string
          page_id: string
          position?: number
          updated_at?: string
        }
        Update: {
          block_data?: Json
          block_type?: string
          created_at?: string
          id?: string
          page_id?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_blocks_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "editable_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      page_content: {
        Row: {
          content: Json
          id: string
          page_key: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          id?: string
          page_key: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          id?: string
          page_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_expiry_checks: {
        Row: {
          checked_at: string | null
          expired_count: number | null
          id: string
        }
        Insert: {
          checked_at?: string | null
          expired_count?: number | null
          id?: string
        }
        Update: {
          checked_at?: string | null
          expired_count?: number | null
          id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          membership_id: string
          paid_at: string | null
          payment_method: string | null
          paystack_reference: string | null
          plan_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          membership_id: string
          paid_at?: string | null
          payment_method?: string | null
          paystack_reference?: string | null
          plan_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          membership_id?: string
          paid_at?: string | null
          payment_method?: string | null
          paystack_reference?: string | null
          plan_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "form_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
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
          created_at: string | null
          email: string | null
          email_verified: boolean | null
          full_name: string | null
          id: string
          last_payment_at: string | null
          paid_until: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id: string
          last_payment_at?: string | null
          paid_until?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          last_payment_at?: string | null
          paid_until?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          full_description: string
          id: string
          image_url: string | null
          is_active: boolean | null
          position: number
          short_description: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_description: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          position?: number
          short_description: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          position?: number
          short_description?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: string
          settings_data: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          settings_data?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          settings_data?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      smtp_settings: {
        Row: {
          created_at: string | null
          from_email: string
          from_name: string
          host: string
          id: string
          is_active: boolean | null
          password: string
          port: number
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          from_email: string
          from_name: string
          host: string
          id?: string
          is_active?: boolean | null
          password: string
          port?: number
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          from_email?: string
          from_name?: string
          host?: string
          id?: string
          is_active?: boolean | null
          password?: string
          port?: number
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          created_at: string | null
          id: string
          is_admin: boolean | null
          message: string
          sender_id: string | null
          ticket_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          message: string
          sender_id?: string | null
          ticket_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          message?: string
          sender_id?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          priority: string | null
          status: string
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          priority?: string | null
          status?: string
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          priority?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          photo_url: string | null
          position: string
          position_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          photo_url?: string | null
          position: string
          position_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          photo_url?: string | null
          position?: string
          position_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      next_membership_serial: {
        Args: { _category_id: string }
        Returns: number
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "super_admin"
        | "director"
        | "head_of_unit"
        | "assistant"
        | "support_worker"
        | "membership_officer"
        | "finance_officer"
        | "secretary"
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
      app_role: [
        "admin",
        "user",
        "super_admin",
        "director",
        "head_of_unit",
        "assistant",
        "support_worker",
        "membership_officer",
        "finance_officer",
        "secretary",
      ],
    },
  },
} as const
