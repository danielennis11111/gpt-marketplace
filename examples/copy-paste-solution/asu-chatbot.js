/**
 * ASU AI Chatbot - Professional Integration
 * Simple copy-paste solution for ASU websites
 */

(function() {
    'use strict';

    // Configuration - easily customizable
    const chatbotProfiles = [
        {
            name: "Socrates",
            description: "General academic help",
            url: "https://app-beta.aiml.asu.edu/a6c1cc23e5964dc1a7497684083b3b19"
        },
        {
            name: "Math Tutor",
            description: "Mathematics support",
            url: "https://app-beta.aiml.asu.edu/a6c1cc23e5964dc1a7497684083b3b19"
        },
        {
            name: "Writing Assistant", 
            description: "Essay and writing help",
            url: "https://app-beta.aiml.asu.edu/ea158d76c30b4a45bac86d902923670e"
        },
        {
            name: "Coding Helper",
            description: "Get help writing scripts or coding", 
            url: "https://app-beta.aiml.asu.edu/2afee586704c45fda29aea2eff30b485"
        }
    ];

    let isChatOpen = false;
    let selectedProfile = 0;
    let isDropdownOpen = false;

    // Login authentication helper
    function ensureAuthentication() {
        // Check if user is authenticated with ASU platform
        // This creates a hidden iframe to handle authentication
        const authFrame = document.createElement('iframe');
        authFrame.src = 'https://platform-beta.aiml.asu.edu/';
        authFrame.style.display = 'none';
        authFrame.onload = function() {
            // Authentication frame loaded, remove it
            setTimeout(() => {
                if (authFrame.parentNode) {
                    authFrame.parentNode.removeChild(authFrame);
                }
            }, 1000);
        };
        document.body.appendChild(authFrame);
    }

    // Inject Font Awesome if not already loaded
    function injectFontAwesome() {
        if (!document.querySelector('link[href*="font-awesome"]') && !document.querySelector('link[href*="fontawesome"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(link);
        }
    }

    // Create and inject CSS
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* ASU Chatbot Styles */
            .asu-chatbot-button {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: #8C1D40;
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 18px;
                font-weight: 500;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .asu-chatbot-button:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            }

            .asu-chatbot-button.open {
                background: #f3f4f6;
                color: #374151;
                right: 524px;
            }

            .asu-chatbot-sidebar {
                position: fixed;
                top: 0;
                right: -500px;
                width: 500px;
                height: 100vh;
                background: white;
                box-shadow: -2px 0 10px rgba(0,0,0,0.1);
                z-index: 999;
                transition: right 0.3s ease;
                display: flex;
                flex-direction: column;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .asu-chatbot-sidebar.open {
                right: 0;
            }

            .asu-chatbot-header {
                background: linear-gradient(45deg, #8C1D40, #FFC425);
                color: white;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .asu-chatbot-profile-selector {
                background: rgba(255,255,255,0.1);
                border: none;
                border-radius: 8px;
                padding: 12px;
                color: white;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 14px;
                transition: background 0.2s ease;
                position: relative;
            }

            .asu-chatbot-profile-selector:hover {
                background: rgba(255,255,255,0.2);
            }

            .asu-chatbot-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                overflow: hidden;
                margin-top: 4px;
                z-index: 10;
                display: none;
            }

            .asu-chatbot-dropdown.open {
                display: block;
            }

            .asu-chatbot-dropdown-item {
                padding: 12px;
                border: none;
                background: none;
                width: 100%;
                text-align: left;
                cursor: pointer;
                color: #374151;
                transition: background 0.2s ease;
                border-bottom: 1px solid #f3f4f6;
            }

            .asu-chatbot-dropdown-item:hover {
                background: #f9fafb;
            }

            .asu-chatbot-dropdown-item.active {
                background: rgba(140, 29, 64, 0.1);
                color: #8C1D40;
            }

            .asu-chatbot-profile-name {
                font-weight: 500;
                font-size: 14px;
            }

            .asu-chatbot-profile-desc {
                font-size: 12px;
                opacity: 0.8;
                margin-top: 2px;
            }

            .asu-chatbot-actions {
                display: flex;
                gap: 8px;
            }

            .asu-chatbot-action-btn {
                background: rgba(255,255,255,0.1);
                border: none;
                border-radius: 6px;
                padding: 6px 12px;
                color: white;
                font-size: 12px;
                cursor: pointer;
                transition: background 0.2s ease;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .asu-chatbot-action-btn:hover {
                background: rgba(255,255,255,0.2);
            }

            .asu-chatbot-content {
                flex: 1;
                position: relative;
            }

            .asu-chatbot-iframe {
                width: 100%;
                height: 100%;
                border: none;
            }

            .asu-chatbot-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.2);
                z-index: 998;
                display: none;
            }

            .asu-chatbot-backdrop.open {
                display: block;
            }

            /* Responsive adjustments */
            @media (max-width: 768px) {
                .asu-chatbot-sidebar {
                    width: 100%;
                    right: -100%;
                }
                
                .asu-chatbot-button.open {
                    right: 24px;
                }
            }

            /* Content margin adjustment */
            body.asu-chatbot-open {
                margin-right: 500px;
                transition: margin-right 0.3s ease;
            }

            @media (max-width: 768px) {
                body.asu-chatbot-open {
                    margin-right: 0;
                }
            }

            /* Login prompt styles */
            .asu-chatbot-login-prompt {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                text-align: center;
                height: 100%;
                background: #f8f9fa;
            }

            .asu-chatbot-login-prompt h3 {
                color: #8C1D40;
                margin-bottom: 16px;
                font-size: 18px;
                font-weight: 600;
            }

            .asu-chatbot-login-prompt p {
                color: #666;
                margin-bottom: 24px;
                line-height: 1.5;
            }

            .asu-chatbot-login-btn {
                background: linear-gradient(45deg, #8C1D40, #FFC425);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
                transition: transform 0.2s ease;
            }

            .asu-chatbot-login-btn:hover {
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
    }

    // Create chatbot HTML structure
    function createChatbot() {
        const chatbotHTML = `
            <!-- Chat Button -->
            <button class="asu-chatbot-button" id="asu-chatbot-toggle">
                <i class="fas fa-comments" id="asu-chatbot-icon"></i>
            </button>

            <!-- Mobile Backdrop -->
            <div class="asu-chatbot-backdrop" id="asu-chatbot-backdrop"></div>

            <!-- Chat Sidebar -->
            <div class="asu-chatbot-sidebar" id="asu-chatbot-sidebar">
                <div class="asu-chatbot-header">
                    <div class="asu-chatbot-profile-selector" id="asu-chatbot-profile-selector">
                        <div>
                            <div class="asu-chatbot-profile-name" id="asu-chatbot-selected-name">${chatbotProfiles[0].name}</div>
                            <div class="asu-chatbot-profile-desc" id="asu-chatbot-selected-desc">${chatbotProfiles[0].description}</div>
                        </div>
                        <span id="asu-chatbot-chevron">▼</span>
                        
                        <div class="asu-chatbot-dropdown" id="asu-chatbot-dropdown">
                            ${chatbotProfiles.map((profile, index) => `
                                <button class="asu-chatbot-dropdown-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                                    <div class="asu-chatbot-profile-name">${profile.name}</div>
                                    <div class="asu-chatbot-profile-desc">${profile.description}</div>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="asu-chatbot-actions">
                        <button class="asu-chatbot-action-btn" id="asu-chatbot-refresh">Refresh</button>
                        <button class="asu-chatbot-action-btn" id="asu-chatbot-new-tab">New Tab</button>
                    </div>
                </div>

                <div class="asu-chatbot-content" id="asu-chatbot-content">
                    <iframe class="asu-chatbot-iframe" id="asu-chatbot-iframe" 
                            src="${chatbotProfiles[0].url}"
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation">
                    </iframe>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    // Show login prompt if authentication is required
    function showLoginPrompt() {
        const content = document.getElementById('asu-chatbot-content');
        content.innerHTML = `
            <div class="asu-chatbot-login-prompt">
                <h3>ASU Authentication Required</h3>
                <p>Please log in to access the AI chatbot. You'll be redirected to the ASU login page.</p>
                <button class="asu-chatbot-login-btn" onclick="window.open('https://platform-beta.aiml.asu.edu/', '_blank')">
                    Login to ASU Platform
                </button>
                <p style="font-size: 12px; margin-top: 16px; color: #999;">
                    After logging in, refresh this page to use the chatbot.
                </p>
            </div>
        `;
    }

    // Check if iframe can load (user is authenticated)
    function checkAuthentication() {
        const testFrame = document.createElement('iframe');
        testFrame.style.display = 'none';
        testFrame.src = 'https://platform-beta.aiml.asu.edu/';
        
        testFrame.onload = function() {
            // If this loads successfully, user is likely authenticated
            setTimeout(() => {
                if (testFrame.parentNode) {
                    testFrame.parentNode.removeChild(testFrame);
                }
            }, 500);
        };

        testFrame.onerror = function() {
            // If there's an error, show login prompt
            showLoginPrompt();
            if (testFrame.parentNode) {
                testFrame.parentNode.removeChild(testFrame);
            }
        };

        document.body.appendChild(testFrame);
    }

    // Add event listeners
    function addEventListeners() {
        const toggle = document.getElementById('asu-chatbot-toggle');
        const sidebar = document.getElementById('asu-chatbot-sidebar');
        const backdrop = document.getElementById('asu-chatbot-backdrop');
        const profileSelector = document.getElementById('asu-chatbot-profile-selector');
        const dropdown = document.getElementById('asu-chatbot-dropdown');
        const iframe = document.getElementById('asu-chatbot-iframe');
        const refresh = document.getElementById('asu-chatbot-refresh');
        const newTab = document.getElementById('asu-chatbot-new-tab');
        const icon = document.getElementById('asu-chatbot-icon');

        // Toggle chat
        toggle.addEventListener('click', () => {
            isChatOpen = !isChatOpen;
            updateChatState();
            
            if (isChatOpen) {
                // Ensure authentication when opening chat
                ensureAuthentication();
            }
        });

        // Close on backdrop click
        backdrop.addEventListener('click', () => {
            isChatOpen = false;
            updateChatState();
        });

        // Profile selector dropdown
        profileSelector.addEventListener('click', (e) => {
            e.stopPropagation();
            isDropdownOpen = !isDropdownOpen;
            dropdown.classList.toggle('open', isDropdownOpen);
        });

        // Close dropdown when clicking elsewhere
        document.addEventListener('click', () => {
            isDropdownOpen = false;
            dropdown.classList.remove('open');
        });

        // Profile selection
        dropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.asu-chatbot-dropdown-item');
            if (item) {
                const index = parseInt(item.dataset.index);
                selectProfile(index);
            }
        });

        // Refresh iframe
        refresh.addEventListener('click', () => {
            iframe.src = iframe.src;
            ensureAuthentication();
        });

        // Open in new tab
        newTab.addEventListener('click', () => {
            window.open(chatbotProfiles[selectedProfile].url, '_blank');
        });

        // Handle iframe load errors (potential auth issues)
        iframe.addEventListener('error', () => {
            checkAuthentication();
        });

        function updateChatState() {
            toggle.classList.toggle('open', isChatOpen);
            sidebar.classList.toggle('open', isChatOpen);
            backdrop.classList.toggle('open', isChatOpen);
            document.body.classList.toggle('asu-chatbot-open', isChatOpen);
            icon.className = isChatOpen ? 'fas fa-times' : 'fas fa-comments';
        }

        function selectProfile(index) {
            selectedProfile = index;
            const profile = chatbotProfiles[index];
            
            // Update selected profile display
            document.getElementById('asu-chatbot-selected-name').textContent = profile.name;
            document.getElementById('asu-chatbot-selected-desc').textContent = profile.description;
            
            // Update active state in dropdown
            document.querySelectorAll('.asu-chatbot-dropdown-item').forEach((item, i) => {
                item.classList.toggle('active', i === index);
            });
            
            // Load new chatbot
            iframe.src = profile.url;
            
            // Close dropdown
            isDropdownOpen = false;
            dropdown.classList.remove('open');
            
            // Ensure authentication for new profile
            ensureAuthentication();
        }
    }

    // Initialize when DOM is ready
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        injectFontAwesome();
        injectStyles();
        createChatbot();
        addEventListeners();
        
        // Check authentication on initial load
        setTimeout(checkAuthentication, 1000);
    }

    // Start the chatbot
    init();

})();