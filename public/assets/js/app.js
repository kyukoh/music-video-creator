/**
 * Music Video Creator - Main JavaScript Application
 */

// グローバル状態管理
const AppState = {
    currentProject: null,
    currentScene: null,
    isLoading: false,
    sidebarOpen: false
};

// API ユーティリティ
const API = {
    async get(url, params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const fullUrl = queryString ? `${url}?${queryString}` : url;
            
            console.log('API.get:', fullUrl);
            
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const text = await response.text();
            console.log('API response text:', text);
            
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse JSON:', e, 'Raw text:', text);
                return { success: false, error: { message: 'Invalid JSON response' } };
            }
        } catch (error) {
            console.error('API.get error:', error);
            return { success: false, error: { message: error.message } };
        }
    },
    
    async post(url, data = {}) {
        try {
            console.log('API.post:', url, data);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const text = await response.text();
            console.log('API POST response text:', text);
            
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse JSON:', e, 'Raw text:', text);
                return { success: false, error: { message: 'Invalid JSON response' } };
            }
        } catch (error) {
            console.error('API.post error:', error);
            return { success: false, error: { message: error.message } };
        }
    },
    
    async put(url, data = {}) {
        try {
            console.log('API.put:', url, data);
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const text = await response.text();
            console.log('API PUT response text:', text);
            
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse JSON:', e, 'Raw text:', text);
                return { success: false, error: { message: 'Invalid JSON response' } };
            }
        } catch (error) {
            console.error('API.put error:', error);
            return { success: false, error: { message: error.message } };
        }
    },
    
    async delete(url, params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const fullUrl = queryString ? `${url}?${queryString}` : url;
            
            console.log('API.delete:', fullUrl);
            
            const response = await fetch(fullUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const text = await response.text();
            console.log('API DELETE response text:', text);
            
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse JSON:', e, 'Raw text:', text);
                return { success: false, error: { message: 'Invalid JSON response' } };
            }
        } catch (error) {
            console.error('API.delete error:', error);
            return { success: false, error: { message: error.message } };
        }
    }
};

// ユーティリティ関数
const Utils = {
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let unitIndex = 0;
        
        while (bytes >= 1024 && unitIndex < units.length - 1) {
            bytes /= 1024;
            unitIndex++;
        }
        
        return Math.round(bytes * 100) / 100 + ' ' + units[unitIndex];
    },
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP') + ' ' + date.toLocaleTimeString('ja-JP');
    }
};

// ローディング管理
const Loading = {
    show(message = '読み込み中...') {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            const messageElement = overlay.querySelector('span');
            if (messageElement) {
                messageElement.textContent = message;
            }
            overlay.classList.remove('hidden');
        }
        AppState.isLoading = true;
    },
    
    hide() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
        AppState.isLoading = false;
    }
};

