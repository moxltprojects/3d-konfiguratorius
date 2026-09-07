const devMode = api_vars.dev_mode;
const apiBaseUrl = api_vars.api_base_url;

const standImageData = [];
let standImageBaseColor = '#ffffff';

function isDevModeByUrl() {
    return new URLSearchParams(window.location.search).get('devMode') === 'true';
}

function isCacheModeByUrl() {
    return new URLSearchParams(window.location.search).get('imageCache') === 'true';
}


document.addEventListener('DOMContentLoaded', function() {
    aiStandApp.init();
});



const aiStandApp = {
    serverStatus: false,
    activeTasks: [],
    selectedMode: null,
    constraints: {
        website: {
            presence: true,
            url: {
                allowLocal: false,
                message: "^Enter a valid website address"
            }
        },
        email: {
            presence: true,
            email: {
                message: "^Enter a valid email address"
            }
        }
    },
    constraintsManual: {
        email: {
            presence: true,
            email: {
                message: "^Enter a valid email address"
            }
        }
    },
    FURNITURE_TYPES: {
        BASE: 'base',
    },
    currentData: {
        taskId: null,
        website: null,
        email: null,
        mainData: null,
    },
    autoSetupElements: {
        form: document.querySelector('#mox-ai-auto-setup-form'),
        url: document.querySelector('#mox-ai-auto-setup-form #auto-setup-url'),
        email: document.querySelector('#mox-ai-auto-setup-form #auto-setup-email'),
        submit: document.querySelector('#mox-ai-auto-setup-form #mox-ai-auto-setup-button')
    },
    setupTabs: document.querySelectorAll('.mox-ai-start .tab-button-wrapper'),
    moxAiSummaryResults: document.querySelector('#mox-ai-stand-summary-results'),
    moxAiSummaryResultsLoadingDots: null,
    checkCurrentSetup: function() {
        const self = this;
        // console.log('checkCurrentSetup');
        // Helper funkcija išjungti prieš tai buvusį setup'ą
        function destroyPreviousSetup(mode) {
            if (mode === 'auto') {
                self.autoSetupDestroy && self.autoSetupDestroy();
            } else if (mode === 'manual') {
                self.manualSetupDestroy && self.manualSetupDestroy();
            }
        }
        // Inicijuojam pradžią pagal aktyvų tab
        const activeTab = Array.from(self.setupTabs).find(tab => tab.classList.contains('active-btn'));
        if (activeTab) {
            const selectedMode = activeTab.dataset.id;
            if (selectedMode === 'auto') {
                self.autoSetupInit();
                self.selectedMode = 'auto';
            } else {
                self.manualSetupInit();
                self.selectedMode = 'manual';
            }
        }
        // Click listeneris kiekvienam tab'ui
        self.setupTabs.forEach(tab => {
            tab.addEventListener('click', e => {
                e.preventDefault();

                const selectedMode = tab.dataset.id;

                // Jeigu tas pats režimas – nieko nedarom
                if (self.selectedMode === selectedMode) return;

                // Išjungiam ankstesnį režimą
                destroyPreviousSetup(self.selectedMode);

                // Atnaujinam UI – active klasė
                self.setupTabs.forEach(t => t.classList.remove('active-btn'));
                tab.classList.add('active-btn');

                // Įjungiam naują režimą
                if (selectedMode === 'auto') {
                    self.autoSetupInit();
                } else {
                    self.manualSetupInit();
                }

                // Atnaujinam dabartinį setup mode
                self.selectedMode = selectedMode;
            });
        });
    },
    autoSetupInit: async function() {
        console.log('Auto setup init');
        const self = this;
        const form = self.autoSetupElements.form;

        form.addEventListener('submit', async e => {
            e.preventDefault();
            console.log("submitted")
            self.showLoadingMessage(true);
            const url = self.autoSetupElements.url.value;
            const email = self.autoSetupElements.email.value;
            const submitButton = self.autoSetupElements.submit;
            const originalHtml = submitButton.innerHTML;

            if (!self.autoSetupWebsiteEmailEntered(url, email)) return;

            if (!self.checkServerStatus()) return;

            self.addActiveTask('scanWebsite');
            
            self.buttonLoader(submitButton, true, '', originalHtml);

            const data = await self.autoSetupCreateTask();
            
            if (data.error) {
                self.removeActiveTask('scanWebsite');

                self.buttonLoader(submitButton, false, 'Error', originalHtml);
                setTimeout(function() {
                    self.buttonLoader(submitButton, false, '', originalHtml);
                }, 2000);
                return;
                
            }

            if (!data.taskId) {
                console.error('No task ID received');
                self.removeActiveTask('scanWebsite');
                self.buttonLoader(submitButton, false, 'Error', originalHtml);
                setTimeout(function() {
                    self.buttonLoader(submitButton, false, '', originalHtml);
                }, 2000);
                return;
            }

            self.currentData.email = email;
            self.currentData.website = url;
            self.currentData.taskId = data.taskId;

            try {
                
                const taskInfo = await self.autoSetupAjaxGetTaskInfoPool(data.taskId);
                const taskInfoData = self.autoSetupFormatData(taskInfo);
                const taskInfoDataString = JSON.stringify(taskInfoData);
                self.currentData.mainData = taskInfoDataString;

                standImageBaseColor = self.pickWeightedColor(taskInfoData.colorScheme);

                self.buttonLoader(submitButton, false, 'Done', originalHtml);
                setTimeout(function() {
                    self.buttonLoader(submitButton, false, '', originalHtml);
                }, 2000);

                self.removeActiveTask('scanWebsite');
                const summaryHtml = await self.autoSetupRenderSummary(taskInfoData);
                self.moxAiSummaryResults.innerHTML = summaryHtml;
                try { furnitureAnalyzerApp.init(); } catch (e) { console.warn('furnitureAnalyzerApp.init failed:', e); }

            } catch (error) {
                // console.error("Error getting task info:", error);
                // self.buttonLoader(submitButton, false, 'Error', originalHtml);
                // setTimeout(function() {
                //     self.buttonLoader(submitButton, false, '', originalHtml);
                // }, 2000);
                const errorLogMsg = `Error getting task info: ${error}`;
                const errorMessage = error.message || 'Unexpected Error. Please try again';
                self.addButtonError(submitButton, originalHtml, errorMessage, errorLogMsg);
                self.removeActiveTask('scanWebsite');
            }

            console.log('currentData', self.currentData);
            
            self.showLoadingMessage(false);
        });
    },
    showLoadingMessage: function (show = true) {
        const self = this;
        const whereToShow = self.moxAiSummaryResults;
        if (!whereToShow) return;
    
        // jeigu rodome
        if (show) {
            // jei jau yra – panaudojam tą patį div
            let messageDiv = whereToShow.querySelector('.mox-ai-loading-message');
    
            if (!messageDiv) {
                messageDiv = document.createElement('div');
                messageDiv.classList.add('mox-ai-loading-message');
                messageDiv.innerHTML = 'Please be patient, analysis can take up to 10 minutes<span class="mox-ai-dots"></span>';
            }
			
			whereToShow.insertBefore(messageDiv, whereToShow.firstChild);
    
            const dotsSpan = messageDiv.querySelector('.mox-ai-dots');
    
            // sustabdom ankstesnį intervalą, jei toks buvo
            if (self.moxAiSummaryResultsLoadingDots) {
                clearInterval(self.moxAiSummaryResultsLoadingDots);
            }
    
            let dotCount = 0;
            self.moxAiSummaryResultsLoadingDots = setInterval(() => {
                dotCount = (dotCount + 1) % 4; // 0,1,2,3 -> ir vėl iš naujo
                dotsSpan.textContent = '.'.repeat(dotCount);
            }, 500); // kas 0.5s keičiam taškų kiekį
    
        } else {
            // slepiam žinutę ir stabdom animaciją
            if (self.moxAiSummaryResultsLoadingDots) {
                clearInterval(self.moxAiSummaryResultsLoadingDots);
                self.moxAiSummaryResultsLoadingDots = null;
            }
    
            const messageDiv = whereToShow.querySelector('.mox-ai-loading-message');
            if (messageDiv) {
                messageDiv.remove();
            }
        }
    },
    autoSetupCreateTask: async function() {
        const self = this;
        const apiUrl = `${apiBaseUrl}createTask/`;
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: self.autoSetupElements.url.value, email: self.autoSetupElements.email.value })
            });
            const results = await response.json();
            if (!response.ok) {
                throw new Error(`${results.error}`);
            }       
            
            return results;
        } catch (error) {
            console.error("Error creating task:", error);
            return { error: error.message };
        }
    },
    autoSetupAjaxGetTaskInfo: async function(taskId) {
        const apiUrl = `${apiBaseUrl}getTask/${taskId}`;
        try {
            const response = await fetch(apiUrl);
 
            const results = await response.json();

            if (!response.ok) {
                throw new Error(`${results.error}`);
            }         
            return results;
        } catch (error) {
            console.error("Error getting task info:", error);
            throw error;
        }
    },
    autoSetupAjaxGetTaskInfoPool: async function(taskId) {
        const self = this;
        const pollInterval = 7000;
        let attempts = 0;
        const maxAttempts = 300;
        const submitButton = self.autoSetupElements.submit;
        return new Promise((resolve, reject) => {
            const checkStatus = async () => {
                try {
                    const taskInfo = await self.autoSetupAjaxGetTaskInfo(taskId);
                    if (taskInfo.status === "completed") {
                        submitButton.dataset.messageType = '';
                        submitButton.dataset.messageText = '';
                        resolve(taskInfo);
                    } else if (taskInfo.status === "processing") {
                        attempts++;
                        submitButton.dataset.messageType = 'processing';
                        submitButton.dataset.messageText = 'Analyzing your website...';
                        if (attempts >= maxAttempts) {
                            reject(new Error("Max attempts reached"));
                        } else {
                            setTimeout(checkStatus, pollInterval);
                        }
                    } else if (taskInfo.status === "queued") {
                        attempts++;
                        submitButton.dataset.messageType = 'queued';
                        submitButton.dataset.messageText = 'You have been added to the queue. Please wait for your turn.';
                        if (attempts >= maxAttempts) {
                            reject(new Error("Max attempts reached"));
                        } else {
                            setTimeout(checkStatus, pollInterval);
                        }
                    } else if (taskInfo.status === "error" || taskInfo.status === "failed") {
                        submitButton.dataset.messageType = 'error';
                        submitButton.dataset.messageText = taskInfo.message || "An error occurred. Please try again.";
                        reject(new Error(taskInfo.message || "Task failed"));
                    } 
                } catch (error) {
                    console.error("Error getting task info:", error);
                    submitButton.dataset.messageType = 'error';
                    submitButton.dataset.messageText = error.message || "An error occurred. Please try again.";
                    reject(error);
                }
            };
            setTimeout(checkStatus, pollInterval);
        });
    },
    autoSetupFormatData: function(data) {
        data.pageSummaries = data.pageSummaries.map(pageSummary => {
            pageSummary.summary = marked.parse(pageSummary.summary);
            return pageSummary;
        });

        console.log('data', data);

        return {
            taskID: data.taskId,
            website: data.url,
            email: data.email,
            businessCategory: data.businessCategory,
            businessDescription: data.businessDescription,
            colorScheme: data.colorScheme,
            navigationElements: data.navigationElements,
            pageSummaries: data.pageSummaries,
            fontFamilies: {
                hasCustomFonts: data.fontFamilies.hasCustomFonts,
                preferredFamilies: data.fontFamilies.preferredFamilies,
                preferredTop: data.fontFamilies.preferredTop,
            },
        };
    },
    autoSetupRenderSummary: async function(data) {
        const formData = new FormData();
        formData.append('action', 'mox_ai_stand_auto_setup_summary');
        formData.append('data', JSON.stringify(data));
        formData.append('devMode', isDevModeByUrl() ? 'true' : 'false');
        formData.append('nonce', theme_vars.nonce);
        try {
            const response = await fetch(theme_vars.ajax_url, {
                method: 'POST',
                body: formData
            });
    
            const summaryData = await response.json();
            if (!response.ok) {
                throw new Error(`${summaryData.error}`);
            }
    
            return summaryData.data.html;
    
        } catch (error) {
            console.error('Error getting task info:', error);
            return null;
        }
    },
    autoSetupDestroy: function() {
        console.log('Auto setup disabled');
        const self = this;
        const form = self.autoSetupElements.form;
        form.reset();
    },
    autoSetupWebsiteEmailEntered: function(website, email) {
        let message = '';
        const values = {
            website: website,
            email: email
        };
        const errors = validate(values, this.constraints);

        if (errors) {
            let message = Object.values(errors)
            .flat()
            .join('\n');

            Swal.fire({
                icon: "error",
                title: "Oops...",
                html: message.replace(/\n/g, '<br>'),
            });
            return false;
        }
        return true;
    },
    // new generate stand start
    generateStand: async function(taskID, button) {
        console.log('Generate stand', taskID);
        const self = this;
        if (!self.checkServerStatus()) return;
        
        self.addActiveTask('generateStand');
    
        const originalHtml = button.innerHTML;

        self.buttonLoader(button, true, '', originalHtml);

        try {
            const generateStandResult = document.querySelector('.mox-results-box-generate-stand-result');
            const configuratorContainer = document.querySelector('.mox-results-box-generate-stand-configurator');
            const generateStandHeader = document.querySelector('.mox-results-box-generate-stand-header');


            // 1) Sukuriam generation task
            const created = await self.generateStandCreateGenerationAjax(taskID);
            const generationId = created && created.generationId ? created.generationId : null;
            if (!generationId) {
                throw new Error('Missing generationId');
            }

            const resolvedTaskId = created.taskId ?? taskID;
            const resolvedGenerationId = created.generationId ?? generationId;

            // 2) Pollinam iki completed
            const taskInfo = await self.generateStandGetTaskPool(generationId);

            console.log('taskInfo', taskInfo);

            let data = (taskInfo && taskInfo.result) ? taskInfo.result : taskInfo;
            if (data && taskInfo) {
                data = {
                    ...taskInfo,
                    ...data,
                };
            }

            // Reset results from previous runs
            standImageData.length = 0;

            const uploadAndAssign = async ({ base64, furnitureType }) => {
                if (!base64) return null;
                // const wpUpload = await self.uploadStandImageToWpAjax({
                //     base64,
                //     taskId: resolvedTaskId,
                //     generationId: resolvedGenerationId
                // });
                const entry = {
                    taskId: resolvedTaskId,
                    generationId: resolvedGenerationId,
                    base64: base64
                };
                // standImageData.push(entry);
                if (furnitureType) {
                    standImageData[furnitureType] = entry;
                }
                return entry;
            };


            if (data && (data.base)) {
                // New format: multiple parts
                await uploadAndAssign({ base64: data.base && data.base.base64, furnitureType: self.FURNITURE_TYPES.BASE });

                console.log('standImageData: ', standImageData);

                // generateStandResult.appendChild(img);

                standImageData['baseColor'] = standImageBaseColor;

                const configuratorHtml = await self.getConfiguratorAjax();

                configuratorContainer.innerHTML = configuratorHtml;

                // Initialize configurator
                initCategoryContent();

                generateStandHeader.classList.add('hidden');


            } else {
                if (generateStandResult) {
                    generateStandResult.textContent = 'No result image returned.';
                }
            }

            self.buttonLoader(button, false, 'Successfully generated', originalHtml);
            setTimeout(function() {
                self.buttonLoader(button, false, '', originalHtml);
            }, 2000);

            self.removeActiveTask('generateStand');

        } catch (error) {
            console.error("Error creating facebook posts:", error);
            self.buttonLoader(button, false, 'Error', originalHtml);
            setTimeout(function() {
                self.buttonLoader(button, false, '', originalHtml);
            }, 2000);
            const errorLogMsg = `Error generating stand: ${error}`;
            const errorMessage = error.message || 'Unexpected Error. Please try again';
            self.addButtonError(button, originalHtml, errorMessage, errorLogMsg);
            self.removeActiveTask('generateStand');
        }
    },

    generateStandCreateGenerationAjax: async function(taskID) {
        const self = this;
        const apiUrl = `${apiBaseUrl}generateFurnitureCreateTask/`;
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    taskId: taskID,
                    cache: isCacheModeByUrl() ? true : false
                }),
            });
            const results = await response.json();
            if (!response.ok) {
                throw new Error(`${results.error || 'Unexpected Error. Please try again'}`);
            }
            return results;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    },
    generateStandGetTaskAjax: async function(generationId) {
        const apiUrl = `${apiBaseUrl}generateFurnitureGetTask/${encodeURIComponent(generationId)}`;
        try {
            const response = await fetch(apiUrl);
            const results = await response.json();
            if (!response.ok) {
                throw new Error(`${results.error || 'Unexpected Error. Please try again'}`);
            }
            return results;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    },
    generateStandGetTaskPool: async function(generationId) {
        const self = this;
        const pollInterval = 7000;
        let attempts = 0;
        const maxAttempts = 300;

        return new Promise((resolve, reject) => {
            const checkStatus = async () => {
                try {
                    const taskInfo = await self.generateStandGetTaskAjax(generationId);
                    const status = taskInfo && taskInfo.status ? taskInfo.status : null;

                    if (status === 'completed') {
                        resolve(taskInfo);
                        return;
                    }

                    if (status === 'failed' || status === 'error') {
                        const msg = (taskInfo && (taskInfo.error || taskInfo.message)) ? (taskInfo.error || taskInfo.message) : 'Task failed';
                        reject(new Error(msg));
                        return;
                    }

                    // queued / processing / unknown: keep polling
                    attempts++;
                    if (attempts >= maxAttempts) {
                        reject(new Error('Max attempts reached'));
                        return;
                    }
                    setTimeout(checkStatus, pollInterval);
                } catch (error) {
                    // trumpi ryšio trūkimai neturėtų iškart nutraukti proceso
                    attempts++;
                    if (attempts >= maxAttempts) {
                        reject(error);
                        return;
                    }
                    setTimeout(checkStatus, pollInterval);
                }
            };
            setTimeout(checkStatus, pollInterval);
        });
    },


    // new generate stand end
    uploadStandImageToWpAjax: async function({ base64, taskId, generationId }) {
        const formData = new FormData();
        formData.append('action', 'mox_ai_stand_upload_image');
        formData.append('nonce', theme_vars.nonce);
        formData.append('image_base64', base64 || '');
        formData.append('taskId', taskId || '');
        formData.append('generationId', generationId || '');

        const response = await fetch(theme_vars.ajax_url, {
            method: 'POST',
            body: formData
        });

        const json = await response.json().catch(() => null);
        if (!response.ok || !json || !json.success) {
            const msg = (json && json.data) ? json.data : 'Upload failed';
            throw new Error(msg);
        }

        return json.data;
    },

    getConfiguratorAjax: async function() {
        const formData = new FormData();
        formData.append('action', 'mox_ai_stand_get_configurator');
        formData.append('nonce', theme_vars.nonce);
        try {
            const response = await fetch(theme_vars.ajax_url, {
                method: 'POST',
                body: formData
            });
    
            const summaryData = await response.json();
            if (!response.ok) {
                throw new Error(`${summaryData.error}`);
            }
    
            return summaryData.data.html;
    
        } catch (error) {
            console.error('Error getting task info:', error);
            return null;
        }
    },
    readFileAsBase64: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },
    showOrderableElements: function(type, data) {
        const self = this;

        const container = document.querySelector('#orderable-elements');
        const facebook = document.querySelector('#custom_orderable_form_2425');
        const sectionizer = document.querySelector('#custom_orderable_form_2423');

        container.classList.add('active');
        if (type === 'facebook') {
            facebook.classList.add('active');
            if (data.generationId) {
                const facebookGenerationIdInput = facebook.querySelector(`input[name="generation_id"]`);
                facebookGenerationIdInput.value = data.generationId;
            }
        } else if (type === 'sectionizer') {
            sectionizer.classList.add('active');
            if (data.generationId) {
                const sectionizerGenerationIdInput = sectionizer.querySelector(`input[name="generation_id"]`);
                sectionizerGenerationIdInput.value = data.generationId;
            }
        }

    },
    buttonLoader: function(button, showLoader = false, text = '', originalHtml = '') {
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
    addActiveTask: function(task) {
        this.activeTasks.push(task);
    },
    removeActiveTask: function(task) {
        this.activeTasks = this.activeTasks.filter(t => t !== task);
    },
    isActiveTask: function(task) {
        console.log('isActiveTask', this.activeTasks);
        return this.activeTasks.length === 0 ? false : this.activeTasks.includes(task);
    },
    checkApiStatus: async function() {
        try {
            const apiUrl = `${apiBaseUrl}checkStatus/`;
            const response = await fetch(apiUrl);
        
            if (response.ok) {
                const data = await response.json();
                this.serverStatus = data.status === 'ok' ? true : false;
            } else {
                this.serverStatus = false;
            }

            console.log('serverStatus:', this.serverStatus);
        } catch (_) {
            // Klaida ignoruojama tyčia – serveris laikomas nepasiekiamu
            this.serverStatus = false;
            console.log('serverStatus:', this.serverStatus);
        }
    },
    checkAPiStatusInterval: function(seconds) {
        const self = this;
        setInterval(function() {
            // console.clear();
            self.checkApiStatus();
        }, seconds * 1000);
    },
    checkServerStatus: function() {
        if (this.serverStatus) return true;
        Swal.fire({
            icon: "error",
            title: "Oops...",
            html: 'Server is offline. Please try again later.'
        });
        return false;
    },
    pickWeightedColor: function(colorScheme) {
        // 1. Pagalbinė funkcija nustatyti, ar spalva yra "beveik" balta/juoda
        const isTooExtreme = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
        
            // 1. Šviesumo patikra (HSP modelis geriau atspindi žmogaus akies suvokimą)
            // Formula: sqrt(0.299*R^2 + 0.587*G^2 + 0.114*B^2)
            const brightness = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
        
            // 2. Išmetame labai tamsias (iki 60) ir labai šviesias (nuo 230)
            // Jūsų #2E2B27 ryškumas yra ~43, todėl su šiuo rėžiu ji bus išmesta.
            const isWhite = brightness > 230;
            const isBlack = brightness < 60; 
        
            // 3. Papildomai: Išmetame spalvas, kurios beveik neturi atspalvio (pilkumas)
            // Jei skirtumas tarp R, G ir B yra labai mažas, spalva yra pilka.
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const isGrey = (max - min) < 10; 
        
            return isWhite || isBlack || isGrey;
        };
    
        // 2. Filtruojame masyvą
        const filtered = colorScheme.filter(item => !isTooExtreme(item.color));
    
        // 3. Jei nieko neliko, grąžiname baltą
        if (filtered.length === 0) return "#ffffff";
    
        // 4. Svorinis parinkimas (Weighted Random Selection)
        // Suskaičiuojame bendrą likusių procentų sumą
        const totalWeight = filtered.reduce((sum, item) => sum + parseFloat(item.percentage), 0);
        
        // Sugeneruojame atsitiktinį skaičių nuo 0 iki sumos
        let random = Math.random() * totalWeight;
    
        for (const item of filtered) {
            random -= parseFloat(item.percentage);
            if (random <= 0) {
                return item.color;
            }
        }
    
        return filtered[0].color; // Apsidraudimui
    },  
    loadTestData: async function() {
        const self = this;
        const taskId = 'dd684828-087b-494c-8f10-148c9a0b972f';
        const url = 'https://zalgiris.lt/';
        const email = 'test@test.test';

        self.currentData.email = email;
        self.currentData.website = url;
        self.currentData.taskId = taskId;
		
		self.showLoadingMessage(true);

        try {
            const taskInfo = await self.autoSetupAjaxGetTaskInfoPool(taskId);
            const taskInfoData = self.autoSetupFormatData(taskInfo);
            const taskInfoDataString = JSON.stringify(taskInfoData);

            standImageBaseColor = self.pickWeightedColor(taskInfoData.colorScheme);

            self.currentData.mainData = taskInfoDataString;
            const summaryHtml = await self.autoSetupRenderSummary(taskInfoData);
            self.moxAiSummaryResults.innerHTML = summaryHtml;
            try { furnitureAnalyzerApp.init(); } catch (e) { console.warn('furnitureAnalyzerApp.init failed:', e); }
        } catch (error) {
            console.error('Error getting task info:', error);
            return null;
        } finally {
            self.showLoadingMessage(false);
        }
    },
    addButtonError: function(button, originalHtml, errorMessage, errorLogMsg) {
        console.log("Error:", errorLogMsg);

        const self = this;
        self.buttonLoader(button, false, 'Error', originalHtml);
        setTimeout(function() {
            self.buttonLoader(button, false, '', originalHtml);
        }, 2000);

        Swal.fire({
            icon: "error",
            title: "Oops...",
            html: errorMessage.replace(/\n/g, '<br>'),
        });

        return false;
    },
    init: function() {
        const self = this;
        if (!self.autoSetupElements.form) {
            return;
        }
        console.log('Mox AI App started');
        this.checkApiStatus();
        // this.checkAPiStatusInterval(10);
        // this.checkCurrentSetup();

        self.autoSetupInit();


        if (isDevModeByUrl()) {
            setTimeout(function() {
                self.loadTestData();
            }, 100);
        }
    },
}
