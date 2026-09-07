# Furniture Configurator Mox V2 — Plugin & Child Theme Overview

## Plugin: `furniture-configurator-mox-v2`

**Main file:** `wp-content/plugins/furniture-configurator-mox-v2/furniture-configurator-v2.php`

3D furniture configuration system — textures, components, room assembly, WooCommerce cart integration.

---

## PHP Files

| File | What it does |
|---|---|
| `furniture-configurator-v2.php` | Entry point: requires all includes, enqueues scripts/styles, registers MIME hooks for `.glb`/`.xml` |
| `constants.php` | Cookie names, furniture-type slugs, global config constants |
| `customposttypes.php` | Registers CPTs (`furniture-texture`, `furniture-component`, `config-template`) and 8 taxonomies |
| `shortcodes.php` | Registers `[mox_furniture_config_general_settings]`, `[mox_furniture_v2_product_thumbnail]`, `[mox_furniture_product_general_settings_v2]` |
| `shortcodes-room.php` | Registers `[mox_furniture_config_room]`, `[mox_furniture_config_preview]` |
| `ajax.php` | Front-end AJAX: gallery, products list, texture images, product settings, price calculation, add-to-cart |
| `ajax-room.php` | Room-specific AJAX: render room, add item, save/load config, calculate room totals, login/register |
| `wooactions.php` | WooCommerce filters/actions: custom cart IDs, display config data in cart, apply config pricing, save config to orders |
| `wooadmin.php` | Shows configured parts breakdown inside WP admin order view |
| `helper.php` | Internal helpers: texture lookups, furniture type resolution |
| `helper-product.php` | Product-specific helper functions (dimensions, price) |
| `helper-room.php` | Room DB queries, config data retrieval |
| `customizer.php` | WP Customizer panels for room/furniture/product layout settings |
| `admin/index.php` | Admin-side configurator interface |
| `admin/metaboxes.php` | Meta boxes for admin CPT editing |
| `admin/ajax.php` | Admin AJAX handlers (render admin room config, add/save items) |

---

## Shortcodes

| Shortcode | Renders | Template |
|---|---|---|
| `[mox_furniture_config_general_settings]` | Category-page configurator (gallery + products) | `template-parts/category/index.php` |
| `[mox_furniture_v2_product_thumbnail]` | 3D model container for product listing thumbnails | Inline HTML |
| `[mox_furniture_product_general_settings_v2]` | Single-product configurator | `template-parts/product/index.php` |
| `[mox_furniture_config_room]` | Full 3D room layout configurator | `template-parts/room/index.php` |
| `[mox_furniture_config_preview]` | Read-only saved-config preview (`?id=`) | Plugin template part |

---

## AJAX Actions

### Category/product configurator (`ajax.php`)

| Action | Purpose |
|---|---|
| `render_config_furniture_gallery` | Returns texture gallery HTML |
| `render_config_furniture_products` | Returns products+components HTML |
| `render_settings_images` | Returns images for a texture ID |
| `render_config_products` | Paginated product list (JSON: HTML + load-more flag) |
| `render_config_furniture_product_settings` | Product dimensions, textures, components (JSON) |
| `config_furniture_calculate_totals` | Category-page price calculation |
| `config_furniture_ajax_add_to_cart` | Category-page add-to-cart |
| `product_ajax_calculate_totals` | Single-product price calculation |
| `product_ajax_add_to_cart` | Single-product add-to-cart |

### Room configurator (`ajax-room.php`)

| Action | Purpose |
|---|---|
| `render_config_room` | Build room state: products, dimensions, textures |
| `load_more_products` | Paginate sidebar product list |
| `add_furniture_item_to_config_v2_settings` | Add item to room config |
| `config_3d_products_addtocart` | Add room config to WooCommerce cart |
| `ajax_config_calculate_totals` | Calculate room total price |
| `ajax_save_config_settings` | Persist config to DB, return config ID |
| `ajax_login_v2` / `ajax_register_v2` | In-configurator auth |
| `render_config_room_preview` | Preview saved room config |

### Admin (`admin/ajax.php`)

| Action | Purpose |
|---|---|
| `render_config_room_admin` | Render admin configurator interface |
| `add_furniture_item_to_admin_config` | Add item to admin config |
| `ajax_save_admin_config_settings` | Save admin config |

---

## Scripts (enqueued on front-end)

| Handle | File | Used on |
|---|---|---|
| `furniture-config-script-js` | `assets/js/script.js` | All pages with plugin |
| `furniture-config-category-script-js` | `assets/js/script-category.js` | Category configurator |
| `furniture-config-products-script-js` | `assets/js/script-products.js` | Category configurator |
| `furniture-config-room-script-js` | `assets/js/script-room.js` | Room configurator |
| `furniture-single-config-script-js` | `assets/js/script-product.js` | Single product |