// 通知管理
const Notification = {
    maxNotifications: 3,  // 最大表示数
    
    show(message, type = 'info', duration = 3000) {  // デフォルトを短く
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        // 古い通知を削除
        const existingNotifications = container.querySelectorAll('.notification');
        if (existingNotifications.length >= this.maxNotifications) {
            // 最も古い通知を削除
            this.remove(existingNotifications[0]);
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type} flex items-center justify-between p-3 rounded-lg mb-2 shadow-lg transition-all transform translate-x-0`;
        notification.style.animation = 'slideInLeft 0.3s ease-out';
        notification.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${this.getIcon(type)}
                </svg>
                <span class="text-sm">${Utils.escapeHtml(message)}</span>
            </div>
            <button class="ml-4 text-white hover:text-gray-200 transition-colors flex-shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;
        
        // 閉じるボタンのイベント
        notification.querySelector('button').addEventListener('click', () => {
            this.remove(notification);
        });
        
        container.appendChild(notification);
        
        // 自動削除
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }
    },
    
    success(message, duration = 3000) {
        this.show(message, 'success', duration);
    },
    
    error(message, duration = 5000) {
        this.show(message, 'error', duration);
    },
    
    warning(message, duration = 4000) {
        this.show(message, 'warning', duration);
    },
    
    info(message, duration = 3000) {
        this.show(message, 'info', duration);
    },
    
    remove(notification) {
        if (!notification) return;
        notification.style.animation = 'slideOutLeft 0.3s ease-in-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    },
    
    clearAll() {
        const container = document.getElementById('notification-container');
        if (container) {
            container.innerHTML = '';
        }
    },
    
    getIcon(type) {
        const icons = {
            success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>',
            error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>',
            warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>',
            info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
        };
        return icons[type] || icons.info;
    }
};

// モーダル管理
const Modal = {
    create(title, content, maxWidth = 'max-w-2xl') {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return null;
        
        const modalHTML = `
            <div class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div class="modal-content bg-white rounded-lg shadow-xl ${maxWidth} w-full max-h-screen overflow-y-auto">
                    <div class="modal-header flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 class="text-xl font-semibold text-gray-900">${title}</h2>
                        <button class="modal-close text-gray-400 hover:text-gray-600 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body p-6">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        modalContainer.innerHTML = modalHTML;
        modalContainer.classList.remove('hidden');
        
        // 閉じるボタンのイベント
        const closeBtn = modalContainer.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        // 背景クリックで閉じる
        const backdrop = modalContainer.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.close();
                }
            });
        }
        
        // ESCキーで閉じる
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.close();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        return modalContainer;
    },
    
    show(content, maxWidth = 'max-w-4xl') {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return null;
        
        const modalHTML = `
            <div class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div class="modal-content bg-white rounded-lg shadow-xl ${maxWidth} w-full max-h-[90vh] overflow-y-auto">
                    <button class="modal-close absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    <div class="p-6">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        modalContainer.innerHTML = modalHTML;
        modalContainer.classList.remove('hidden');
        
        // 閉じるボタンのイベント
        const closeBtn = modalContainer.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        // 背景クリックで閉じる
        const backdrop = modalContainer.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.close();
                }
            });
        }
        
        // ESCキーで閉じる
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.close();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        return modalContainer;
    },
    
    close() {
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
            modalContainer.classList.add('hidden');
            modalContainer.innerHTML = '';
        }
    }
};

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - Starting app initialization');
    
    // UI初期化
    console.log('Initializing UI...');
    initializeUI();
    
    // プロジェクト一覧の読み込み
    console.log('Loading project list...');
    loadProjectList();
    
    // エクスポート/インポートボタンのイベントリスナー
    console.log('Initializing export/import...');
    initializeExportImport();
    
    console.log('App initialization complete');
});

/**
 * エクスポート/インポート機能の初期化
 */
function initializeExportImport() {
    const exportBtn = document.getElementById('export-project-btn');
    const importBtn = document.getElementById('import-project-btn');
    
    // エクスポートボタンのイベント
    if (exportBtn) {
        exportBtn.addEventListener('click', handleProjectExport);
    }
    
    // インポートボタンのイベント
    if (importBtn) {
        importBtn.addEventListener('click', handleProjectImport);
    }
}

/**
 * プロジェクトのエクスポート処理
 */
function handleProjectExport() {
    if (!AppState.currentProject) {
        Notification.error('エクスポートするプロジェクトを選択してください');
        return;
    }
    
    // 確認ダイアログ
    if (!confirm(`プロジェクト「${AppState.currentProject.name}」をエクスポートしますか？`)) {
        return;
    }
    
    // エクスポート処理
    Loading.show('プロジェクトをエクスポート中...');
    
    // ダウンロード用のリンクを作成
    const downloadLink = document.createElement('a');
    downloadLink.href = `api/export.php?project_id=${AppState.currentProject.id}`;
    downloadLink.download = `${AppState.currentProject.name}_${new Date().toISOString().slice(0,10)}.zip`;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    setTimeout(() => {
        Loading.hide();
        Notification.success('プロジェクトのエクスポートを開始しました');
    }, 1000);
}

/**
 * プロジェクトのインポート処理
 */
function handleProjectImport() {
    // ファイル選択用のinput要素を作成
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.zip';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        
        // ファイルタイプの検証
        if (!file.name.toLowerCase().endsWith('.zip')) {
            Notification.error('ZIPファイルを選択してください');
            return;
        }
        
        // ファイルサイズの検証（500MB制限）
        const maxSize = 500 * 1024 * 1024;
        if (file.size > maxSize) {
            Notification.error('ファイルサイズが大きすぎます（500MB制限）');
            return;
        }
        
        try {
            Loading.show('プロジェクトをインポート中...');
            
            const formData = new FormData();
            formData.append('project_file', file);
            
            const response = await fetch('api/import.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                Notification.success(result.message || 'プロジェクトのインポートが完了しました');
                
                // プロジェクト一覧を再読み込み
                await loadProjectList();
                
                // インポートしたプロジェクトを選択
                if (result.project_id) {
                    selectProject(result.project_id);
                }
            } else {
                throw new Error(result.error || 'インポートに失敗しました');
            }
        } catch (error) {
            console.error('Import error:', error);
            Notification.error(error.message || 'インポートに失敗しました');
        } finally {
            Loading.hide();
        }
    });
    
    // ファイル選択ダイアログを表示
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}

/**
 * UI初期化
 */
function initializeUI() {
    // モバイルメニューの初期化
    initializeMobileMenu();
    
    // イベントリスナーの設定
    setupEventListeners();
    
    // レスポンシブ対応
    handleResize();
    window.addEventListener('resize', handleResize);
}

/**
 * モバイルメニューの初期化
 */
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleSidebar);
    }
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // サイドバー外クリックで閉じる
    document.addEventListener('click', function(e) {
        if (AppState.sidebarOpen && 
            sidebar && !sidebar.contains(e.target) && 
            mobileMenuBtn && !mobileMenuBtn.contains(e.target)) {
            closeSidebar();
        }
    });
}

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
    // 新規プロジェクトボタン
    const newProjectBtn = document.getElementById('new-project-btn');
    const getStartedBtn = document.getElementById('get-started-btn');
    
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', showCreateProjectModal);
    }
    
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', showCreateProjectModal);
    }
}

/**
 * レスポンシブ対応
 */
function handleResize() {
    const sidebar = document.getElementById('sidebar');
    const width = window.innerWidth;
    
    if (width >= 768 && sidebar) {
        // デスクトップ表示
        sidebar.classList.remove('open');
        AppState.sidebarOpen = false;
        removeSidebarOverlay();
    }
}

/**
 * サイドバーの開閉
 */
function toggleSidebar() {
    if (AppState.sidebarOpen) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.add('open');
        AppState.sidebarOpen = true;
        
        // オーバーレイを追加（モバイル時）
        if (window.innerWidth < 768) {
            addSidebarOverlay();
        }
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
        AppState.sidebarOpen = false;
        removeSidebarOverlay();
    }
}

function addSidebarOverlay() {
    if (!document.getElementById('sidebar-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'sidebar-overlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-25';
        overlay.addEventListener('click', closeSidebar);
        document.body.appendChild(overlay);
    }
}

function removeSidebarOverlay() {
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
        overlay.remove();
    }
}

async function loadProjectList() {
    console.log('Loading project list...');
    try {
        Loading.show();
        console.log('Fetching from api/projects.php');
        const response = await API.get('api/projects.php');
        console.log('API response:', response);
        
        if (response.success) {
            renderProjectList(response.data || []);
            Notification.success('プロジェクト一覧を読み込みました');
        } else {
            console.error('API error:', response);
            throw new Error(response.error?.message || 'プロジェクト一覧の読み込みに失敗しました');
        }
    } catch (error) {
        console.error('loadProjectList error:', error);
        Notification.error('プロジェクト一覧の読み込みに失敗しました');
        renderProjectList([]);
    } finally {
        Loading.hide();
    }
}

/**
 * プロジェクト一覧の描画
 */
function renderProjectList(projects) {
    const projectList = document.getElementById('project-list');
    
    if (!projects || projects.length === 0) {
        projectList.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                <p class="text-sm">プロジェクトがありません</p>
            </div>
        `;
        return;
    }
    
    const projectsHTML = projects.map(project => `
        <div class="project-item" data-project-id="${project.id}">
            <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-medium text-gray-900 truncate">${Utils.escapeHtml(project.name)}</h3>
                    <div class="flex items-center space-x-2 mt-1">
                        ${project.notes ? `<p class="text-xs text-gray-500 truncate">${Utils.escapeHtml(project.notes)}</p>` : ''}
                        <span class="text-xs text-gray-400 font-mono" title="Project ID">${project.id}</span>
                    </div>
                </div>
                <div class="flex items-center space-x-1 ml-2">
                    <button class="edit-project-btn p-1 text-gray-400 hover:text-gray-600 transition-colors" data-project-id="${project.id}" title="編集">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button class="delete-project-btn p-1 text-gray-400 hover:text-red-600 transition-colors" data-project-id="${project.id}" title="削除">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    projectList.innerHTML = projectsHTML;
    
    // イベントリスナーを追加
    projectList.querySelectorAll('.project-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!e.target.closest('button')) {
                const projectId = this.dataset.projectId;
                selectProject(projectId);
            }
        });
    });
    
    projectList.querySelectorAll('.edit-project-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const projectId = this.dataset.projectId;
            showEditProjectModal(projectId);
        });
    });
    
    projectList.querySelectorAll('.delete-project-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const projectId = this.dataset.projectId;
            showDeleteProjectConfirm(projectId);
        });
    });
}

/**
 * プロジェクト選択
 */
async function selectProject(projectId) {
    try {
        Loading.show('プロジェクトを読み込み中...');
        
        // プロジェクト情報を取得
        const projectResponse = await API.get('api/projects.php', { id: projectId });
        
        if (!projectResponse.success) {
            throw new Error(projectResponse.error?.message || 'プロジェクトの読み込みに失敗しました');
        }
        
        // 現在のプロジェクトを設定
        AppState.currentProject = projectResponse.data;
        
        // プロジェクト一覧でアクティブ状態を更新
        updateProjectListSelection(projectId);
        
        // エクスポートボタンを有効化
        const exportBtn = document.getElementById('export-project-btn');
        if (exportBtn) {
            exportBtn.disabled = false;
        }
        
        // シーン一覧画面に遷移
        await loadSceneListView(projectId);
        
        // ページタイトルを更新
        updatePageTitle(AppState.currentProject.name);
        
        // モバイルでサイドバーを閉じる
        if (window.innerWidth < 768) {
            closeSidebar();
        }
        
        Notification.success(`プロジェクト「${AppState.currentProject.name}」を選択しました`);
        
    } catch (error) {
        Notification.error('プロジェクトの選択に失敗しました');
    } finally {
        Loading.hide();
    }
}

/**
 * プロジェクト一覧の選択状態を更新
 */
function updateProjectListSelection(selectedProjectId) {
    const projectItems = document.querySelectorAll('.project-item');
    
    projectItems.forEach(item => {
        const projectId = item.dataset.projectId;
        if (projectId === selectedProjectId) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

/**
 * ページタイトルを更新
 */
function updatePageTitle(title) {
    const pageTitleElement = document.getElementById('page-title');
    if (pageTitleElement) {
        pageTitleElement.textContent = title;
    }
    
    // ブラウザのタイトルも更新
    document.title = `${title} - Music Video Creator`;
}

/**
 * プロジェクト作成モーダルを表示
 */
function showCreateProjectModal() {
    const modalContent = `
        <form id="create-project-form">
            <div class="space-y-4">
                <div>
                    <label for="project-name" class="block text-sm font-medium text-gray-700 mb-2">楽曲名</label>
                    <input type="text" id="project-name" name="name" required
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="楽曲名を入力してください">
                </div>
                <div>
                    <label for="project-notes" class="block text-sm font-medium text-gray-700 mb-2">備考</label>
                    <textarea id="project-notes" name="notes" rows="3"
                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="備考を入力してください（任意）"></textarea>
                </div>
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" onclick="Modal.close()" 
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        キャンセル
                    </button>
                    <button type="submit" 
                            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        作成
                    </button>
                </div>
            </div>
        </form>
    `;
    
    Modal.create('新規プロジェクト作成', modalContent);
    
    // フォーム送信イベント
    document.getElementById('create-project-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const projectData = {
            name: formData.get('name'),
            notes: formData.get('notes') || ''
        };
        
        try {
            Loading.show('プロジェクトを作成中...');
            
            const response = await API.post('api/projects.php', projectData);
            
            if (response.success) {
                Modal.close();
                Notification.success('プロジェクトを作成しました');
                
                // プロジェクト一覧を再読み込み
                await loadProjectList();
                
                // 作成したプロジェクトを選択
                if (response.data && response.data.id) {
                    await selectProject(response.data.id);
                }
            } else {
                throw new Error(response.error?.message || 'プロジェクトの作成に失敗しました');
            }
            
        } catch (error) {
            Notification.error(error.message || 'プロジェクトの作成に失敗しました');
        } finally {
            Loading.hide();
        }
    });
    
    // 楽曲名フィールドにフォーカス
    setTimeout(() => {
        document.getElementById('project-name').focus();
    }, 100);
}

/**
 * シーン一覧画面を読み込み
 */
async function loadSceneListView(projectId) {
    try {
        // シーン一覧を取得
        const scenesResponse = await API.get('api/scenes.php', { project_id: projectId });
        
        if (!scenesResponse.success) {
            throw new Error(scenesResponse.error?.message || 'シーン一覧の読み込みに失敗しました');
        }
        
        // シーン一覧画面を描画
        renderSceneListView(scenesResponse.data || []);
        
    } catch (error) {
        Notification.error('シーン一覧の読み込みに失敗しました');
        
        // エラー時は空のシーン一覧を表示
        renderSceneListView([]);
    }
}

/**
 * メディアライブラリを表示
 */
async function showMediaLibrary() {
    if (!AppState.currentProject) {
        Notification.error('プロジェクトが選択されていません');
        return;
    }
    
    const modalContent = `
        <div class="media-library-container">
            <!-- フィルタータブ -->
            <div class="flex space-x-2 mb-4">
                <button id="filter-all" class="filter-btn active px-4 py-2 text-sm font-medium rounded-md transition-colors">
                    全て
                </button>
                <button id="filter-image" class="filter-btn px-4 py-2 text-sm font-medium rounded-md transition-colors">
                    画像のみ
                </button>
                <button id="filter-video" class="filter-btn px-4 py-2 text-sm font-medium rounded-md transition-colors">
                    動画のみ
                </button>
            </div>
            
            <!-- アップロードエリア -->
            <div id="drop-zone" class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 transition-all">
                <div class="space-y-3">
                    <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <div>
                        <p class="text-lg font-medium text-gray-700">ファイルをドロップしてアップロード</p>
                        <p class="text-sm text-gray-500 mt-1">または</p>
                    </div>
                    <button id="file-select-btn" class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        ファイル選択
                    </button>
                    <input type="file" id="file-input" multiple accept="image/*,video/*" class="hidden">
                </div>
            </div>
            
            <!-- アップロード進捗 -->
            <div id="upload-progress" class="hidden mb-4">
                <div class="bg-gray-200 rounded-full h-2">
                    <div id="upload-progress-bar" class="h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
                <p id="upload-status" class="text-sm text-gray-600 mt-2">アップロード中...</p>
            </div>
            
            <!-- ファイル一覧 -->
            <div class="flex-1 overflow-y-auto">
                <div id="media-grid" class="grid grid-cols-4 gap-4 min-h-64">
                    <!-- ファイルアイテムがここに表示される -->
                    <div class="flex items-center justify-center col-span-4 py-12">
                        <div class="text-center">
                            <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                            <p class="text-gray-500">読み込み中...</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- フッター -->
            <div class="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                <div id="selection-info" class="text-sm text-gray-600">
                    ファイルが選択されていません
                </div>
                <div class="space-x-2">
                    <button id="delete-selected-btn" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        削除
                    </button>
                    <button onclick="Modal.close()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    `;
    
    Modal.create('メディアライブラリ', modalContent, 'max-w-4xl');
    
    // メディアライブラリの初期化
    await initializeMediaLibrary();
}

/**
 * メディアライブラリの初期化
 */
// メディアライブラリのグローバル変数
let currentMediaFilter = 'all';
let selectedMediaFiles = new Set();

