<?php 

function configurator_furniture_customizer_settings($wp_customize) {
    // Add a new section
    $wp_customize->add_section('configurator_furniture_section', array(
        'title'    => __('Configurator Settings', 'furniture-config'),
        'priority' => 30,
    ));

    /*************** Add Wall Height setting   ***********/
    $wp_customize->add_setting('wall_height_standard', array(
        'default'           => '250',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('wall_height_defaul_control', array(
        'label'    => __('Wall Height DEFAULT (cm)', 'furniture-config'),
        'section'  => 'configurator_furniture_section',
        'settings' => 'wall_height_standard',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('wall_height_min', array(
        'default'           => '250',
        'sanitize_callback' => 'absint', 
    ));
    $wp_customize->add_control('wall_height_min_control', array(
        'label'    => __('Wall Height MIN (cm)', 'furniture-config'),
        'section'  => 'configurator_furniture_section',
        'settings' => 'wall_height_min',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('wall_height_max', array(
        'default'           => '250',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('wall_height_max_control', array(
        'label'    => __('Wall Height MAX (cm)', 'furniture-config'),
        'section'  => 'configurator_furniture_section',
        'settings' => 'wall_height_max',
        'type'     => 'number',
    ));

    /*************** Add Wall Width setting   ***********/
    $wp_customize->add_setting('wall_width_standard', array(
        'default'           => '250',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('wall_width_defaul_control', array(
        'label'    => __('Wall Width DEFAULT (cm)', 'furniture-config'),
        'section'  => 'configurator_furniture_section',
        'settings' => 'wall_width_standard',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('wall_width_min', array(
        'default'           => '250',
        'sanitize_callback' => 'absint', 
    ));
    $wp_customize->add_control('wall_width_min_control', array(
        'label'    => __('Wall Width MIN (cm)', 'furniture-config'),
        'section'  => 'configurator_furniture_section',
        'settings' => 'wall_width_min',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('wall_width_max', array(
        'default'           => '250',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('wall_width_max_control', array(
        'label'    => __('Wall Width MAX (cm)', 'furniture-config'),
        'section'  => 'configurator_furniture_section',
        'settings' => 'wall_width_max',
        'type'     => 'number',
    ));

    /*************** Add Wall Depth setting   ***********/
    $wp_customize->add_setting('wall_depth_standard', array(
        'default'           => '250',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('wall_depth_standard_control', array(
        'label'    => __('Wall Depth DEFAULT (cm)', 'furniture-config'),
        'section'  => 'configurator_furniture_section',
        'settings' => 'wall_depth_standard',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('wall_depth_min', array(
        'default'           => '250',
        'sanitize_callback' => 'absint', 
    ));
    $wp_customize->add_control('wall_depth_min_control', array(
        'label'    => __('Wall Depth MIN (cm)', 'furniture-config'),
        'section'  => 'configurator_furniture_section',
        'settings' => 'wall_depth_min',
        'type'     => 'number',
    ));

    $wp_customize->add_setting('wall_depth_max', array(
        'default'           => '250',
        'sanitize_callback' => 'absint', 
    ));

    $wp_customize->add_control('wall_depth_max_control', array(
        'label'    => __('Wall Depth MAX (cm)', 'furniture-config'),
        'section'  => 'configurator_furniture_section',
        'settings' => 'wall_depth_max',
        'type'     => 'number',
    ));
}

add_action('customize_register', 'configurator_furniture_customizer_settings');
