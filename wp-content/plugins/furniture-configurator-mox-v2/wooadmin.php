<?php

function furniture_part_show_order_product_item_display($item_id, $item, $html_wrap) {
	display_custom_funrniture_part_data_for_configurator_order($item_id, $item, $html_wrap);
}

function configurator_parts_woocommerce_before_order_itemmeta($item_id, $item) {
	$html_wrap = 'div';

	display_custom_funrniture_part_data_for_configurator_order($item_id, $item, $html_wrap, show_bottom_img: true);
}

add_action('woocommerce_before_order_itemmeta', 'configurator_parts_woocommerce_before_order_itemmeta', 10, 2);

function display_custom_funrniture_part_data_for_configurator_order($item_id, $item, $html_wrap, $show_bottom_img = false){
	$config_settings = $item->get_meta('_config_settings');

	if (empty($config_settings)) return;

	$config_settings = json_decode(json_encode($config_settings), true);

	$general_settings = $config_settings['general_settings'] ?? [];
	$dimensions = $general_settings['dimensions'] ?? [];
	$components = $general_settings['components'] ?? null;
	$product_components = $general_settings['product_components'] ?? null;
    $textures = $general_settings['textures'];
    $ai_textures = $general_settings['ai_textures'];

	$db_data = $config_settings['db_data'] ?? [];
	$config_totals = $db_data['prices'] ?? [];
	?>

	<style>
    .facades-order-data {
        margin: 30px 0;
        font-family: Arial, sans-serif;
        color: #222;
    }

    .facades-order-data table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 18px;
        font-size: 14px;
    }

    .facades-order-data th {
        background: #f5f5f5;
        padding: 10px 12px;
        border: 1px solid #ddd;
        text-align: left;
        font-weight: 600;
    }

    .facades-order-data td {
        padding: 10px 12px;
        border: 1px solid #e5e5e5;
        vertical-align: top;
    }

    .facades-order-data tbody tr:nth-child(even) {
        background: #fafafa;
    }

    .facades-order-data h3 {
        margin: 0;
        font-size: 18px;
    }

    .facades-order-data .section-table th {
        background: #eeeeee;
        font-size: 16px;
    }

    .facades-order-data .nested-table {
        margin: 8px 0 0;
        border: 1px solid #ddd;
        background: #fff;
    }

    .facades-order-data .nested-table th,
    .facades-order-data .nested-table td {
        font-size: 13px;
        padding: 8px 10px;
    }

    .facades-order-data .nested-table th {
        background: #f9f9f9;
    }

    .facades-order-data .subitem-title {
        margin-bottom: 8px;
        font-weight: 600;
    }

    .facades-order-data .price-cell {
        white-space: nowrap;
        font-weight: 600;
        text-align: right;
    }

    .facades-order-data .muted {
        color: #777;
    }
</style>