async function initializeMediaLibrary() {
    // ローカル変数をグローバル変数に変更
    let currentFilter = currentMediaFilter;
    let selectedFiles = selectedMediaFiles;
    
    // ファイル一覧を読み込み
    await loadMediaFiles(currentFilter);
    
    // フィルターボタンのイベントリスナー
    document.getElementById('filter-all').addEventListener('click', () => setFilter('all'));
    document.getElementById('filter-image').addEventListener('click', () => setFilter('image'));
    document.getElementById('filter-video').addEventListener('click', () => setFilter('video'));
    
    // ファイル選択ボタン
    document.getElementById('file-select-btn').addEventListener('click', () => {
        document.getElementById('file-input').click();
    });
    
    // ファイル入力の変更
    document.getElementById('file-input').addEventListener('change', handleFileSelect);
    
    // ドラッグ&ドロップ
    const dropZone = document.getElementById('drop-zone');
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over', 'bg-blue-50', 'border-blue-400');
        console.log('Drag over');
    });
    
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        if (!dropZone.contains(e.relatedTarget)) {
            dropZone.classList.remove('drag-over', 'bg-blue-50', 'border-blue-400');
        }
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Files dropped:', e.dataTransfer.files.length, 'files');
        dropZone.classList.remove('drag-over', 'bg-blue-50', 'border-blue-400');
        handleFileDrop(e);
    });
    
    // 削除ボタン
    document.getElementById('delete-selected-btn').addEventListener('click', handleDeleteSelected);
    
    // フィルター設定関数
    async function setFilter(filter) {
        currentFilter = filter;
        currentMediaFilter = filter;  // グローバル変数も更新
        
        // フィルターボタンの状態更新
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`filter-${filter}`).classList.add('active');
        
        // ファイル一覧を再読み込み
        await loadMediaFiles(filter);
    }
    
    // ファイル一覧読み込み
    async function loadMediaFiles(filter = 'all') {
        try {
            console.log('Loading media files with filter:', filter);
            console.log('Project ID:', AppState.currentProject?.id);
            
            if (!AppState.currentProject?.id) {
                console.error('No project ID available');
                renderMediaFiles([]);
                return;
            }
            
            const response = await API.get('api/media.php', {
                project_id: AppState.currentProject.id,
                filter: filter
            });
            
            console.log('Media files response:', response);
            
            if (response.success) {
                const files = response.data || response.files || [];
                console.log('Rendering files:', files.length);
                renderMediaFiles(files);
            } else {
                throw new Error(response.error?.message || 'ファイル一覧の読み込みに失敗しました');
            }
        } catch (error) {
            console.error('Error loading media files:', error);
            Notification.error('ファイル一覧の読み込みに失敗しました: ' + error.message);
            renderMediaFiles([]);
        }
    }
    
    // ファイル一覧の描画
    function renderMediaFiles(files) {
        const mediaGrid = document.getElementById('media-grid');
        
        if (!files || files.length === 0) {
            mediaGrid.innerHTML = `
                <div class="flex items-center justify-center col-span-4 py-12 empty-state">
                    <div class="text-center">
                        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        <h4 class="text-lg font-medium text-gray-700 mb-2">ファイルがありません</h4>
                        <p class="text-gray-500">ファイルをアップロードしてください</p>
                    </div>
                </div>
            `;
            return;
        }
        
        const filesHTML = files.map(file => {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');
            const fileUrl = `api/serve-media.php?project_id=${AppState.currentProject.id}&type=${isImage ? 'image' : 'video'}&file_id=${file.id}`;
            
            return `
                <div class="media-item border-2 border-gray-200 rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg" 
                     data-file-id="${file.id}" data-file-type="${isImage ? 'image' : 'video'}">
                    <div class="aspect-square bg-gray-100 relative">
                        ${isImage ? `
                            <img src="${fileUrl}" alt="${file.name}" class="w-full h-full object-cover">
                        ` : `
                            <div class="w-full h-full bg-gray-800 flex items-center justify-center relative">
                                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"></path>
                                </svg>
                                <div class="absolute top-1 left-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                    VIDEO
                                </div>
                            </div>
                        `}
                    </div>
                    
                    <!-- ファイル情報 -->
                    <div class="p-3 bg-white">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="text-sm font-medium text-gray-900 truncate flex-1 mr-2">${file.name}</h4>
                            <button class="delete-file-btn p-1 text-gray-400 hover:text-red-600 transition-colors" 
                                    data-file-id="${file.id}" title="削除">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="flex justify-between text-xs text-gray-500">
                            <span>${Utils.formatFileSize(file.size)}</span>
                            <span>${Utils.formatDate(file.updated_at)}</span>
                        </div>
                    </div>
                    
                    <!-- 選択オーバーレイ -->
                    <div class="selected-overlay absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center opacity-0 transition-opacity">
                        <div class="bg-blue-600 text-white rounded-full p-2">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        mediaGrid.innerHTML = filesHTML;
        
        // ファイルアイテムのイベントリスナー
        mediaGrid.querySelectorAll('.media-item').forEach(item => {
            item.addEventListener('click', function() {
                const fileId = this.dataset.fileId;
                toggleFileSelection(fileId);
            });
        });
        
        // 削除ボタンのイベントリスナー
        mediaGrid.querySelectorAll('.delete-file-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const fileId = this.dataset.fileId;
                deleteFile(fileId);
            });
        });
        
        // 選択状態を更新
        updateSelectionDisplay();
    }
    
    // ファイル選択の切り替え
    function toggleFileSelection(fileId) {
        const item = document.querySelector(`[data-file-id="${fileId}"]`);
        if (!item) return;
        
        if (selectedFiles.has(fileId)) {
            selectedFiles.delete(fileId);
            item.classList.remove('selected');
            item.querySelector('.selected-overlay').style.opacity = '0';
        } else {
            selectedFiles.add(fileId);
            item.classList.add('selected');
            item.querySelector('.selected-overlay').style.opacity = '1';
        }
        
        updateSelectionDisplay();
    }
    
    // 選択状態の表示を更新
    function updateSelectionDisplay() {
        const selectionInfo = document.getElementById('selection-info');
        const deleteBtn = document.getElementById('delete-selected-btn');
        
        if (selectedFiles.size === 0) {
            selectionInfo.textContent = 'ファイルが選択されていません';
            deleteBtn.disabled = true;
        } else {
            selectionInfo.textContent = `${selectedFiles.size}個のファイルが選択されています`;
            deleteBtn.disabled = false;
        }
    }
    
    // ファイル選択処理
    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            uploadFiles(files);
        }
    }
    
    // ファイルドロップ処理
    function handleFileDrop(e) {
        console.log('handleFileDrop called with', e.dataTransfer.files.length, 'files');
        const files = Array.from(e.dataTransfer.files);
        console.log('Files to upload:', files.map(f => ({name: f.name, type: f.type, size: f.size})));
        if (files.length > 0) {
            uploadFiles(files);
        } else {
            console.warn('No files to upload');
        }
    }
    
    // 画像を圧縮する関数
    async function compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // アスペクト比を保ちながらリサイズ
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob(function(blob) {
                        resolve(new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now()
                        }));
                    }, file.type, quality);
                };
            };
            reader.onerror = reject;
        });
    }
    
    // ファイルアップロード処理
    async function uploadFiles(files) {
        console.log('uploadFiles called with', files.length, 'files');
        if (!files || files.length === 0) {
            console.warn('No files provided to uploadFiles');
            return;
        }
        
        // プロジェクトIDの確認
        if (!AppState.currentProject?.id) {
            console.error('No current project ID');
            Notification.error('プロジェクトが選択されていません');
            return;
        }
        
        console.log('Current project ID:', AppState.currentProject.id);
        
        // ファイルサイズの検証（より安全な制限）
        const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB per file（PHPのデフォルトに合わせる）
        const MAX_TOTAL_SIZE = 7 * 1024 * 1024; // 合計7MB（安全マージン）
        
        let totalSize = 0;
        const oversizedFiles = [];
        
        files.forEach(file => {
            totalSize += file.size;
            if (file.size > MAX_FILE_SIZE) {
                oversizedFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
            }
        });
        
        if (oversizedFiles.length > 0) {
            Notification.error(`ファイルサイズが大きすぎます（最大8MB）: ${oversizedFiles.join(', ')}`);;
            Notification.info('より大きなファイルをアップロードするには、サーバー設定を変更してください');
            return;
        }
        
        if (totalSize > MAX_TOTAL_SIZE) {
            Notification.error(`合計ファイルサイズが大きすぎます。一度にアップロードできるのは合計7MBまでです。現在: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
            Notification.info('ファイルを分けてアップロードしてください');
            return;
        }
        
        // ファイルタイプの検証
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mov', 'video/avi', 'video/webm'];
        const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
        
        if (invalidFiles.length > 0) {
            Notification.error(`サポートされていないファイル形式が含まれています: ${invalidFiles.map(f => f.name).join(', ')}`);
            return;
        }
        
        // 大きい画像を圧縮
        const processedFiles = [];
        for (const file of files) {
            if (file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) { // 2MB以上の画像
                try {
                    console.log(`Compressing ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)...`);
                    const compressed = await compressImage(file);
                    console.log(`Compressed to ${(compressed.size / 1024 / 1024).toFixed(2)}MB`);
                    processedFiles.push(compressed);
                } catch (e) {
                    console.error(`Failed to compress ${file.name}:`, e);
                    processedFiles.push(file); // 圧縮失敗時は元ファイルを使用
                }
            } else {
                processedFiles.push(file);
            }
        }
        
        files = processedFiles;
        
        try {
            showUploadProgress();
            updateUploadProgress(0, `${files.length}個のファイルをアップロード中...`);
            
            const formData = new FormData();
            formData.append('project_id', AppState.currentProject.id);
            
            // 大きいファイルは分割してアップロード
            const BATCH_SIZE = 5; // 一度にアップロードするファイル数
            const batches = [];
            
            for (let i = 0; i < files.length; i += BATCH_SIZE) {
                batches.push(files.slice(i, i + BATCH_SIZE));
            }
            
            if (batches.length > 1) {
                Notification.info(`${files.length}個のファイルを${batches.length}回に分けてアップロードします`);
                
                let uploadedCount = 0;
                let errorCount = 0;
                
                for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                    const batch = batches[batchIndex];
                    const batchFormData = new FormData();
                    batchFormData.append('project_id', AppState.currentProject.id);
                    
                    batch.forEach((file) => {
                        batchFormData.append('files[]', file);
                    });
                    
                    updateUploadProgress(
                        (batchIndex / batches.length) * 100,
                        `バッチ ${batchIndex + 1}/${batches.length} をアップロード中...`
                    );
                    
                    try {
                        const response = await fetch('api/media.php', {
                            method: 'POST',
                            body: batchFormData
                        });
                        
                        const responseText = await response.text();
                        const result = JSON.parse(responseText);
                        
                        if (result.success) {
                            uploadedCount += result.success_count || batch.length;
                            errorCount += result.error_count || 0;
                        } else {
                            errorCount += batch.length;
                        }
                    } catch (e) {
                        console.error(`Batch ${batchIndex + 1} failed:`, e);
                        errorCount += batch.length;
                    }
                }
                
                updateUploadProgress(100, 'アップロード完了');
                
                if (uploadedCount > 0) {
                    if (errorCount > 0) {
                        Notification.warning(`${uploadedCount}個のファイルをアップロードしました。${errorCount}個のファイルでエラーが発生しました。`);
                    } else {
                        Notification.success(`${uploadedCount}個のファイルをアップロードしました`);
                    }
                }
                
                setTimeout(async () => {
                    await loadMediaFiles(currentMediaFilter || 'all');
                    hideUploadProgress();
                }, 1000);
                
                return;
            }
            
            // 通常のアップロード（ファイル数が少ない場合）
            files.forEach((file) => {
                formData.append('files[]', file);
            });
            
            console.log('FormData prepared with project_id:', AppState.currentProject.id);
            console.log('Files being uploaded:', files.map(f => f.name));
            
            // アップロード進捗のシミュレーション
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 20;
                if (progress > 90) progress = 90;
                updateUploadProgress(progress, `${files.length}個のファイルをアップロード中...`);
            }, 200);
            
            console.log('Sending POST request to api/media.php...');
            const response = await fetch('api/media.php', {
                method: 'POST',
                body: formData
            });
            
            clearInterval(progressInterval);
            
            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response text:', responseText);
            
            let result;
            try {
                // PHPエラーを含む場合の処理
                if (responseText.includes('Warning') || responseText.includes('Error')) {
                    // PHPエラーメッセージを抽出
                    const errorMatch = responseText.match(/Warning.*?bytes exceeds the limit of (\d+) bytes/);
                    if (errorMatch) {
                        const limitMB = (parseInt(errorMatch[1]) / 1024 / 1024).toFixed(1);
                        throw new Error(`ファイルサイズがサーバーの制限（${limitMB}MB）を超えています。より小さいファイルをアップロードしてください。`);
                    }
                    throw new Error('サーバーエラーが発生しました。ファイルサイズを確認してください。');
                }
                
                // JSONの最初の位置を探す
                const jsonStart = responseText.indexOf('{');
                if (jsonStart !== -1) {
                    const jsonText = responseText.substring(jsonStart);
                    result = JSON.parse(jsonText);
                } else {
                    throw new Error('サーバーからの応答が不正です');
                }
            } catch (e) {
                console.error('Failed to parse response:', e);
                if (e.message.includes('ファイルサイズ')) {
                    throw e;
                }
                throw new Error('サーバーエラー: ' + e.message);
            }
            
            if (result.success) {
                updateUploadProgress(100, 'アップロード完了');
                
                if (result.errors && result.errors.length > 0) {
                    Notification.warning(`${result.success_count}個のファイルをアップロードしました。${result.errors.length}個のファイルでエラーが発生しました。`);
                } else {
                    Notification.success(`${result.success_count}個のファイルをアップロードしました`);
                }
                
                // ファイル一覧を更新
                setTimeout(async () => {
                    await loadMediaFiles(currentMediaFilter || 'all');
                    hideUploadProgress();
                }, 1000);
                
            } else {
                throw new Error(result.error?.message || 'アップロードに失敗しました');
            }
            
        } catch (error) {
            updateUploadProgress(0, 'アップロードに失敗しました');
            Notification.error('ファイルのアップロードに失敗しました: ' + error.message);
            
            setTimeout(() => {
                hideUploadProgress();
            }, 2000);
        }
    }
    
    // アップロード進捗の表示
    function showUploadProgress() {
        const progressContainer = document.getElementById('upload-progress');
        if (progressContainer) {
            progressContainer.classList.remove('hidden');
        }
    }
    
    // アップロード進捗の更新
    function updateUploadProgress(percentage, message) {
        const progressBar = document.getElementById('upload-progress-bar');
        const statusText = document.getElementById('upload-status');
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            
            // 進捗に応じて色を変更
            if (percentage === 100) {
                progressBar.className = 'h-2 rounded-full transition-all duration-300 bg-green-500';
            } else {
                progressBar.className = 'h-2 rounded-full transition-all duration-300 bg-blue-500';
            }
        }
        
        if (statusText) {
            statusText.textContent = message;
        }
    }
    
    // アップロード進捗の非表示
    function hideUploadProgress() {
        const progressContainer = document.getElementById('upload-progress');
        if (progressContainer) {
            progressContainer.classList.add('hidden');
        }
        
        // 進捗をリセット
        updateUploadProgress(0, 'アップロード中...');
    }
    
    // ファイル削除処理
    async function deleteFile(fileId) {
        if (!confirm('このファイルを削除しますか？\n関連するシーンからも自動的に削除されます。')) {
            return;
        }
        
        try {
            Loading.show('ファイルを削除中...');
            
            const response = await API.delete('api/media.php', {
                project_id: AppState.currentProject.id,
                file_id: fileId
            });
            
            if (response.success) {
                Notification.success('ファイルを削除しました');
                
                // 選択状態から削除
                selectedFiles.delete(fileId);
                
                // ファイル一覧を更新
                await loadMediaFiles(currentFilter);
                
            } else {
                throw new Error(response.error?.message || 'ファイルの削除に失敗しました');
            }
            
        } catch (error) {
            Notification.error('ファイルの削除に失敗しました: ' + error.message);
        } finally {
            Loading.hide();
        }
    }
    
    // 選択されたファイルの削除
    async function handleDeleteSelected() {
        if (selectedFiles.size === 0) return;
        
        const fileCount = selectedFiles.size;
        if (!confirm(`選択された${fileCount}個のファイルを削除しますか？\n関連するシーンからも自動的に削除されます。`)) {
            return;
        }
        
        try {
            Loading.show(`${fileCount}個のファイルを削除中...`);
            
            const deletePromises = Array.from(selectedFiles).map(fileId => 
                API.delete('api/media.php', {
                    project_id: AppState.currentProject.id,
                    file_id: fileId
                })
            );
            
            const results = await Promise.allSettled(deletePromises);
            
            let successCount = 0;
            let errorCount = 0;
            
            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value.success) {
                    successCount++;
                } else {
                    errorCount++;
                }
            });
            
            // 結果に応じてメッセージを表示
            if (errorCount === 0) {
                Notification.success(`${successCount}個のファイルを削除しました`);
            } else if (successCount === 0) {
                Notification.error(`${errorCount}個のファイルの削除に失敗しました`);
            } else {
                Notification.warning(`${successCount}個のファイルを削除しました。${errorCount}個のファイルで削除に失敗しました。`);
            }
            
            // 選択状態をクリア
            selectedFiles.clear();
            
            // ファイル一覧を更新
            await loadMediaFiles(currentFilter);
            
        } catch (error) {
            Notification.error('ファイルの削除中にエラーが発生しました');
        } finally {
            Loading.hide();
        }
    }
    
    // ファイル選択の切り替え
    function toggleFileSelection(fileId) {
        if (selectedFiles.has(fileId)) {
            selectedFiles.delete(fileId);
        } else {
            selectedFiles.add(fileId);
        }
        
        // 選択状態の表示更新
        const fileItem = document.querySelector(`[data-file-id="${fileId}"]`);
        if (fileItem) {
            if (selectedFiles.has(fileId)) {
                fileItem.classList.add('selected');
            } else {
                fileItem.classList.remove('selected');
            }
        }
        
        updateSelectionInfo();
    }
    
    // 選択情報の更新
    function updateSelectionInfo() {
        const selectionInfo = document.getElementById('selection-info');
        const deleteBtn = document.getElementById('delete-selected-btn');
        
        if (selectedFiles.size === 0) {
            selectionInfo.textContent = 'ファイルが選択されていません';
            deleteBtn.disabled = true;
        } else {
            selectionInfo.textContent = `${selectedFiles.size}個のファイルが選択されています`;
            deleteBtn.disabled = false;
        }
    }
    
    // ファイル選択処理
    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            uploadFiles(files);
        }
    }
    
    // ファイルドロップ処理
    function handleFileDrop(e) {
        console.log('handleFileDrop called with', e.dataTransfer.files.length, 'files');
        const files = Array.from(e.dataTransfer.files);
        console.log('Files to upload:', files.map(f => ({name: f.name, type: f.type, size: f.size})));
        if (files.length > 0) {
            uploadFiles(files);
        } else {
            console.warn('No files to upload');
        }
    }
    
    // 重複した関数を削除（上のバージョンを使用）
    
    // ファイル削除処理
    async function deleteFile(fileId) {
        if (!confirm('このファイルを削除しますか？\n関連するシーンからも自動的に削除されます。')) {
            return;
        }
        
        try {
            Loading.show('ファイルを削除中...');
            
            const response = await API.delete('api/media.php', {
                project_id: AppState.currentProject.id,
                file_id: fileId
            });
            
            if (response.success) {
                Notification.success('ファイルを削除しました');
                
                // 選択状態から削除
                selectedFiles.delete(fileId);
                
                // ファイル一覧を更新
                await loadMediaFiles(currentFilter);
                
            } else {
                throw new Error(response.error?.message || 'ファイルの削除に失敗しました');
            }
            
        } catch (error) {
            Notification.error('ファイルの削除に失敗しました: ' + error.message);
        } finally {
            Loading.hide();
        }
    }
    
    // 選択されたファイルの削除
    async function handleDeleteSelected() {
        if (selectedFiles.size === 0) return;
        
        const fileCount = selectedFiles.size;
        if (!confirm(`選択された${fileCount}個のファイルを削除しますか？\n関連するシーンからも自動的に削除されます。`)) {
            return;
        }
        
        try {
            Loading.show(`${fileCount}個のファイルを削除中...`);
            
            const deletePromises = Array.from(selectedFiles).map(fileId => 
                API.delete('api/media.php', {
                    project_id: AppState.currentProject.id,
                    file_id: fileId
                })
            );
            
            const results = await Promise.allSettled(deletePromises);
            
            let successCount = 0;
            let errorCount = 0;
            
            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value.success) {
                    successCount++;
                } else {
                    errorCount++;
                }
            });
            
            // 結果に応じてメッセージを表示
            if (errorCount === 0) {
                Notification.success(`${successCount}個のファイルを削除しました`);
            } else if (successCount === 0) {
                Notification.error(`${errorCount}個のファイルの削除に失敗しました`);
            } else {
                Notification.warning(`${successCount}個のファイルを削除しました。${errorCount}個のファイルで削除に失敗しました。`);
            }
            
            // 選択状態をクリア
            selectedFiles.clear();
            
            // ファイル一覧を更新
            await loadMediaFiles(currentFilter);
            
        } catch (error) {
            Notification.error('ファイルの削除中にエラーが発生しました');
        } finally {
            Loading.hide();
        }
    }
}

