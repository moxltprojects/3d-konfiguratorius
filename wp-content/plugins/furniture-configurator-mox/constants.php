<?php 
$plugin_url = plugins_url('/furniture-configurator-mox');
$template_parts_url = plugin_dir_path(__FILE__) .'/template-parts';

$config_cookie_name = 'config_cookie';

$furniture_type_bottom_name = 'Bottom';
$furniture_type_bottom_slug = 'bottom';
$furniture_type_bottom_corner_name = 'Bottom corner';
$furniture_type_bottom_corner_slug = 'bottom-corner';
$furniture_type_top_name = 'Top';
$furniture_type_top_slug = 'top';
$furniture_type_top_corner_name = 'Top corner';
$furniture_type_top_corner_slug = 'top-corner';
$furniture_type_full_name = 'Full';
$furniture_type_full_slug = 'full';
$furniture_type_full_corner_name = 'Full corner';
$furniture_type_full_corner_slug = 'full-corner';
$furniture_type_full_bottom_name = 'Full Bottom';
$furniture_type_full_bottom_slug = 'full-bottom';
$furniture_type_vertical_space_slug = 'vertical-space';

$texture_base_slug = 'base';
$texture_base_slug = 'frame-brim';
$texture_frame_slug = 'frame';
$texture_frame_brim_slug = 'front-brim';

$current_step_type = 'basic-settings';

$steps_header_data = [
    [
        'step' => '1',
        'title' => 'Basic Settings',
    ],
    [
        'step' => '2',
        'title' => 'Room Layout',
    ],
    [
        'step' => '3',
        'title' => 'Play & Edit',
    ],
    [
        'step' => '4',
        'title' => 'Summary',
    ],
];

$steps_content_data = [
    [
        'type' => 'basic-settings',
        'title' => 'Basic Settings',
    ],
    [
        'type' => 'room-layout',
        'title' => 'Room Layout',
    ],
    [
        'type' => 'playedit-summary',
        'title' => 'Play & Edit',
    ],
];


$wall_single = "single-wall";
$walls_two = "with-corner";

// $wall_length_slug = 'width';
// $wall_depth_slug = 'depth';
// $wall_height_slug = 'height';

$HEIGHT_SLUG = 'height';
$DEPTH_SLUG = 'depth';
$WIDTH_SLUG = 'width';
$SPACE_SLUG = 'space';

$MY_CABINETS_TYPE = 'my-cabinets';
$ADD_CABINETS_TYPE = 'edit-cabinets';

$PRICE_CM_CHUNK = 10;


/****** dynamic components ******/
$DYNAMIC_COMPONENT_NAME = 'Dynamic Components';
$DYNAMIC_COMPONENT_SLUG = 'Dynamic-components';

$CAT_EXTERIOR_NAME = 'Exterior';
$CAT_EXTERIOR_SLUG = 'exterior';
$CAT_MATERIAL_NAME = 'Material';
$CAT_MATERIAL_SLUG = 'material';
$CAT_STRETCH_NAME = 'Stretch';
$CAT_STRETCH_SLUG = 'stretch';

$TYPE_BOTTOM_NAME = 'Bottom';
$TYPE_BOTTOM_SLUG = 'bottom';
$TYPE_HEIGTH_NAME = 'Height';
$TYPE_HEIGTH_SLUG = 'height';
$TYPE_DOOR_NAME = 'Door';
$TYPE_DOOR_SLUG = 'door';
$TYPE_FRONT_NAME = 'Front';
$TYPE_FRONT_SLUG = 'front';
$TYPE_SIDE_NAME = 'Side';
$TYPE_SIDE_SLUG = 'side';
$TYPE_DRAWER_NAME = 'Drawer';
$TYPE_DRAWER_SLUG = 'drawer';
$TYPE_TABLETOP_NAME = 'Tabletop';
$TYPE_TABLETOP_SLUG = 'tabletop';

