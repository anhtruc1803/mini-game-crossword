/**
 * Supabase Database types — manually maintained to match migration.
 * Regenerate with `npx supabase gen types typescript` when using Supabase CLI.
 */

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          user_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      themes: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          banner_url: string | null;
          desktop_bg_url: string | null;
          mobile_bg_url: string | null;
          primary_color: string;
          secondary_color: string;
          accent_color: string;
          overlay_opacity: number;
          font_heading: string | null;
          font_body: string | null;
          custom_css_json: Record<string, string> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          banner_url?: string | null;
          desktop_bg_url?: string | null;
          mobile_bg_url?: string | null;
          primary_color?: string;
          secondary_color?: string;
          accent_color?: string;
          overlay_opacity?: number;
          font_heading?: string | null;
          font_body?: string | null;
          custom_css_json?: Record<string, string> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          banner_url?: string | null;
          desktop_bg_url?: string | null;
          mobile_bg_url?: string | null;
          primary_color?: string;
          secondary_color?: string;
          accent_color?: string;
          overlay_opacity?: number;
          font_heading?: string | null;
          font_body?: string | null;
          custom_css_json?: Record<string, string> | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      programs: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          status: string;
          start_at: string | null;
          end_at: string | null;
          theme_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          status?: string;
          start_at?: string | null;
          end_at?: string | null;
          theme_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          status?: string;
          start_at?: string | null;
          end_at?: string | null;
          theme_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "programs_theme_id_fkey";
            columns: ["theme_id"];
            isOneToOne: false;
            referencedRelation: "themes";
            referencedColumns: ["id"];
          }
        ];
      };
      games: {
        Row: {
          id: string;
          program_id: string;
          title: string;
          subtitle: string | null;
          final_keyword: string | null;
          total_rows: number;
          current_row_index: number | null;
          game_status: string;
          announcement_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          title: string;
          subtitle?: string | null;
          final_keyword?: string | null;
          total_rows?: number;
          current_row_index?: number | null;
          game_status?: string;
          announcement_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          program_id?: string;
          title?: string;
          subtitle?: string | null;
          final_keyword?: string | null;
          total_rows?: number;
          current_row_index?: number | null;
          game_status?: string;
          announcement_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "games_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          }
        ];
      };
      crossword_rows: {
        Row: {
          id: string;
          game_id: string;
          row_order: number;
          clue_text: string;
          answer_text: string;
          answer_length: number;
          highlighted_indexes_json: number[];
          row_status: string;
          note_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          row_order: number;
          clue_text: string;
          answer_text: string;
          answer_length: number;
          highlighted_indexes_json?: number[];
          row_status?: string;
          note_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          row_order?: number;
          clue_text?: string;
          answer_text?: string;
          answer_length?: number;
          highlighted_indexes_json?: number[];
          row_status?: string;
          note_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "crossword_rows_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          }
        ];
      };
      game_events: {
        Row: {
          id: string;
          game_id: string;
          event_type: string;
          message: string;
          payload_json: Record<string, unknown> | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          game_id: string;
          event_type: string;
          message: string;
          payload_json?: Record<string, unknown> | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          game_id?: string;
          event_type?: string;
          message?: string;
          payload_json?: Record<string, unknown> | null;
          created_at?: string;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "game_events_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_public_viewer_snapshot: {
        Args: {
          p_program_slug: string;
        };
        Returns: unknown;
      };
      is_admin: {
        Args: {
          p_user_id: string | null;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
