# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WordPress site running the **Avada** theme with a custom **Avada-Child-Theme**. Uses WooCommerce for e-commerce and ACF (Advanced Custom Fields) for custom data. The primary custom feature is the **MoxAI Stand** — an AI-powered exhibition stand configurator.

## CSS Build

SCSS source lives in `wp-content/themes/Avada-Child-Theme/assets/sass/`. The entry point is `bundle.scss`, which imports all partials. Compile to `assets/css/bundle.css` using your local Sass tooling (e.g. `sass assets/sass/bundle.scss assets/css/bundle.css`). There is no package.json or build script in the repo — compilation is done externally.

## Architecture

### Child Theme Structure

```
wp-content/themes/Avada-Child-Theme/
├── functions.php          # Entry point: requires inc/ files, enqueues assets, injects api_vars
├── inc/
│   ├── shortcodes.php     # Custom Fusion Builder element + WordPress shortcodes
│   ├── helper.php         # WP_Query helpers, HTML renderers for carousels
│   ├── ajax.php           # Generic AJAX handlers (taxonomy terms)
│   └── moxai_stand.php    # Requires the three moxai_stand/* files
│       moxai_stand/
│       ├── 1_mox_ai_start.php      # [mox_ai_stand_start] shortcode + form HTML
│       ├── 2_mox_ai_summary.php    # [mox_ai_stand_summary] shortcode
│       └── mox_ai_ajax.php         # AJAX: summary render, image upload, configurator fetch
├── template-parts/
│   ├── mox_ai_stand_summary.php    # PHP template rendering website analysis results
│   └── furniture_analyze_form.php  # Upload form for furniture photo analyzer
└── assets/
    ├── sass/              # SCSS source (bundle.scss imports all partials)
    ├── css/               # Compiled CSS (bundle.css, not committed as source)
    ├── js/
    │   ├── custom_script.js           # Global: tab UI, showMoreContent, search canvas
    │   ├── moxai_stand.js             # aiStandApp object — website analysis + stand generation flow
    │   └── moxai_furniture_analyzer.js # furnitureAnalyzerApp — photo upload + analysis
    └── fonts/, images/, lity/, swiper/
```

### MoxAI Stand Flow

1. User submits website URL + email via `[mox_ai_stand_start]` form
2. JS (`aiStandApp`) calls external API `createTask/` → receives `taskId`
3. Polls `getTask/{taskId}` every 7 s until status = `completed`
4. Calls WP AJAX `mox_ai_stand_auto_setup_summary` → renders `mox_ai_stand_summary.php` with color scheme, fonts, page summaries
5. User clicks "Begin" → `generateFurnitureCreateTask/` creates a generation task, polls `generateFurnitureGetTask/{generationId}`
6. Result (base64 image) is stored in `standImageData['base']`; WP AJAX `mox_ai_stand_get_configurator` returns the 3D configurator HTML

### External API Configuration

The external API base URL is set via ACF options page fields:
- `live_api_base_url` — used when `dev_mode` ACF field is **true**
- `dev_api_base_url` — used when `dev_mode` is **false**

These are injected into the page as `window.api_vars` in `functions.php` (`wp_head` hook).

URL query params for testing:
- `?devMode=true` — skips the form and auto-loads test data (hardcoded `taskId`)
- `?imageCache=true` — passes `cache: true` to the generation API

### AJAX Actions (all use nonce `theme`)

| Action | Handler | Purpose |
|---|---|---|
| `mox_ai_stand_auto_setup_summary` | `mox_ai_ajax.php` | Renders summary HTML via template-part |
| `mox_ai_stand_upload_image` | `mox_ai_ajax.php` | Saves base64 image to WP Media Library |
| `mox_ai_stand_get_configurator` | `mox_ai_ajax.php` | Returns `[mox_furniture_config_general_settings]` shortcode HTML |
| `get_product_taxonomy_terms` | `ajax.php` | Returns taxonomy terms as slug→name map |

### Shortcodes

| Shortcode | File | Notes |
|---|---|---|
| `[trukme_posts_carousel]` | `shortcodes.php` | Swiper carousel for posts or WooCommerce products; also registered as a Fusion Builder element |
| `[pterm_banner_title/image]` | `shortcodes.php` | Reads ACF `banner` field from current product category term |
| `[pterm_bottom_content_*]` | `shortcodes.php` | Reads ACF `bottom_content` field from current product category term |
| `[mox_ai_stand_start]` | `1_mox_ai_start.php` | Renders the website analysis form |
| `[mox_ai_stand_summary]` | `2_mox_ai_summary.php` | Empty container; populated via AJAX after analysis |

### CSS Variables

SCSS variables in `_var.scss` map to Avada's CSS custom properties (`--awb-color3` through `--awb-custom_color_3` and `--awb-typography*`). Always use the SCSS aliases (`$blackTheme1`, `$mobile`, etc.) rather than the raw `--awb-*` vars in SCSS files.

### Maintenance Script

`delete-old-config-attachments.php` (root) is a standalone CLI-style script — run directly in a browser or via cron. It connects to the database directly (not via WordPress bootstrap), deletes temp configurator images older than 1 month from `wp-content/uploads/temp-configurator/`, and cleans up `wp_config_user_settings.temp_ai_textures` JSON references.

## Three.js Development

The project contains a Three.js-based 3D configurator.

For Three.js work, use the `threejs` skill.

The official Three.js reference repository is:

`~/references/threejs-r160/`

Prefer official Three.js examples as implementation references.
Always verify APIs against the Three.js version used by the project.