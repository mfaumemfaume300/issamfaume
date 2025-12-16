// ============================================
// Audit Completion & Reporting - Interactive Script
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // Table of Contents Toggle
    // ============================================
    const tocToggle = document.getElementById('tocToggle');
    const tocList = document.getElementById('tocList');
    
    if (tocToggle && tocList) {
        // Initially show TOC on desktop, hide on mobile
        if (window.innerWidth > 768) {
            tocList.classList.add('active');
            tocToggle.textContent = 'Table of Contents \u25B2';
        }

        tocToggle.addEventListener('click', function() {
            tocList.classList.toggle('active');
            const isActive = tocList.classList.contains('active');
            tocToggle.textContent = isActive ? 'Table of Contents \u25B2' : 'Table of Contents \u25BC';
        });
    }

    // ============================================
    // Smooth Scrolling for Navigation Links
    // ============================================
    const navLinks = document.querySelectorAll('.toc-list a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const headerOffset = 100; // Offset for sticky nav
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Close TOC on mobile after clicking
                if (window.innerWidth <= 768) {
                    tocList.classList.remove('active');
                    tocToggle.textContent = 'Table of Contents \u25BC';
                }
            }
        });
    });

    // ============================================
    // Collapsible Sections
    // ============================================
    const collapsibleSections = document.querySelectorAll('.collapsible-section');
    
    collapsibleSections.forEach(section => {
        const trigger = section.querySelector('.collapse-trigger');
        
        if (trigger) {
            trigger.addEventListener('click', function() {
                section.classList.toggle('collapsed');
                
                // Animate scroll if section is being expanded and is out of view
                if (!section.classList.contains('collapsed')) {
                    setTimeout(() => {
                        const rect = section.getBoundingClientRect();
                        if (rect.top < 0) {
                            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 100);
                }
            });
        }
    });

    // Add keyboard support for collapsible sections
    collapsibleSections.forEach(section => {
        const trigger = section.querySelector('.collapse-trigger');
        if (trigger) {
            trigger.setAttribute('tabindex', '0');
            trigger.setAttribute('role', 'button');
            trigger.setAttribute('aria-expanded', 'true');
            
            trigger.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                    const isCollapsed = section.classList.contains('collapsed');
                    this.setAttribute('aria-expanded', !isCollapsed);
                }
            });
        }
    });

    // ============================================
    // Search Functionality
    // ============================================
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const closeSearch = document.getElementById('closeSearch');
    const searchResults = document.getElementById('searchResults');

    // Open search overlay
    if (searchBtn && searchOverlay) {
        searchBtn.addEventListener('click', function() {
            searchOverlay.classList.add('active');
            searchInput.focus();
        });
    }

    // Close search overlay
    if (closeSearch) {
        closeSearch.addEventListener('click', function() {
            searchOverlay.classList.remove('active');
            searchInput.value = '';
            searchResults.innerHTML = '';
        });
    }

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('active')) {
            searchOverlay.classList.remove('active');
            searchInput.value = '';
            searchResults.innerHTML = '';
        }
    });

    // Close when clicking outside
    if (searchOverlay) {
        searchOverlay.addEventListener('click', function(e) {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove('active');
                searchInput.value = '';
                searchResults.innerHTML = '';
            }
        });
    }

    // Search implementation
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim().toLowerCase();
            
            if (query.length < 2) {
                searchResults.innerHTML = '';
                return;
            }
            
            // Debounce search
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        });
    }

    function performSearch(query) {
        const allSections = document.querySelectorAll('.content-section');
        const results = [];
        
        allSections.forEach(section => {
            const sectionTitle = section.querySelector('.section-title');
            const cards = section.querySelectorAll('.card');
            
            cards.forEach(card => {
                const cardTitle = card.querySelector('h3');
                const content = card.textContent.toLowerCase();
                const title = cardTitle ? cardTitle.textContent : (sectionTitle ? sectionTitle.textContent : '');
                
                if (content.includes(query)) {
                    // Extract context around the match
                    const index = content.indexOf(query);
                    const start = Math.max(0, index - 50);
                    const end = Math.min(content.length, index + query.length + 100);
                    let excerpt = content.substring(start, end).trim();
                    
                    // Clean up excerpt
                    excerpt = excerpt.replace(/\s+/g, ' ');
                    if (start > 0) excerpt = '...' + excerpt;
                    if (end < content.length) excerpt = excerpt + '...';
                    
                    // Highlight the query in excerpt
                    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
                    excerpt = excerpt.replace(regex, '<span class="search-highlight">$1</span>');
                    
                    results.push({
                        title: title,
                        excerpt: excerpt,
                        section: section.id,
                        element: card
                    });
                }
            });
        });
        
        displaySearchResults(results, query);
    }

    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function displaySearchResults(results, query) {
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No results found for "' + escapeHtml(query) + '"</div>';
            return;
        }
        
        // Limit results to top 10
        const limitedResults = results.slice(0, 10);
        
        let html = '<div style="margin-bottom: 1rem; color: var(--text-light);">' + 
                   'Found ' + results.length + ' result' + (results.length > 1 ? 's' : '') + 
                   (results.length > 10 ? ' (showing first 10)' : '') + '</div>';
        
        limitedResults.forEach(result => {
            html += `
                <div class="search-result-item" data-section="${result.section}">
                    <h4>${escapeHtml(result.title)}</h4>
                    <p>${result.excerpt}</p>
                </div>
            `;
        });
        
        searchResults.innerHTML = html;
        
        // Add click handlers to results
        const resultItems = searchResults.querySelectorAll('.search-result-item');
        resultItems.forEach(item => {
            item.addEventListener('click', function() {
                const sectionId = this.getAttribute('data-section');
                const section = document.getElementById(sectionId);
                
                if (section) {
                    // Close search overlay
                    searchOverlay.classList.remove('active');
                    searchInput.value = '';
                    searchResults.innerHTML = '';
                    
                    // Expand section if collapsed
                    if (section.classList.contains('collapsed')) {
                        section.classList.remove('collapsed');
                    }
                    
                    // Scroll to section
                    const headerOffset = 100;
                    const elementPosition = section.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // Back to Top Button
    // ============================================
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ============================================
    // Enhanced Tooltip Accessibility
    // ============================================
    const tooltips = document.querySelectorAll('.tooltip');
    
    tooltips.forEach(tooltip => {
        // Add ARIA attributes
        tooltip.setAttribute('tabindex', '0');
        tooltip.setAttribute('aria-label', tooltip.getAttribute('data-tooltip'));
        
        // Keyboard support
        tooltip.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Tooltip will show on focus via CSS
            }
        });
        
        // Touch support for mobile
        tooltip.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.classList.add('tooltip-active');
            
            // Remove after 3 seconds
            setTimeout(() => {
                this.classList.remove('tooltip-active');
            }, 3000);
        });
    });

    // ============================================
    // Keyboard Shortcuts
    // ============================================
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to open search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchBtn && searchOverlay) {
                searchOverlay.classList.add('active');
                searchInput.focus();
            }
        }
        
        // Ctrl/Cmd + H to toggle TOC
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            if (tocToggle) {
                tocToggle.click();
            }
        }
    });

    // ============================================
    // Section Visibility Animation
    // ============================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards for animation
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // ============================================
    // Active Section Highlighting in TOC
    // ============================================
    const sections = document.querySelectorAll('.content-section');
    const tocLinks = document.querySelectorAll('.toc-list a');

    const sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                tocLinks.forEach(link => {
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.style.boxShadow = '0 4px 12px rgba(0, 102, 204, 0.4)';
                        link.style.transform = 'scale(1.05)';
                    } else {
                        link.style.boxShadow = '';
                        link.style.transform = '';
                    }
                });
            }
        });
    }, {
        threshold: 0.3
    });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // ============================================
    // Dynamic Content Statistics
    // ============================================
    function updateStatistics() {
        const totalSections = document.querySelectorAll('.content-section').length;
        const totalCards = document.querySelectorAll('.card').length;
        const totalTooltips = document.querySelectorAll('.tooltip').length;
        
        console.log('Audit Document Statistics:');
        console.log('- Total Sections:', totalSections);
        console.log('- Total Cards:', totalCards);
        console.log('- Total Interactive Tooltips:', totalTooltips);
        console.log('- Interactive features: Collapsible sections, search, tooltips, smooth scrolling');
    }

    updateStatistics();

    // ============================================
    // Print Functionality
    // ============================================
    window.addEventListener('beforeprint', function() {
        // Expand all sections before printing
        collapsibleSections.forEach(section => {
            section.classList.remove('collapsed');
        });
    });

    // ============================================
    // Responsive TOC Behavior
    // ============================================
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768 && !tocList.classList.contains('active')) {
                tocList.classList.add('active');
                tocToggle.textContent = 'Table of Contents \u25B2';
            } else if (window.innerWidth <= 768 && tocList.classList.contains('active')) {
                tocList.classList.remove('active');
                tocToggle.textContent = 'Table of Contents \u25BC';
            }
        }, 250);
    });

    // ============================================
    // Loading Complete Message
    // ============================================
    console.log('%c✓ Audit Completion & Reporting Document Loaded', 'color: #0066cc; font-size: 16px; font-weight: bold;');
    console.log('%cKeyboard Shortcuts:', 'color: #009999; font-weight: bold;');
    console.log('  • Ctrl/Cmd + K: Open search');
    console.log('  • Ctrl/Cmd + H: Toggle table of contents');
    console.log('  • ESC: Close search overlay');
    console.log('%cFeatures:', 'color: #009999; font-weight: bold;');
    console.log('  • Interactive collapsible sections');
    console.log('  • Real-time search functionality');
    console.log('  • Tooltips for key terms (hover or tap)');
    console.log('  • Smooth scrolling navigation');
    console.log('  • Responsive mobile-friendly design');

});
