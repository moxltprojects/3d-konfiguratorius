
<?php 

if(!$loop->have_posts()) return;

$current_texture_id = $current_texture ? $current_texture->ID : null;
$current_texture_name = $current_texture ? $current_texture->post_title : null;

// $texture_woocommerce = get_field('woocommerce', $current_texture_id);
// $texture_price = $texture_woocommerce['discount_price'] && floatval($texture_woocommerce['discount_price']) > 0 ? 
//     $texture_woocommerce['discount_price'] * 100 : 
//     $texture_woocommerce['regular_price'] * 100;
?>

<div class="list-container texture-list-container" data-type="<?php echo $texture_type; ?>">
    <div class="heading-block">
        <?php echo sprintf("<h3 class='heading'>%s:</h3> <span class='value'>%s</span>", $heading, $current_texture_name); ?>
    </div>
    <div class="list texture-list">
        <?php while($loop->have_posts()): $loop->the_post(); ?>
            <?php 
                $texture_id = get_the_ID();
                $thumbnail_url = get_the_post_thumbnail_url($texture_id, 'thumbnail');
                $thumbnail_full = get_the_post_thumbnail_url($texture_id, 'full');
                $name = get_the_title();
                $current_class = $current_texture_id === $texture_id ? ' current' : '';

                $texture_woocommerce = get_field('woocommerce', $texture_id);
                $texture_price = $texture_woocommerce['discount_price'] && floatval($texture_woocommerce['discount_price']) > 0 ? 
                    $texture_woocommerce['discount_price'] : 
                    $texture_woocommerce['regular_price'];
            ?>
            <div 
                class="texture-list-item<?php echo $current_class; ?>"
                data-id="<?php echo $texture_id; ?>"
                data-name="<?php echo $name; ?>"
                data-src="<?php echo $thumbnail_full; ?>"
                data-price="<?php echo $texture_price; ?>"
            >
                <button 
                    type="button"
                >
                    <img src="<?php echo $thumbnail_url; ?>" name="<?php echo $name; ?>"/>
                </button>
            </div>
        <?php endwhile; ?>
    </div>
</div>