// Main JavaScript File - AI Bazaar Landing Page

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavbar();
    initScrollAnimations();
    initCounterAnimations();
    initVoiceDemo();
    initSampleCommands();
    initBeforeAfterEffects();
    initCTAButtons();
    initMobileMenu();
});

// 1. Navbar Scroll Effect
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove scrolled class
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Update active nav link
        updateActiveNavLink();
        
        lastScrollTop = scrollTop;
    });
}

// 2. Mobile Menu Toggle
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !menuBtn.contains(event.target)) {
                navMenu.classList.remove('active');
                menuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
            }
        });
    }
}

// 3. Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || '0s';
                
                // Apply delay via setTimeout
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, parseFloat(delay) * 1000);
            }
        });
    }, observerOptions);
    
    // Observe all animate-on-scroll elements
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// 4. Animated Counters
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number, .metric-number');
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(counter) {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            counter.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            counter.textContent = target;
        }
    };
    
    updateCounter();
}

// 5. Update Active Nav Link
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// 6. Voice Demo Simulation
function initVoiceDemo() {
    const micButton = document.getElementById('micButton');
    const voiceWave = document.getElementById('voiceWave');
    const conversation = document.getElementById('demoConversation');
    const languageSelect = document.getElementById('demoLanguage');
    
    if (!micButton) return;
    
    let isListening = false;
    
    // Sample responses based on language
    const responses = {
        'hindi': {
            'add': '✓ जोड़ा गया! 5 kg आटा बिक्री में जोड़ा। स्टॉक अपडेट किया गया।',
            'stock': 'आपके पास 8 kg चीनी का स्टॉक है। 2 दिन में फिर से ऑर्डर करने पर विचार करें।',
            'invoice': '✓ GST इनवॉइस बनाया गया। कुल राशि: ₹525 (₹500 + ₹25 GST)।'
        },
        'tamil': {
            'add': '✓ சேர்க்கப்பட்டது! 5 கிலோ கோதுமை மாவு விற்பனையில் சேர்க்கப்பட்டது. பங்கு புதுப்பிக்கப்பட்டது.',
            'stock': 'உங்களிடம் 8 கிலோ சர்க்கரை இருப்பு உள்ளது. 2 நாட்களில் மீண்டும் ஆர்டர் செய்யக் கவனியுங்கள்.',
            'invoice': '✓ GST இன்வாய்ஸ் உருவாக்கப்பட்டது. மொத்தம்: ₹525 (₹500 + ₹25 GST).'
        },
        'gujarati': {
            'add': '✓ ઉમેરાયું! 5 કિલો લોટ વેચાણમાં ઉમેર્યું. સ્ટોક અપડેટ કર્યો.',
            'stock': 'તમારી પાસે 8 કિલો ખાંડનો સ્ટોક છે. 2 દિવસમાં ફરીથી ઓર્ડર કરવાનો વિચાર કરો.',
            'invoice': '✓ GST ઇનવૉઇસ બનાવ્યો. કુલ રકમ: ₹525 (₹500 + ₹25 GST).'
        }
    };
    
    micButton.addEventListener('click', function() {
        if (!isListening) {
            // Start listening
            isListening = true;
            micButton.classList.add('active');
            voiceWave.classList.remove('hidden');
            micButton.innerHTML = '<i class="fas fa-stop"></i>';
            
            // Add listening message
            addMessage("Listening... Speak now", 'ai', true);
            
            // Simulate listening for 3 seconds
            setTimeout(() => {
                if (isListening) {
                    stopListening();
                    simulateVoiceCommand();
                }
            }, 3000);
        } else {
            // Stop listening
            stopListening();
        }
    });
    
    function stopListening() {
        isListening = false;
        micButton.classList.remove('active');
        voiceWave.classList.add('hidden');
        micButton.innerHTML = '<i class="fas fa-microphone"></i>';
    }
    
    function simulateVoiceCommand() {
        const commands = [
            "Add 5 kg atta to today's sales",
            "What is my stock of sugar?",
            "Generate GST invoice for customer Rahul",
            "How much tea powder is left?",
            "Show today's profit"
        ];
        
        const randomCommand = commands[Math.floor(Math.random() * commands.length)];
        processVoiceCommand(randomCommand);
    }
    
    function processVoiceCommand(command) {
        // Add user message
        addMessage(command, 'user');
        
        // Process and add AI response
        setTimeout(() => {
            const language = languageSelect.value;
            let response;
            
            if (command.toLowerCase().includes('add')) {
                response = responses[language]?.add || "✓ Added successfully! Inventory updated.";
            } else if (command.toLowerCase().includes('stock')) {
                response = responses[language]?.stock || "You have 8 kg in stock. Consider reordering in 2 days.";
            } else if (command.toLowerCase().includes('invoice')) {
                response = responses[language]?.invoice || "✓ GST invoice generated. Total: ₹525 (₹500 + ₹25 GST).";
            } else {
                response = "I've recorded that. Is there anything else you'd like me to help with?";
            }
            
            addMessage(response, 'ai');
        }, 1000);
    }
    
    function addMessage(text, sender, isTemporary = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = sender === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.innerHTML = `<p>${text}</p>`;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
        
        if (isTemporary) {
            messageDiv.classList.add('temporary');
            conversation.appendChild(messageDiv);
            
            // Remove temporary message
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 2000);
        } else {
            conversation.appendChild(messageDiv);
        }
        
        // Scroll to bottom
        conversation.scrollTop = conversation.scrollHeight;
    }
}

