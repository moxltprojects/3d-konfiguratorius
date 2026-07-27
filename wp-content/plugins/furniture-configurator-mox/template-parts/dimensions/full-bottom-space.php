<?php
global $furniture_type_bottom_name, $furniture_type_full_name, $furniture_type_vertical_space_slug, $HEIGHT_SLUG; 

$heading = __("$furniture_type_full_name and $furniture_type_bottom_name Space", 'furniture-config');

$type = $furniture_type_vertical_space_slug;
$dimension_type = $HEIGHT_SLUG;

$standard = $vertical_space_standard;
$min = $vertical_space_min;
$max = $vertical_space_max;
$constant_name = 'verticalSpace';

?>

<?php include $template_parts_url .'/dimensions/slider-container.php'; ?>