/**
 * シーン一覧画面の描画
 */
function renderSceneListView(scenes) {
    const mainContent = document.getElementById('main-content');
    
    const sceneListHTML = `
        <div class="scene-list-container">
            <!-- ヘッダー -->
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">${Utils.escapeHtml(AppState.currentProject.name)}</h1>
                    <div class="flex items-center space-x-4 mt-1">
                        <p class="text-gray-600">シーン一覧</p>
                        <span class="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">ID: ${AppState.currentProject.id}</span>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <button id="export-scenes-btn" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        シーンダウンロード
                    </button>
                    <button id="upload-scenes-btn" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        シーンアップロード
                    </button>
                    <button id="media-library-btn" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        メディアライブラリ
                    </button>
                    <button id="add-scene-btn" class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        新規シーン
                    </button>
                </div>
            </div>
            
            <!-- シーンテーブル -->
            <div class="table-container bg-white rounded-lg shadow">
                <div class="overflow-x-auto">
                    <table id="scenes-table" class="w-full">
                        <thead class="table-header">
                            <tr>
                                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                                    </svg>
                                </th>
                                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">サムネイル</th>
                                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">開始時間</th>
                                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">歌詞</th>
                                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">シーン説明</th>
                                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カメラ/演出</th>
                                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">操作</th>
                            </tr>
                        </thead>
                        <tbody id="scene-table-body">
                            ${renderSceneRows(scenes)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = sceneListHTML;
    
    // イベントリスナーを設定
    setupSceneListEventListeners();
}

/**
 * シーン行の描画
 */
function renderSceneRows(scenes) {
    if (!scenes || scenes.length === 0) {
        return `
            <tr>
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                        <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        <p class="text-lg font-medium mb-2">シーンがありません</p>
                        <p class="text-sm">「新規シーン」ボタンからシーンを追加してください</p>
                    </div>
                </td>
            </tr>
        `;
    }
    
    return scenes.map((scene, index) => {
        const thumbnailUrl = scene.image_file_id ? 
            `api/serve-media.php?project_id=${AppState.currentProject.id}&type=image&file_id=${scene.image_file_id}` : null;
        
        return `
            <tr class="scene-row table-row border-b border-gray-200 hover:bg-gray-50" 
                data-scene-id="${scene.id}" 
                data-order="${scene.order}">
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-2">
                        <div class="drag-handle text-gray-400 hover:text-gray-600 cursor-move" title="ドラッグして並び替え">
                            ≡
                        </div>
                        <button type="button" class="edit-scene-btn p-1 text-gray-400 hover:text-blue-600 transition-colors" 
                                data-scene-id="${scene.id}" title="シーン詳細を編集">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7 20.5 3 21.5l1-4L16.732 3.732z"></path>
                            </svg>
                        </button>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow" 
                         title="シーンプレビュー">
                        ${thumbnailUrl ? 
                            `<img src="${thumbnailUrl}" alt="サムネイル" class="w-full h-full object-cover">` :
                            `<div class="w-full h-full flex items-center justify-center text-gray-400">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>`
                        }
                    </div>
                </td>
                <td class="px-6 py-4">
                    <input type="text" onclick="event.stopPropagation()" 
                           class="scene-field inline-edit w-20 text-sm" 
                           data-scene-id="${scene.id}" 
                           data-field="start_time"
                           value="${Utils.escapeHtml(scene.start_time || '')}"
                           placeholder="0:00">
                </td>
                <td class="px-6 py-4">
                    <textarea class="scene-field inline-edit w-full text-sm resize-none" onclick="event.stopPropagation()" 
                              data-scene-id="${scene.id}" 
                              data-field="lyrics"
                              rows="2"
                              placeholder="歌詞を入力...">${Utils.escapeHtml(scene.lyrics || '')}</textarea>
                </td>
                <td class="px-6 py-4">
                    <textarea class="scene-field inline-edit w-full text-sm resize-none" onclick="event.stopPropagation()" 
                              data-scene-id="${scene.id}" 
                              data-field="description"
                              rows="2"
                              placeholder="シーン説明を入力...">${Utils.escapeHtml(scene.description || '')}</textarea>
                </td>
                <td class="px-6 py-4">
                    <textarea class="scene-field inline-edit w-full text-sm resize-none" onclick="event.stopPropagation()" 
                              data-scene-id="${scene.id}" 
                              data-field="camera_direction"
                              rows="2"
                              placeholder="カメラワークや演出のメモを入力...">${Utils.escapeHtml(scene.camera_direction || '')}</textarea>
                </td>
                <td class="px-6 py-4" onclick="event.stopPropagation()">
                    <div class="flex items-center justify-end space-x-1">
                        <button type="button"
                                class="add-scene-relative-btn add-scene-before-btn p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                data-scene-id="${scene.id}" data-position="before" title="このシーンの上に追加">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4"></path>
                            </svg>
                        </button>
                        <button type="button"
                                class="add-scene-relative-btn add-scene-after-btn p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                data-scene-id="${scene.id}" data-position="after" title="このシーンの下に追加">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 15l4 4 4-4"></path>
                            </svg>
                        </button>
                        <button type="button" class="delete-scene-btn p-1 text-gray-400 hover:text-red-600 transition-colors" 
                                data-scene-id="${scene.id}" title="削除">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * シーン一覧のイベントリスナー設定
 */
function setupSceneListEventListeners() {
    // メディアライブラリボタン
    const mediaLibraryBtn = document.getElementById('media-library-btn');
    if (mediaLibraryBtn) {
        mediaLibraryBtn.addEventListener('click', showMediaLibrary);
    }
    
    // 新規シーンボタン
    const addSceneBtn = document.getElementById('add-scene-btn');
    if (addSceneBtn) {
        addSceneBtn.addEventListener('click', addNewScene);
    }
    
    // シーンファイルアップロードボタン
    const uploadScenesBtn = document.getElementById('upload-scenes-btn');
    if (uploadScenesBtn) {
        uploadScenesBtn.addEventListener('click', showSceneFileUploadModal);
    }

    const exportScenesBtn = document.getElementById('export-scenes-btn');
    if (exportScenesBtn) {
        exportScenesBtn.addEventListener('click', exportScenes);
    }

    // シーン編集ボタン
    document.querySelectorAll('.edit-scene-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const sceneId = this.dataset.sceneId;
            if (sceneId) {
                openSceneDetail(sceneId);
            }
        });
    });

    // インライン編集のイベントリスナー
    setupInlineEditListeners();
    
    // シーン挿入ボタン
    document.querySelectorAll('.add-scene-relative-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const sceneId = this.dataset.sceneId;
            const position = this.dataset.position || 'after';
            addNewScene(sceneId, position);
        });
    });

    // シーン削除ボタン
    document.querySelectorAll('.delete-scene-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const sceneId = this.dataset.sceneId;
            deleteScene(sceneId);
        });
    });
    
    // ドラッグ&ドロップの設定
    setupSceneDragAndDrop();
}

