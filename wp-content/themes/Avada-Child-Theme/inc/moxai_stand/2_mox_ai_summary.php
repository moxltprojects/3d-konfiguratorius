<?php 

function mox_ai_stand_summary_shortcode() {
    ob_start();
    ?>
    <div id="mox-ai-stand-summary-results" class="mox-ai-stand-summary"></div>
    <?php
    return ob_get_clean();
}

add_shortcode('mox_ai_stand_summary', 'mox_ai_stand_summary_shortcode');



function mox_ai_stand_introduction_content() {
    ob_start();
    ?>
    <div class="mox-ai-stand-introduction">
        <div class="mox-ai-stand-introduction-steps">
            <div class="mox-ai-stand-introduction-step mox-ai-stand-introduction-step-1">
                <div class="mox-ai-stand-introduction-step-arrow"></div>
                <div class="mox-ai-stand-introduction-step-content">
                    <h2>Step 2: use the 3D configurator</h2>
                    <p>Setup and visualize your stand by selecting the best setup options that fits for your presence.</p>
                </div>
                <div class="mox-ai-stand-introduction-step-image"></div>
            </div>
            <div class="mox-ai-stand-introduction-step mox-ai-stand-introduction-step-2">
                <div class="mox-ai-stand-introduction-step-arrow"></div>
                <div class="mox-ai-stand-introduction-step-content">
                    <h2>Step 3: make a purchase and get all materials prepared </h2>
                    <p>Once the configuration is finished, we step-in with a professional preparation of all communication parameters and final stiches needed to craft your stand.</p>
                </div>
                <div class="mox-ai-stand-introduction-step-image"></div>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