// 7. Sample Command Buttons
function initSampleCommands() {
    const commandTags = document.querySelectorAll('.command-tag');
    const conversation = document.getElementById('demoConversation');
    
    commandTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const command = this.getAttribute('data-command');
            
            // Add user message
            const userMsg = document.createElement('div');
            userMsg.className = 'message user';
            userMsg.innerHTML = `
                <div class="avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="bubble">
                    <p>${command}</p>
                </div>
            `;
            conversation.appendChild(userMsg);
            
            // Simulate AI response
            setTimeout(() => {
                const aiMsg = document.createElement('div');
                aiMsg.className = 'message ai';
                
                let response = '';
                if (command.includes('Add')) {
                    response = "✓ Added 5 kg atta to today's sales. Inventory updated: 15 kg remaining.";
                } else if (command.includes('Stock')) {
                    response = "You have 8 kg of sugar in stock. Consider ordering more in 2 days.";
                } else if (command.includes('GST')) {
                    response = "✓ GST invoice generated for Rahul. Total: ₹525 (₹500 + ₹25 GST).";
                }
                
                aiMsg.innerHTML = `
                    <div class="avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="bubble">
                        <p>${response}</p>
                    </div>
                `;
                conversation.appendChild(aiMsg);
                
                // Scroll to bottom
                conversation.scrollTop = conversation.scrollHeight;
            }, 800);
        });
    });
}

// 8. Before/After Effects
function initBeforeAfterEffects() {
    const comparisonCards = document.querySelectorAll('.comparison-card');
    
    comparisonCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('hover-lift');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('hover-lift');
        });
    });
}

// 9. CTA Buttons
function initCTAButtons() {
    const tryDemoBtns = document.querySelectorAll('#tryDemoHero, #finalDemo');
    
    tryDemoBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Scroll to demo section
            document.getElementById('demo').scrollIntoView({
                behavior: 'smooth'
            });
            
            // Trigger demo after a delay
            setTimeout(() => {
                const micBtn = document.getElementById('micButton');
                if (micBtn) {
                    micBtn.click();
                }
            }, 1000);
        });
    });
    
    // Watch video button
    const watchVideoBtn = document.getElementById('watchVideo');
    if (watchVideoBtn) {
        watchVideoBtn.addEventListener('click', function() {
            // In a real implementation, this would open a video modal
            alert('Video demonstration would play here. In production, this would open a modal with a tutorial video.');
        });
    }
}

// 10. Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});