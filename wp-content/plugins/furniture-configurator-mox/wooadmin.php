<?php

function show_order_product_item_display($item_id, $item, $html_wrap) {
	display_custom_data_for_configurator_order($item_id, $item, $html_wrap);
}

function configurator_woocommerce_before_order_itemmeta($item_id, $item) {
	$html_wrap = 'div';

	display_custom_data_for_configurator_order($item_id, $item, $html_wrap, show_bottom_img: true);
}

add_action('woocommerce_before_order_itemmeta', 'configurator_woocommerce_before_order_itemmeta', 10, 2);

function display_custom_data_for_configurator_order($item_id, $item, $html_wrap, $show_bottom_img = false){
	$product_type = $item->get_meta('_product_type');
	if($product_type !== 'Draggable config') return;
	
	$config_totals = $item->get_meta('_config_totals');
	$config_thumbnail_url = $item->get_meta('_config_thumbnail_url');
	$xml_file_url = $item->get_meta('_xml_file_url');
	$currency_symbol = get_woocommerce_currency_symbol();
	
	$settings = $item->get_meta('_main_settings');
	$base_texture_data = $settings->base_texture_data;
	$frame_texture_data = $settings->frame_texture_data;
	$room_type = $settings->room_type;
	$room_height = $settings->room_height;
	$room_width = $settings->room_width;
	$room_depth = $settings->room_depth;
	$bottom_height = $settings->bottom_height;
	$bottom_depth = $settings->bottom_full_depth;
	$top_height = $settings->top_height;
	$top_depth = $settings->top_depth;
	$full_height = $settings->full_height;
	$full_depth = $settings->bottom_full_depth;
	$vertical_space = $settings->vertical_space;

	$furniture_list = $item->get_meta('_furniture_list');

	?>
	<<?php echo $html_wrap; ?> class="facades-order-data" style="margin: 30px 0px 30px;">
		<table style="width: 100%;">	
			<tr>
				<th>
					<h3>General Settings: </h3>
				</th>
			</tr>
		</table>
		<table style="width: 100%;">	
			<tr>
				<th>
					<strong>Type</strong>
				</th>
				<th>
					<strong>Value</strong>
				</th>
				<th>
					<strong>Regular Price</strong>
				</th>
				<th>
					<strong>Discount Price</strong>
				</th>
				<th>
					<strong>Display Price</strong>
				</th>
			</tr>
			<tr>
				<td>
					<?php echo __('Room dimensions', 'furniture-config'); ?>
				</td>
				<td style="min-width: 100px;">
					<table>
						<tr>
							<td class="dimensions" style="vertical-align: middle; border:none;padding: 0;">
								<?php echo sprintf(__('Height: %s cm', 'config-furniture'), $room_height); ?>
							</td>
						</tr>
						<tr>
							<td class="dimensions" style="vertical-align: middle; border:none;padding: 0;">
								<?php echo sprintf(__('Depth: %s cm', 'config-furniture'), $room_depth); ?>
							</td>
						</tr>
						<tr>
							<td class="dimensions" style="vertical-align: middle; border:none;padding: 0;">
								<?php echo sprintf(__('Width: %s cm', 'config-furniture'), $room_width); ?><br/>
							</td>
						</tr>
					</table>
				</td>
				<td></td>
				<td></td>
				<td></td>
			<tr>
			<tr>
				<?php if($base_texture_data) : ?>
					<td>
						<?php echo __('Base Texture', 'furniture-config'); ?>
					</td>
					<td>
						<?php echo $base_texture_data['name']; ?>
					</td>
					<td>
						<?php echo $base_texture_data['regular_price']; ?><?php echo $currency_symbol; ?>
					</td>
					<td>
						<?php echo $base_texture_data['discount_price']; ?><?php echo $currency_symbol; ?>
					</td>
					<td>
						<?php echo $base_texture_data['display_price']; ?><?php echo $currency_symbol; ?>
					</td>
				<?php endif; ?>
			</tr>
			<tr>
				<?php if($frame_texture_data) : ?>
					<td>
						<?php echo __('Frame Texture', 'furniture-config'); ?>
					</td>
					<td>
						<?php echo $frame_texture_data['name']; ?>
					</td>
					<td>
						<?php echo $frame_texture_data['regular_price']; ?><?php echo $currency_symbol; ?>
					</td>
					<td>
						<?php echo $frame_texture_data['discount_price']; ?><?php echo $currency_symbol; ?>
					</td>
					<td>
						<?php echo $frame_texture_data['display_price']; ?><?php echo $currency_symbol; ?>
					</td>
				<?php endif; ?>
			</tr>
			<tr>
			<?php if($vertical_space) : ?>
					<td>
						<?php echo __('Vertical Space', 'furniture-config'); ?>
					</td>
					<td>
						<?php echo $vertical_space; ?>mm
					</td>
					<td></td>
					<td></td>
					<td></td>
				<?php endif; ?>
			</tr>
		</table>
		
		<table style="width: 100%;">	
			<tr>
				<th>
					<h3>Furniture list: </h3>
				</th>
			</tr>
		</table>
		
		<table style="width: 100%;">
			<thead>
				<tr>
					<th>Name</th>
					<th>Type</th>
					<th>Dimensions (mm)</th>
					<th>Position (mm)</th>
					<th>Price</th>
					<th>Price (m3)</th>
				</tr>
			</thead>
			<?php
			if (count($furniture_list) > 0) : ?>
				<thead>
				<?php foreach($furniture_list as $furniture_item) : ?>
					<?php echo render_furniture_item(
						$furniture_item, 
						$currency_symbol,
						$bottom_height,
						$bottom_depth,
						$top_height,
						$top_depth,
						$full_height,
						$full_depth
				); ?>
				<?php endforeach; ?>
				</thead>
			<?php endif; ?>
		</table>
		<?php if($show_bottom_img): ?>
			<?php 
				$thumbnail_url = $item->get_meta('_config_thumbnail_url'); 
				$xml_file = $item->get_meta('_xml_file_url');
			?>
			<table style="width: 100%; margin: 30px 0 0;">
				<tr>
					<th style="width: 50%; text-align: center;">
						<h3>
							<a href="<?php echo $thumbnail_url; ?>" target="_blank">View 2d Image</a>
						</h3>
					</th>
					<th style="width: 50%; text-align: center;">
						<h3>
							<a href="<?php echo $xml_file; ?>" target="_blank">View XML File</a>
						</h3>
					</th>
				</tr>
			</table>
		<?php endif; ?>
	</<?php echo $html_wrap; ?>>
	<?php
}