<<?php echo esc_html($html_wrap); ?> class="facades-order-data">

    <table class="section-table">
        <tr>
            <th>
                <h3><?php echo esc_html__('General Settings:', 'furniture-config'); ?></h3>
            </th>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th colspan="3" style="text-align: center;">
                    <?php echo esc_html__('Dimensions', 'furniture-config'); ?>
                </th>
            </tr>
            <tr>
                <th><?php echo esc_html__('Width (mm)', 'furniture-config'); ?></th>
                <th><?php echo esc_html__('Height (mm)', 'furniture-config'); ?></th>
                <th><?php echo esc_html__('Depth (mm)', 'furniture-config'); ?></th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><?php echo esc_html($db_data['width'] ?? ''); ?></td>
                <td><?php echo esc_html($db_data['height'] ?? ''); ?></td>
                <td><?php echo esc_html($db_data['depth'] ?? ''); ?></td>
            </tr>
        </tbody>
    </table>

    <?php if($product_components) : ?>
        <table style="width: 100%;">	
            <tr>
                <th>
                    <h3>Product Specific Components Settings: </h3>
                </th>
            </tr>
        </table>
        <table style="width: 100%;">	
            <thead>
                <tr>
                    <th style="width: 33%;text-align: center;vertical-align: middle;"><?php echo __('Selected Components', 'furniture-config'); ?></th>
                    <th style="width: 33%;text-align: center;vertical-align: middle;"><?php echo __('Selected Components Subitems', 'furniture-config'); ?></th>
                    <th style="width: 33%;text-align: center;vertical-align: middle;"><?php echo __('Subtotal', 'furniture-config'); ?></th>
                </tr>
            </thead>
            <tbody>
                <?php 
                    $product_components_children = $product_components['children']; 
                    $product_component_total = $product_components['total']; 
                    $product_component_currency = $product_components['currency']; 
                ?>
                <?php foreach($product_components_children as $component): ?>
                    <?php 
                        $component = (object) $component;
                    ?>
                    <tr>
                        <?php if(isset($component->item)) : ?>
                            <?php 
                                $item = $component->item;
                            ?>

                            <td style="vertical-align: middle;"><?php echo $item['name']; ?></td>
                            <td>
                                <table style="width: 100%;">
                                    <tbody>
                                        <?php 
                                            $woocommerce = $item['woocommerce'];
                                        ?>
                                        <tr>
                                            <td style="border: none;width: 70%;"></td>
                                            <td style="border: none;width: 15%;"><?php echo $woocommerce['regular_price']; ?><?php echo $product_component_currency; ?></td>
                                            <td style="border: none;width: 15%;"><?php echo $woocommerce['discount_price']; ?> <?php echo $woocommerce['discount_price'] ? $product_component_currency : '-'; ?></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                            <td style="vertical-align: middle; text-align:center;"><?php echo $woocommerce['discount_price'] > 0 ? $woocommerce['discount_price'] : $woocommerce['regular_price']; ?> <?php echo $product_component_currency; ?></td>
                            <?php else : ?>
                                <?php 
                                    $parent = $component->parent;
                                ?>
                                <td style="vertical-align: middle;"><?php echo $parent['name']; ?></td>
                                <td>
                                    <table style="width: 100%;">
                                        <tbody>
                                            <?php foreach($component->children as $component_child): ?>
                                                <?php 
                                                    $component_child = (object) $component_child;
                                                    $woocommerce = $component_child->woocommerce;
                                                ?>
                                                <tr>
                                                    <td style="border: none;width: 70%;"><?php echo $component_child->name; ?></td>
                                                    <td style="border: none;width: 15%;"><?php echo $woocommerce['regular_price']; ?><?php echo $product_component_currency; ?></td>
                                                    <td style="border: none;width: 15%;"><?php echo $woocommerce['discount_price']; ?> <?php echo $woocommerce['discount_price'] ? $product_component_currency : '-'; ?></td>
                                                </tr>
                                            <?php endforeach; ?>
                                        </tbody>
                                    </table>
                                </td>
                                <td style="vertical-align: middle; text-align:center;"><?php echo $parent['subtotal']; ?> <?php echo $product_component_currency; ?></td>
                        <?php endif; ?>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <table style="width: 100%;"> 
            <tr>
                <td style="border: none;width: 70%;"><?php echo __('Total', 'furniture-config'); ?></td>
                <td style="border: none;text-align: center;width: 30%"><?php echo $product_component_total; ?> <?php echo $product_component_currency; ?></td>		
            </tr>
        </table>
    <?php endif; ?>							


    <table style="width: 100%;">	
        <tr>
            <th>
                <h3>Texture Settings: </h3>
            </th>
        </tr>
    </table>
    
    <?php foreach($textures as $texture): ?>
        <?php 
            $texture_id = $texture['id'];
            $texturePrices = $texture['prices'];
            $texture_regular_price = $texturePrices['regular'];
            $texture_sale_price = $texturePrices['discount'];
            $texture_name = $texture['name'];
            $texture_image = $texture['thumbnail'];
            $texture_type = $texture['type'];     
        ?>
        <table style="width: 100%;">	
            <thead>
                <tr>
                    <th style="text-align: center;vertical-align: middle;">Type</th>
                    <th style="text-align: center;vertical-align: middle;">Color</th>
                    <th style="text-align: center;vertical-align: middle;">Regular Price</th>
                    <th style="text-align: center;vertical-align: middle;">Discount Price</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="width: 200px;text-align: center;"><?php echo $texture_type; ?></td>
                    <td style="text-align: center;">
                        <p style="text-align: center;margin-top:0;"><?php echo $texture_name; ?></p>
                        <img src="<?php echo $texture_image; ?>" />
                    </td>
                    <td style="width: 200px;text-align: center;"><?php echo $texture_regular_price; ?></td>
                    <td style="width: 200px;text-align: center;"><?php echo $texture_sale_price; ?></td>
                </tr>
            </tbody>
        </table>

    <?php endforeach; ?>

    <?php if($db_data['has_brand_texture'] && !empty($ai_textures)): ?>

        <table style="width: 100%;">	
            <tr>
                <th>
                    <h3>AI Texture Settings: </h3>
                </th>
            </tr>
        </table>

        <?php foreach($ai_textures as $key => $texture): ?>
            <?php 
                $attachment_id = isset($texture['attachment']['attachment_id']) ? $texture['attachment']['attachment_id'] : null;
                $textureColor = isset($texture['color']) ? $texture['color'] : null;
            ?>
            <table style="width: 100%;">	
                <thead>
                    <tr>
                        <th style="text-align: center;vertical-align: middle;">Type</th>
                        <th style="text-align: center;vertical-align: middle;">Color</th>
                        <th style="text-align: center;vertical-align: middle;">Texture</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="width: 200px;text-align: center;"><?php echo $key; ?></td>
                        <td style="text-align: center;">
                            <?php if(!empty($textureColor)): ?>
                                <div style="width: 30px; height: 30px; background-color: <?php echo $textureColor; ?>"></div>

                                <?php else: ?>
                                    -
                            <?php endif; ?>
                        </td>
                        <td style="width: 200px;text-align: center;">
                            <?php if(!empty($attachment_id)): ?>
                            <?php
                                    echo wp_get_attachment_image(
                                        $attachment_id,
                                        'full',
                                        false,
                                        [
                                            'alt' => '',
                                            'style' => 'width:150px;height:auto;',
                                        ]
                                    );
                                ?>
                                
                                <?php else: ?>
                                    -
                            <?php endif; ?>
                        </td>
                    </tr>
                </tbody>
            </table>

        <?php endforeach; ?>
    <?php endif; ?>
		
</<?php echo esc_html($html_wrap); ?>>

<?php
}