<?php
$devMode = $args['devMode'];
?>
<div id="furnitureAnalyzeFormWrapper" class="furniture-analyze">
    <form id="furnitureAnalyzeForm" class="furniture-analyze__form">
        <div class="furniture-analyze__fields">
            <div class="dragDrop-container">
                <p class="furniture-analyze__label picker-label">Photo</p>

                <div class="picker-desktop furniture-analyze__upload" id="furnitureDesktopPicker">
                    <label class="furniture-analyze__upload-zone" for="fileInputDesktop">
                        <span class="furniture-analyze__upload-icon" aria-hidden="true">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                        <span class="furniture-analyze__upload-title">Choose a photo</span>
                        <span class="furniture-analyze__upload-hint">JPEG or PNG</span>
                        <input type="file" id="fileInputDesktop" class="furniture-analyze__file-input" accept="image/png,image/jpeg,image/*">
                    </label>
                </div>
                <div id="furniturePreviewWrap" class="preview-wrap furniture-analyze__preview" hidden>
                    <div class="preview-box furniture-analyze__preview-box">
                        <img id="furniturePreviewImage" alt="Selected photo">
                        <button type="button" id="furnitureBtnClearPreview" class="preview-clear furniture-analyze__preview-remove" aria-label="Remove photo" title="Remove">×</button>
                    </div>
                </div>

                <div class="picker-mobile furniture-analyze__mobile" id="furnitureMobilePicker" hidden>
                    <div class="mobile-actions furniture-analyze__mobile-actions">
                        <button type="button" id="furnitureBtnGallery" class="furniture-analyze__action-btn">Gallery</button>
                        <button type="button" id="furnitureBtnCamera" class="furniture-analyze__action-btn furniture-analyze__action-btn--primary">Take a photo</button>
                    </div>
                    <input type="file" id="fileInputGallery" class="furniture-analyze__file-input" accept="image/png,image/jpeg,image/*" hidden>
                    <input type="file" id="fileInputCamera" class="furniture-analyze__file-input" accept="image/png,image/jpeg,image/*" capture="environment" hidden>
                </div>
            </div>

            <div class="dragDrop-container">
                <p class="furniture-analyze__label picker-label">Wall Photo</p>

                <div class="picker-desktop furniture-analyze__upload" id="wallDesktopPicker">
                    <label class="furniture-analyze__upload-zone" for="wallFileInputDesktop">
                        <span class="furniture-analyze__upload-icon" aria-hidden="true">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                        <span class="furniture-analyze__upload-title">Choose a photo</span>
                        <span class="furniture-analyze__upload-hint">JPEG or PNG</span>
                        <input type="file" id="wallFileInputDesktop" class="furniture-analyze__wallFile-input" accept="image/png,image/jpeg,image/*">
                    </label>
                </div>
                <div id="wallPreviewWrap" class="preview-wrap furniture-analyze__preview" hidden>
                    <div class="preview-box furniture-analyze__preview-box">
                        <img id="wallPreviewImage" alt="Selected wall photo">
                        <button type="button" id="wallBtnClearPreview" class="preview-clear furniture-analyze__preview-remove" aria-label="Remove photo" title="Remove">×</button>
                    </div>
                </div>

                <div class="picker-mobile furniture-analyze__mobile" id="wallMobilePicker" hidden>
                    <div class="mobile-actions furniture-analyze__mobile-actions">
                        <button type="button" id="wallBtnGallery" class="furniture-analyze__action-btn">Gallery</button>
                        <button type="button" id="wallBtnCamera" class="furniture-analyze__action-btn furniture-analyze__action-btn--primary">Take a photo</button>
                    </div>
                    <input type="file" id="wallFileInputGallery" class="furniture-analyze__wallFile-input" accept="image/png,image/jpeg,image/*" hidden>
                    <input type="file" id="wallFileInputCamera" class="furniture-analyze__wallFile-input" accept="image/png,image/jpeg,image/*" capture="environment" hidden>
                </div>
            </div>

            <div class="dragDrop-container">
                <p class="furniture-analyze__label picker-label">Floor Photo</p>

                <div class="picker-desktop furniture-analyze__upload" id="floorDesktopPicker">
                    <label class="furniture-analyze__upload-zone" for="floorFileInputDesktop">
                        <span class="furniture-analyze__upload-icon" aria-hidden="true">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                        <span class="furniture-analyze__upload-title">Choose a photo</span>
                        <span class="furniture-analyze__upload-hint">JPEG or PNG</span>
                        <input type="file" id="floorFileInputDesktop" class="furniture-analyze__floorFile-input" accept="image/png,image/jpeg,image/*">
                    </label>
                </div>
                <div id="floorPreviewWrap" class="preview-wrap furniture-analyze__preview" hidden>
                    <div class="preview-box furniture-analyze__preview-box">
                        <img id="floorPreviewImage" alt="Selected floor photo">
                        <button type="button" id="floorBtnClearPreview" class="preview-clear furniture-analyze__preview-remove" aria-label="Remove photo" title="Remove">×</button>
                    </div>
                </div>

                <div class="picker-mobile furniture-analyze__mobile" id="floorMobilePicker" hidden>
                    <div class="mobile-actions furniture-analyze__mobile-actions">
                        <button type="button" id="floorBtnGallery" class="furniture-analyze__action-btn">Gallery</button>
                        <button type="button" id="floorBtnCamera" class="furniture-analyze__action-btn furniture-analyze__action-btn--primary">Take a photo</button>
                    </div>
                    <input type="file" id="floorFileInputGallery" class="furniture-analyze__floorFile-input" accept="image/png,image/jpeg,image/*" hidden>
                    <input type="file" id="floorFileInputCamera" class="furniture-analyze__floorFile-input" accept="image/png,image/jpeg,image/*" capture="environment" hidden>
                </div>
            </div>
        </div>

        <div class="furniture-analyze__actions">
            <button type="button" id="furnitureAnalyzeButton" class="fusion-button button-flat fusion-button-default-size button-custom fusion-button-default button-12345 fusion-button-default-span fusion-button-default-type furniture-analyze__submit">
                <span class="fusion-button-text">Analyze</span>
            </button>
        </div>
    </form>
    <?php if ($devMode) : ?>
        <div id="furnitureAnalyzeOutputWrapper" class="furniture-analyze-output" hidden>
            <div class="furniture-analyze-output__header">
                <h4 class="furniture-analyze-output__title">Analyze output</h4>
                <button
                    type="button"
                    id="furnitureAnalyzeOutputToggle"
                    class="furniture-analyze-output__toggle"
                    aria-expanded="false"
                    aria-controls="furnitureAnalyzeOutput"
                >Show output</button>
            </div>
            <div id="furnitureAnalyzeOutput" class="furniture-analyze-output__panel" hidden></div>
        </div>
    <?php endif; ?>
</div>