function render_furniture_item(
	$item, 
	$currency_symbol,
	$bottom_height,
	$bottom_depth,
	$top_height,
	$top_depth,
	$full_height,
	$full_depth
) {
	global $furniture_type_bottom_slug, $furniture_type_bottom_corner_slug, $furniture_type_top_slug, $furniture_type_bottom_corner_slug, $furniture_type_top_corner_slug, $furniture_type_full_corner_slug;
	
	$item_post = $item->furniture_post;
	$item_db_data = $item->db_data;
	$type = $item->object_type;
	$height = 0;
	$depth = 0;
	$position = json_decode($item_db_data->furniture_position_mm);
	$bottom = $position->bottom;
	$top = $position->top;
	$back = $position->back;
	$front = $position->front;
	$left = $position->left;
	$right = $position->right;
	
	switch($type) {
		case $furniture_type_bottom_slug: {
			$height = $bottom_height;
			$depth = $bottom_depth;
			break;
		}
		case $furniture_type_bottom_corner_slug: {
			$height = $bottom_height;
			$depth = $bottom_depth;
			break;
		}
		case $furniture_type_top_slug: {
			$height = $top_height;
			$depth = $top_depth;
			break;
		}
		case $furniture_type_bottom_top_slug: {
			$height = $top_height;
			$depth = $top_depth;
			break;
		}
		case $furniture_type_full_slug: {
			$height = $full_height;
			$depth = $full_depth;
			break;
		}
		case $furniture_typefull_top_slug: {
			$height = $full_height;
			$depth = $full_depth;
			break;
		}
			
		default: {
			$height = 0;
			$depth = 0;
		}
	}
	?>	
	<tr class="frame-item">
		<td class="title" style="vertical-align: top; border:none;">
			<h2><?php echo $item_post->post_title; ?></h2>
		</td>

		<td class="type" style="vertical-align: top; border:none;">
			<h2><?php echo $type; ?></h2>
		</td>

		<td style="min-width: 100px;">
			<table>
				<tr>
					<td class="dimensions" style="vertical-align: middle; border:none;padding: 0;">
						<?php echo sprintf(__('Height: %s mm', 'config-furniture'), $height); ?>
					</td>
				</tr>
				<tr>
					<td class="dimensions" style="vertical-align: middle; border:none;padding: 0;">
						<?php echo sprintf(__('Depth: %s mm', 'config-furniture'), $depth); ?>
					</td>
				</tr>
				<tr>
					<td class="dimensions" style="vertical-align: middle; border:none;padding: 0;">
						<?php echo sprintf(__('Width: %s mm', 'config-furniture'), $item_db_data->width); ?><br/>
					</td>
				</tr>
			</table>
		</td>
		<td style="min-width: 100px;">
			<table>
				<tr>
					<th class="dimensions" style="vertical-align: middle; border:none;padding: 0 5px 0 0;">
						<?php echo __('Y Position', 'config-furniture'); ?><br/>
					</th>
					<td class="dimensions" style="vertical-align: middle; border:none;padding: 0 5px 0 0;">
						<?php echo sprintf(__('Bottom: %s mm', 'config-furniture'), $bottom); ?><br/>
					</td>
					<td class="dimensions" style="vertical-align: middle; border:none;padding: 0;">
						<?php echo sprintf(__('Top: %s mm', 'config-furniture'), $top); ?>
					</td>
				</tr>
				<tr>
					<th class="dimensions" style="vertical-align: middle; border:none;padding: 0 5px 0 0;">
						<?php echo __('Z Position', 'config-furniture'); ?><br/>
					</th>
					<td class="dimensions" style="vertical-align: middle; border:none;padding: 0 5px 0 0;">
						<?php echo sprintf(__('Back: %s mm', 'config-furniture'), $back); ?><br/>
					</td>
					<td class="dimensions" style="vertical-align: middle; border:none;padding: 0;">
						<?php echo sprintf(__('Front: %s mm', 'config-furniture'), $front); ?>
					</td>
				</tr>
				<tr>
					<th class="dimensions" style="vertical-align: middle; border:none;padding: 0 5px 0 0;">
						<?php echo __('X Position', 'config-furniture'); ?><br/>
					</th>
					<td class="dimensions" style="vertical-align: middle; border:none;padding: 0 5px 0 0;">
						<?php echo sprintf(__('Left: %s mm', 'config-furniture'), $left); ?><br/>
					</td>
					<td class="dimensions" style="vertical-align: middle; border:none;padding: 0;">
						<?php echo sprintf(__('Right: %s mm', 'config-furniture'), $right); ?>
					</td>
				</tr>
			</table>
		</td>
		<td style="min-width: 100px;">
			<table>
				<tr>
					<td style="vertical-align: middle; border:none;padding: 0;">
						<?php echo sprintf(__('Regular: %s %s', 'config-furniture'), $item->regular_price, $currency_symbol); ?>
					</td>
				</tr>
				<tr>
					<td style="vertical-align: middle; border:none;padding: 0;">
						<?php echo sprintf(__('Discount: %s %s', 'config-furniture'), $item->discount_price, $currency_symbol); ?>
					</td>
				</tr> 
				<tr>
					<td style="vertical-align: middle; border:none;padding: 0;">
						<?php echo sprintf(__('Display: %s %s', 'config-furniture'), $item->display_price, $currency_symbol); ?>
					</td>
				</tr>
			</table>
		</td>
		<td style="min-width: 100px;">
			<table>
				<tr>
					<td style="vertical-align: middle; border:none;padding: 0;">
						<?php echo sprintf(__('Regular: %s %s', 'config-furniture'), $item->regular_price_cm3, $currency_symbol); ?>
					</td>
				</tr>
				<tr>
					<td style="vertical-align: middle; border:none;padding: 0;">
						<?php echo sprintf(__('Discount: %s %s', 'config-furniture'), $item->discount_price_cm3, $currency_symbol); ?>
					</td>
				</tr> 
				<tr>
					<td style="vertical-align: middle; border:none;padding: 0;">
						<?php echo sprintf(__('Display: %s %s', 'config-furniture'), $item->display_price_cm3, $currency_symbol); ?>
					</td>
				</tr>
			</table>
		</td>
	</tr>
	<?php
}

