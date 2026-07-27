<?php



add_action('wp_ajax_mox_ai_stand_auto_setup_summary', 'mox_ai_stand_auto_setup_summary');
add_action('wp_ajax_nopriv_mox_ai_stand_auto_setup_summary', 'mox_ai_stand_auto_setup_summary');

add_action('wp_ajax_mox_ai_stand_upload_image', 'mox_ai_stand_upload_image');
add_action('wp_ajax_nopriv_mox_ai_stand_upload_image', 'mox_ai_stand_upload_image');

function mox_ai_stand_auto_setup_summary() {
    check_ajax_referer('theme', 'nonce');
    $data = isset($_POST['data']) ? json_decode(stripslashes($_POST['data']), true) : false;
    $devMode = isset($_POST['devMode']) ? sanitize_text_field(wp_unslash($_POST['devMode'])) : false;
    if (!$data) {
        wp_send_json_error('Invalid or empty data');
    }
    ob_start();
    ?>
    <div class="mox-results-box">
        <div class="mox-results-box-wrapper">
            <?php get_template_part('template-parts/mox_ai_stand_summary', null, array('data' => $data, 'devMode' => $devMode)); ?>
        </div>
    </div>
    <?php
    $html = ob_get_clean();
    // Grąžinti HTML kaip atsakymą
    wp_send_json_success([
        'html' => $html
    ]);
}

function mox_ai_stand_upload_image() {
    check_ajax_referer('theme', 'nonce');

    $image_base64 = isset($_POST['image_base64']) ? (string) wp_unslash($_POST['image_base64']) : '';
    $task_id = isset($_POST['taskId']) ? sanitize_text_field(wp_unslash($_POST['taskId'])) : '';
    $generation_id = isset($_POST['generationId']) ? sanitize_text_field(wp_unslash($_POST['generationId'])) : '';

    if ($image_base64 === '') {
        wp_send_json_error('Missing image_base64');
    }

    $allowed_mimes = [
        'image/png' => 'png',
        'image/jpeg' => 'jpg',
        'image/webp' => 'webp',
    ];

    $mime = 'image/png';
    $base64_payload = $image_base64;

    if (preg_match('#^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$#s', $image_base64, $matches)) {
        $mime = strtolower($matches[1]);
        $base64_payload = $matches[2];
    }

    if (!isset($allowed_mimes[$mime])) {
        wp_send_json_error('Unsupported image type');
    }

    $binary = base64_decode($base64_payload, true);
    if ($binary === false) {
        wp_send_json_error('Invalid base64');
    }

    $max_bytes = 25 * 1024 * 1024;
    if (strlen($binary) > $max_bytes) {
        wp_send_json_error('Image too large');
    }

    $image_info = @getimagesizefromstring($binary);
    if (!$image_info || empty($image_info['mime'])) {
        wp_send_json_error('Invalid image data');
    }
    $detected_mime = strtolower((string) $image_info['mime']);
    if ($detected_mime !== $mime) {
        wp_send_json_error('MIME mismatch');
    }

    $ext = $allowed_mimes[$mime];
    $safe_task = $task_id !== '' ? preg_replace('/[^a-zA-Z0-9_-]+/', '-', $task_id) : 'task';
    $safe_gen = $generation_id !== '' ? preg_replace('/[^a-zA-Z0-9_-]+/', '-', $generation_id) : 'gen';
    $filename = sanitize_file_name("mox-stand-{$safe_task}-{$safe_gen}." . $ext);

    $upload = wp_upload_bits($filename, null, $binary);
    if (!empty($upload['error'])) {
        wp_send_json_error('Upload failed');
    }

    require_once ABSPATH . 'wp-admin/includes/image.php';

    $attachment = [
        'post_mime_type' => $mime,
        'post_title' => preg_replace('/\.[^.]+$/', '', basename($filename)),
        'post_content' => '',
        'post_status' => 'inherit',
        'guid' => $upload['url'],
    ];

    $attachment_id = wp_insert_attachment($attachment, $upload['file']);
    if (is_wp_error($attachment_id) || !$attachment_id) {
        wp_send_json_error('Attachment create failed');
    }

    $attach_data = wp_generate_attachment_metadata($attachment_id, $upload['file']);
    if (is_array($attach_data)) {
        wp_update_attachment_metadata($attachment_id, $attach_data);
    }

    if ($task_id !== '') {
        update_post_meta($attachment_id, 'mox_task_id', $task_id);
    }
    if ($generation_id !== '') {
        update_post_meta($attachment_id, 'mox_generation_id', $generation_id);
    }

    $url = wp_get_attachment_url($attachment_id);

    wp_send_json_success([
        'attachmentId' => (int) $attachment_id,
        'url' => $url,
        'taskId' => $task_id,
        'generationId' => $generation_id,
    ]);
}


add_action('wp_ajax_mox_ai_stand_get_configurator', 'mox_ai_stand_get_configurator');
add_action('wp_ajax_nopriv_mox_ai_stand_get_configurator', 'mox_ai_stand_get_configurator');

function mox_ai_stand_get_configurator() {
    check_ajax_referer('theme', 'nonce');
    ob_start();
    ?>

    <div class="mox-stand-configurator-element">
        <div class="mox-stand-configurator-element-content">
            <?php echo do_shortcode('[mox_furniture_config_general_settings]'); ?>
        </div>
    </div>
    <?php
    $html = ob_get_clean();
    // Grąžinti HTML kaip atsakymą
    wp_send_json_success([
        'html' => $html
    ]);
}



