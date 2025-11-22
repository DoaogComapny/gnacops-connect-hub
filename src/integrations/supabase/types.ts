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
      appointments: {
        Row: {
          appointment_date: string
          appointment_type: string
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          duration_minutes: number
          google_calendar_event_id: string | null
          id: string
          meeting_link: string | null
          purpose: string
          reminder_sent: boolean | null
          secretary_notes: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          appointment_date: string
          appointment_type: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          duration_minutes?: number
          google_calendar_event_id?: string | null
          id?: string
          meeting_link?: string | null
          purpose: string
          reminder_sent?: boolean | null
          secretary_notes?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_type?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          duration_minutes?: number
          google_calendar_event_id?: string | null
          id?: string
          meeting_link?: string | null
          purpose?: string
          reminder_sent?: boolean | null
          secretary_notes?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          module: string | null
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          module?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          module?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      available_dates: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          id: string
          is_available: boolean
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          id?: string
          is_available?: boolean
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          is_available?: boolean
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "available_dates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      coordinator_notifications: {
        Row: {
          coordinator_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          priority: string | null
          read_at: string | null
          school_id: string | null
          title: string
        }
        Insert: {
          coordinator_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          priority?: string | null
          read_at?: string | null
          school_id?: string | null
          title: string
        }
        Update: {
          coordinator_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          school_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "coordinator_notifications_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_resources: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          file_url: string | null
          id: string
          resource_type: string
          status: string
          title: string
          updated_at: string | null
          version: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          resource_type: string
          status?: string
          title: string
          updated_at?: string | null
          version?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          resource_type?: string
          status?: string
          title?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          head_user_id: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_department_id: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          head_user_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_department_id?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          head_user_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_department_id?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_parent_department_id_fkey"
            columns: ["parent_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "gnacops_units"
            referencedColumns: ["id"]
          },
        ]
      }
      document_access_log: {
        Row: {
          action: string
          created_at: string | null
          document_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_access_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          created_at: string | null
          department_id: string | null
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_public: boolean | null
          tags: string[] | null
          title: string
          unit_id: string | null
          updated_at: string | null
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_public?: boolean | null
          tags?: string[] | null
          title: string
          unit_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_public?: boolean | null
          tags?: string[] | null
          title?: string
          unit_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "gnacops_units"
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
      email_analytics: {
        Row: {
          appointment_id: string | null
          bounce_status: string | null
          clicked_at: string | null
          created_at: string | null
          email_type: string
          id: string
          opened_at: string | null
          recipient_email: string
          sent_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          bounce_status?: string | null
          clicked_at?: string | null
          created_at?: string | null
          email_type: string
          id?: string
          opened_at?: string | null
          recipient_email: string
          sent_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          bounce_status?: string | null
          clicked_at?: string | null
          created_at?: string | null
          email_type?: string
          id?: string
          opened_at?: string | null
          recipient_email?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_analytics_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string | null
          html_body: string
          id: string
          is_active: boolean | null
          subject: string
          template_key: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          html_body: string
          id?: string
          is_active?: boolean | null
          subject: string
          template_key: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          html_body?: string
          id?: string
          is_active?: boolean | null
          subject?: string
          template_key?: string
          updated_at?: string | null
          variables?: Json | null
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
      gnacops_units: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          responsibilities: string[] | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          responsibilities?: string[] | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          responsibilities?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      grant_applications: {
        Row: {
          amount: number
          applicant_school_id: string | null
          application_data: Json | null
          created_at: string | null
          deadline: string | null
          id: string
          reviewed_by: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          applicant_school_id?: string | null
          application_data?: Json | null
          created_at?: string | null
          deadline?: string | null
          id?: string
          reviewed_by?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          applicant_school_id?: string | null
          application_data?: Json | null
          created_at?: string | null
          deadline?: string | null
          id?: string
          reviewed_by?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grant_applications_applicant_school_id_fkey"
            columns: ["applicant_school_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grant_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      marketplace_cart: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_delivery_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          delivered_at: string | null
          delivery_address: string
          delivery_personnel_id: string
          id: string
          notes: string | null
          order_id: string
          picked_up_at: string | null
          pickup_address: string
          status: string
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          delivered_at?: string | null
          delivery_address: string
          delivery_personnel_id: string
          id?: string
          notes?: string | null
          order_id: string
          picked_up_at?: string | null
          pickup_address: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          delivered_at?: string | null
          delivery_address?: string
          delivery_personnel_id?: string
          id?: string
          notes?: string | null
          order_id?: string
          picked_up_at?: string | null
          pickup_address?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_delivery_assignments_delivery_personnel_id_fkey"
            columns: ["delivery_personnel_id"]
            isOneToOne: false
            referencedRelation: "marketplace_delivery_personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_delivery_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_delivery_personnel: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          is_active: boolean | null
          phone: string
          successful_deliveries: number | null
          total_deliveries: number | null
          user_id: string
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          phone: string
          successful_deliveries?: number | null
          total_deliveries?: number | null
          user_id: string
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string
          successful_deliveries?: number | null
          total_deliveries?: number | null
          user_id?: string
          vehicle_type?: string | null
        }
        Relationships: []
      }
      marketplace_marketing_materials: {
        Row: {
          admin_approved: boolean | null
          admin_approved_at: string | null
          admin_approved_by: string | null
          clicks: number | null
          created_at: string | null
          end_date: string | null
          id: string
          image_url: string
          impressions: number | null
          is_active: boolean | null
          link_url: string | null
          material_type: string
          start_date: string | null
          title: string
          vendor_id: string
        }
        Insert: {
          admin_approved?: boolean | null
          admin_approved_at?: string | null
          admin_approved_by?: string | null
          clicks?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          image_url: string
          impressions?: number | null
          is_active?: boolean | null
          link_url?: string | null
          material_type: string
          start_date?: string | null
          title: string
          vendor_id: string
        }
        Update: {
          admin_approved?: boolean | null
          admin_approved_at?: string | null
          admin_approved_by?: string | null
          clicks?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          image_url?: string
          impressions?: number | null
          is_active?: boolean | null
          link_url?: string | null
          material_type?: string
          start_date?: string | null
          title?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_marketing_materials_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "marketplace_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_onboarding_questions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          options: Json | null
          position: number | null
          question_text: string
          question_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          options?: Json | null
          position?: number | null
          question_text: string
          question_type?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          options?: Json | null
          position?: number | null
          question_text?: string
          question_type?: string
        }
        Relationships: []
      }
      marketplace_order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_orders: {
        Row: {
          buyer_id: string
          cancelled_at: string | null
          commission_amount: number | null
          confirmed_at: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_address: string
          delivery_fee: number | null
          delivery_phone: string
          dispatched_at: string | null
          id: string
          notes: string | null
          order_number: string
          order_status: string
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string
          total_amount: number
          updated_at: string | null
          vendor_earnings: number | null
          vendor_id: string
        }
        Insert: {
          buyer_id: string
          cancelled_at?: string | null
          commission_amount?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_address: string
          delivery_fee?: number | null
          delivery_phone: string
          dispatched_at?: string | null
          id?: string
          notes?: string | null
          order_number: string
          order_status?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          total_amount: number
          updated_at?: string | null
          vendor_earnings?: number | null
          vendor_id: string
        }
        Update: {
          buyer_id?: string
          cancelled_at?: string | null
          commission_amount?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_address?: string
          delivery_fee?: number | null
          delivery_phone?: string
          dispatched_at?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          order_status?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          total_amount?: number
          updated_at?: string | null
          vendor_earnings?: number | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "marketplace_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_product_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          is_primary: boolean | null
          position: number | null
          product_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          position?: number | null
          product_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          position?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_product_reviews: {
        Row: {
          created_at: string | null
          id: string
          is_verified_purchase: boolean | null
          order_id: string | null
          product_id: string
          rating: number
          review_text: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id: string
          rating: number
          review_text?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string
          rating?: number
          review_text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_product_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_products: {
        Row: {
          admin_approved: boolean | null
          admin_approved_at: string | null
          admin_approved_by: string | null
          category: string
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          inventory_quantity: number | null
          is_active: boolean | null
          is_featured: boolean | null
          price: number
          requires_admin_approval: boolean | null
          sales_count: number | null
          sku: string | null
          title: string
          updated_at: string | null
          vendor_id: string
          views_count: number | null
        }
        Insert: {
          admin_approved?: boolean | null
          admin_approved_at?: string | null
          admin_approved_by?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          inventory_quantity?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          price: number
          requires_admin_approval?: boolean | null
          sales_count?: number | null
          sku?: string | null
          title: string
          updated_at?: string | null
          vendor_id: string
          views_count?: number | null
        }
        Update: {
          admin_approved?: boolean | null
          admin_approved_at?: string | null
          admin_approved_by?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          inventory_quantity?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          price?: number
          requires_admin_approval?: boolean | null
          sales_count?: number | null
          sku?: string | null
          title?: string
          updated_at?: string | null
          vendor_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "marketplace_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_staff: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_vendor_applications: {
        Row: {
          answer: string | null
          created_at: string | null
          id: string
          question_id: string
          vendor_id: string
        }
        Insert: {
          answer?: string | null
          created_at?: string | null
          id?: string
          question_id: string
          vendor_id: string
        }
        Update: {
          answer?: string | null
          created_at?: string | null
          id?: string
          question_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_vendor_applications_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "marketplace_onboarding_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_vendor_applications_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "marketplace_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_vendor_staff: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          role: string
          staff_user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role: string
          staff_user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          staff_user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_vendor_staff_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "marketplace_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_vendors: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          business_address: string | null
          business_category: string
          business_documents: Json | null
          business_name: string
          commission_rate: number | null
          created_at: string | null
          email: string
          id: string
          identification_document: string | null
          phone: string | null
          rejection_reason: string | null
          social_media_links: Json | null
          status: string
          total_orders: number | null
          total_sales: number | null
          updated_at: string | null
          user_id: string
          wallet_balance: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          business_address?: string | null
          business_category: string
          business_documents?: Json | null
          business_name: string
          commission_rate?: number | null
          created_at?: string | null
          email: string
          id?: string
          identification_document?: string | null
          phone?: string | null
          rejection_reason?: string | null
          social_media_links?: Json | null
          status?: string
          total_orders?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id: string
          wallet_balance?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          business_address?: string | null
          business_category?: string
          business_documents?: Json | null
          business_name?: string
          commission_rate?: number | null
          created_at?: string | null
          email?: string
          id?: string
          identification_document?: string | null
          phone?: string | null
          rejection_reason?: string | null
          social_media_links?: Json | null
          status?: string
          total_orders?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id?: string
          wallet_balance?: number | null
        }
        Relationships: []
      }
      marketplace_wallet_transactions: {
        Row: {
          amount: number
          balance_after: number | null
          created_at: string | null
          description: string | null
          id: string
          order_id: string | null
          transaction_type: string
          vendor_id: string
        }
        Insert: {
          amount: number
          balance_after?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          transaction_type: string
          vendor_id: string
        }
        Update: {
          amount?: number
          balance_after?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          transaction_type?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_wallet_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_wallet_transactions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "marketplace_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_withdrawal_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          bank_details: Json
          created_at: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          status: string
          vendor_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          bank_details: Json
          created_at?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          vendor_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          bank_details?: Json
          created_at?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_withdrawal_requests_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "marketplace_vendors"
            referencedColumns: ["id"]
          },
        ]
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
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          module: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          module?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          module?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
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
      permissions: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          module: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          module: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          module?: string
          name?: string
        }
        Relationships: []
      }
      policies: {
        Row: {
          approved_by: string | null
          content: string
          created_at: string | null
          created_by: string | null
          deadline: string | null
          department_id: string | null
          id: string
          implementation_progress: number | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          department_id?: string | null
          id?: string
          implementation_progress?: number | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          department_id?: string | null
          id?: string
          implementation_progress?: number | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
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
      recurring_appointments: {
        Row: {
          appointment_type: string
          created_at: string | null
          days_of_week: number[] | null
          duration_minutes: number
          end_date: string | null
          id: string
          is_active: boolean | null
          purpose: string
          recurrence_interval: number
          recurrence_pattern: string
          start_date: string
          time_of_day: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          appointment_type: string
          created_at?: string | null
          days_of_week?: number[] | null
          duration_minutes?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          purpose: string
          recurrence_interval?: number
          recurrence_pattern: string
          start_date: string
          time_of_day: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          appointment_type?: string
          created_at?: string | null
          days_of_week?: number[] | null
          duration_minutes?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          purpose?: string
          recurrence_interval?: number
          recurrence_pattern?: string
          start_date?: string
          time_of_day?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      research_projects: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          findings: string | null
          id: string
          lead_researcher_id: string | null
          report_url: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          findings?: string | null
          id?: string
          lead_researcher_id?: string | null
          report_url?: string | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          findings?: string | null
          id?: string
          lead_researcher_id?: string | null
          report_url?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_projects_lead_researcher_id_fkey"
            columns: ["lead_researcher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      school_flags: {
        Row: {
          coordinator_id: string
          created_at: string | null
          flag_type: string
          id: string
          notes: string | null
          priority: string | null
          resolved_at: string | null
          school_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          coordinator_id: string
          created_at?: string | null
          flag_type: string
          id?: string
          notes?: string | null
          priority?: string | null
          resolved_at?: string | null
          school_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          coordinator_id?: string
          created_at?: string | null
          flag_type?: string
          id?: string
          notes?: string | null
          priority?: string | null
          resolved_at?: string | null
          school_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_flags_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      school_inspections: {
        Row: {
          compliance_score: number | null
          created_at: string | null
          findings: string | null
          id: string
          inspection_date: string
          inspector_id: string | null
          recommendations: string | null
          report_url: string | null
          school_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          compliance_score?: number | null
          created_at?: string | null
          findings?: string | null
          id?: string
          inspection_date: string
          inspector_id?: string | null
          recommendations?: string | null
          report_url?: string | null
          school_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          compliance_score?: number | null
          created_at?: string | null
          findings?: string | null
          id?: string
          inspection_date?: string
          inspector_id?: string | null
          recommendations?: string | null
          report_url?: string | null
          school_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_inspections_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      school_registrations: {
        Row: {
          created_at: string | null
          id: string
          license_expiry: string | null
          owner_email: string
          owner_name: string
          owner_phone: string
          registration_data: Json | null
          registration_number: string | null
          school_address: string
          school_name: string
          status: string
          updated_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          license_expiry?: string | null
          owner_email: string
          owner_name: string
          owner_phone: string
          registration_data?: Json | null
          registration_number?: string | null
          school_address: string
          school_name: string
          status?: string
          updated_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          license_expiry?: string | null
          owner_email?: string
          owner_name?: string
          owner_phone?: string
          registration_data?: Json | null
          registration_number?: string | null
          school_address?: string
          school_name?: string
          status?: string
          updated_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_registrations_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      staff_assignments: {
        Row: {
          created_at: string | null
          district: string | null
          id: string
          region: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          district?: string | null
          id?: string
          region?: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          district?: string | null
          id?: string
          region?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      support_cases: {
        Row: {
          assigned_to: string | null
          case_type: string
          created_at: string | null
          description: string
          id: string
          priority: string
          resolution: string | null
          resolved_at: string | null
          school_id: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          case_type: string
          created_at?: string | null
          description: string
          id?: string
          priority?: string
          resolution?: string | null
          resolved_at?: string | null
          school_id?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          case_type?: string
          created_at?: string | null
          description?: string
          id?: string
          priority?: string
          resolution?: string | null
          resolved_at?: string | null
          school_id?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_cases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_cases_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
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
      sync_logs: {
        Row: {
          created_at: string | null
          created_by: string | null
          entity_id: string | null
          error_message: string | null
          google_event_id: string | null
          id: string
          status: string
          sync_type: string
          synced_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          entity_id?: string | null
          error_message?: string | null
          google_event_id?: string | null
          id?: string
          status?: string
          sync_type: string
          synced_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          entity_id?: string | null
          error_message?: string | null
          google_event_id?: string | null
          id?: string
          status?: string
          sync_type?: string
          synced_at?: string | null
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_by: string | null
          assigned_to: string | null
          attachments: Json | null
          completed_at: string | null
          created_at: string | null
          department_id: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          tags: string[] | null
          title: string
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          completed_at?: string | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          tags?: string[] | null
          title: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          completed_at?: string | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          tags?: string[] | null
          title?: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "gnacops_units"
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
      user_module_access: {
        Row: {
          created_at: string | null
          id: string
          module: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          module: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          module?: string
          user_id?: string | null
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
      get_user_permissions: {
        Args: { _user_id: string }
        Returns: {
          module: string
          permission_code: string
          permission_name: string
        }[]
      }
      has_permission: {
        Args: { _permission_code: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_audit: {
        Args: {
          _action: string
          _entity_id: string
          _entity_type: string
          _module?: string
          _new_data?: Json
          _old_data?: Json
          _user_id: string
        }
        Returns: string
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
        | "district_coordinator"
        | "regional_coordinator"
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
        "district_coordinator",
        "regional_coordinator",
      ],
    },
  },
} as const
