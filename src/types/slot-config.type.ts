export interface PayoutEntry {
  "3": number;
  "4": number;
  "5": number;
}

export interface FeatureFlags {
  is_tournament_enabled: boolean;
  is_jackpot_enabled: boolean;
  enable_buy_feature: boolean;
  use_high_res_assets: boolean;
  enable_haptic_feedback: boolean;
}

export interface ScheduledEvent {
  event_id: string;
  event_name: string;
  start_date: string;
  end_date: string;
  event_type: string;
  multiplier_value?: number;
}

export interface Rewards {
  daily_login_base: number;
  daily_login_streak_multiplier: number;
  ad_watch_reward: number;
  social_share_reward: number;
  level_up_base: number;
}

export interface JackpotTier {
  seed: number;
  contribution_pct: number;
}

export interface JackpotSettings {
  jackpot_type: string;
  currency: string;
  tiers: Record<string, JackpotTier>;
}

export interface PlayerSegmentCondition {
  ">="?: number;
  "<="?: number;
  ">"?: number;
  "<"?: number;
}

export interface PlayerSegment {
  segment_id: string;
  segment_name: string;
  conditions: Record<string, PlayerSegmentCondition>;
  overrides: Record<string, unknown>;
}

export interface PromotionalOffer {
  pack_id: string;
  price_usd: number;
  coins: number;
  bonus_spins: number;
}

export interface LiveOpsCampaign {
  campaign_id: string;
  active_campaign: string;
  ui_theme: string;
  promotional_offers: PromotionalOffer[];
}

export interface SlotConfig {
  game_name: string;
  slot_machine_id: string;
  app_version_target: string;
  bet_levels: number[];
  reel_symbols: Record<string, string>;
  payout_table: Record<string, PayoutEntry>;
  feature_flags: FeatureFlags;
  event_schedule: ScheduledEvent[];
  rewards: Rewards;
  jackpot_settings: JackpotSettings;
  player_segments: PlayerSegment[];
  liveops_campaign_settings: LiveOpsCampaign[];
}
