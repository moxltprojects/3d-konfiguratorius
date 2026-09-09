let furnitureAnalyzeData = null;

const furnitureAnalyzerApp = {
    apiUrl: typeof api_vars !== 'undefined' ? `${api_vars.api_base_url}furnitureAnalyzer/` : '',
    isMobile: false,
    pickers: [],

    init() {
        const form = document.getElementById('furnitureAnalyzeForm');
        if (!form || form.dataset.furnitureAnalyzerBound) return;
        form.dataset.furnitureAnalyzerBound = '1';

        this.form = form;
        this.button = document.getElementById('furnitureAnalyzeButton');
        this.output = document.getElementById('furnitureAnalyzeOutput');
        this.outputWrapper = document.getElementById('furnitureAnalyzeOutputWrapper');
        this.outputToggle = document.getElementById('furnitureAnalyzeOutputToggle');

        this.isMobile = this.isMobileDevice();
        document.body.classList.toggle('is-mobile', this.isMobile);

        this.pickers = [
            this.createPicker({
                desktopPicker:  'furnitureDesktopPicker',
                mobilePicker:   'furnitureMobilePicker',
                previewWrap:    'furniturePreviewWrap',
                previewImage:   'furniturePreviewImage',
                btnClearPreview:'furnitureBtnClearPreview',
                fileInputDesktop:'fileInputDesktop',
                fileInputGallery:'fileInputGallery',
                fileInputCamera: 'fileInputCamera',
                btnGallery:     'furnitureBtnGallery',
                btnCamera:      'furnitureBtnCamera',
                fieldName:      'file',
            }),
            this.createPicker({
                desktopPicker:  'wallDesktopPicker',
                mobilePicker:   'wallMobilePicker',
                previewWrap:    'wallPreviewWrap',
                previewImage:   'wallPreviewImage',
                btnClearPreview:'wallBtnClearPreview',
                fileInputDesktop:'wallFileInputDesktop',
                fileInputGallery:'wallFileInputGallery',
                fileInputCamera: 'wallFileInputCamera',
                btnGallery:     'wallBtnGallery',
                btnCamera:      'wallBtnCamera',
                fieldName:      'wallFile',
            }),
            this.createPicker({
                desktopPicker:  'floorDesktopPicker',
                mobilePicker:   'floorMobilePicker',
                previewWrap:    'floorPreviewWrap',
                previewImage:   'floorPreviewImage',
                btnClearPreview:'floorBtnClearPreview',
                fileInputDesktop:'floorFileInputDesktop',
                fileInputGallery:'floorFileInputGallery',
                fileInputCamera: 'floorFileInputCamera',
                btnGallery:     'floorBtnGallery',
                btnCamera:      'floorBtnCamera',
                fieldName:      'floorFile',
            }),
        ];

        this.form.addEventListener('submit', (e) => e.preventDefault());
        if (this.button) {
            this.button.addEventListener('click', (e) => this.handleAnalyze(e));
        }
        if (this.outputToggle) {
            this.outputToggle.addEventListener('click', () => this.toggleOutputPanel());
        }
    },

    createPicker(ids) {
        const app = this;
        const picker = {
            selectedFile: null,
            previewUrl: null,
            fieldName: ids.fieldName,
            desktopPicker:   document.getElementById(ids.desktopPicker),
            mobilePicker:    document.getElementById(ids.mobilePicker),
            previewWrap:     document.getElementById(ids.previewWrap),
            previewImage:    document.getElementById(ids.previewImage),
            btnClearPreview: document.getElementById(ids.btnClearPreview),
            fileInputDesktop:document.getElementById(ids.fileInputDesktop),
            fileInputGallery:document.getElementById(ids.fileInputGallery),
            fileInputCamera: document.getElementById(ids.fileInputCamera),
            btnGallery:      document.getElementById(ids.btnGallery),
            btnCamera:       document.getElementById(ids.btnCamera),

            updatePickerVisibility() {
                const hasPreview = Boolean(this.selectedFile);
                if (this.previewWrap) this.previewWrap.hidden = !hasPreview;
                if (hasPreview) {
                    if (this.desktopPicker) this.desktopPicker.hidden = true;
                    if (this.mobilePicker)  this.mobilePicker.hidden  = true;
                    return;
                }
                if (this.desktopPicker) this.desktopPicker.hidden = app.isMobile;
                if (this.mobilePicker)  this.mobilePicker.hidden  = !app.isMobile;
            },

            revokePreviewUrl() {
                if (this.previewUrl) {
                    URL.revokeObjectURL(this.previewUrl);
                    this.previewUrl = null;
                }
                if (this.previewImage) this.previewImage.removeAttribute('src');
            },

            clearOtherInputs(activeInput) {
                for (const input of [this.fileInputDesktop, this.fileInputGallery, this.fileInputCamera]) {
                    if (input && input !== activeInput) input.value = '';
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
                if (!this.previewImage) return;
                this.previewImage.onerror = () => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        this.previewImage.onerror = null;
                        this.previewImage.src = reader.result;
                    };
                    reader.onerror = () => {
                        app.showOutput('Could not display image preview.', true);
                    };
                    reader.readAsDataURL(file);
                };
                this.previewImage.onload = () => {
                    this.previewImage.onerror = null;
                };
                this.previewImage.src = this.previewUrl;
            },

            setSelectedFile(file, activeInput) {
                if (!app.isImageFile(file)) {
                    app.showOutput('Unsupported file. Use a photo (JPEG/PNG).', true);
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

            bindEvents() {
                const bindInput = (input) => {
                    if (!input) return;
                    const onPick = () => this.handleFileInput(input);
                    input.addEventListener('change', onPick);
                    input.addEventListener('input', onPick);
                };
                bindInput(this.fileInputDesktop);
                bindInput(this.fileInputGallery);
                bindInput(this.fileInputCamera);

                if (this.btnGallery) {
                    this.btnGallery.addEventListener('click', () => {
                        if (this.fileInputGallery) { this.fileInputGallery.value = ''; this.fileInputGallery.click(); }
                    });
                }
                if (this.btnCamera) {
                    this.btnCamera.addEventListener('click', () => {
                        if (this.fileInputCamera) { this.fileInputCamera.value = ''; this.fileInputCamera.click(); }
                    });
                }
                if (this.btnClearPreview) {
                    this.btnClearPreview.addEventListener('click', () => this.clearSelection());
                }

                this.updatePickerVisibility();
            },
        };

        picker.bindEvents();
        return picker;
    },

    isMobileDevice() {
        const ua = navigator.userAgent || '';
        const mobileUa = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        const touchNarrow =
            navigator.maxTouchPoints > 0 &&
            window.matchMedia('(max-width: 768px)').matches;
        return mobileUa || touchNarrow;
    },

    isImageFile(file) {
        if (!file || file.size <= 0) return false;
        if (file.type && file.type.startsWith('image/')) return true;
        const name = (file.name || '').toLowerCase();
        if (/\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i.test(name)) return true;
        return !file.type || file.type === 'application/octet-stream';
    },

    showOutputWrapper() {
        if (this.outputWrapper) this.outputWrapper.hidden = false;
    },

    hideOutputWrapper() {
        if (this.outputWrapper) this.outputWrapper.hidden = true;
        this.setOutputPanelOpen(false);
        if (this.output) this.output.innerHTML = '';
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

    async uploadImageToWp({ base64, generationId, imageType }) {
        if (!base64) return null;
        if (typeof theme_vars === 'undefined' || !theme_vars.ajax_url) {
            throw new Error('WordPress upload is not available.');
        }

        const formData = new FormData();
        formData.append('action', 'mox_ai_stand_upload_image');
        formData.append('nonce', theme_vars.nonce);
        formData.append('image_base64', base64);
        formData.append('generationId', generationId || '');
        formData.append('imageType', imageType || '');

        const response = await fetch(theme_vars.ajax_url, {
            method: 'POST',
            body: formData,
        });

        const json = await response.json().catch(() => null);
        if (!response.ok || !json || !json.success) {
            const msg = (json && json.data) ? json.data : 'Upload failed';
            throw new Error(msg);
        }

        return json.data;
    },

    async persistAnalyzeTextures(data) {
        if (!data || typeof data !== 'object') return data;

        const generationId = data.generationId || '';
        const types = ['wall', 'floor'];

        await Promise.all(types.map(async (type) => {
            const texture = data[type];
            if (!texture || typeof texture !== 'object' || !texture.base64) {
                return;
            }

            const uploaded = await this.uploadImageToWp({
                base64: texture.base64,
                generationId,
                imageType: type,
            });

            data[type] = {
                url: uploaded.url,
                attachmentId: uploaded.attachmentId,
                path: texture.path || null,
            };
        }));

        return data;
    },

    showOutput(text, isError, revealWrapper = false) {
        if (isError && !revealWrapper) {
            alert(text);
            return;
        }
        if (!this.output) return;
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

        const furniturePicker = this.pickers[0];
        if (!furniturePicker?.selectedFile) {
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

        if (button) this.buttonLoader(button, true, '', originalHtml);
        this.hideOutputWrapper();

        const formData = new FormData();
        for (const picker of this.pickers) {
            if (picker.selectedFile) {
                formData.append(picker.fieldName, picker.selectedFile, picker.selectedFile.name || 'photo.jpg');
            }
        }


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
                try {
                    data = await this.persistAnalyzeTextures(data);
                } catch (uploadErr) {
                    ['wall', 'floor'].forEach((type) => {
                        if (data[type] && typeof data[type] === 'object') {
                            const { base64, ...rest } = data[type];
                            data[type] = { ...rest, error: uploadErr.message };
                        }
                    });
                    this.storeAnalyzeData(data);
                    this.showOutput(`Upload failed: ${uploadErr.message}\n\n${JSON.stringify(data, null, 2)}`, true, true);
                    finishButton('Error');
                    return;
                }
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
