<?php
global $PARTS_HEIGHT_SLUG, $furniture_config_v2_template_parts_url;

$heading = __("Height", 'furniture-config');

$dimension_type = $PARTS_HEIGHT_SLUG;

$standard = $height_standard;
$min = $depth_min;
$max = $depth_max;

?>

<?php include $furniture_config_v2_template_parts_url .'/product/settings-sections/dimensions/slider-container.php'; ?>