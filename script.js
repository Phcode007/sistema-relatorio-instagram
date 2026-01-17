class InstagramReportSystem {
    constructor() {
        this.isMIUI = this.detectMIUI();
        this.currentWeek = this.getCurrentWeek();
        this.data = {
            attendance: [],
            content: [],
            highlights: {
                bestStory: '',
                bestReel: '',
                suggestions: ''
            },
            week: this.currentWeek
        };
        
        this.isMobile = false;
        this.isTablet = false;
        
        this.init();
    }
    
    detectMIUI() {
        const ua = navigator.userAgent;
        return ua.includes('MiuiBrowser') || 
               ua.includes('XiaoMi') || 
               ua.includes('Redmi') ||
               ua.includes('MIUI') ||
               /xiaomi/i.test(ua);
    }
    
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.detectDevice();
        
        if (this.isMIUI) {
            this.applyMIUIFixes();
        }
        
        this.addMobileStyles();
        this.loadSavedData();
        this.updateUI();
        this.setCurrentYear();
        this.setupMobileFeatures();
        
        this.showNotification('Sistema carregado. Bem-vinda, Iandra!', 'success');
    }
    
    applyMIUIFixes() {
        console.log('Aplicando correções para MIUI/Redmi');
        
        document.body.classList.add('miui-device');
        
        const style = document.createElement('style');
        style.textContent = `
            .miui-device input,
            .miui-device textarea,
            .miui-device select {
                -webkit-user-modify: read-write-plaintext-only !important;
                user-select: text !important;
                -webkit-user-select: text !important;
            }
            
            .miui-device .table-wrapper {
                -webkit-overflow-scrolling: touch !important;
            }
            
            .miui-device .mobile-input,
            .miui-device .mobile-textarea {
                min-height: 48px !important;
                font-size: 16px !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    cacheElements() {
        this.elements = {
            weekInput: document.getElementById('week'),
            attendanceBody: document.getElementById('attendanceBody'),
            contentBody: document.getElementById('contentBody'),
            attendanceMobile: document.getElementById('attendanceMobile'),
            contentMobile: document.getElementById('contentMobile'),
            attendanceEmpty: document.getElementById('attendanceEmpty'),
            contentEmpty: document.getElementById('contentEmpty'),
            bestStory: document.getElementById('bestStory'),
            bestReel: document.getElementById('bestReel'),
            suggestions: document.getElementById('suggestions'),
            notification: document.getElementById('notification'),
            lastSaveTime: document.getElementById('lastSaveTime'),
            dataCount: document.getElementById('dataCount'),
            currentYear: document.getElementById('currentYear')
        };
        
        this.buttons = {
            addAttendanceRow: document.getElementById('addAttendanceRow'),
            addContentRow: document.getElementById('addContentRow'),
            duplicateLastDay: document.getElementById('duplicateLastDay'),
            addMultipleDays: document.getElementById('addMultipleDays'),
            generateReport: document.getElementById('generateReport'),
            printReport: document.getElementById('printReport'),
            exportData: document.getElementById('exportData'),
            clearData: document.getElementById('clearData'),
            newWeek: document.getElementById('newWeek'),
            quickSave: document.getElementById('quickSave'),
            mobileAddButton: document.getElementById('mobileAddButton')
        };
        
        this.stats = {
            totalMessages: document.getElementById('totalMessages'),
            totalReplies: document.getElementById('totalReplies'),
            totalReservations: document.getElementById('totalReservations'),
            totalBudgets: document.getElementById('totalBudgets'),
            totalLost: document.getElementById('totalLost'),
            conversionRate: document.getElementById('conversionRate'),
            totalStories: document.getElementById('totalStories'),
            totalReels: document.getElementById('totalReels'),
            totalStoryViews: document.getElementById('totalStoryViews'),
            totalReelViews: document.getElementById('totalReelViews'),
            avgEngagement: document.getElementById('avgEngagement'),
            statMessages: document.getElementById('statMessages'),
            statReplies: document.getElementById('statReplies'),
            statPotential: document.getElementById('statPotential'),
            statEngagement: document.getElementById('statEngagement'),
            legendMessages: document.getElementById('legendMessages'),
            legendPotential: document.getElementById('legendPotential'),
            performanceLevel: document.getElementById('performanceLevel')
        };
    }
    
    setupEventListeners() {
        this.buttons.addAttendanceRow.addEventListener('click', () => this.addAttendanceRow());
        this.buttons.addContentRow.addEventListener('click', () => this.addContentRow());
        
        if (this.buttons.duplicateLastDay) {
            this.buttons.duplicateLastDay.addEventListener('click', () => this.duplicateLastAttendance());
        }
        
        if (this.buttons.addMultipleDays) {
            this.buttons.addMultipleDays.addEventListener('click', () => this.addWeekOfContent());
        }
        
        this.buttons.generateReport.addEventListener('click', () => this.generateReport());
        this.buttons.printReport.addEventListener('click', () => window.print());
        this.buttons.exportData.addEventListener('click', () => this.exportData());
        this.buttons.clearData.addEventListener('click', () => this.clearData());
        this.buttons.newWeek.addEventListener('click', () => this.startNewWeek());
        this.buttons.quickSave.addEventListener('click', () => this.saveData());
        
        if (this.buttons.mobileAddButton) {
            this.buttons.mobileAddButton.addEventListener('click', () => this.handleMobileAdd());
        }
        
        this.elements.weekInput.value = this.currentWeek;
        this.elements.weekInput.addEventListener('change', (e) => {
            this.data.week = e.target.value;
            this.saveData();
        });
        
        this.setupCharacterCounters();
        this.setupTabNavigation();
        this.setupAutoSave();
        
        if (this.isMIUI) {
            this.setupMIUITouchFix();
        }
    }
    
    setupMIUITouchFix() {
        document.addEventListener('touchstart', (e) => {
            const target = e.target;
            
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                target.style.fontSize = '16px';
                
                setTimeout(() => {
                    target.focus();
                    if (target.setSelectionRange) {
                        target.setSelectionRange(target.value.length, target.value.length);
                    }
                }, 50);
            }
        }, { passive: true });
        
        let lastTap = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTap < 300) {
                e.preventDefault();
            }
            lastTap = now;
        }, { passive: false });
    }
    
    setupMobileFeatures() {
        this.setupMobileContextMenu();
        this.improveTouchInputs();
        
        window.addEventListener('resize', () => {
            this.detectDevice();
            this.renderTablesForDevice();
        });
    }
    
    setupMobileContextMenu() {
        const contextMenu = document.getElementById('mobileContextMenu');
        if (!contextMenu) return;
        
        const contextItems = contextMenu.querySelectorAll('.context-item');
        
        contextItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                
                switch(action) {
                    case 'addDay':
                        this.handleMobileAdd();
                        break;
                    case 'addWeek':
                        this.addWeekOfContent();
                        break;
                    case 'duplicate':
                        this.duplicateLastAttendance();
                        break;
                }
                
                contextMenu.classList.add('hidden');
            });
        });
        
        const contextCancel = contextMenu.querySelector('.context-cancel');
        if (contextCancel) {
            contextCancel.addEventListener('click', () => {
                contextMenu.classList.add('hidden');
            });
        }
        
        document.addEventListener('click', (e) => {
            if (contextMenu && !contextMenu.contains(e.target) && !e.target.closest('.floating-action-button')) {
                contextMenu.classList.add('hidden');
            }
        });
    }
    
    handleMobileAdd() {
        const activeTab = document.querySelector('.tab.active');
        if (!activeTab) return;
        
        const tabId = activeTab.getAttribute('data-tab');
        if (tabId === 'attendance') {
            this.addAttendanceRow();
        } else {
            this.addContentRow();
        }
    }
    
    improveTouchInputs() {
        if (this.isMobile) {
            const minSize = this.isMIUI ? '48px' : '44px';
            
            document.querySelectorAll('input, textarea, select, button').forEach(element => {
                element.style.minHeight = minSize;
                element.style.minWidth = minSize;
                element.style.touchAction = 'manipulation';
            });
            
            document.querySelectorAll('input[type="number"], input[type="date"]').forEach(input => {
                input.style.fontSize = '16px';
                input.setAttribute('inputmode', 'numeric');
            });
        }
    }
    
    detectDevice() {
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
        
        document.body.classList.remove('is-mobile', 'is-tablet', 'is-desktop');
        
        if (this.isMobile) {
            document.body.classList.add('is-mobile');
        } else if (this.isTablet) {
            document.body.classList.add('is-tablet');
        } else {
            document.body.classList.add('is-desktop');
        }
    }
    
    addMobileStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.95);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
            }
            
            .loading-overlay.active {
                opacity: 1;
                pointer-events: all;
            }
            
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
            }
            
            .loading-text {
                color: #333;
                font-weight: 600;
                font-size: 16px;
            }
            
            .touch-ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            }
            
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            /* MIUI specific fixes */
            .miui-input-fix:focus {
                border-color: #2c5282 !important;
                box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.3) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupCharacterCounters() {
        const setupCounter = (input, counterClass) => {
            const counter = input.parentElement.querySelector(`.${counterClass}`);
            if (counter) {
                const updateCounter = () => {
                    counter.textContent = `${input.value.length}/${input.maxLength}`;
                };
                input.addEventListener('input', updateCounter);
                updateCounter();
            }
        };
        
        setupCounter(this.elements.bestStory, 'char-counter');
        setupCounter(this.elements.bestReel, 'char-counter');
        setupCounter(this.elements.suggestions, 'char-counter');
        
        this.elements.bestStory.addEventListener('input', (e) => {
            this.data.highlights.bestStory = e.target.value;
            this.saveData();
        });
        
        this.elements.bestReel.addEventListener('input', (e) => {
            this.data.highlights.bestReel = e.target.value;
            this.saveData();
        });
        
        this.elements.suggestions.addEventListener('input', (e) => {
            this.data.highlights.suggestions = e.target.value;
            this.saveData();
        });
    }
    
    setupTabNavigation() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                if (this.isMobile) {
                    this.createTouchRipple(e);
                }
                
                const tabId = tab.getAttribute('data-tab');
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                const tabContent = document.getElementById(`${tabId}-tab`);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
            });
        });
    }
    
    createTouchRipple(event) {
        const btn = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - (btn.getBoundingClientRect().left + radius)}px`;
        circle.style.top = `${event.clientY - (btn.getBoundingClientRect().top + radius)}px`;
        circle.classList.add('touch-ripple');
        
        btn.appendChild(circle);
        
        setTimeout(() => {
            circle.remove();
        }, 600);
    }
    
    setupAutoSave() {
        let saveTimeout;
        const saveHandler = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.saveData();
                this.updateLastSaveTime();
            }, 1000);
        };
        
        document.addEventListener('input', saveHandler);
        document.addEventListener('change', saveHandler);
    }
    
    getCurrentWeek() {
        const now = new Date();
        const year = now.getFullYear();
        const firstDay = new Date(year, 0, 1);
        const days = Math.floor((now - firstDay) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((days + firstDay.getDay() + 1) / 7);
        return `${year}-W${week.toString().padStart(2, '0')}`;
    }
    
    getCurrentDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    addAttendanceRow(date = this.getCurrentDate()) {
        this.data.attendance.push({
            date,
            messages: 0,
            replies: 0,
            reservations: 0,
            budgets: 0,
            lost: 0,
            observations: ''
        });
        
        this.renderAttendanceTable();
        this.saveData();
        this.showNotification('Dia adicionado ao atendimento');
    }
    
    addContentRow(date = this.getCurrentDate()) {
        this.data.content.push({
            date,
            stories: 0,
            reels: 0,
            storyViews: 0,
            reelViews: 0,
            engagement: 0,
            observations: ''
        });
        
        this.renderContentTable();
        this.saveData();
        this.showNotification('Dia adicionado ao conteúdo');
    }
    
    duplicateLastAttendance() {
        if (this.data.attendance.length === 0) {
            this.showNotification('Não há dados para duplicar', 'warning');
            return;
        }
        
        const last = {...this.data.attendance[this.data.attendance.length - 1]};
        last.date = this.getCurrentDate();
        this.data.attendance.push(last);
        
        this.renderAttendanceTable();
        this.saveData();
        this.showNotification('Último dia duplicado');
    }
    
    addWeekOfContent() {
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            if (!this.data.content.find(item => item.date === dateStr)) {
                this.data.content.push({
                    date: dateStr,
                    stories: 0,
                    reels: 0,
                    storyViews: 0,
                    reelViews: 0,
                    engagement: 0,
                    observations: ''
                });
            }
        }
        
        this.renderContentTable();
        this.saveData();
        this.showNotification('Semana de conteúdo adicionada');
    }
    
    renderTablesForDevice() {
        this.renderAttendanceTable();
        this.renderContentTable();
    }
    
    renderAttendanceTable() {
        if (this.isMobile) {
            this.renderAttendanceForMobile();
        } else {
            this.renderAttendanceForDesktop();
        }
        
        this.updateStatistics();
    }
    
    renderContentTable() {
        if (this.isMobile) {
            this.renderContentForMobile();
        } else {
            this.renderContentForDesktop();
        }
        
        this.updateStatistics();
    }
    
    renderAttendanceForDesktop() {
        if (this.data.attendance.length === 0) {
            if (this.elements.attendanceEmpty) {
                this.elements.attendanceEmpty.classList.remove('hidden');
            }
            this.elements.attendanceBody.innerHTML = '';
            return;
        }
        
        if (this.elements.attendanceEmpty) {
            this.elements.attendanceEmpty.classList.add('hidden');
        }
        
        this.elements.attendanceBody.innerHTML = this.data.attendance.map((item, index) => `
            <tr data-index="${index}">
                <td>
                    <input type="date" class="date-input miui-input-fix" value="${item.date}" 
                           onchange="instagramReport.updateAttendanceField(${index}, 'date', this.value)">
                </td>
                <td>
                    <input type="number" min="0" value="${item.messages}" class="miui-input-fix"
                           onchange="instagramReport.updateAttendanceField(${index}, 'messages', this.value)">
                </td>
                <td>
                    <input type="number" min="0" value="${item.replies}" class="miui-input-fix"
                           onchange="instagramReport.updateAttendanceField(${index}, 'replies', this.value)">
                </td>
                <td>
                    <input type="number" min="0" value="${item.reservations}" class="miui-input-fix"
                           onchange="instagramReport.updateAttendanceField(${index}, 'reservations', this.value)">
                </td>
                <td>
                    <input type="number" min="0" value="${item.budgets}" class="miui-input-fix"
                           onchange="instagramReport.updateAttendanceField(${index}, 'budgets', this.value)">
                </td>
                <td>
                    <input type="number" min="0" value="${item.lost}" class="miui-input-fix"
                           onchange="instagramReport.updateAttendanceField(${index}, 'lost', this.value)">
                </td>
                <td>
                    <textarea onchange="instagramReport.updateAttendanceField(${index}, 'observations', this.value)"
                              class="miui-input-fix"
                              placeholder="Observações...">${item.observations}</textarea>
                </td>
                <td>
                    <button class="delete-btn" onclick="instagramReport.deleteAttendanceRow(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    renderContentForDesktop() {
        if (this.data.content.length === 0) {
            if (this.elements.contentEmpty) {
                this.elements.contentEmpty.classList.remove('hidden');
            }
            this.elements.contentBody.innerHTML = '';
            return;
        }
        
        if (this.elements.contentEmpty) {
            this.elements.contentEmpty.classList.add('hidden');
        }
        
        this.elements.contentBody.innerHTML = this.data.content.map((item, index) => `
            <tr data-index="${index}">
                <td>
                    <input type="date" class="date-input miui-input-fix" value="${item.date}" 
                           onchange="instagramReport.updateContentField(${index}, 'date', this.value)">
                </td>
                <td>
                    <input type="number" min="0" value="${item.stories}" class="miui-input-fix"
                           onchange="instagramReport.updateContentField(${index}, 'stories', this.value)">
                </td>
                <td>
                    <input type="number" min="0" value="${item.reels}" class="miui-input-fix"
                           onchange="instagramReport.updateContentField(${index}, 'reels', this.value)">
                </td>
                <td>
                    <input type="number" min="0" value="${item.storyViews}" class="miui-input-fix"
                           onchange="instagramReport.updateContentField(${index}, 'storyViews', this.value)">
                </td>
                <td>
                    <input type="number" min="0" value="${item.reelViews}" class="miui-input-fix"
                           onchange="instagramReport.updateContentField(${index}, 'reelViews', this.value)">
                </td>
                <td>
                    <input type="number" min="0" max="100" step="0.1" value="${item.engagement}" class="miui-input-fix"
                           onchange="instagramReport.updateContentField(${index}, 'engagement', this.value)">
                </td>
                <td>
                    <textarea onchange="instagramReport.updateContentField(${index}, 'observations', this.value)"
                              class="miui-input-fix"
                              placeholder="Observações...">${item.observations}</textarea>
                </td>
                <td>
                    <button class="delete-btn" onclick="instagramReport.deleteContentRow(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    renderAttendanceForMobile() {
        const container = this.elements.attendanceMobile;
        if (!container) return;
        
        if (this.data.attendance.length === 0) {
            container.innerHTML = `
                <div class="empty-state-mobile">
                    <i class="fas fa-inbox fa-2x"></i>
                    <p>Nenhum dado de atendimento</p>
                    <button class="btn btn-success" onclick="instagramReport.addAttendanceRow()">
                        <i class="fas fa-plus"></i> Adicionar Primeiro Dia
                    </button>
                </div>
            `;
            return;
        }
        
        const items = this.data.attendance.map((item, index) => `
            <div class="mobile-card" data-index="${index}">
                <div class="card-header">
                    <h4>${this.formatDateForMobile(item.date)}</h4>
                    <button class="delete-btn-mobile" onclick="instagramReport.deleteAttendanceRow(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="card-content">
                    <div class="mobile-row">
                        <span class="label">Mensagens:</span>
                        <input type="number" value="${item.messages}" 
                               onchange="instagramReport.updateAttendanceField(${index}, 'messages', this.value)"
                               class="mobile-input miui-input-fix">
                    </div>
                    <div class="mobile-row">
                        <span class="label">Respostas:</span>
                        <input type="number" value="${item.replies}" 
                               onchange="instagramReport.updateAttendanceField(${index}, 'replies', this.value)"
                               class="mobile-input miui-input-fix">
                    </div>
                    <div class="mobile-row">
                        <span class="label">Reservas:</span>
                        <input type="number" value="${item.reservations}" 
                               onchange="instagramReport.updateAttendanceField(${index}, 'reservations', this.value)"
                               class="mobile-input miui-input-fix">
                    </div>
                    <div class="mobile-row">
                        <span class="label">Orçamentos:</span>
                        <input type="number" value="${item.budgets}" 
                               onchange="instagramReport.updateAttendanceField(${index}, 'budgets', this.value)"
                               class="mobile-input miui-input-fix">
                    </div>
                    <div class="mobile-row">
                        <span class="label">Perdidos:</span>
                        <input type="number" value="${item.lost}" 
                               onchange="instagramReport.updateAttendanceField(${index}, 'lost', this.value)"
                               class="mobile-input miui-input-fix">
                    </div>
                    <div class="mobile-row-full">
                        <span class="label">Observações:</span>
                        <textarea onchange="instagramReport.updateAttendanceField(${index}, 'observations', this.value)"
                                  class="mobile-textarea miui-input-fix" placeholder="Adicione observações...">${item.observations}</textarea>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = items;
    }
    
    renderContentForMobile() {
        const container = this.elements.contentMobile;
        if (!container) return;
        
        if (this.data.content.length === 0) {
            container.innerHTML = `
                <div class="empty-state-mobile">
                    <i class="fas fa-photo-video fa-2x"></i>
                    <p>Nenhum dado de conteúdo</p>
                    <button class="btn btn-success" onclick="instagramReport.addContentRow()">
                        <i class="fas fa-plus"></i> Adicionar Primeiro Dia
                    </button>
                </div>
            `;
            return;
        }
        
        const items = this.data.content.map((item, index) => `
            <div class="mobile-card" data-index="${index}">
                <div class="card-header">
                    <h4>${this.formatDateForMobile(item.date)}</h4>
                    <button class="delete-btn-mobile" onclick="instagramReport.deleteContentRow(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="card-content">
                    <div class="mobile-row">
                        <span class="label">Stories:</span>
                        <input type="number" value="${item.stories}" 
                               onchange="instagramReport.updateContentField(${index}, 'stories', this.value)"
                               class="mobile-input miui-input-fix">
                    </div>
                    <div class="mobile-row">
                        <span class="label">Reels:</span>
                        <input type="number" value="${item.reels}" 
                               onchange="instagramReport.updateContentField(${index}, 'reels', this.value)"
                               class="mobile-input miui-input-fix">
                    </div>
                    <div class="mobile-row">
                        <span class="label">Views Stories:</span>
                        <input type="number" value="${item.storyViews}" 
                               onchange="instagramReport.updateContentField(${index}, 'storyViews', this.value)"
                               class="mobile-input miui-input-fix">
                    </div>
                    <div class="mobile-row">
                        <span class="label">Views Reels:</span>
                        <input type="number" value="${item.reelViews}" 
                               onchange="instagramReport.updateContentField(${index}, 'reelViews', this.value)"
                               class="mobile-input miui-input-fix">
                    </div>
                    <div class="mobile-row">
                        <span class="label">Engajamento:</span>
                        <input type="number" value="${item.engagement}" 
                               onchange="instagramReport.updateContentField(${index}, 'engagement', this.value)"
                               class="mobile-input miui-input-fix">
                    </div>
                    <div class="mobile-row-full">
                        <span class="label">Observações:</span>
                        <textarea onchange="instagramReport.updateContentField(${index}, 'observations', this.value)"
                                  class="mobile-textarea miui-input-fix" placeholder="Adicione observações...">${item.observations}</textarea>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = items;
    }
    
    formatDateForMobile(dateString) {
        try {
            const date = new Date(dateString);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (date.toDateString() === today.toDateString()) {
                return 'Hoje';
            } else if (date.toDateString() === yesterday.toDateString()) {
                return 'Ontem';
            } else {
                return date.toLocaleDateString('pt-BR', { 
                    weekday: 'short', 
                    day: '2-digit', 
                    month: 'short' 
                });
            }
        } catch (e) {
            return dateString;
        }
    }
    
    updateAttendanceField(index, field, value) {
        if (index >= 0 && index < this.data.attendance.length) {
            this.data.attendance[index][field] = field === 'date' ? value : 
                field === 'observations' ? value : Number(value) || 0;
            this.updateStatistics();
            this.saveData();
        }
    }
    
    updateContentField(index, field, value) {
        if (index >= 0 && index < this.data.content.length) {
            this.data.content[index][field] = field === 'date' ? value : 
                field === 'observations' ? value : Number(value) || 0;
            this.updateStatistics();
            this.saveData();
        }
    }
    
    deleteAttendanceRow(index) {
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            this.data.attendance.splice(index, 1);
            this.renderAttendanceTable();
            this.saveData();
            this.showNotification('Registro excluído');
        }
    }
    
    deleteContentRow(index) {
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            this.data.content.splice(index, 1);
            this.renderContentTable();
            this.saveData();
            this.showNotification('Registro excluído');
        }
    }
    
    updateStatistics() {
        const attendance = this.data.attendance;
        const content = this.data.content;
        
        const totals = {
            messages: attendance.reduce((sum, item) => sum + (item.messages || 0), 0),
            replies: attendance.reduce((sum, item) => sum + (item.replies || 0), 0),
            reservations: attendance.reduce((sum, item) => sum + (item.reservations || 0), 0),
            budgets: attendance.reduce((sum, item) => sum + (item.budgets || 0), 0),
            lost: attendance.reduce((sum, item) => sum + (item.lost || 0), 0),
            stories: content.reduce((sum, item) => sum + (item.stories || 0), 0),
            reels: content.reduce((sum, item) => sum + (item.reels || 0), 0),
            storyViews: content.reduce((sum, item) => sum + (item.storyViews || 0), 0),
            reelViews: content.reduce((sum, item) => sum + (item.reelViews || 0), 0)
        };
        
        const potentialClients = totals.reservations + totals.budgets;
        const conversionRate = totals.messages > 0 ? 
            ((potentialClients / totals.messages) * 100).toFixed(1) : '0.0';
        
        const engagementValues = content.filter(item => item.engagement > 0).map(item => item.engagement);
        const avgEngagement = engagementValues.length > 0 ? 
            (engagementValues.reduce((a, b) => a + b, 0) / engagementValues.length).toFixed(1) : '0.0';
        
        this.stats.totalMessages.textContent = totals.messages;
        this.stats.totalReplies.textContent = totals.replies;
        this.stats.totalReservations.textContent = totals.reservations;
        this.stats.totalBudgets.textContent = totals.budgets;
        this.stats.totalLost.textContent = totals.lost;
        this.stats.conversionRate.textContent = `${conversionRate}%`;
        
        this.stats.totalStories.textContent = totals.stories;
        this.stats.totalReels.textContent = totals.reels;
        this.stats.totalStoryViews.textContent = totals.storyViews;
        this.stats.totalReelViews.textContent = totals.reelViews;
        this.stats.avgEngagement.textContent = `${avgEngagement}%`;
        
        this.stats.statMessages.textContent = totals.messages;
        this.stats.statReplies.textContent = totals.replies;
        this.stats.statPotential.textContent = potentialClients;
        this.stats.statEngagement.textContent = `${avgEngagement}%`;
        
        if (this.stats.legendMessages) {
            this.stats.legendMessages.textContent = totals.messages;
        }
        
        if (this.stats.legendPotential) {
            this.stats.legendPotential.textContent = potentialClients;
        }
        
        this.updatePerformanceIndicator(avgEngagement);
        this.updateDataCount();
    }
    
    updatePerformanceIndicator(engagement) {
        const indicator = this.stats.performanceLevel;
        if (!indicator) return;
        
        const eng = parseFloat(engagement);
        if (eng >= 5) {
            indicator.textContent = 'Excelente';
            indicator.className = 'performance-good';
        } else if (eng >= 3) {
            indicator.textContent = 'Bom';
            indicator.className = 'performance-good';
        } else if (eng >= 2) {
            indicator.textContent = 'Regular';
            indicator.className = 'performance-regular';
        } else {
            indicator.textContent = 'Melhorar';
            indicator.className = 'performance-low';
        }
    }
    
    updateDataCount() {
        const total = this.data.attendance.length + this.data.content.length;
        if (this.elements.dataCount) {
            this.elements.dataCount.textContent = `${total} registros`;
        }
    }
    
    updateLastSaveTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        if (this.elements.lastSaveTime) {
            this.elements.lastSaveTime.textContent = `Último: ${timeStr}`;
        }
    }
    
    saveData() {
        const saveData = {
            attendance: this.data.attendance,
            content: this.data.content,
            highlights: this.data.highlights,
            week: this.data.week,
            savedAt: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('instagramReportData', JSON.stringify(saveData));
        } catch (e) {
            this.showNotification('Erro ao salvar dados. Espaço de armazenamento pode estar cheio.', 'error');
        }
    }
    
    loadSavedData() {
        try {
            const saved = localStorage.getItem('instagramReportData');
            if (saved) {
                const data = JSON.parse(saved);
                
                this.data.attendance = data.attendance || [];
                this.data.content = data.content || [];
                this.data.highlights = data.highlights || {
                    bestStory: '',
                    bestReel: '',
                    suggestions: ''
                };
                this.data.week = data.week || this.currentWeek;
                
                this.elements.weekInput.value = this.data.week;
                this.elements.bestStory.value = this.data.highlights.bestStory || '';
                this.elements.bestReel.value = this.data.highlights.bestReel || '';
                this.elements.suggestions.value = this.data.highlights.suggestions || '';
                
                this.renderTablesForDevice();
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }
    
    clearData() {
        if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
            this.data.attendance = [];
            this.data.content = [];
            this.data.highlights = {
                bestStory: '',
                bestReel: '',
                suggestions: ''
            };
            
            this.elements.bestStory.value = '';
            this.elements.bestReel.value = '';
            this.elements.suggestions.value = '';
            
            this.renderTablesForDevice();
            this.saveData();
            
            this.showNotification('Todos os dados foram limpos');
        }
    }
    
    startNewWeek() {
        if (confirm('Iniciar uma nova semana? Os dados atuais serão mantidos.')) {
            const nextWeek = this.getNextWeek();
            this.data.week = nextWeek;
            this.elements.weekInput.value = nextWeek;
            this.saveData();
            this.showNotification('Nova semana iniciada');
        }
    }
    
    getNextWeek() {
        const [year, week] = this.data.week.split('-W');
        let nextYear = parseInt(year);
        let nextWeek = parseInt(week) + 1;
        
        if (nextWeek > 52) {
            nextWeek = 1;
            nextYear++;
        }
        
        return `${nextYear}-W${nextWeek.toString().padStart(2, '0')}`;
    }
    
    generateReport() {
        const reportWindow = window.open('', '_blank');
        if (!reportWindow) {
            this.showNotification('Por favor, permita pop-ups para gerar o relatório', 'error');
            return;
        }
        
        const reportDate = new Date().toLocaleDateString('pt-BR');
        const [year, weekNum] = this.data.week.split('-W');
        
        const attendanceRows = this.data.attendance.map(item => `
            <tr>
                <td>${new Date(item.date).toLocaleDateString('pt-BR')}</td>
                <td>${item.messages}</td>
                <td>${item.replies}</td>
                <td>${item.reservations}</td>
                <td>${item.budgets}</td>
                <td>${item.lost}</td>
                <td>${item.observations}</td>
            </tr>
        `).join('');
        
        const contentRows = this.data.content.map(item => `
            <tr>
                <td>${new Date(item.date).toLocaleDateString('pt-BR')}</td>
                <td>${item.stories}</td>
                <td>${item.reels}</td>
                <td>${item.storyViews}</td>
                <td>${item.reelViews}</td>
                <td>${item.engagement}%</td>
                <td>${item.observations}</td>
            </tr>
        `).join('');
        
        reportWindow.document.write(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Relatório Instagram - Semana ${weekNum} de ${year}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 40px; 
                        line-height: 1.6;
                        color: #333;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 40px; 
                        border-bottom: 3px solid #1a365d;
                        padding-bottom: 20px;
                    }
                    h1 { 
                        color: #1a365d; 
                        margin-bottom: 10px;
                        font-size: 28px;
                    }
                    h2 { 
                        color: #2c5282; 
                        margin-bottom: 15px;
                        font-size: 22px;
                    }
                    h3 { 
                        color: #1a365d;
                        background: #f7fafc;
                        padding: 12px 15px;
                        border-radius: 6px;
                        margin: 30px 0 15px;
                        border-left: 4px solid #dd6b20;
                    }
                    .section { 
                        margin: 30px 0; 
                        page-break-inside: avoid;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 20px 0;
                        font-size: 14px;
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 12px; 
                        text-align: left; 
                    }
                    th { 
                        background-color: #2c5282; 
                        color: white; 
                        font-weight: 600;
                    }
                    tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    .summary { 
                        background: #f7fafc; 
                        padding: 25px; 
                        border-radius: 8px;
                        border: 1px solid #e2e8f0;
                        margin: 30px 0;
                    }
                    .summary-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                        margin-top: 20px;
                    }
                    .summary-item {
                        background: white;
                        padding: 15px;
                        border-radius: 6px;
                        border: 1px solid #e2e8f0;
                        text-align: center;
                    }
                    .summary-value {
                        font-size: 24px;
                        font-weight: bold;
                        color: #2c5282;
                        display: block;
                        margin-bottom: 5px;
                    }
                    .summary-label {
                        font-size: 14px;
                        color: #4a5568;
                    }
                    .footer { 
                        margin-top: 50px; 
                        text-align: center; 
                        color: #666;
                        font-size: 14px;
                        border-top: 1px solid #ddd;
                        padding-top: 20px;
                    }
                    .highlight-box {
                        background: #fff3cd;
                        border: 1px solid #ffeaa7;
                        border-radius: 6px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .print-info {
                        background: #e8f4fc;
                        padding: 15px;
                        border-radius: 6px;
                        margin-bottom: 20px;
                        font-size: 14px;
                    }
                    @media print {
                        body { margin: 20px; }
                        .header { border-bottom: 2px solid #1a365d; }
                        h1 { font-size: 24px; }
                        h2 { font-size: 20px; }
                        h3 { font-size: 18px; }
                        table { font-size: 12px; }
                        .summary-grid { grid-template-columns: 1fr 1fr; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Relatório Semanal - Instagram</h1>
                    <h2>Material para Construção - Nossa Senhora da Conceição</h2>
                    <div class="print-info">
                        <p><strong>Semana:</strong> ${weekNum ? `Semana ${weekNum} de ${year}` : this.data.week} | 
                           <strong>Gerado por:</strong> Iandra Jamille | 
                           <strong>Data:</strong> ${reportDate}</p>
                    </div>
                </div>
                
                <div class="section">
                    <h3>📞 Atendimento - Direct & Mensagens</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Dia</th>
                                <th>Mensagens</th>
                                <th>Respostas</th>
                                <th>Reservas</th>
                                <th>Orçamentos</th>
                                <th>Perdidos</th>
                                <th>Observações</th>
                            </tr>
                        </thead>
                        <tbody>${attendanceRows}</tbody>
                        <tfoot>
                            <tr style="background-color: #e8f4fc; font-weight: bold;">
                                <td>Totais:</td>
                                <td>${this.stats.totalMessages.textContent}</td>
                                <td>${this.stats.totalReplies.textContent}</td>
                                <td>${this.stats.totalReservations.textContent}</td>
                                <td>${this.stats.totalBudgets.textContent}</td>
                                <td>${this.stats.totalLost.textContent}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <div class="section">
                    <h3>📱 Conteúdo Postado (Story & Reels)</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Dia</th>
                                <th>Stories</th>
                                <th>Reels</th>
                                <th>Views Stories</th>
                                <th>Views Reels</th>
                                <th>Engajamento</th>
                                <th>Observações</th>
                            </tr>
                        </thead>
                        <tbody>${contentRows}</tbody>
                        <tfoot>
                            <tr style="background-color: #e8f4fc; font-weight: bold;">
                                <td>Totais/Médias:</td>
                                <td>${this.stats.totalStories.textContent}</td>
                                <td>${this.stats.totalReels.textContent}</td>
                                <td>${this.stats.totalStoryViews.textContent}</td>
                                <td>${this.stats.totalReelViews.textContent}</td>
                                <td>${this.stats.avgEngagement.textContent}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <div class="summary">
                    <h3>📊 Resumo da Semana</h3>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span class="summary-value">${this.stats.statMessages.textContent}</span>
                            <span class="summary-label">Mensagens Recebidas</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-value">${this.stats.statReplies.textContent}</span>
                            <span class="summary-label">Respostas Enviadas</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-value">${this.stats.statPotential.textContent}</span>
                            <span class="summary-label">Clientes em Potencial</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-value">${this.stats.conversionRate.textContent}</span>
                            <span class="summary-label">Taxa de Conversão</span>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h3>⭐ Destaques da Semana</h3>
                    <div class="highlight-box">
                        <p><strong>🎯 Story com mais visualizações:</strong> ${this.data.highlights.bestStory || 'Não informado'}</p>
                        <p><strong>🏆 Reels com melhor desempenho:</strong> ${this.data.highlights.bestReel || 'Não informado'}</p>
                        <p><strong>💡 Sugestões para próxima semana:</strong> ${this.data.highlights.suggestions || 'Não informado'}</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Sistema de Relatório Instagram &copy; ${new Date().getFullYear()}</p>
                    <p>Gerado para Iandra Jamille - Auxiliar de Marketing | Material para Construção</p>
                    <p class="no-print">Para melhor visualização, use o modo de impressão do navegador (Ctrl+P)</p>
                </div>
                
                <script>
                    window.onload = function() {
                        setTimeout(() => window.print(), 500);
                    };
                </script>
            </body>
            </html>
        `);
        
        reportWindow.document.close();
        this.showNotification('Relatório gerado com sucesso');
    }
    
    exportData() {
        const exportData = {
            ...this.data,
            exportedAt: new Date().toISOString(),
            exportedBy: 'Iandra Jamille',
            system: 'Sistema de Relatório Instagram - Material para Construção'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `relatorio-instagram-${this.data.week}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('Dados exportados com sucesso');
    }
    
    showNotification(message, type = 'success') {
        const notification = this.elements.notification;
        if (!notification) return;
        
        const icon = notification.querySelector('i');
        const text = notification.querySelector('.notification-text');
        
        text.textContent = message;
        
        switch(type) {
            case 'success':
                icon.className = 'fas fa-check-circle';
                notification.style.background = 'var(--success)';
                break;
            case 'error':
                icon.className = 'fas fa-exclamation-circle';
                notification.style.background = 'var(--danger)';
                break;
            case 'warning':
                icon.className = 'fas fa-exclamation-triangle';
                notification.style.background = 'var(--warning)';
                break;
            default:
                icon.className = 'fas fa-info-circle';
                notification.style.background = 'var(--info)';
        }
        
        notification.classList.remove('hidden');
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 300);
        }, 3000);
    }
    
    updateUI() {
        this.updateStatistics();
        this.updateLastSaveTime();
        this.updateDataCount();
    }
    
    setCurrentYear() {
        if (this.elements.currentYear) {
            this.elements.currentYear.textContent = new Date().getFullYear();
        }
    }
}

let instagramReport;

document.addEventListener('DOMContentLoaded', () => {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Carregando sistema para Iandra...</div>
    `;
    document.body.appendChild(loadingOverlay);
    
    setTimeout(() => {
        loadingOverlay.classList.add('active');
        
        setTimeout(() => {
            instagramReport = new InstagramReportSystem();
            window.instagramReport = instagramReport;
            
            loadingOverlay.classList.remove('active');
            setTimeout(() => {
                loadingOverlay.remove();
            }, 300);
        }, 800);
    }, 100);
    
    if ('ontouchstart' in window) {
        document.querySelectorAll('button, .btn').forEach(button => {
            button.style.minHeight = '44px';
            button.style.minWidth = '44px';
            
            button.addEventListener('touchstart', function(e) {
                const touch = e.touches[0];
                const rect = this.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                
                const ripple = document.createElement('span');
                ripple.className = 'touch-ripple';
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
        
        // Correção específica para MIUI
        const isMIUI = /miui|redmi|xiaomi/i.test(navigator.userAgent);
        
        document.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                e.target.style.fontSize = '16px';
                
                if (isMIUI) {
                    setTimeout(() => {
                        e.target.focus();
                    }, 50);
                }
            }
        }, { passive: true });
    }
});