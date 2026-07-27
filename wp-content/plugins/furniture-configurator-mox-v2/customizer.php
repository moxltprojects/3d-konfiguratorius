<?php 


function furniture_config_customizer_settings($wp_customize) {
    $section_id = 'configurator_furniture_v2_section';
    $setting_1_id = 'heading_section_1';
    $setting_2_id = 'heading_section_2';

    $wp_customize->add_section($section_id, array(
        'title'    => __('Configurator Settings V2', 'furniture-config'),
        'priority' => 30,
    ));

    $wp_customize->add_setting($setting_1_id, array(
        'default'           => '',
        'sanitize_callback' => '', 
    ));

    $wp_customize->add_control('term_section_heading_1_control', array(
        'label'    => __('Heading Section No. 1', 'furniture-config'),
        'section'  => $section_id,
        'settings' => $setting_1_id,
        'type'     => 'text',
    ));


    $wp_customize->add_setting($setting_2_id, array(
        'default'           => '',
        'sanitize_callback' => '', 
    ));

    $wp_customize->add_control('term_section_heading_2_control', array(
        'label'    => __('Heading Section No. 2', 'furniture-config'),
        'section'  => $section_id,
        'settings' => $setting_2_id,
        'type'     => 'text',
    ));

    /*************** Add Wall Height setting   ***********/
    $setting_3_id = 'default_brim_width';
    $wp_customize->add_setting($setting_3_id, array(
        'default'           => '25',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('default_brim_width_control', array(
        'label'    => __('Brim width (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => $setting_3_id,
        'type'     => 'number',
    ));
   
}

add_action('customize_register', 'furniture_config_customizer_settings');

function furniture_config_room_customizer_settings($wp_customize) {
    $section_id = 'furniture_config_room_section';
    $setting_1_id = 'heading_section_1';
    $setting_2_id = 'heading_section_2';

    // Add a new section
    $wp_customize->add_section($section_id , array(
        'title'    => __('Room Configurator Settings', 'furniture-config'),
        'priority' => 30,
    ));

    /*************** Add Wall Height setting   ***********/
    $wp_customize->add_setting('room_wall_height_standard', array(
        'default'           => '250',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('room_wall_height_defaul_control', array(
        'label'    => __('Wall Height DEFAULT (cm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'room_wall_height_standard',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('room_wall_height_min', array(
        'default'           => '200',
        'sanitize_callback' => 'absint', 
    ));
    $wp_customize->add_control('room_wall_height_min_control', array(
        'label'    => __('Wall Height MIN (cm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'room_wall_height_min',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('room_wall_height_max', array(
        'default'           => '300',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('room_wall_height_max_control', array(
        'label'    => __('Wall Height MAX (cm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'room_wall_height_max',
        'type'     => 'number',
    ));

    /*************** Add Wall Width setting   ***********/
    $wp_customize->add_setting('room_wall_width_standard', array(
        'default'           => '250',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('room_wall_width_defaul_control', array(
        'label'    => __('Wall Width DEFAULT (cm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'room_wall_width_standard',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('room_wall_width_min', array(
        'default'           => '100',
        'sanitize_callback' => 'absint', 
    ));
    $wp_customize->add_control('room_wall_width_min_control', array(
        'label'    => __('Wall Width MIN (cm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'room_wall_width_min',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('room_wall_width_max', array(
        'default'           => '550',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('room_wall_width_max_control', array(
        'label'    => __('Wall Width MAX (cm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'room_wall_width_max',
        'type'     => 'number',
    ));

    /*************** Add Wall Depth setting   ***********/
    $wp_customize->add_setting('room_wall_depth_standard', array(
        'default'           => '250',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('room_wall_depth_standard_control', array(
        'label'    => __('Wall Depth DEFAULT (cm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'room_wall_depth_standard',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('wall_depth_min', array(
        'default'           => '100',
        'sanitize_callback' => 'absint', 
    ));
    $wp_customize->add_control('room_wall_depth_min_control', array(
        'label'    => __('Wall Depth MIN (cm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'room_wall_depth_min',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('room_wall_depth_max', array(
        'default'           => '550',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('room_wall_depth_max_control', array(
        'label'    => __('Wall Depth MAX (cm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'room_wall_depth_max',
        'type'     => 'number',
    ));
}

add_action('customize_register', 'furniture_config_room_customizer_settings');

function furniture_config_room_furniture_customizer_settings($wp_customize) {
    $section_id = 'furniture_config_room_furniture_section';

    // Add a new section
    $wp_customize->add_section($section_id , array(
        'title'    => __('Furniture Dimensions Settings', 'furniture-config'),
        'priority' => 30,
    ));

//     /*************** Width full setting   ***********/
//     $wp_customize->add_setting('furniture_width_full_default', array(
//         'default'           => '500',
//         'sanitize_callback' => 'absint', 
//     ));

//     $wp_customize->add_control('furniture_width_full_default_control', array(
//         'label'    => __('FULL width default (mm)', 'furniture-config'),
//         'section'  => $section_id,
//         'settings' => 'furniture_width_full_default',
//         'type'     => 'number',
//     ));

//    $wp_customize->add_setting('furniture_width_full_min', array(
//         'default'           => '400',
//         'sanitize_callback' => 'absint', 
//     ));

//     $wp_customize->add_control('furniture_width_full_min_control', array(
//         'label'    => __('FULL width MIN (mm)', 'furniture-config'),
//         'section'  => $section_id,
//         'settings' => 'furniture_width_full_min',
//         'type'     => 'number',
//     ));

//     $wp_customize->add_setting('furniture_width_full_max', array(
//         'default'           => '900',
//         'sanitize_callback' => 'absint', 
//     ));

//     $wp_customize->add_control('furniture_width_full_max_control', array(
//         'label'    => __('FULL width MAX (mm)', 'furniture-config'),
//         'section'  => $section_id,
//         'settings' => 'furniture_width_full_max',
//         'type'     => 'number',
//     ));

//     /*************** Width bottom setting   ***********/
//     $wp_customize->add_setting('furniture_width_bottom_default', array(
//         'default'           => '500',
//         'sanitize_callback' => 'absint', 
//     ));

//     $wp_customize->add_control('furniture_width_bottom_default_control', array(
//         'label'    => __('BOTTOM width default (mm)', 'furniture-config'),
//         'section'  => $section_id,
//         'settings' => 'furniture_width_default',
//         'type'     => 'number',
//     ));

//    $wp_customize->add_setting('furniture_width_bottom_min', array(
//         'default'           => '400',
//         'sanitize_callback' => 'absint', 
//     ));

//     $wp_customize->add_control('furniture_width_bottom_min_control', array(
//         'label'    => __('BOTTOM width MIN (mm)', 'furniture-config'),
//         'section'  => $section_id,
//         'settings' => 'furniture_width_bottom_min',
//         'type'     => 'number',
//     ));

//     $wp_customize->add_setting('furniture_width_bottom_max', array(
//         'default'           => '900',
//         'sanitize_callback' => 'absint', 
//     ));

//     $wp_customize->add_control('furniture_width_bottom_max_control', array(
//         'label'    => __('BOTTOM width MAX (mm)', 'furniture-config'),
//         'section'  => $section_id,
//         'settings' => 'furniture_width_bottom_max',
//         'type'     => 'number',
//     ));

//     /*************** Width top setting   ***********/
//     $wp_customize->add_setting('furniture_width_top_default', array(
//         'default'           => '500',
//         'sanitize_callback' => 'absint', 
//     ));

//     $wp_customize->add_control('furniture_width_top_default_control', array(
//         'label'    => __('TOP width default (mm)', 'furniture-config'),
//         'section'  => $section_id,
//         'settings' => 'furniture_width_default',
//         'type'     => 'number',
//     ));

//    $wp_customize->add_setting('furniture_width_top_min', array(
//         'default'           => '400',
//         'sanitize_callback' => 'absint', 
//     ));

//     $wp_customize->add_control('furniture_width_top_min_control', array(
//         'label'    => __('TOP width MIN (mm)', 'furniture-config'),
//         'section'  => $section_id,
//         'settings' => 'furniture_width_top_min',
//         'type'     => 'number',
//     ));

//     $wp_customize->add_setting('furniture_width_top_max', array(
//         'default'           => '900',
//         'sanitize_callback' => 'absint', 
//     ));

//     $wp_customize->add_control('furniture_width_top_max_control', array(
//         'label'    => __('TOP width MAX (mm)', 'furniture-config'),
//         'section'  => $section_id,
//         'settings' => 'furniture_width_top_max',
//         'type'     => 'number',
//     ));

    /*************** Height full setting   ***********/
    $wp_customize->add_setting('furniture_height_full_default', array(
        'default'           => '1500',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_height_full_default_control', array(
        'label'    => __('FULL height default (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_height_full_default',
        'type'     => 'number',
    ));

   $wp_customize->add_setting('furniture_height_full_min', array(
        'default'           => '1400',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_height_full_min_control', array(
        'label'    => __('FULL height MIN (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_height_full_min',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('furniture_height_full_max', array(
        'default'           => '2000',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_height_full_max_control', array(
        'label'    => __('FULL height MAX (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_height_full_max',
        'type'     => 'number',
    ));

    /*************** Height bottom setting   ***********/
    $wp_customize->add_setting('furniture_height_bottom_default', array(
        'default'           => '1500',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_height_bottom_default_control', array(
        'label'    => __('BOTTOM height default (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_height_bottom_default',
        'type'     => 'number',
    ));

   $wp_customize->add_setting('furniture_height_bottom_min', array(
        'default'           => '1400',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_height_bottom_min_control', array(
        'label'    => __('BOTTOM height MIN (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_height_bottom_min',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('furniture_height_bottom_max', array(
        'default'           => '2000',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_height_bottom_max_control', array(
        'label'    => __('BOTTOM height MAX (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_height_bottom_max',
        'type'     => 'number',
    ));

    /*************** Height top setting   ***********/
    $wp_customize->add_setting('furniture_height_top_default', array(
        'default'           => '1500',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_height_top_default_control', array(
        'label'    => __('TOP height default (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_height_top_default',
        'type'     => 'number',
    ));

   $wp_customize->add_setting('furniture_height_top_min', array(
        'default'           => '1400',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_height_top_min_control', array(
        'label'    => __('TOP height MIN (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_height_top_min',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('furniture_height_top_max', array(
        'default'           => '2000',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_height_top_max_control', array(
        'label'    => __('TOP height MAX (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_height_top_max',
        'type'     => 'number',
    ));

    /*************** Depth full setting   ***********/
    $wp_customize->add_setting('furniture_depth_full_default', array(
        'default'           => '500',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_depth_full_default_control', array(
        'label'    => __('FULL depth default (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_depth_full_default',
        'type'     => 'number',
    ));

   $wp_customize->add_setting('furniture_depth_full_min', array(
        'default'           => '400',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_depth_full_min_control', array(
        'label'    => __('FULL depth MIN (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_depth_full_min',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('furniture_depth_full_max', array(
        'default'           => '700',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_depth_full_max_control', array(
        'label'    => __('FULL depth MAX (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_depth_full_max',
        'type'     => 'number',
    ));

    /*************** Depth bottom setting   ***********/
    $wp_customize->add_setting('furniture_depth_bottom_default', array(
        'default'           => '500',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_depth_bottom_default_control', array(
        'label'    => __('BOTTOM depth default (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_depth_bottom_default',
        'type'     => 'number',
    ));

   $wp_customize->add_setting('furniture_depth_bottom_min', array(
        'default'           => '400',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_depth_bottom_min_control', array(
        'label'    => __('BOTTOM depth MIN (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_depth_bottom_min',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('furniture_depth_bottom_max', array(
        'default'           => '700',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_depth_bottom_max_control', array(
        'label'    => __('BOTTOM depth MAX (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_depth_bottom_max',
        'type'     => 'number',
    ));

    /*************** Depth top setting   ***********/
    $wp_customize->add_setting('furniture_depth_top_default', array(
        'default'           => '500',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_depth_top_control', array(
        'label'    => __('TOP depth default (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_depth_top_default',
        'type'     => 'number',
    ));

   $wp_customize->add_setting('furniture_depth_top_min', array(
        'default'           => '400',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_depth_top_min_control', array(
        'label'    => __('TOP depth MIN (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_depth_top_min',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('furniture_depth_top_max', array(
        'default'           => '700',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_depth_top_max_control', array(
        'label'    => __('TOP depth MAX (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_depth_top_max',
        'type'     => 'number',
    ));

    /*************** spacing setting   ***********/
    $wp_customize->add_setting('furniture_space_bottom_default', array(
        'default'           => '100',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_space_bottom_default_control', array(
        'label'    => __('Vertical space default (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_space_bottom_default',
        'type'     => 'number',
    ));

   $wp_customize->add_setting('furniture_space_bottom_min', array(
        'default'           => '50',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_space_bottom_min_control', array(
        'label'    => __('Vertical space MIN (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_space_bottom_min',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('furniture_space_bottom_max', array(
        'default'           => '700',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('furniture_space_bottom_max_control', array(
        'label'    => __('Vertical space MAX (mm)', 'furniture-config'),
        'section'  => $section_id,
        'settings' => 'furniture_space_bottom_max',
        'type'     => 'number',
    ));
}

add_action('customize_register', 'furniture_config_room_furniture_customizer_settings');