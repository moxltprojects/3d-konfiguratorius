<?php
global $PARTS_WIDTH_SLUG, $furniture_config_v2_template_parts_url;

$heading = __("Width", 'furniture-config');

$dimension_type = $PARTS_WIDTH_SLUG;

$standard = $width_standard;
$min = $depth_min;
$max = $depth_max;

?>

<?php include $furniture_config_v2_template_parts_url .'/product/settings-sections/dimensions/slider-container.php'; ?>