/**
 * インライン編集のイベントリスナー設定
 */
function setupInlineEditListeners() {
    document.querySelectorAll('.scene-field').forEach(field => {
        field.addEventListener('compositionstart', function() {
            this.dataset.isComposing = 'true';
        });

        field.addEventListener('compositionend', function() {
            delete this.dataset.isComposing;
        });

        // フォーカス時
        field.addEventListener('focus', function() {
            this.classList.add('editing');
            this.closest('.scene-row').classList.add('editing-row');
        });
        
        // フォーカス離脱時
        field.addEventListener('blur', function() {
            this.classList.remove('editing');
            this.closest('.scene-row').classList.remove('editing-row');
            
            // 自動保存
            saveSceneField(this);
        });
        
        // Enterキー処理（textareaの場合はShift+Enter以外）
        field.addEventListener('keydown', function(e) {
            const tagName = this.tagName.toLowerCase();
            const composing = e.isComposing || this.dataset.isComposing === 'true';

            if (composing) {
                return;
            }

            if (e.key === 'Enter' && tagName !== 'textarea') {
                e.preventDefault();
                this.blur();
            } else if (e.key === 'Enter' && tagName === 'textarea' && !e.shiftKey) {
                e.preventDefault();
                this.blur();
            }
        });
    });
}

/**
 * シーンフィールドの保存
 */
async function saveSceneField(fieldElement) {
    const sceneId = fieldElement.dataset.sceneId;
    const fieldName = fieldElement.dataset.field;
    const value = fieldElement.value;
    
    // バリデーション
    if (fieldName === 'start_time' && value) {
        const timePattern = /^\d{1,2}:\d{2}$/;
        if (!timePattern.test(value)) {
            fieldElement.classList.add('invalid');
            Notification.error('時間は「分:秒」の形式で入力してください（例: 1:30）');
            setTimeout(() => {
                fieldElement.classList.remove('invalid');
            }, 3000);
            return;
        }
    }
    
    try {
        // 保存状態の表示
        fieldElement.classList.add('saving');
        
        const updateData = {
            project_id: AppState.currentProject.id
        };
        updateData[fieldName] = value;
        
        const response = await API.put(`api/scenes.php?id=${sceneId}`, updateData);
        
        if (response.success) {
            // 保存成功
            fieldElement.classList.remove('saving');
            fieldElement.classList.add('saved');
            
            setTimeout(() => {
                fieldElement.classList.remove('saved');
            }, 2000);
            
        } else {
            throw new Error(response.error?.message || '保存に失敗しました');
        }
        
    } catch (error) {
        // 保存エラー
        fieldElement.classList.remove('saving');
        fieldElement.classList.add('save-error');
        
        Notification.error('保存に失敗しました: ' + error.message);
        
        setTimeout(() => {
            fieldElement.classList.remove('save-error');
        }, 3000);
    }
}

/**
 * 新規シーン追加
 */
async function addNewScene(reference = null, position = 'after') {
    try {
        let referenceSceneId = reference;
        if (referenceSceneId && typeof referenceSceneId === 'object') {
            if (typeof referenceSceneId.preventDefault === 'function') {
                referenceSceneId.preventDefault();
            }
            referenceSceneId = null;
        }

        if (position !== 'before' && position !== 'after') {
            position = 'after';
        }

        const isRelativeInsert = Boolean(referenceSceneId);
        Loading.show(isRelativeInsert ? 'シーンを挿入中...' : 'シーンを追加中...');
        
        const newSceneData = {
            project_id: AppState.currentProject.id,
            start_time: '',
            lyrics: '',
            description: '',
            camera_direction: '',
            image_prompt: '',
            video_prompt: ''
        };

        if (isRelativeInsert) {
            newSceneData.reference_scene_id = referenceSceneId;
            newSceneData.position = position;
        }
        
        const response = await API.post('api/scenes.php', newSceneData);
        
        if (response.success) {
            Notification.success(isRelativeInsert ? '新しいシーンを挿入しました' : '新しいシーンを追加しました');
            
            // シーン一覧を再読み込み
            await loadSceneListView(AppState.currentProject.id);
            
        } else {
            throw new Error(response.error?.message || 'シーンの追加に失敗しました');
        }
        
    } catch (error) {
        Notification.error('シーンの追加に失敗しました: ' + error.message);
    } finally {
        Loading.hide();
    }
}

/**
 * シーンダウンロード
 */