Each script receives localized data via `wp_localize_script`: `ajaxurl`, `assetsUrl`, `login_nonce`.
Product scripts additionally receive `productId` and `furnitureType`.

---

## WooCommerce Hooks (`wooactions.php`)

| Hook | Purpose |
|---|---|
| `woocommerce_cart_id` (filter) | Unique cart IDs based on configuration settings |
| `woocommerce_get_item_data` (filter) | Display configured furniture data in cart |
| `woocommerce_cart_item_name` (filter) | Show furniture configuration above item name |
| `woocommerce_cart_item_price` (filter) | Custom pricing display |
| `woocommerce_cart_item_subtotal` (filter) | Custom subtotal display |
| `woocommerce_before_calculate_totals` (action) | Apply configuration-based pricing |
| `woocommerce_order_item_get_formatted_meta_data` (filter) | Hide internal meta in orders |
| `woocommerce_checkout_create_order_line_item` (action) | Save config data to order items |
| `woocommerce_before_order_itemmeta` (action, wooadmin.php) | Display configured parts in admin order view |

---

## Custom Post Types & Taxonomies (`customposttypes.php`)

**Post Types:**
- `furniture-texture` — Configurator textures (taxonomies: category, type, brand, thickness)
- `furniture-component` — Add-on components for configurations
- `config-template` — Pre-configured room templates

**Taxonomies:**
- `furniture-texture-category`, `furniture-texture-type`, `furniture-texture-brand`, `furniture-texture-thickness`
- `config-furniture-type`, `config-component-category`, `config-component-type`, `config-material-type`

---

---

## Child Theme — Connected Parts

**Theme path:** `wp-content/themes/Avada-Child-Theme/`

The child theme owns the AI analysis entry flow. The plugin owns everything from the configurator UI onward. The handoff happens at a single point.

---

### `inc/moxai_stand/mox_ai_ajax.php`

The only direct coupling point between the child theme and the plugin.

| Line | AJAX Action | What it does |
|---|---|---|
| 5–6 | `mox_ai_stand_auto_setup_summary` | Renders AI analysis results via `template-parts/mox_ai_stand_summary.php` |
| 8–9 | `mox_ai_stand_upload_image` | Saves base64 image to WP media library |
| 129–130 | `mox_ai_stand_get_configurator` | **Bridge to plugin** — returns configurator HTML |
| **139** | *(inside above)* | `do_shortcode('[mox_furniture_config_general_settings]')` — the direct plugin call |

`mox_ai_stand_get_configurator` is triggered by `moxai_stand.js` after AI analysis completes. It calls the plugin shortcode and returns the full configurator HTML inside the AI stand flow.

---

### `functions.php`

| Lines | What |
|---|---|
| 37–44 | Enqueues `moxai_stand.js` and `moxai_furniture_analyzer.js` on archive pages |
| 47–54 | `wp_localize_script` → `theme_vars`: `ajax_url`, `nonce` (`theme`), `cart_url` — used by theme AJAX and indirectly by plugin JS |
| 59–76 | Injects `window.api_vars` (`api_base_url`, `dev_mode`) into `wp_head` for external API calls |

---

### `assets/js/moxai_stand.js`

Orchestrates the AI stand flow end-to-end:
1. POSTs website URL to external API (`createTask/`), polls `getTask/{taskId}` every 7s
2. On completion calls `mox_ai_stand_auto_setup_summary` → renders summary template
3. User clicks "Begin" → calls external generation API
4. Calls `mox_ai_stand_get_configurator` → loads plugin configurator into the page

---

### `assets/js/moxai_furniture_analyzer.js`

Handles furniture photo upload and AI analysis flow (separate from stand generation).

---

### Template Parts (child theme)

| File | Rendered by |
|---|---|
| `template-parts/mox_ai_stand_summary.php` | `mox_ai_stand_auto_setup_summary` AJAX action |
| `template-parts/furniture_analyze_form.php` | Included inside `mox_ai_stand_summary.php` |

---

## Integration Flow

```
[mox_ai_stand_start] shortcode
  → moxai_stand.js polls external API (createTask / getTask)
  → AJAX: mox_ai_stand_auto_setup_summary
    → template-parts/mox_ai_stand_summary.php
  → User clicks "Begin" → external generation API
  → AJAX: mox_ai_stand_get_configurator          ← child theme
    → do_shortcode('[mox_furniture_config_general_settings]')  ← PLUGIN
      → Plugin JS loads (script-category.js)
      → Plugin AJAX: render_config_furniture_gallery
      → Plugin AJAX: render_config_furniture_products
      → Plugin AJAX: render_config_furniture_product_settings
      → User configures → config_furniture_ajax_add_to_cart
        → WooCommerce (wooactions.php hooks apply)
```
