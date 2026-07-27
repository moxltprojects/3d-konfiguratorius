<?php
global $texture_base_slug;

$loop = fetch_texture_list($texture_base_slug);

$heading = __('Base', 'furniture-config');

$current_texture = $default_base_texture;

$texture_type = $texture_base_slug;

?>

<?php include $template_parts_url .'/textures/section.php'; ?>
