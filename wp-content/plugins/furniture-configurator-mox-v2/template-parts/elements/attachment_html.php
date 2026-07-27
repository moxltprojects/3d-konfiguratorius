<?php if (!empty($attachmentId)): ?>
    <?php echo wp_get_attachment_image($attachmentId, 'custom-thumb'); ?>

<?php elseif (!empty($thumbnailBase64)): ?>

    <img 
        src="<?php echo esc_attr(
            str_starts_with($thumbnailBase64, 'data:image')
                ? $thumbnailBase64
                : 'data:image/jpeg;base64,' . $thumbnailBase64
        ); ?>" 
        alt=""
    >

<?php endif; ?>