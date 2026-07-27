<?php 
$furniture_config_v2_plugin_url = plugins_url('/furniture-configurator-mox-v2');
$furniture_config_v2_template_parts_url = plugin_dir_path(__FILE__) .'template-parts';

$config_cookie_name = 'config_cookie';
$config_cookie_name_furniture_types = 'config_cookie_furniture_types';
$config_textures_cookie = 'config_textures_data';
$config_components_cookie = 'config_components_data';

$texture_front_slug = 'front';

$TEXTURE_ALL_SLUG = 'all';
$FURNITURE_TYPE_ALL_SLUG = 'all';
$FURNITURE_TYPE_FULL = 'full';
$FURNITURE_TYPE_TOP = 'top';
$FURNITURE_TYPE_BASE = 'bottom';
$FURNITURE_TYPE_WALL = 'wall';
$FURNITURE_TYPE_WALL_TOP = 'wall-top';

$THUMB_TYPE_HORIZONTAL_WALL_TOP = 'horizontal-wall-top';

$BOTTOM_CORNER_SLUG = 'bottom-corner';
$TOP_CORNER_SLUG = 'top-corner';
$FULL_CORNER_SLUG = 'full-corner';

$MY_CABINETS_TYPE = 'my-cabinets';
$ADD_CABINETS_TYPE = 'edit-cabinets';

$FURNITURE_TEXTURE_SLUG__COUNTERTOP = 'countertop';
$FURNITURE_TEXTURE_SLUG__FRONT = 'front';
$FURNITURE_TEXTURE_SLUG__BASE = 'base';

$HEIGHT_SLUG = 'height';
$DEPTH_SLUG = 'depth';
$WIDTH_SLUG = 'width';
$SPACE_SLUG = 'space_bottom';

$VERTICAL_SPACE_SLUG = 'space_bottom';

$WALL_SINGLE = 'single-wall'; 
$WALL_SINGLE_TITLE = 'Single Wall';
$WALL_DOUBLE = 'with-corner';
$WALL_DOUBLE_TITLE = 'Two Walls';

$BRAND_TEXTURE = '#5B94F4';

$stepsListHeading = [
    [
        'step' => '1',
        'slug' => 'templates',
        'title' => 'Templates',
    ],
    [
        'step' => '2',
        'slug' => 'general-settings',
        'title' => 'General Settings',
    ],
    [
        'step' => '3',
        'slug' => 'room-layout',
        'title' => 'Layout',
    ],
    [
        'step' => '4',
        'slug' => 'play-edit',
        'title' => 'Play & Edit',
    ],
    [
        'step' => '5',
        'slug' => 'summary',
        'title' => 'Summary',
    ],
];

$stepsList = [
    [
        'step' => '1',
        'slug' => 'templates',
        'title' => 'Templates',
    ],
    [
        'step' => '2',
        'slug' => 'general-settings',
        'title' => 'General Settings',
    ],
    [
        'step' => '3',
        'slug' => 'room-layout',
        'title' => 'Layout',
    ],
    [
        'step' => '4',
        'slug' => 'play-edit',
        'title' => 'Play & Edit',
    ],
];

$CONFIG_USER_TABLE_NAME = 'config_user_settings';
$CONFIG_USER_PRODUCTS_TABLE_NAME = 'config_user_setting_products';