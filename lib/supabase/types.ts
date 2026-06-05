export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "admin" | "student";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: AppRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: AppRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: AppRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      brand_settings: {
        Row: {
          id: boolean;
          brand_name: string;
          logo_url: string | null;
          primary_color: string;
          accent_color: string;
          legal_name: string;
          tax_id: string;
          country: string;
          state: string;
          address: string;
          legal_email: string;
          privacy_policy: string;
          terms_conditions: string;
          cookies_policy: string;
          legal_notice: string;
          privacy_updated_at: string;
          terms_updated_at: string;
          cookies_updated_at: string;
          legal_notice_updated_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          brand_name?: string;
          logo_url?: string | null;
          primary_color?: string;
          accent_color?: string;
          legal_name?: string;
          tax_id?: string;
          country?: string;
          state?: string;
          address?: string;
          legal_email?: string;
          privacy_policy?: string;
          terms_conditions?: string;
          cookies_policy?: string;
          legal_notice?: string;
          privacy_updated_at?: string;
          terms_updated_at?: string;
          cookies_updated_at?: string;
          legal_notice_updated_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: boolean;
          brand_name?: string;
          logo_url?: string | null;
          primary_color?: string;
          accent_color?: string;
          legal_name?: string;
          tax_id?: string;
          country?: string;
          state?: string;
          address?: string;
          legal_email?: string;
          privacy_policy?: string;
          terms_conditions?: string;
          cookies_policy?: string;
          legal_notice?: string;
          privacy_updated_at?: string;
          terms_updated_at?: string;
          cookies_updated_at?: string;
          legal_notice_updated_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          creator_id: string | null;
          title: string;
          slug: string;
          type: string;
          subtitle: string | null;
          description: string | null;
          cover_image_url: string | null;
          price_mxn_cents: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id?: string | null;
          title: string;
          slug: string;
          type: string;
          subtitle?: string | null;
          description?: string | null;
          cover_image_url?: string | null;
          price_mxn_cents?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string | null;
          title?: string;
          slug?: string;
          type?: string;
          subtitle?: string | null;
          description?: string | null;
          cover_image_url?: string | null;
          price_mxn_cents?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          product_id: string;
          module_id: string | null;
          title: string;
          slug: string;
          description: string | null;
          video_url: string | null;
          display_order: number;
          is_preview: boolean;
          lesson_type: string;
          duration_minutes: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          module_id?: string | null;
          title: string;
          slug: string;
          description?: string | null;
          video_url?: string | null;
          display_order?: number;
          is_preview?: boolean;
          lesson_type?: string;
          duration_minutes?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          module_id?: string | null;
          title?: string;
          slug?: string;
          description?: string | null;
          video_url?: string | null;
          display_order?: number;
          is_preview?: boolean;
          lesson_type?: string;
          duration_minutes?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lessons_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      lesson_resources: {
        Row: {
          id: string;
          lesson_id: string;
          title: string;
          file_url: string;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          title: string;
          file_url: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          title?: string;
          file_url?: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_resources_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          }
        ];
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          product_id: string;
          status: string;
          enrolled_at: string;
          expires_at: string | null;
          payment_provider: string | null;
          payment_reference: string | null;
          granted_by: string | null;
          granted_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          product_id: string;
          status?: string;
          enrolled_at?: string;
          expires_at?: string | null;
          payment_provider?: string | null;
          payment_reference?: string | null;
          granted_by?: string | null;
          granted_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          product_id?: string;
          status?: string;
          enrolled_at?: string;
          expires_at?: string | null;
          payment_provider?: string | null;
          payment_reference?: string | null;
          granted_by?: string | null;
          granted_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          lesson_id: string;
          is_completed: boolean;
          last_viewed_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          lesson_id: string;
          is_completed?: boolean;
          last_viewed_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          lesson_id?: string;
          is_completed?: boolean;
          last_viewed_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_progress_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          status: string;
          total_mxn_cents: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          status?: string;
          total_mxn_cents: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          status?: string;
          total_mxn_cents?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          method: string;
          status: string;
          proof_url: string | null;
          approved_by: string | null;
          approved_at: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          method: string;
          status?: string;
          proof_url?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          method?: string;
          status?: string;
          proof_url?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      courses: {
        Row: {
          id: string;
          creator_id: string | null;
          title: string;
          slug: string;
          description: string | null;
          cover_image_url: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
