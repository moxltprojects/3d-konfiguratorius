<?php

function mox_ai_stand_start_shortcode() {

    $activeTab = 'auto'; // auto, manual

    ob_start();
    ?>
    <div class="mox-ai-stand-start">
        <div class="tabs">
            <div class="tab-buttons">
                <div data-id="auto" class="tab-button-wrapper <?php echo $activeTab === 'auto' ? 'active-btn' : ''; ?>">
                    <div class="tab-button-bg"></div>
                    <button class="tab-button <?php echo $activeTab === 'auto' ? 'active' : ''; ?>" onclick="showTab(this, 'tab0-1')">Analyze your website (get a context and colors)</button>
                </div>
            </div>
            <div id="tab0-1" class="tab-content <?php echo $activeTab === 'auto' ? 'active' : ''; ?>">
                <?php mox_ai_stand_start_tab1_content(); ?>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

add_shortcode('mox_ai_stand_start', 'mox_ai_stand_start_shortcode');


function mox_ai_stand_start_tab1_content() {
	$defaultValues = false;
    ?>
    <div class="mox-ai-auto-setup">
        <form id="mox-ai-auto-setup-form" autocomplete="off">
            <div class="mox-ai-auto-setup-wrapper">
                <div class="mox-ai-auto-setup-item mox-ai-auto-setup-input">
                    <label for="auto-setup-url">Your website URL</label>
                    <input type="url" id="auto-setup-url" placeholder="https://web.com" <?php echo $defaultValues ? 'value="https://antanas.lt"' : ''; ?> autocomplete="off">
                </div>
                <div class="mox-ai-auto-setup-item mox-ai-auto-setup-input">
                    <label for="auto-setup-email">Your email</label>
                    <input type="email" id="auto-setup-email" placeholder="email@email.com" <?php echo $defaultValues ? 'value="email@email.com"' : ''; ?> autocomplete="off">
                </div>
                <div class="mox-ai-auto-setup-item mox-ai-auto-setup-submit">
                    <button id="mox-ai-auto-setup-button" type="submit" class="fusion-button button-flat fusion-button-default-size button-default fusion-button-default button-9999 fusion-button-span-no fusion-button-default-type mox-ai-auto-setup-button" aria-label="Analyze">  
                        <span class="fusion-button-text">Analyze</span>
                    </button>
                </div>
            </div>
        </form>
    </div>
    <?php
}