async function exportScenes(event) {
    try {
        if (event && typeof event.preventDefault === 'function') {
            event.preventDefault();
        }

        if (!AppState.currentProject) {
            throw new Error('プロジェクトが選択されていません');
        }

        Loading.show('シーンファイルを生成しています...');

        const url = `api/scenes.php?action=export&project_id=${encodeURIComponent(AppState.currentProject.id)}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'text/csv,application/json'
            }
        });

        if (!response.ok) {
            let errorMessage = 'エクスポートに失敗しました';
            const contentType = response.headers.get('Content-Type') || '';
            const text = await response.text();
            if (contentType.includes('application/json')) {
                try {
                    const json = JSON.parse(text);
                    errorMessage = json.error?.message || json.error || errorMessage;
                } catch (_) {
                    // ignore parse error
                }
            }
            throw new Error(errorMessage);
        }

        const blob = await response.blob();
        let filename = `scenes_${AppState.currentProject.id}_${Date.now()}.csv`;

        const disposition = response.headers.get('Content-Disposition');
        if (disposition) {
            const match = disposition.match(/filename="?([^";]+)"?/i);
            if (match && match[1]) {
                filename = decodeURIComponent(match[1]);
            }
        }

        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);

        Notification.success('シーンファイルをエクスポートしました');
    } catch (error) {
        Notification.error('シーンファイルのエクスポートに失敗しました: ' + error.message);
    } finally {
        Loading.hide();
    }
}

/**
 * シーン削除
 */
async function deleteScene(sceneId) {
    if (!confirm('このシーンを削除しますか？')) {
        return;
    }
    
    try {
        Loading.show('シーンを削除中...');
        
        const response = await API.delete('api/scenes.php', { 
            id: sceneId,
            project_id: AppState.currentProject.id 
        });
        
        if (response.success) {
            Notification.success('シーンを削除しました');
            
            // シーン一覧を再読み込み
            await loadSceneListView(AppState.currentProject.id);
            
        } else {
            throw new Error(response.error?.message || 'シーンの削除に失敗しました');
        }
        
    } catch (error) {
        Notification.error('シーンの削除に失敗しました: ' + error.message);
    } finally {
        Loading.hide();
    }
}

/**
 * シーンの詳細編集画面を開く
 */
async function openSceneDetail(sceneId) {
    try {
        // 現在のシーン情報を取得
        const response = await API.get('api/scenes.php', {
            project_id: AppState.currentProject.id,
            scene_id: sceneId
        });
        
        let scene = null;
        if (response.success && response.data) {
            // 配列の場合は該当シーンを探す
            if (Array.isArray(response.data)) {
                scene = response.data.find(s => s.id === sceneId);
            } else {
                scene = response.data;
            }
        }
        
        if (!scene) {
            Notification.error('シーン情報の取得に失敗しました');
            return;
        }
        
        // モーダルのHTML
        const modalContent = `
            <div class="space-y-6">
                <div class="text-center">
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">シーン詳細編集</h3>
                    <p class="text-sm text-gray-500">画像・動画プロンプトとメディアファイルを設定します</p>
                </div>
                
                <form id="scene-detail-form" class="space-y-4">
                    <!-- 基本情報 -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                                <input type="text" id="scene-start-time" value="${Utils.escapeHtml(scene.start_time || '')}" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                       placeholder="0:00">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">歌詞</label>
                                <textarea id="scene-lyrics" 
                                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                          rows="2"
                                          placeholder="歌詞を入力...">${Utils.escapeHtml(scene.lyrics || '')}</textarea>
                            </div>
                        </div>
                        <div class="mt-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">シーン説明</label>
                            <textarea id="scene-description" 
                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                      rows="2"
                                      placeholder="シーン説明を入力...">${Utils.escapeHtml(scene.description || '')}</textarea>
                        </div>
                        <div class="mt-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">カメラ/演出</label>
                            <textarea id="scene-camera-direction" 
                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                      rows="2"
                                      placeholder="カメラワークや演出の指示を入力...">${Utils.escapeHtml(scene.camera_direction || '')}</textarea>
                        </div>
                    </div>
                    
                    <!-- 画像生成プロンプト -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">画像生成プロンプト</label>
                        <textarea id="image-prompt" 
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                  rows="3"
                                  placeholder="AI画像生成用の詳細なプロンプトを入力...">${Utils.escapeHtml(scene.image_prompt || '')}</textarea>
                    </div>
                    
                    <!-- 画像ファイル選択 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">画像ファイル</label>
                        <div class="flex items-center space-x-2">
                            <div id="image-preview" class="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                ${scene.image_file_id ? 
                                    `<img src="api/serve-media.php?project_id=${AppState.currentProject.id}&type=image&file_id=${scene.image_file_id}" 
                                          class="w-full h-full object-cover">` :
                                    `<div class="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
                                            </path>
                                        </svg>
                                    </div>`
                                }
                            </div>
                            <button type="button" id="select-image-btn" 
                                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                画像を選択
                            </button>
                            ${scene.image_file_id ? 
                                `<button type="button" id="remove-image-btn" 
                                         class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                                    削除
                                </button>` : ''
                            }
                        </div>
                        <input type="hidden" id="image-file-id" value="${scene.image_file_id || ''}">
                    </div>
                    
                    <!-- 動画生成プロンプト -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">動画生成プロンプト</label>
                        <textarea id="video-prompt" 
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                  rows="3"
                                  placeholder="AI動画生成用の詳細なプロンプトを入力...">${Utils.escapeHtml(scene.video_prompt || '')}</textarea>
                    </div>
                    
                    <!-- 動画ファイル選択 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">動画ファイル</label>
                        <div class="flex items-center space-x-2">
                            <div id="video-preview" class="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                ${scene.video_file_id ? 
                                    `<video src="api/serve-media.php?project_id=${AppState.currentProject.id}&type=video&file_id=${scene.video_file_id}" 
                                            class="w-full h-full object-cover"></video>` :
                                    `<div class="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z">
                                            </path>
                                        </svg>
                                    </div>`
                                }
                            </div>
                            <button type="button" id="select-video-btn" 
                                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                動画を選択
                            </button>
                            ${scene.video_file_id ? 
                                `<button type="button" id="remove-video-btn" 
                                         class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                                    削除
                                </button>` : ''
                            }
                        </div>
                        <input type="hidden" id="video-file-id" value="${scene.video_file_id || ''}">
                    </div>
                    
                    <!-- ボタン -->
                    <div class="flex justify-end space-x-3 pt-4 border-t">
                        <button type="button" onclick="Modal.close()" 
                                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                            キャンセル
                        </button>
                        <button type="submit" 
                                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            保存
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        Modal.show(modalContent);
        
        // イベントリスナーの設定
        const form = document.getElementById('scene-detail-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveSceneDetail(sceneId);
        });
        
        // 画像選択ボタン
        const selectImageBtn = document.getElementById('select-image-btn');
        if (selectImageBtn) {
            selectImageBtn.addEventListener('click', () => {
                selectMediaFile('image', sceneId);
            });
        }
        
        // 画像削除ボタン
        const removeImageBtn = document.getElementById('remove-image-btn');
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', () => {
                document.getElementById('image-file-id').value = '';
                document.getElementById('image-preview').innerHTML = `
                    <div class="w-full h-full flex items-center justify-center text-gray-400">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
                            </path>
                        </svg>
                    </div>
                `;
                removeImageBtn.remove();
            });
        }
        
        // 動画選択ボタン
        const selectVideoBtn = document.getElementById('select-video-btn');
        if (selectVideoBtn) {
            selectVideoBtn.addEventListener('click', () => {
                selectMediaFile('video', sceneId);
            });
        }
        
        // 動画削除ボタン
        const removeVideoBtn = document.getElementById('remove-video-btn');
        if (removeVideoBtn) {
            removeVideoBtn.addEventListener('click', () => {
                document.getElementById('video-file-id').value = '';
                document.getElementById('video-preview').innerHTML = `
                    <div class="w-full h-full flex items-center justify-center text-gray-400">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z">
                            </path>
                        </svg>
                    </div>
                `;
                removeVideoBtn.remove();
            });
        }
        
    } catch (error) {
        Notification.error('シーン詳細の読み込みに失敗しました: ' + error.message);
    }
}

/**
 * シーン詳細の保存
 */
async function saveSceneDetail(sceneId) {
    try {
        Loading.show('保存中...');
        
        const updateData = {
            project_id: AppState.currentProject.id,
            start_time: document.getElementById('scene-start-time').value,
            lyrics: document.getElementById('scene-lyrics').value,
            description: document.getElementById('scene-description').value,
            camera_direction: document.getElementById('scene-camera-direction').value,
            image_prompt: document.getElementById('image-prompt').value,
            video_prompt: document.getElementById('video-prompt').value,
            image_file_id: document.getElementById('image-file-id').value || '',
            video_file_id: document.getElementById('video-file-id').value || ''
        };
        
        console.log('Saving scene detail with data:', updateData);
        console.log('Scene ID:', sceneId);
        
        const response = await API.put(`api/scenes.php?id=${sceneId}&project_id=${AppState.currentProject.id}`, updateData);
        
        if (response.success) {
            Notification.success('シーン詳細を保存しました');
            Modal.close();
            
            // シーン一覧を再読み込み
            await loadSceneListView(AppState.currentProject.id);
        } else {
            throw new Error(response.error?.message || '保存に失敗しました');
        }
        
    } catch (error) {
        Notification.error('保存に失敗しました: ' + error.message);
    } finally {
        Loading.hide();
    }
}

// グローバル変数として前のモーダル内容を保存
let savedModalContent = null;

/**
 * メディア選択をキャンセル
 */
function cancelMediaSelection() {
    if (savedModalContent) {
        document.getElementById('modal-container').innerHTML = savedModalContent;
        savedModalContent = null;
    } else {
        Modal.close();
    }
}

/**
 * メディアファイル選択モーダルを開く
 */
async function selectMediaFile(type, sceneId) {
    // 現在のモーダルの内容を保存
    savedModalContent = document.getElementById('modal-container').innerHTML;
    
    // メディアライブラリを選択モードで開く
    const filter = type === 'image' ? 'image' : 'video';
    
    // メディアライブラリのモーダルを作成
    const modalContent = `
        <div class="p-6">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-900">${type === 'image' ? '画像' : '動画'}を選択</h2>
                <button onclick="cancelMediaSelection()" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="mb-4">
                <p class="text-sm text-gray-600">クリックしてファイルを選択してください</p>
            </div>
            
            <div id="media-selection-grid" class="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                <div class="text-center text-gray-400 py-8 col-span-4">
                    <div class="spinner"></div>
                    <p class="mt-2">読み込み中...</p>
                </div>
            </div>
            
            <div class="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button onclick="cancelMediaSelection()" 
                        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                    キャンセル
                </button>
            </div>
        </div>
    `;
    
    Modal.show(modalContent);
    
    // メディアファイルを読み込み
    try {
        const response = await API.get('api/media.php', {
            project_id: AppState.currentProject.id,
            filter: filter
        });
        
        if (response.success) {
            const files = response.data || [];
            renderMediaSelectionGrid(files, type, sceneId);
        } else {
            throw new Error(response.error?.message || 'ファイルの読み込みに失敗しました');
        }
    } catch (error) {
        console.error('Error loading media files:', error);
        document.getElementById('media-selection-grid').innerHTML = `
            <div class="text-center text-red-500 py-8 col-span-4">
                <p>ファイルの読み込みに失敗しました</p>
            </div>
        `;
    }
}

/**
 * メディア選択グリッドを描画
 */
function renderMediaSelectionGrid(files, type, sceneId) {
    const grid = document.getElementById('media-selection-grid');
    
    if (!files || files.length === 0) {
        grid.innerHTML = `
            <div class="text-center text-gray-400 py-8 col-span-4">
                <p>${type === 'image' ? '画像' : '動画'}がありません</p>
            </div>
        `;
        return;
    }
    
    const filesHTML = files.map(file => {
        const fileUrl = `api/serve-media.php?project_id=${AppState.currentProject.id}&type=${type}&file_id=${file.id}`;
        
        return `
            <div class="media-selection-item border-2 border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-400 transition-all" 
                 data-file-id="${file.id}" 
                 onclick="selectMediaFileItem('${file.id}', '${type}', '${sceneId}')">
                <div class="aspect-square bg-gray-100 relative">
                    ${type === 'image' ? 
                        `<img src="${fileUrl}" alt="${file.name}" class="w-full h-full object-cover">` :
                        `<div class="w-full h-full bg-gray-800 flex items-center justify-center">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>`
                    }
                </div>
                <div class="p-2 bg-white">
                    <p class="text-xs text-gray-600 truncate" title="${file.name}">${file.name}</p>
                </div>
            </div>
        `;
    }).join('');
    
    grid.innerHTML = filesHTML;
}

/**
 * メディアファイルを選択
 */
