import type { SlotConfig } from "../../types/index.js";

export const baseConfig: SlotConfig = {
  game_name: "Test Game",
  slot_machine_id: "SLOT_001",
  app_version_target: ">=1.0.0",
  bet_levels: [10, 50, 100],
  reel_symbols: { ID_00: "WILD", ID_01: "SCATTER" },
  payout_table: {
    WILD: { "3": 10, "4": 50, "5": 100 },
  },
  feature_flags: {
    is_tournament_enabled: false,
    is_jackpot_enabled: false,
    enable_buy_feature: false,
    use_high_res_assets: false,
    enable_haptic_feedback: false,
  },
  event_schedule: [],
  rewards: {
    daily_login_base: 100,
    daily_login_streak_multiplier: 1.5,
    ad_watch_reward: 50,
    social_share_reward: 25,
    level_up_base: 200,
  },
  jackpot_settings: {
    jackpot_type: "progressive",
    currency: "coins",
    tiers: {
      mini: { seed: 1000, contribution_pct: 0.01 },
    },
  },
  player_segments: [],
  liveops_campaign_settings: [],
};
