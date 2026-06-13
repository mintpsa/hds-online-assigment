# Game: HDS Coding Assignment (SLOT_ENV_042)

An adventure-themed mobile slot game with progressive jackpots, seasonal LiveOps campaigns, and player segmentation.

## Reel symbols

Symbols are ranked by payout value (highest first):

- **WILD** — substitutes for any symbol
- **SCATTER_BONUS** — triggers bonus rounds
- **HIGH_ARTIFACT / HIGH_EXPLORER** — high-value themed symbols
- **MID_COMPASS / MID_MAP** — mid-value symbols
- **LOW_A / LOW_K / LOW_Q / LOW_J / LOW_10** — low-value card symbols

## Key config fields

- **bet_levels** — coins per spin tiers available to the player; must be ascending
- **payout_table** — multipliers paid for 3-, 4-, and 5-symbol matches; 5-match ≥ 4-match ≥ 3-match is a hard requirement
- **feature_flags.is_jackpot_enabled / is_tournament_enabled** — master switches; disabling both effectively mothballs the game
- **jackpot_settings.tiers[*].contribution_pct** — fraction of each bet added to each jackpot pool; total across all tiers above 15% is a risk warning, above 25% is an error
- **rewards** — base coin values for player engagement actions (daily login, ad watch, etc.)
- **event_schedule** — time-boxed XP or reward multiplier events; end_date must be after start_date
- **liveops_campaign_settings** — active seasonal campaign including UI theme and promotional coin packs
- **player_segments** — behavioural cohorts with per-segment overrides (e.g. whale multipliers, new-player tutorials)
