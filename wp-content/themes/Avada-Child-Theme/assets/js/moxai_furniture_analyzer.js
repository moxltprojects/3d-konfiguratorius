let furnitureAnalyzeData = null;

const furnitureAnalyzerApp = {
    apiUrl: typeof api_vars !== 'undefined' ? `${api_vars.api_base_url}furnitureAnalyzer/` : '',
    selectedFile: null,
    previewUrl: null,
    isMobile: false,
    init() {
        const form = document.getElementById('furnitureAnalyzeForm');
        if (!form || form.dataset.furnitureAnalyzerBound) {
            return;
        }
        form.dataset.furnitureAnalyzerBound = '1';
        this.bindElements();
        this.initPickerMode();
        this.bindEvents();
    },

    bindElements() {
        this.form = document.getElementById('furnitureAnalyzeForm');
        this.button = document.getElementById('furnitureAnalyzeButton');
        this.output = document.getElementById('furnitureAnalyzeOutput');
        this.outputWrapper = document.getElementById('furnitureAnalyzeOutputWrapper');
        this.outputToggle = document.getElementById('furnitureAnalyzeOutputToggle');
        this.desktopPicker = document.getElementById('desktopPicker');
        this.mobilePicker = document.getElementById('mobilePicker');
        this.fileInputDesktop = document.getElementById('fileInputDesktop');
        this.fileInputGallery = document.getElementById('fileInputGallery');
        this.fileInputCamera = document.getElementById('fileInputCamera');
        this.btnGallery = document.getElementById('btnGallery');
        this.btnCamera = document.getElementById('btnCamera');
        this.previewWrap = document.getElementById('previewWrap');
        this.previewImage = document.getElementById('previewImage');
        this.btnClearPreview = document.getElementById('btnClearPreview');
    },

    bindEvents() {
        this.bindFileInput(this.fileInputDesktop);
        this.bindFileInput(this.fileInputGallery);
        this.bindFileInput(this.fileInputCamera);

        this.btnGallery.addEventListener('click', () => this.openFilePicker(this.fileInputGallery));
        this.btnCamera.addEventListener('click', () => this.openFilePicker(this.fileInputCamera));
        this.btnClearPreview.addEventListener('click', () => this.clearSelection());
        this.form.addEventListener('submit', (e) => e.preventDefault());
        if (this.button) {
            this.button.addEventListener('click', (e) => this.handleAnalyze(e));
        }
        if (this.outputToggle) {
            this.outputToggle.addEventListener('click', () => this.toggleOutputPanel());
        }
    },

    isMobileDevice() {
        const ua = navigator.userAgent || '';
        const mobileUa = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        const touchNarrow =
            navigator.maxTouchPoints > 0 &&
            window.matchMedia('(max-width: 768px)').matches;
        return mobileUa || touchNarrow;
    },

    /** Camera/gallery on mobile often returns empty file.type — still a valid image */
    isImageFile(file) {
        if (!file || file.size <= 0) return false;
        if (file.type && file.type.startsWith('image/')) return true;
        const name = (file.name || '').toLowerCase();
        if (/\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i.test(name)) return true;
        return !file.type || file.type === 'application/octet-stream';
    },

    initPickerMode() {
        this.isMobile = this.isMobileDevice();
        document.body.classList.toggle('is-mobile', this.isMobile);
        this.updatePickerVisibility();
    },

    updatePickerVisibility() {
        const hasPreview = Boolean(this.selectedFile);
        this.previewWrap.hidden = !hasPreview;
        if (hasPreview) {
            this.desktopPicker.hidden = true;
            this.mobilePicker.hidden = true;
            return;
        }
        this.desktopPicker.hidden = this.isMobile;
        this.mobilePicker.hidden = !this.isMobile;
    },

    revokePreviewUrl() {
        if (this.previewUrl) {
            URL.revokeObjectURL(this.previewUrl);
            this.previewUrl = null;
        }
        this.previewImage.removeAttribute('src');
    },

    clearOtherInputs(activeInput) {
        const inputs = [this.fileInputDesktop, this.fileInputGallery, this.fileInputCamera];
        for (const input of inputs) {
            if (input && input !== activeInput) {
                input.value = '';
            }
        }
    },

    clearSelection() {
        this.selectedFile = null;
        this.revokePreviewUrl();
        for (const input of [this.fileInputDesktop, this.fileInputGallery, this.fileInputCamera]) {
            if (input) input.value = '';
        }
        this.updatePickerVisibility();
    },

    showPreviewFromFile(file) {
        this.revokePreviewUrl();
        this.previewUrl = URL.createObjectURL(file);
        this.previewImage.onerror = () => {
            const reader = new FileReader();
            reader.onload = () => {
                this.previewImage.onerror = null;
                this.previewImage.src = reader.result;
            };
            reader.onerror = () => {
                this.showOutput('Could not display image preview.', true);
            };
            reader.readAsDataURL(file);
        };
        this.previewImage.onload = () => {
            this.previewImage.onerror = null;
        };
        this.previewImage.src = this.previewUrl;
    },

    setSelectedFile(file, activeInput) {
        if (!this.isImageFile(file)) {
            this.showOutput('Unsupported file. Use a photo (JPEG/PNG).', true);
            return;
        }
        this.selectedFile = file;
        this.clearOtherInputs(activeInput);
        this.showPreviewFromFile(file);
        this.updatePickerVisibility();
    },

    handleFileInput(input) {
        const file = input.files?.[0];
        if (!file) return;
        this.setSelectedFile(file, input);
    },

    bindFileInput(input) {
        const onPick = () => this.handleFileInput(input);
        input.addEventListener('change', onPick);
        input.addEventListener('input', onPick);
    },

    openFilePicker(input) {
        input.value = '';
        input.click();
    },

    showOutputWrapper() {
        if (this.outputWrapper) {
            this.outputWrapper.hidden = false;
        }
    },

    hideOutputWrapper() {
        if (this.outputWrapper) {
            this.outputWrapper.hidden = true;
        }
        this.setOutputPanelOpen(false);
        if (this.output) {
            this.output.innerHTML = '';
        }
    },

    setOutputPanelOpen(open) {
        if (!this.output) return;
        const isOpen = Boolean(open);
        this.output.hidden = !isOpen;
        if (this.outputToggle) {
            this.outputToggle.textContent = isOpen ? 'Hide output' : 'Show output';
            this.outputToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
    },

    toggleOutputPanel() {
        if (!this.output) return;
        this.setOutputPanelOpen(this.output.hidden);
    },

    buttonLoader(button, showLoader = false, text = '', originalHtml = '') {
        if (!button) return;
        if (showLoader) {
            button.innerHTML = '<span class="loader-icon-style"><span class="loader"></span></span>';
            button.disabled = true;
            return;
        }
        if (text) {
            button.innerHTML = `<span class="fusion-button-text awb-button__text">${text}</span>`;
            return;
        }
        button.innerHTML = originalHtml;
        button.disabled = false;
    },

    storeAnalyzeData(data) {
        furnitureAnalyzeData = data ?? null;
    },

    showOutput(text, isError, revealWrapper = false) {
        if (isError && !revealWrapper) {
            alert(text);
            return;
        }
        if (!this.output) {
            return;
        }
        const pre = document.createElement('pre');
        pre.textContent = text;
        if (isError) pre.style.color = '#a00';
        this.output.innerHTML = '';
        this.output.appendChild(pre);
        if (revealWrapper) {
            this.showOutputWrapper();
            this.setOutputPanelOpen(false);
        }
    },

    async handleAnalyze(e) {
        e.preventDefault();

        if (!this.selectedFile) {
            this.showOutput('Select or take a photo first.', true);
            return;
        }

        const button = this.button;
        const originalHtml = button ? button.innerHTML : '';

        const finishButton = (feedbackText = '') => {
            if (!button) return;
            if (feedbackText) {
                this.buttonLoader(button, false, feedbackText, originalHtml);
                setTimeout(() => this.buttonLoader(button, false, '', originalHtml), 2000);
            } else {
                this.buttonLoader(button, false, '', originalHtml);
            }
        };

        if (button) {
            this.buttonLoader(button, true, '', originalHtml);
        }

        this.hideOutputWrapper();

        const formData = new FormData();
        formData.append('file', this.selectedFile, this.selectedFile.name || 'photo.jpg');

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                body: formData,
            });

            let data;
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch {
                this.showOutput(text || `HTTP ${response.status}`, !response.ok, true);
                finishButton(!response.ok ? 'Error' : 'Done');
                return;
            }

            const isError = !response.ok;
            if (!isError) {
                this.storeAnalyzeData(data);
            }
            this.showOutput(JSON.stringify(data, null, 2), isError, true);
            finishButton(isError ? 'Error' : 'Done');
        } catch (err) {
            this.showOutput(`Error: ${err.message}`, true, true);
            finishButton('Error');
        }
    },
};
