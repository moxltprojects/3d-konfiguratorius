<?php
global $PARTS_DEPTH_SLUG, $furniture_config_v2_template_parts_url;

$heading = __("Depth", 'furniture-config');

$dimension_type = $PARTS_DEPTH_SLUG;

$standard = $depth_standard;
$min = $depth_min;
$max = $depth_max;

?>

<?php include $furniture_config_v2_template_parts_url .'/elements/settings/slider-container.php'; ?>
