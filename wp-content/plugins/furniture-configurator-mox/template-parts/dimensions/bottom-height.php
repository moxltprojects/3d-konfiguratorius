<?php
global $furniture_type_bottom_name, $furniture_type_bottom_slug, $HEIGHT_SLUG; 

$heading = __("$furniture_type_bottom_name Height", 'furniture-config');

$type = $furniture_type_bottom_slug;
$dimension_type = $HEIGHT_SLUG;

$standard = $bottom_height_standard;
$min = $bottom_height_min;
$max = $bottom_height_max;
$constant_name = 'bottomHeight';

?>

<?php include $template_parts_url .'/dimensions/slider-container.php'; ?>