function selectMediaFileItem(fileId, type, sceneId) {
    // 前のモーダルに戻る（グローバル変数から復元）
    if (!savedModalContent) {
        console.error('No saved modal content to restore');
        Modal.close();
        return;
    }
    
    document.getElementById('modal-container').innerHTML = savedModalContent;
    
    // 選択したファイルを反映
    const fileIdInput = document.getElementById(`${type}-file-id`);
    const previewDiv = document.getElementById(`${type}-preview`);
    
    if (fileIdInput && previewDiv) {
        fileIdInput.value = fileId;
        
        const fileUrl = `api/serve-media.php?project_id=${AppState.currentProject.id}&type=${type}&file_id=${fileId}`;
        
        if (type === 'image') {
            previewDiv.innerHTML = `<img src="${fileUrl}" class="w-full h-full object-cover">`;
        } else {
            previewDiv.innerHTML = `<video src="${fileUrl}" class="w-full h-full object-cover"></video>`;
        }
        
        // 削除ボタンを追加（まだ存在しない場合）
        const btnContainer = previewDiv.parentElement;
        if (!document.getElementById(`remove-${type}-btn`)) {
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.id = `remove-${type}-btn`;
            removeBtn.className = 'px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700';
            removeBtn.textContent = '削除';
            removeBtn.onclick = function() {
                document.getElementById(`${type}-file-id`).value = '';
                previewDiv.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center text-gray-400">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="${type === 'image' ? 
                                    'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' :
                                    'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                                  }">
                            </path>
                        </svg>
                    </div>
                `;
                this.remove();
            };
            btnContainer.appendChild(removeBtn);
        }
    }
    
    // グローバル変数をクリア
    savedModalContent = null;
    // イベントリスナーを再設定
    reattachSceneDetailEventListeners(sceneId);
    
    Notification.success(`${type === 'image' ? '画像' : '動画'}を選択しました`);
}

/**
 * メディア選択をキャンセル
 */
function cancelMediaSelection() {
    // メインのメディアライブラリモーダルを閉じる
    Modal.close();
}

/**
 * シーン詳細モーダルのイベントリスナーを再設定
 */
function reattachSceneDetailEventListeners(sceneId) {
    // フォームの送信イベント
    const form = document.getElementById('scene-detail-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveSceneDetail(sceneId);
        });
    }
    
    // 画像選択ボタン
    const selectImageBtn = document.getElementById('select-image-btn');
    if (selectImageBtn) {
        selectImageBtn.onclick = () => selectMediaFile('image', sceneId);
    }
    
    // 動画選択ボタン
    const selectVideoBtn = document.getElementById('select-video-btn');
    if (selectVideoBtn) {
        selectVideoBtn.onclick = () => selectMediaFile('video', sceneId);
    }
    
    // 画像削除ボタン
    const removeImageBtn = document.getElementById('remove-image-btn');
    if (removeImageBtn) {
        removeImageBtn.onclick = () => {
            document.getElementById('image-file-id').value = '';
            document.getElementById('image-preview').innerHTML = `
                <div class="w-full h-full flex items-center justify-center text-gray-400">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
                        </path>
                    </svg>
                </div>
            `;
            removeImageBtn.remove();
        };
    }
    
    // 動画削除ボタン
    const removeVideoBtn = document.getElementById('remove-video-btn');
    if (removeVideoBtn) {
        removeVideoBtn.onclick = () => {
            document.getElementById('video-file-id').value = '';
            document.getElementById('video-preview').innerHTML = `
                <div class="w-full h-full flex items-center justify-center text-gray-400">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z">
                        </path>
                    </svg>
                </div>
            `;
            removeVideoBtn.remove();
        };
    }
}

/**
 * シーンファイルアップロードモーダルを表示
 */
function showSceneFileUploadModal() {
    const modalContent = `
        <form id="scene-file-upload-form">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">シーンファイル</label>
                    <div id="scene-file-dropzone" class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors">
                        <input type="file" id="scene-file-input" accept=".txt,.csv,.xlsx,.xls" class="hidden">
                        <div class="space-y-2">
                            <svg class="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <p class="text-sm text-gray-600">テキスト（.txt）/CSV（.csv）/Excel（.xlsx, .xls）ファイルを選択</p>
                            <p class="text-xs text-gray-400">ファイルをドラッグ＆ドロップしてアップロードできます</p>
                            <button type="button" onclick="document.getElementById('scene-file-input').click()" 
                                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
                                ファイル選択
                            </button>
                        </div>
                        <div id="selected-file-info" class="hidden mt-3 p-3 bg-gray-50 rounded-md">
                            <p class="text-sm text-gray-700"></p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-blue-50 p-4 rounded-md">
                    <h4 class="text-sm font-medium text-blue-900 mb-2">ファイル形式について</h4>
                    <ul class="text-xs text-blue-800 space-y-1">
                        <li>• <strong>テキストファイル（.txt）:</strong> 歌詞を改行で区切って記述</li>
                        <li>• <strong>CSV/Excel（.csv/.xlsx/.xls）:</strong> 開始時間,歌詞,シーン説明,カメラ/演出,英語生成プロンプト,動画生成プロンプト の順で列を配置</li>
                    </ul>
                </div>
                
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" onclick="Modal.close()" 
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        キャンセル
                    </button>
                    <button type="submit" 
                            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors">
                        アップロード
                    </button>
                </div>
            </div>
        </form>
    `;
    
    Modal.create('シーンファイルアップロード', modalContent);
    
    // ファイル選択の処理
    const fileInput = document.getElementById('scene-file-input');
    const fileInfo = document.getElementById('selected-file-info');
    const dropzone = document.getElementById('scene-file-dropzone');
    const allowedExtensions = ['txt', 'csv', 'xlsx', 'xls'];

    function updateSelectedFile(file) {
        if (file) {
            fileInfo.classList.remove('hidden');
            fileInfo.querySelector('p').textContent = `選択されたファイル: ${file.name} (${Utils.formatFileSize(file.size)})`;
        } else {
            fileInfo.classList.add('hidden');
        }
    }

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        updateSelectedFile(file);
    });

    if (dropzone) {
        const highlight = () => {
            dropzone.classList.add('border-blue-400', 'bg-blue-50');
            dropzone.classList.remove('border-gray-300');
        };
        const unhighlight = () => {
            dropzone.classList.remove('border-blue-400', 'bg-blue-50');
            dropzone.classList.add('border-gray-300');
        };

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, event => {
                event.preventDefault();
                event.stopPropagation();
                highlight();
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, event => {
                event.preventDefault();
                event.stopPropagation();
                if (eventName === 'drop') {
                    const files = event.dataTransfer?.files;
                    if (files && files.length > 0) {
                        const file = files[0];
                        const ext = file.name.split('.').pop()?.toLowerCase() || '';
                        if (!allowedExtensions.includes(ext)) {
                            Notification.error('対応していないファイル形式です。txt/csv/xlsx/xlsをご利用ください');
                            unhighlight();
                            return;
                        }

                        try {
                            const dataTransfer = new DataTransfer();
                            dataTransfer.items.add(file);
                            fileInput.files = dataTransfer.files;
                        } catch (error) {
                            try {
                                fileInput.files = files;
                            } catch (_) {
                                // ignore if assignment fails; user can fall back to manual selection
                            }
                        }

                        updateSelectedFile(file);
                    }
                }
                unhighlight();
            });
        });
    }

    // フォーム送信の処理
    document.getElementById('scene-file-upload-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const file = fileInput.files[0];
        
        if (!file) {
            Notification.error('ファイルを選択してください');
            return;
        }
        
        try {
            Loading.show('シーンファイルをアップロード中...');
            
            const formData = new FormData();
            formData.append('project_id', AppState.currentProject.id);
            formData.append('file', file);  // 'scene_file' から 'file' に変更
            
            const response = await fetch('api/scenes.php?action=upload', {  // action=upload パラメータを追加
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                Modal.close();
                Notification.success('シーンファイルをアップロードしました');
                
                // シーン一覧を再読み込み
                await loadSceneListView(AppState.currentProject.id);
                
            } else {
                throw new Error(result.error?.message || 'アップロードに失敗しました');
            }
            
        } catch (error) {
            Notification.error('シーンファイルのアップロードに失敗しました: ' + error.message);
        } finally {
            Loading.hide();
        }
    });
}

/**
 * シーンのドラッグ&ドロップ設定
 */
function setupSceneDragAndDrop() {
    console.log('Setting up scene drag and drop...');
    
    let tbody = document.querySelector('#scenes-table tbody');
    if (!tbody) {
        console.log('tbody not found - trying alternative selector');
        // 代替セレクタを試す
        const table = document.getElementById('scenes-table');
        if (!table) {
            console.log('scenes-table not found');
            return;
        }
        tbody = table.querySelector('tbody');
        if (!tbody) {
            console.log('tbody still not found');
            return;
        }
    }
    
    let draggedRow = null;
    let draggedIndex = -1;
    // マニュアルドラッグ用（HTML5 DnDが発火しない環境向けフォールバック）
    let manualDragging = false;
    let startY = 0;
    let moveListener = null;
    let upListener = null;

    // --- フローティングプレビュー（ゴースト） ---
    let dragPreview = null;
    let lastMouse = { x: 0, y: 0 };
    function ensureDragPreview(row) {
        if (!dragPreview) {
            const clone = row.cloneNode(true);
            const rect = row.getBoundingClientRect();
            const wrapper = document.createElement('div');
            wrapper.className = 'drag-preview';
            wrapper.style.width = rect.width + 'px';
            wrapper.appendChild(clone);
            document.body.appendChild(wrapper);
            dragPreview = wrapper;
        }
        return dragPreview;
    }
    function moveDragPreview(x, y) {
        lastMouse = { x, y };
        if (dragPreview) {
            dragPreview.style.transform = `translate(${x + 12}px, ${y + 12}px)`;
        }
    }
    function removeDragPreview() {
        if (dragPreview && dragPreview.parentNode) {
            dragPreview.parentNode.removeChild(dragPreview);
        }
        dragPreview = null;
    }
    function transparentDragImage() {
        const c = document.createElement('canvas');
        c.width = 1; c.height = 1;
        return c;
    }
    
    // すべてのシーン行にドラッグ機能を設定
    const rows = tbody.querySelectorAll('.scene-row');
    console.log('Found ' + rows.length + ' scene rows');
    
    rows.forEach((row, index) => {
        // 行をドラッグ可能にする（ただしドラッグハンドルからのみ）
        const dragHandle = row.querySelector('.drag-handle');
        if (!dragHandle) {
            console.log('No drag handle found for row ' + index);
            return;
        }

        // 一部ブラウザでは <tr> のドラッグ開始が子要素から伝播しないため
        // ハンドル自体をドラッグ可能にする
        dragHandle.setAttribute('draggable', 'true');

        // ドラッグハンドルにマウスダウンイベントを追加（ドラッグ許可）
        dragHandle.addEventListener('mousedown', function(e) {
            // ここではデフォルトを阻害しない（環境によりdrag開始が抑止されるため）
            row.draggable = false; // 行ではなくハンドルをドラッグ源にする
            console.log('Drag enabled for row ' + index + ' (mousedown on handle)');

            // マニュアルフォールバック準備
            manualDragging = false;
            startY = e.clientY;

            const tbodyRect = tbody.getBoundingClientRect();

            moveListener = function(me) {
                // 少し動いたら手動ドラッグに切替
                if (!manualDragging && Math.abs(me.clientY - startY) > 4) {
                    manualDragging = true;
                    draggedRow = row;
                    draggedIndex = Array.from(tbody.children).indexOf(row);
                    row.classList.add('opacity-50');
                    // 視覚的にフローティング
                    row.style.visibility = 'hidden';
                    ensureDragPreview(row);
                    moveDragPreview(me.clientX, me.clientY);
                    document.body.classList.add('select-none');
                }

                if (!manualDragging) return;

                // 現在位置の行を取得
                const el = document.elementFromPoint(me.clientX, me.clientY);
                const overRow = el ? el.closest && el.closest('.scene-row') : null;
                if (!overRow || overRow === draggedRow || !tbody.contains(overRow)) return;

                const rect = overRow.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;

                // ビジュアルフィードバックをクリア
                tbody.querySelectorAll('.scene-row').forEach(r => {
                    r.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
                });

                if (me.clientY < midpoint) {
                    overRow.classList.add('border-t-2', 'border-blue-500');
                    if (draggedRow !== overRow.previousSibling) {
                        tbody.insertBefore(draggedRow, overRow);
                    }
                } else {
                    overRow.classList.add('border-b-2', 'border-blue-500');
                    if (overRow.nextSibling) {
                        tbody.insertBefore(draggedRow, overRow.nextSibling);
                    } else {
                        tbody.appendChild(draggedRow);
                    }
                }
                // プレビューの位置更新
                moveDragPreview(me.clientX, me.clientY);
            };

            upListener = function() {
                document.removeEventListener('mousemove', moveListener);
                document.removeEventListener('mouseup', upListener);
                if (manualDragging) {
                    row.classList.remove('opacity-50');
                    row.style.visibility = '';
                    tbody.querySelectorAll('.scene-row').forEach(r => {
                        r.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
                    });
                    document.body.classList.remove('select-none');
                    removeDragPreview();
                    manualDragging = false;
                    draggedRow = null;
                    draggedIndex = -1;
                    // 並び順を更新
                    updateSceneOrder();
                }
            };

            document.addEventListener('mousemove', moveListener);
            document.addEventListener('mouseup', upListener);
        });
        
        // 行全体にマウスアップイベント
        document.addEventListener('mouseup', function() {
            row.draggable = false;
        });
        
        row.addEventListener('dragstart', function(e) {
            if (!this.draggable) {
                e.preventDefault();
                return;
            }
            
            console.log('Drag started on row', this.dataset.sceneId);
            draggedRow = this;
            draggedIndex = Array.from(tbody.children).indexOf(this);
            this.classList.add('opacity-50');
            e.dataTransfer.effectAllowed = 'move';
            try { e.dataTransfer.setData('text/plain', this.dataset.sceneId || 'drag'); } catch(_) {}
            try { e.dataTransfer.setDragImage(transparentDragImage(), 0, 0); } catch(_) {}

            // 自前のフローティングプレビュー
            ensureDragPreview(this);
            moveDragPreview(e.clientX || lastMouse.x, e.clientY || lastMouse.y);
            const moveOnDrag = (de) => moveDragPreview(de.clientX, de.clientY);
            document.addEventListener('dragover', moveOnDrag);
            this._moveOnDrag = moveOnDrag;
        });

        // ハンドルからドラッグ開始された場合のフォールバック
        dragHandle.addEventListener('dragstart', function(e) {
            console.log('Drag started from handle for row', row.dataset.sceneId);
            // 親行をドラッグ対象として扱う
            draggedRow = row;
            draggedIndex = Array.from(tbody.children).indexOf(row);
            row.classList.add('opacity-50');
            e.dataTransfer.effectAllowed = 'move';
            try { e.dataTransfer.setData('text/plain', row.dataset.sceneId || 'drag'); } catch(_) {}
            try { e.dataTransfer.setDragImage(transparentDragImage(), 0, 0); } catch(_) {}

            // 自前のプレビュー
            ensureDragPreview(row);
            moveDragPreview(e.clientX || lastMouse.x, e.clientY || lastMouse.y);
            const moveOnDrag = (de) => moveDragPreview(de.clientX, de.clientY);
            document.addEventListener('dragover', moveOnDrag);
            row._moveOnDrag = moveOnDrag;
        });
        
        row.addEventListener('dragend', function(e) {
            console.log('Drag ended');
            this.draggable = false;
            this.classList.remove('opacity-50');
            
            // すべての行からビジュアルフィードバックをクリア
            tbody.querySelectorAll('.scene-row').forEach(r => {
                r.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
            });
            
            if (this._moveOnDrag) {
                document.removeEventListener('dragover', this._moveOnDrag);
                this._moveOnDrag = null;
            }
            removeDragPreview();
            draggedRow = null;
            draggedIndex = -1;
        });

        // ハンドル側の dragend でもクリーンアップ
        dragHandle.addEventListener('dragend', function() {
            row.draggable = false;
            row.classList.remove('opacity-50');
            tbody.querySelectorAll('.scene-row').forEach(r => {
                r.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
            });
            if (row._moveOnDrag) {
                document.removeEventListener('dragover', row._moveOnDrag);
                row._moveOnDrag = null;
            }
            removeDragPreview();
            draggedRow = null;
            draggedIndex = -1;
        });
        
        row.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (!draggedRow || draggedRow === this) return;
            
            const currentIndex = Array.from(tbody.children).indexOf(this);
            const rect = this.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            
            // ビジュアルフィードバックをクリア
            tbody.querySelectorAll('.scene-row').forEach(r => {
                r.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
            });
            
            if (e.clientY < midpoint) {
                // 上半分 = この行の前に挿入
                this.classList.add('border-t-2', 'border-blue-500');
            } else {
                // 下半分 = この行の後に挿入
                this.classList.add('border-b-2', 'border-blue-500');
            }
        });
        
        row.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (!draggedRow || draggedRow === this) return;
            
            console.log('Drop occurred');
            
            const rect = this.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            
            if (e.clientY < midpoint) {
                // この行の前に挿入
                tbody.insertBefore(draggedRow, this);
            } else {
                // この行の後に挿入
                if (this.nextSibling) {
                    tbody.insertBefore(draggedRow, this.nextSibling);
                } else {
                    tbody.appendChild(draggedRow);
                }
            }
            
            // ビジュアルフィードバックをクリア
            tbody.querySelectorAll('.scene-row').forEach(r => {
                r.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
            });
            
            // 並び順を更新
            updateSceneOrder();
        });
        
        row.addEventListener('dragenter', function(e) {
            if (draggedRow && draggedRow !== this) {
                e.preventDefault();
            }
        });
    });
}

/**
 * シーンの順序を更新
 */
async function updateSceneOrder() {
    const tbody = document.querySelector('#scenes-table tbody');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('.scene-row');
    const sceneIds = [];
    
    rows.forEach((row, index) => {
        const sceneId = row.dataset.sceneId;
        if (sceneId) {
            sceneIds.push(sceneId);
            // インデックスを更新
            row.dataset.index = index;
        }
    });
    
    try {
        // サーバーに新しい順序を送信
        const response = await API.post('api/scenes.php', {
            action: 'reorder',
            project_id: AppState.currentProject.id,
            scene_ids: sceneIds
        });
        
        if (response.success) {
            Notification.success('シーンの順序を更新しました');
        } else {
            throw new Error(response.error?.message || 'シーン順序の更新に失敗しました');
        }
    } catch (error) {
        Notification.error('シーン順序の更新に失敗しました: ' + error.message);
        // エラー時は元の順序に戻す
        await loadSceneListView(AppState.currentProject.id);
    }
}

/**
 * プロジェクト編集モーダルを表示
 */
async function showEditProjectModal(projectId) {
    try {
        // プロジェクト情報を取得
        const response = await API.get('api/projects.php', { id: projectId });
        
        if (!response.success) {
            throw new Error(response.error?.message || 'プロジェクト情報の取得に失敗しました');
        }
        
        const project = response.data;
        
        const modalContent = `
            <form id="edit-project-form">
                <div class="space-y-4">
                    <div>
                        <label for="edit-project-name" class="block text-sm font-medium text-gray-700 mb-2">楽曲名</label>
                        <input type="text" id="edit-project-name" name="name" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                               value="${Utils.escapeHtml(project.name)}">
                    </div>
                    <div>
                        <label for="edit-project-notes" class="block text-sm font-medium text-gray-700 mb-2">備考</label>
                        <textarea id="edit-project-notes" name="notes" rows="3"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">${Utils.escapeHtml(project.notes || '')}</textarea>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="Modal.close()" 
                                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            キャンセル
                        </button>
                        <button type="submit" 
                                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            更新
                        </button>
                    </div>
                </div>
            </form>
        `;
        
        Modal.create('プロジェクト編集', modalContent);
        
        // フォーム送信イベント
        document.getElementById('edit-project-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const projectData = {
                name: formData.get('name'),
                notes: formData.get('notes') || ''
            };
            
            try {
                Loading.show('プロジェクトを更新中...');
                
                const updateResponse = await API.put(`api/projects.php?id=${projectId}`, projectData);
                
                if (updateResponse.success) {
                    Modal.close();
                    Notification.success('プロジェクトを更新しました');
                    
                    // プロジェクト一覧を再読み込み
                    await loadProjectList();
                    
                    // 現在のプロジェクトが更新された場合、ページタイトルも更新
                    if (AppState.currentProject && AppState.currentProject.id === projectId) {
                        AppState.currentProject.name = projectData.name;
                        AppState.currentProject.notes = projectData.notes;
                        updatePageTitle(projectData.name);
                    }
                    
                } else {
                    throw new Error(updateResponse.error?.message || 'プロジェクトの更新に失敗しました');
                }
                
            } catch (error) {
                Notification.error(error.message || 'プロジェクトの更新に失敗しました');
            } finally {
                Loading.hide();
            }
        });
        
        // 楽曲名フィールドにフォーカス
        setTimeout(() => {
            document.getElementById('edit-project-name').focus();
        }, 100);
        
    } catch (error) {
        Notification.error('プロジェクト情報の取得に失敗しました');
    }
}

/**
 * プロジェクト削除確認モーダルを表示
 */
async function showDeleteProjectConfirm(projectId) {
    try {
        // プロジェクト情報を取得
        const response = await API.get('api/projects.php', { id: projectId });
        
        if (!response.success) {
            throw new Error(response.error?.message || 'プロジェクト情報の取得に失敗しました');
        }
        
        const project = response.data;
        
        const modalContent = `
            <div class="space-y-4">
                <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">プロジェクトの削除</h3>
                        <p class="text-sm text-gray-600 mt-1">この操作は取り消すことができません。</p>
                    </div>
                </div>
                
                <div class="bg-red-50 p-4 rounded-md">
                    <p class="text-sm text-red-800">
                        <strong>「${Utils.escapeHtml(project.name)}」</strong>を削除しますか？<br>
                        プロジェクトに含まれる全てのシーンとメディアファイルも削除されます。
                    </p>
                </div>
                
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" onclick="Modal.close()" 
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        キャンセル
                    </button>
                    <button type="button" id="confirm-delete-btn"
                            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        削除する
                    </button>
                </div>
            </div>
        `;
        
        Modal.create('プロジェクト削除の確認', modalContent);
        
        // 削除確認ボタンのイベント
        document.getElementById('confirm-delete-btn').addEventListener('click', async function() {
            try {
                Loading.show('プロジェクトを削除中...');
                
                const deleteResponse = await API.delete('api/projects.php', { id: projectId });
                
                if (deleteResponse.success) {
                    Modal.close();
                    Notification.success('プロジェクトを削除しました');
                    
                    // 削除されたプロジェクトが現在選択中の場合、状態をクリア
                    if (AppState.currentProject && AppState.currentProject.id === projectId) {
                        AppState.currentProject = null;
                        updatePageTitle('Music Video Creator');
                        
                        // メインコンテンツをクリア
                        const mainContent = document.getElementById('main-content');
                        if (mainContent) {
                            mainContent.innerHTML = `
                                <div class="flex items-center justify-center h-full">
                                    <div class="text-center">
                                        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                        </svg>
                                        <h2 class="text-xl font-semibold text-gray-700 mb-2">プロジェクトを選択してください</h2>
                                        <p class="text-gray-500 mb-6">左のサイドバーからプロジェクトを選択するか、新規作成してください</p>
                                        <button id="get-started-btn" class="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                            </svg>
                                            新規プロジェクト作成
                                        </button>
                                    </div>
                                </div>
                            `;
                            
                            // 新規プロジェクトボタンのイベントリスナーを再設定
                            document.getElementById('get-started-btn').addEventListener('click', showCreateProjectModal);
                        }
                    }
                    
                    // プロジェクト一覧を再読み込み
                    await loadProjectList();
                    
                } else {
                    throw new Error(deleteResponse.error?.message || 'プロジェクトの削除に失敗しました');
                }
                
            } catch (error) {
                Notification.error(error.message || 'プロジェクトの削除に失敗しました');
            } finally {
                Loading.hide();
            }
        });
        
    } catch (error) {
        Notification.error('プロジェクト情報の取得に失敗しました');
    }
}