add_filter('woocommerce_admin_order_item_thumbnail', 'override_admin_order_item_thumbnail', 10, 2);

function override_admin_order_item_thumbnail($thumbnail, $orderItemId) {
	global $theorder;

    if (!$theorder) {
        $order = wc_get_order($orderItemId);
    } else {
        $order = $theorder;
    }

	$order_item = $order->get_item($orderItemId);
	
	if($order_item) {
		$custom_thumbnail = $order_item->get_meta('_config_thumbnail_url');

		if (!empty($custom_thumbnail)) {
			return '<img src="' . esc_url($custom_thumbnail) . '" style="width: 40px; height: auto;" />';
		}
	}



    return $thumbnail;
}


add_filter('woocommerce_email_attachments', 'attach_image_to_order_emails', 10, 3);

function attach_image_to_order_emails($attachments, $email_id, $order) {
    if ( ! in_array($email_id, array(
		'new_order', 
		'customer_processing_order', 
		'customer_completed_order',
		'customer_on_hold_order',
	)) ) {
        return $attachments;
    }

    if ( is_a($order, 'WC_Order') ) {
        foreach ($order->get_items() as $item_id => $item) {
			$product_name = strtolower(sanitize_file_name($item->get_name()));

            $image_url = $item->get_meta('_config_thumbnail_url');
            if (!empty($image_url)) {
				$filename = "configurator-{$product_name}-order-{$order->id}.jpg";
				
                // Download image to temp dir
                $upload_dir = wp_upload_dir();
                $tmp_path = $upload_dir['basedir'] . '/' . $filename;

                // Only download if not already cached (optional)
                if (!file_exists($tmp_path)) {
                    $image_data = wp_remote_get($image_url);
                    if (!is_wp_error($image_data)) {
                        file_put_contents($tmp_path, wp_remote_retrieve_body($image_data));
                    }
                }

                if (file_exists($tmp_path)) {
                    $attachments[] = $tmp_path;
                }
            }

			$xml_url = $item->get_meta('_xml_file_url');

			if (!empty($xml_url)) {
				$xml_filename = "configurator-xml-{$product_name}-order-{$order->get_id()}.xml";
            	$xml_path = $upload_dir['basedir'] . '/' . $xml_filename;

                if (!file_exists($xml_path)) {
                    $xml_data = wp_remote_get($xml_url);
                    if (!is_wp_error($xml_data)) {
                        file_put_contents($xml_path, wp_remote_retrieve_body($xml_data));
                    }
                }

                if (file_exists($xml_path)) {
                    $attachments[] = $xml_path;
                }
            }
        }
    }

    return $attachments;
}


