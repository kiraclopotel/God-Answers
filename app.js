// God Answers - Main Application Logic
// Progressive Web App with Multi-Faith Support

// ============================================================================
// CONFIGURATION & DATA
// ============================================================================

const faithData = {
    christianity: {
        name: 'Christianity',
        icon: '✝️',
        source: 'Holy Bible',
        api: 'bible-api.com'
    },
    islam: {
        name: 'Islam',
        icon: '☪️',
        source: 'Holy Quran',
        api: 'api.alquran.cloud'
    },
    judaism: {
        name: 'Judaism',
        icon: '✡️',
        source: 'Torah',
        api: 'sefaria.org'
    },
    hinduism: {
        name: 'Hinduism',
        icon: '🕉️',
        source: 'Bhagavad Gita',
        api: 'bhagavadgita.io'
    },
    buddhism: {
        name: 'Buddhism',
        icon: '☸️',
        source: 'Dhammapada',
        api: 'local'
    }
};

let selectedFaith = null;
let currentVerse = null;
let deferredPrompt = null;

// Daily guidance tracking
const DAILY_LIMIT = 10; // Maximum guidances per day
const FREE_DAILY = 3;   // Free guidances at start of day
let guidanceData = {
    remaining: FREE_DAILY,
    lastReset: new Date().toDateString(),
    earnedToday: {
        reflect: 0,
        share: 0,
        save: 0
    },
    currentStreak: 0,
    longestStreak: 0,
    totalDays: 0,
    lastActiveDate: null
};

// Bible structure - all 66 books
const bibleBooks = [
    {name: "Genesis", abbr: "Genesis", chapters: 50},
    {name: "Exodus", abbr: "Exodus", chapters: 40},
    {name: "Leviticus", abbr: "Leviticus", chapters: 27},
    {name: "Numbers", abbr: "Numbers", chapters: 36},
    {name: "Deuteronomy", abbr: "Deuteronomy", chapters: 34},
    {name: "Joshua", abbr: "Joshua", chapters: 24},
    {name: "Judges", abbr: "Judges", chapters: 21},
    {name: "Ruth", abbr: "Ruth", chapters: 4},
    {name: "1 Samuel", abbr: "1Samuel", chapters: 31},
    {name: "2 Samuel", abbr: "2Samuel", chapters: 24},
    {name: "1 Kings", abbr: "1Kings", chapters: 22},
    {name: "2 Kings", abbr: "2Kings", chapters: 25},
    {name: "1 Chronicles", abbr: "1Chronicles", chapters: 29},
    {name: "2 Chronicles", abbr: "2Chronicles", chapters: 36},
    {name: "Ezra", abbr: "Ezra", chapters: 10},
    {name: "Nehemiah", abbr: "Nehemiah", chapters: 13},
    {name: "Esther", abbr: "Esther", chapters: 10},
    {name: "Job", abbr: "Job", chapters: 42},
    {name: "Psalms", abbr: "Psalms", chapters: 150},
    {name: "Proverbs", abbr: "Proverbs", chapters: 31},
    {name: "Ecclesiastes", abbr: "Ecclesiastes", chapters: 12},
    {name: "Song of Solomon", abbr: "SongofSolomon", chapters: 8},
    {name: "Isaiah", abbr: "Isaiah", chapters: 66},
    {name: "Jeremiah", abbr: "Jeremiah", chapters: 52},
    {name: "Lamentations", abbr: "Lamentations", chapters: 5},
    {name: "Ezekiel", abbr: "Ezekiel", chapters: 48},
    {name: "Daniel", abbr: "Daniel", chapters: 12},
    {name: "Hosea", abbr: "Hosea", chapters: 14},
    {name: "Joel", abbr: "Joel", chapters: 3},
    {name: "Amos", abbr: "Amos", chapters: 9},
    {name: "Obadiah", abbr: "Obadiah", chapters: 1},
    {name: "Jonah", abbr: "Jonah", chapters: 4},
    {name: "Micah", abbr: "Micah", chapters: 7},
    {name: "Nahum", abbr: "Nahum", chapters: 3},
    {name: "Habakkuk", abbr: "Habakkuk", chapters: 3},
    {name: "Zephaniah", abbr: "Zephaniah", chapters: 3},
    {name: "Haggai", abbr: "Haggai", chapters: 2},
    {name: "Zechariah", abbr: "Zechariah", chapters: 14},
    {name: "Malachi", abbr: "Malachi", chapters: 4},
    {name: "Matthew", abbr: "Matthew", chapters: 28},
    {name: "Mark", abbr: "Mark", chapters: 16},
    {name: "Luke", abbr: "Luke", chapters: 24},
    {name: "John", abbr: "John", chapters: 21},
    {name: "Acts", abbr: "Acts", chapters: 28},
    {name: "Romans", abbr: "Romans", chapters: 16},
    {name: "1 Corinthians", abbr: "1Corinthians", chapters: 16},
    {name: "2 Corinthians", abbr: "2Corinthians", chapters: 13},
    {name: "Galatians", abbr: "Galatians", chapters: 6},
    {name: "Ephesians", abbr: "Ephesians", chapters: 6},
    {name: "Philippians", abbr: "Philippians", chapters: 4},
    {name: "Colossians", abbr: "Colossians", chapters: 4},
    {name: "1 Thessalonians", abbr: "1Thessalonians", chapters: 5},
    {name: "2 Thessalonians", abbr: "2Thessalonians", chapters: 3},
    {name: "1 Timothy", abbr: "1Timothy", chapters: 6},
    {name: "2 Timothy", abbr: "2Timothy", chapters: 4},
    {name: "Titus", abbr: "Titus", chapters: 3},
    {name: "Philemon", abbr: "Philemon", chapters: 1},
    {name: "Hebrews", abbr: "Hebrews", chapters: 13},
    {name: "James", abbr: "James", chapters: 5},
    {name: "1 Peter", abbr: "1Peter", chapters: 5},
    {name: "2 Peter", abbr: "2Peter", chapters: 3},
    {name: "1 John", abbr: "1John", chapters: 5},
    {name: "2 John", abbr: "2John", chapters: 1},
    {name: "3 John", abbr: "3John", chapters: 1},
    {name: "Jude", abbr: "Jude", chapters: 1},
    {name: "Revelation", abbr: "Revelation", chapters: 22}
];

// Buddhist Dhammapada verses (sample - full version would have all 423 verses)
const dhammapadaVerses = [
    {verse: 1, chapter: 1, text: "All that we are is the result of what we have thought: it is founded on our thoughts, it is made up of our thoughts. If a man speaks or acts with an evil thought, pain follows him, as the wheel follows the foot of the ox that draws the carriage."},
    {verse: 2, chapter: 1, text: "All that we are is the result of what we have thought: it is founded on our thoughts, it is made up of our thoughts. If a man speaks or acts with a pure thought, happiness follows him, like a shadow that never leaves him."},
    {verse: 3, chapter: 1, text: "He abused me, he beat me, he defeated me, he robbed me – in those who harbour such thoughts hatred will never cease."},
    {verse: 21, chapter: 2, text: "Earnestness is the path of immortality, thoughtlessness the path of death. Those who are in earnest do not die, those who are thoughtless are as if dead already."},
    {verse: 25, chapter: 2, text: "By effort and heedfulness, discipline and self-mastery, let the wise one make for himself an island which no flood can overwhelm."},
    {verse: 50, chapter: 4, text: "Not the perversities of others, not their sins of commission or omission, but his own misdeeds and negligences should a sage take notice of."},
    {verse: 103, chapter: 8, text: "Though one should conquer a thousand times a thousand men in battle, he who conquers himself is the greatest warrior."},
    {verse: 183, chapter: 14, text: "To avoid all evil, to cultivate good, and to cleanse one's mind — this is the teaching of the Buddhas."},
    {verse: 223, chapter: 17, text: "Conquer anger by love. Conquer evil by good. Conquer the stingy by giving. Conquer the liar by truth."},
    {verse: 276, chapter: 20, text: "You yourself must make the effort. The Buddhas are only teachers. The thoughtful who enter the way are freed from the bondage of Mara."}
];

// ============================================================================
// INITIALIZATION
// ============================================================================

window.addEventListener('load', function() {
    initializeApp();
    registerServiceWorker();
    setupPWAInstall();
});

function initializeApp() {
    // Load and check guidance data
    loadGuidanceData();
    checkDailyReset();
    updateGuidanceUI();
    
    // Check for remembered faith
    const rememberedFaith = localStorage.getItem('selectedFaith');
    if (rememberedFaith) {
        selectedFaith = rememberedFaith;
        showMainApp();
    }

    // Load theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeIcon').textContent = '☀️';
    }

    // Setup event listeners
    setupFaithSelection();
    setupThemeToggle();
}

function setupFaithSelection() {
    document.querySelectorAll('.faith-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.faith-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedFaith = this.dataset.faith;
            document.getElementById('continueBtn').disabled = false;
        });
    });

    document.getElementById('continueBtn').addEventListener('click', function() {
        if (document.getElementById('rememberFaith').checked) {
            localStorage.setItem('selectedFaith', selectedFaith);
        }
        showMainApp();
    });
}

function setupThemeToggle() {
    document.getElementById('themeToggle').addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        document.getElementById('themeIcon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
        
        // Haptic feedback on mobile
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    });
}

// ============================================================================
// DAILY GUIDANCE SYSTEM
// ============================================================================

function loadGuidanceData() {
    const saved = localStorage.getItem('guidanceData');
    if (saved) {
        guidanceData = JSON.parse(saved);
    }
}

function saveGuidanceData() {
    localStorage.setItem('guidanceData', JSON.stringify(guidanceData));
}

function checkDailyReset() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString(); // 24 hours ago
    
    if (guidanceData.lastReset !== today) {
        // Check if user used app yesterday to maintain streak
        if (guidanceData.lastActiveDate === yesterday) {
            guidanceData.currentStreak++;
        } else if (guidanceData.lastActiveDate !== today) {
            // Streak broken
            guidanceData.currentStreak = 0;
        }
        
        // Update longest streak
        if (guidanceData.currentStreak > guidanceData.longestStreak) {
            guidanceData.longestStreak = guidanceData.currentStreak;
        }
        
        // New day - reset
        guidanceData.remaining = FREE_DAILY;
        guidanceData.lastReset = today;
        guidanceData.earnedToday = {
            reflect: 0,
            share: 0,
            save: 0
        };
        
        saveGuidanceData();
    }
}

function markDayActive() {
    const today = new Date().toDateString();
    if (guidanceData.lastActiveDate !== today) {
        guidanceData.lastActiveDate = today;
        guidanceData.totalDays++;
        
        // If this is first use today, increment streak
        if (guidanceData.currentStreak === 0) {
            guidanceData.currentStreak = 1;
        }
        
        saveGuidanceData();
    }
}

function updateGuidanceUI() {
    const countElement = document.getElementById('remainingCount');
    const earnMoreSection = document.getElementById('earnMore');
    
    if (countElement) {
        countElement.textContent = guidanceData.remaining;
        
        // Show earn more section if running low
        if (guidanceData.remaining <= 1 && earnMoreSection) {
            earnMoreSection.style.display = 'block';
        } else if (earnMoreSection) {
            earnMoreSection.style.display = 'none';
        }
    }
    
    // Update counter label to show streak
    const counterLabel = document.querySelector('.counter-label');
    if (counterLabel && guidanceData.currentStreak > 0) {
        counterLabel.innerHTML = `Divine Guidances Remaining Today<br><span style="font-size: 0.9em; color: var(--primary-color);">🔥 ${guidanceData.currentStreak} Day Streak</span>`;
    } else if (counterLabel) {
        counterLabel.textContent = 'Divine Guidances Remaining Today';
    }
}

function canReceiveGuidance() {
    return guidanceData.remaining > 0;
}

function useGuidance() {
    if (guidanceData.remaining > 0) {
        guidanceData.remaining--;
        saveGuidanceData();
        updateGuidanceUI();
        return true;
    }
    return false;
}

function earnGuidance(type, amount) {
    const canEarn = guidanceData.remaining < DAILY_LIMIT;
    
    if (!canEarn) {
        showToast('You have reached the daily maximum');
        return false;
    }
    
    // Check if already earned from this action today
    const maxEarnings = { reflect: 3, share: 3, save: 5 }; // Max times per day
    
    if (guidanceData.earnedToday[type] >= maxEarnings[type]) {
        showToast(`You've earned the maximum from ${type} today`);
        return false;
    }
    
    // Add guidances but don't exceed daily limit
    const toAdd = Math.min(amount, DAILY_LIMIT - guidanceData.remaining);
    guidanceData.remaining += toAdd;
    guidanceData.earnedToday[type]++;
    
    saveGuidanceData();
    updateGuidanceUI();
    
    return true;
}

// ============================================================================
// NAVIGATION
// ============================================================================

function showMainApp() {
    document.getElementById('faithSelector').classList.remove('active');
    document.getElementById('mainApp').classList.add('active');
    
    const faith = faithData[selectedFaith];
    document.getElementById('currentFaith').innerHTML = `
        <span>${faith.icon}</span>
        <span>${faith.name}</span>
    `;
}

function changeFaith() {
    localStorage.removeItem('selectedFaith');
    
    // Hide and reset main app
    document.getElementById('mainApp').classList.remove('active');
    const result = document.getElementById('result');
    result.classList.remove('show');
    resetVerseDisplay();
    
    // Show faith selector
    document.getElementById('faithSelector').classList.add('active');
    document.querySelectorAll('.faith-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('continueBtn').disabled = true;
    document.getElementById('rememberFaith').checked = false;
}

function resetVerseDisplay() {
    const elements = ['reference', 'verseText', 'translation', 'verseActions'];
    elements.forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('reveal');
        if (id !== 'verseActions') {
            el.textContent = '';
        }
    });
    document.getElementById('result').style.opacity = '1';
    document.getElementById('result').style.transform = 'translateY(0)';
    
    // Hide share card
    const shareCardContainer = document.getElementById('shareCardContainer');
    if (shareCardContainer) {
        shareCardContainer.style.display = 'none';
    }
}

// ============================================================================
// MAIN FUNCTIONALITY - RECEIVE ANSWER
// ============================================================================

async function receiveAnswer() {
    const btn = document.getElementById('readyBtn');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const error = document.getElementById('error');
    
    // Check if user has guidances remaining
    if (!canReceiveGuidance()) {
        showToast('No guidances remaining today. Reflect, Share, or Save to earn more! 🙏');
        document.getElementById('earnMore').style.display = 'block';
        return;
    }
    
    // Use one guidance
    if (!useGuidance()) {
        return;
    }
    
    // Disable button
    btn.disabled = true;
    
    // Haptic feedback
    if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]);
    }
    
    // If there's a previous result, fade it out first
    if (result.classList.contains('show')) {
        result.style.opacity = '0';
        result.style.transform = 'translateY(-20px)';
        await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    // Clear previous content
    result.classList.remove('show');
    resetVerseDisplay();
    error.classList.remove('show');
    
    // Show loading
    loading.classList.add('show');
    
    try {
        // Fetch based on selected faith
        switch(selectedFaith) {
            case 'christianity':
                await fetchChristianVerse();
                break;
            case 'islam':
                await fetchIslamVerse();
                break;
            case 'judaism':
                await fetchJudaismVerse();
                break;
            case 'hinduism':
                await fetchHinduismVerse();
                break;
            case 'buddhism':
                await fetchBuddhismVerse();
                break;
        }
    } catch (err) {
        console.error('Error:', err);
        error.textContent = 'Unable to receive guidance at this time. Please check your connection and try again.';
        error.classList.add('show');
        
        // Refund the guidance since it failed
        guidanceData.remaining++;
        saveGuidanceData();
        updateGuidanceUI();
    } finally {
        loading.classList.remove('show');
        btn.disabled = false;
    }
}

// ============================================================================
// API INTEGRATIONS
// ============================================================================

function getRandomBibleVerse() {
    const randomBook = bibleBooks[Math.floor(Math.random() * bibleBooks.length)];
    const randomChapter = Math.floor(Math.random() * randomBook.chapters) + 1;
    const randomVerse = Math.floor(Math.random() * 50) + 1;
    
    return {
        book: randomBook.abbr,
        chapter: randomChapter,
        verse: randomVerse
    };
}

async function fetchChristianVerse() {
    const verse = getRandomBibleVerse();
    let apiUrl = `https://bible-api.com/${verse.book}+${verse.chapter}:${verse.verse}`;
    
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            // If verse doesn't exist, try verse 1
            const retryUrl = `https://bible-api.com/${verse.book}+${verse.chapter}:1`;
            const retryResponse = await fetch(retryUrl);
            
            if (!retryResponse.ok) {
                throw new Error('Unable to fetch verse');
            }
            
            const data = await retryResponse.json();
            await checkAndExpandVerse(data, verse.book, verse.chapter, verse.verse);
        } else {
            const data = await response.json();
            await checkAndExpandVerse(data, verse.book, verse.chapter, verse.verse);
        }
    } catch (error) {
        throw error;
    }
}

async function checkAndExpandVerse(data, book, chapter, startVerse) {
    // Check if verse seems incomplete
    const text = data.text.trim();
    const incompletePatterns = [
        /,\s*saying[,.]?\s*$/i,
        /:\s*$/,
        /,\s*$/,
        /and\s*$/i,
        /but\s*$/i,
        /for\s*$/i,
        /that\s*$/i,
        /which\s*$/i,
        /who\s*$/i,
        /when\s*$/i,
        /therefore\s*$/i
    ];
    
    const seemsIncomplete = incompletePatterns.some(pattern => pattern.test(text));
    
    if (seemsIncomplete && startVerse < 50) {
        // Fetch verse range to get complete thought
        try {
            const rangeUrl = `https://bible-api.com/${book}+${chapter}:${startVerse}-${startVerse + 1}`;
            const rangeResponse = await fetch(rangeUrl);
            
            if (rangeResponse.ok) {
                const rangeData = await rangeResponse.json();
                // Check if combined text is more complete
                const combinedText = rangeData.text.trim();
                if (combinedText.length > text.length) {
                    displayVerse(rangeData);
                    return;
                }
            }
        } catch (err) {
            console.log('Could not fetch extended verse, using original');
        }
    }
    
    // Display original if expansion failed or wasn't needed
    displayVerse(data);
}

async function fetchIslamVerse() {
    // Al-Quran Cloud API - Random verse from 6236 verses
    const randomVerse = Math.floor(Math.random() * 6236) + 1;
    const apiUrl = `https://api.alquran.cloud/v1/ayah/${randomVerse}/en.asad`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.code === 200) {
            const verseData = {
                reference: `Quran ${data.data.surah.number}:${data.data.numberInSurah}`,
                text: data.data.text,
                translation: `Surah ${data.data.surah.englishName} - ${data.data.surah.englishNameTranslation}`
            };
            displayVerse(verseData);
        } else {
            throw new Error('Failed to fetch Quran verse');
        }
    } catch (error) {
        throw error;
    }
}

async function fetchJudaismVerse() {
    // Sefaria API - Random verse from Torah
    const torahBooks = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'];
    const randomBook = torahBooks[Math.floor(Math.random() * torahBooks.length)];
    const maxChapters = {Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34};
    const randomChapter = Math.floor(Math.random() * maxChapters[randomBook]) + 1;
    const randomVerse = Math.floor(Math.random() * 30) + 1;
    
    const apiUrl = `https://www.sefaria.org/api/texts/${randomBook}.${randomChapter}.${randomVerse}?context=0`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.text && data.text.length > 0) {
            const verseData = {
                reference: `${randomBook} ${randomChapter}:${randomVerse}`,
                text: Array.isArray(data.text) ? data.text[0] : data.text,
                translation: 'Torah - Hebrew Bible'
            };
            displayVerse(verseData);
        } else {
            throw new Error('Failed to fetch Torah verse');
        }
    } catch (error) {
        // Fallback to a known verse
        const verseData = {
            reference: 'Deuteronomy 6:5',
            text: 'You shall love the LORD your God with all your heart and with all your soul and with all your might.',
            translation: 'Torah - Hebrew Bible'
        };
        displayVerse(verseData);
    }
}

async function fetchHinduismVerse() {
    // Bhagavad Gita API - 700 verses across 18 chapters
    const randomChapter = Math.floor(Math.random() * 18) + 1;
    const versesPerChapter = [47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 35, 27, 20, 24, 28, 78];
    const maxVerse = versesPerChapter[randomChapter - 1];
    const randomVerse = Math.floor(Math.random() * maxVerse) + 1;
    
    const apiUrl = `https://bhagavadgita.io/api/v1/chapters/${randomChapter}/verses/${randomVerse}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data && data.translations && data.translations.length > 0) {
            const verseData = {
                reference: `Bhagavad Gita ${randomChapter}:${randomVerse}`,
                text: data.translations[0].description,
                translation: data.translations[0].author_name || 'Bhagavad Gita'
            };
            displayVerse(verseData);
        } else {
            throw new Error('Failed to fetch Bhagavad Gita verse');
        }
    } catch (error) {
        // Fallback verse
        const verseData = {
            reference: 'Bhagavad Gita 2:47',
            text: 'You have the right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results of your activities, nor be attached to inaction.',
            translation: 'Bhagavad Gita'
        };
        displayVerse(verseData);
    }
}

async function fetchBuddhismVerse() {
    // Use local Dhammapada verses
    const randomVerse = dhammapadaVerses[Math.floor(Math.random() * dhammapadaVerses.length)];
    
    const verseData = {
        reference: `Dhammapada ${randomVerse.chapter}:${randomVerse.verse}`,
        text: randomVerse.text,
        translation: 'The Dhammapada - Buddhist Scripture'
    };
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    displayVerse(verseData);
}

// ============================================================================
// DISPLAY & ANIMATIONS
// ============================================================================

function displayVerse(data) {
    const result = document.getElementById('result');
    const reference = document.getElementById('reference');
    const verseText = document.getElementById('verseText');
    const translation = document.getElementById('translation');
    const verseActions = document.getElementById('verseActions');
    
    // Store current verse for saving/sharing
    currentVerse = {
        reference: data.reference,
        text: typeof data.text === 'string' ? data.text.trim() : data.text,
        translation: data.translation_name ? 
            `${data.translation_name} (${data.translation_id.toUpperCase()})` : 
            data.translation,
        faith: selectedFaith
    };
    
    // Mark day as active for streak tracking
    markDayActive();
    
    // Set content
    reference.textContent = currentVerse.reference;
    verseText.textContent = currentVerse.text;
    translation.textContent = currentVerse.translation;
    
    // Check if already saved
    updateSaveButton();
    
    // Show result container
    result.classList.add('show');
    
    // Trigger staggered animations
    setTimeout(() => reference.classList.add('reveal'), 300);
    setTimeout(() => verseText.classList.add('reveal'), 600);
    setTimeout(() => translation.classList.add('reveal'), 1200);
    setTimeout(() => verseActions.classList.add('reveal'), 1500);
    
    // Generate and display share card
    setTimeout(() => displayShareCard(), 1800);
}

// ============================================================================
// FAVORITES SYSTEM
// ============================================================================

function getSavedVerses() {
    const saved = localStorage.getItem('savedVerses');
    return saved ? JSON.parse(saved) : [];
}

function saveVerse(verse) {
    const saved = getSavedVerses();
    saved.unshift(verse); // Add to beginning
    localStorage.setItem('savedVerses', JSON.stringify(saved));
}

function removeSavedVerse(reference) {
    let saved = getSavedVerses();
    saved = saved.filter(v => v.reference !== reference);
    localStorage.setItem('savedVerses', JSON.stringify(saved));
}

function isVerseSaved(reference) {
    const saved = getSavedVerses();
    return saved.some(v => v.reference === reference);
}

function toggleSave() {
    if (!currentVerse) return;
    
    const isSaved = isVerseSaved(currentVerse.reference);
    
    if (isSaved) {
        removeSavedVerse(currentVerse.reference);
        showToast('Removed from saved passages');
    } else {
        saveVerse(currentVerse);
        
        // Earn +1 guidance for saving
        if (earnGuidance('save', 1)) {
            showToast('Saved! +1 guidance earned 🙏');
        } else {
            showToast('Saved to your collection');
        }
    }
    
    updateSaveButton();
    
    // Haptic feedback
    if ('vibrate' in navigator) {
        navigator.vibrate(30);
    }
}

function updateSaveButton() {
    if (!currentVerse) return;
    
    const saveBtn = document.getElementById('saveBtn');
    const saveIcon = document.getElementById('saveIcon');
    const saveText = document.getElementById('saveText');
    const isSaved = isVerseSaved(currentVerse.reference);
    
    if (isSaved) {
        saveBtn.classList.add('active');
        saveIcon.textContent = '✓';
        saveText.textContent = 'Saved';
    } else {
        saveBtn.classList.remove('active');
        saveIcon.textContent = '💾';
        saveText.textContent = 'Save';
    }
}

// ============================================================================
// SHARE CARD GENERATION
// ============================================================================

function wrapText(text, maxWidth) {
    // Smart text wrapping that doesn't break words
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= maxWidth) {
            currentLine = testLine;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines;
}

function centerText(text, width) {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
}

function generateShareCard(verse, faith) {
    const faithIcons = {
        christianity: '✝️',
        islam: '☪️',
        judaism: '✡️',
        hinduism: '🕉️',
        buddhism: '☸️'
    };
    
    const faithNames = {
        christianity: 'CHRISTIANITY',
        islam: 'ISLAM',
        judaism: 'JUDAISM',
        hinduism: 'HINDUISM',
        buddhism: 'BUDDHISM'
    };
    
    const icon = faithIcons[faith] || '🙏';
    const faithName = faithNames[faith] || faith.toUpperCase();
    const frameWidth = 35;
    const divider = '═'.repeat(frameWidth);
    
    // Header
    const header = `${icon}  ${faithName}`;
    const headerCentered = centerText(header, frameWidth);
    
    // Wrap verse text
    const verseLines = wrapText(verse.text, frameWidth - 4);
    const verseCentered = verseLines.map(line => centerText(line, frameWidth));
    
    // Reference (right-aligned style)
    const refText = `— ${verse.reference}`;
    const refCentered = centerText(refText, frameWidth);
    
    // Footer with streak
    const streak = guidanceData.currentStreak > 0 ? `Day ${guidanceData.currentStreak} 🔥` : 'Day 1';
    const footer = `${streak} • god-answers.app`;
    const footerCentered = centerText(footer, frameWidth);
    
    // Assemble card
    const card = [
        divider,
        headerCentered,
        divider,
        '',
        ...verseCentered,
        '',
        refCentered,
        '',
        divider,
        footerCentered,
        divider
    ].join('\n');
    
    return card;
}

function displayShareCard() {
    if (!currentVerse || !selectedFaith) return;
    
    const shareCard = generateShareCard(currentVerse, selectedFaith);
    const shareCardElement = document.getElementById('shareCard');
    const containerElement = document.getElementById('shareCardContainer');
    
    shareCardElement.textContent = shareCard;
    containerElement.style.display = 'block';
    
    // Animate in
    setTimeout(() => {
        containerElement.style.opacity = '0';
        containerElement.style.transform = 'translateY(20px)';
        containerElement.style.transition = 'opacity 0.5s, transform 0.5s';
        
        requestAnimationFrame(() => {
            containerElement.style.opacity = '1';
            containerElement.style.transform = 'translateY(0)';
        });
    }, 100);
}

async function copyShareCard() {
    const shareCard = document.getElementById('shareCard').textContent;
    const copyBtn = document.querySelector('.copy-card-btn');
    const copyIcon = document.getElementById('copyIcon');
    
    try {
        await navigator.clipboard.writeText(shareCard);
        
        // Visual feedback
        copyBtn.classList.add('copied');
        copyIcon.textContent = '✅';
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span>✅</span> Copied!';
        
        // Earn +3 for sharing
        if (earnGuidance('share', 3)) {
            showToast('Copied! +3 guidances earned 🙏');
        } else {
            showToast('Copied to clipboard!');
        }
        
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate([30, 20, 30]);
        }
        
        // Reset button after 2 seconds
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyIcon.textContent = '📋';
            copyBtn.innerHTML = '<span id="copyIcon">📋</span> Copy to Share';
        }, 2000);
        
    } catch (err) {
        showToast('Failed to copy. Please try again.');
        console.error('Copy failed:', err);
    }
}

// ============================================================================
// CONTEXT VIEWER
// ============================================================================

async function showContext() {
    if (!currentVerse || selectedFaith !== 'christianity') {
        showToast('Context view only available for Bible verses');
        return;
    }
    
    // Parse the reference to get book, chapter, verse
    const refMatch = currentVerse.reference.match(/^(.+?)\s+(\d+):(\d+)(-\d+)?$/);
    if (!refMatch) {
        showToast('Unable to load context');
        return;
    }
    
    const [, bookName, chapter, startVerse] = refMatch;
    const verseNum = parseInt(startVerse);
    
    // Find the book abbreviation
    const book = bibleBooks.find(b => b.name === bookName);
    if (!book) {
        showToast('Unable to load context');
        return;
    }
    
    // Fetch surrounding verses (2 before, 2 after)
    const contextStart = Math.max(1, verseNum - 2);
    const contextEnd = verseNum + 2;
    
    try {
        const contextUrl = `https://bible-api.com/${book.abbr}+${chapter}:${contextStart}-${contextEnd}`;
        const response = await fetch(contextUrl);
        
        if (!response.ok) {
            throw new Error('Failed to fetch context');
        }
        
        const data = await response.json();
        
        // Display context in verse text area
        const verseText = document.getElementById('verseText');
        const translation = document.getElementById('translation');
        
        verseText.innerHTML = formatContextVerses(data.verses, verseNum);
        translation.textContent = `${data.translation_name} - Extended Context`;
        
        showToast('Showing surrounding verses');
        
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(30);
        }
    } catch (error) {
        showToast('Unable to load context');
        console.error('Context error:', error);
    }
}

function formatContextVerses(verses, currentVerse) {
    return verses.map(v => {
        const isCurrent = v.verse === currentVerse;
        const style = isCurrent ? 'font-weight: bold; color: var(--primary-color);' : 'opacity: 0.7;';
        return `<span style="${style}">[${v.verse}] ${v.text.trim()}</span>`;
    }).join(' ');
}

// ============================================================================
// SHARING
// ============================================================================

async function shareVerse() {
    if (!currentVerse) return;
    
    // Scroll to share card
    const shareCardContainer = document.getElementById('shareCardContainer');
    if (shareCardContainer && shareCardContainer.style.display !== 'none') {
        shareCardContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight the copy button
        const copyBtn = document.querySelector('.copy-card-btn');
        if (copyBtn) {
            copyBtn.style.animation = 'pulse 0.5s ease-in-out 3';
        }
        
        showToast('👇 Copy the card below to share');
    } else {
        // Fallback to old share method
        const shareText = `"${currentVerse.text}"\n\n— ${currentVerse.reference}\nvia God Answers`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Divine Guidance',
                    text: shareText,
                    url: window.location.href
                });
                
                if (earnGuidance('share', 3)) {
                    showToast('Shared! +3 guidances earned 🙏');
                } else {
                    showToast('Shared successfully');
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    fallbackShare(shareText);
                }
            }
        } else {
            fallbackShare(shareText);
        }
    }
    
    // Haptic feedback
    if ('vibrate' in navigator) {
        navigator.vibrate(30);
    }
}

function fallbackShare(text) {
    // Copy to clipboard
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            // Earn +3 guidance for sharing (clipboard counts as share)
            if (earnGuidance('share', 3)) {
                showToast('Copied to clipboard! +3 guidances earned 🙏');
            } else {
                showToast('Copied to clipboard');
            }
        }).catch(() => {
            showToast('Unable to share');
        });
    }
}

// ============================================================================
// MODALS - RULES & REFLECTION
// ============================================================================

function showRules() {
    document.getElementById('rulesModal').classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

function closeRules() {
    document.getElementById('rulesModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function openReflection() {
    if (!currentVerse) return;
    document.getElementById('reflectionModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeReflection() {
    document.getElementById('reflectionModal').classList.remove('active');
    document.getElementById('reflectionText').value = '';
    document.body.style.overflow = 'auto';
}

function submitReflection() {
    const reflectionText = document.getElementById('reflectionText').value.trim();
    
    if (!reflectionText) {
        showToast('Please write your reflection first');
        return;
    }
    
    if (reflectionText.length < 20) {
        showToast('Please write a more meaningful reflection (at least 20 characters)');
        return;
    }
    
    // Save reflection with verse
    if (currentVerse) {
        const reflections = JSON.parse(localStorage.getItem('reflections') || '[]');
        reflections.unshift({
            verse: currentVerse,
            reflection: reflectionText,
            date: new Date().toISOString()
        });
        localStorage.setItem('reflections', JSON.stringify(reflections));
    }
    
    // Earn +2 guidance for meaningful reflection
    if (earnGuidance('reflect', 2)) {
        showToast('Thank you for reflecting deeply! +2 guidances earned 🙏');
    } else {
        showToast('Reflection saved');
    }
    
    closeReflection();
    
    // Haptic feedback
    if ('vibrate' in navigator) {
        navigator.vibrate([30, 20, 30]);
    }
}

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================================================
// PWA INSTALLATION
// ============================================================================

function setupPWAInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install prompt after 30 seconds if not installed
        setTimeout(() => {
            if (!window.matchMedia('(display-mode: standalone)').matches) {
                document.getElementById('installPrompt').classList.add('show');
            }
        }, 30000);
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('App is installed');
    }
}

async function installApp() {
    if (!deferredPrompt) {
        showToast('Installation not available');
        return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        showToast('Installing app...');
    }
    
    deferredPrompt = null;
    closeInstallPrompt();
}

function closeInstallPrompt() {
    document.getElementById('installPrompt').classList.remove('show');
}

// ============================================================================
// SERVICE WORKER REGISTRATION
// ============================================================================

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !document.getElementById('readyBtn').disabled) {
        receiveAnswer();
    }
});

// Close modals on outside click
document.getElementById('rulesModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeRules();
    }
});

document.getElementById('reflectionModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeReflection();
    }
});

// Close modals on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeRules();
        closeReflection();
        closeAuthModal();
    }
});

// ============================================================================
// FIREBASE AUTHENTICATION SYSTEM
// ============================================================================

let currentUser = null;

// Listen for authentication state changes
auth.onAuthStateChanged(function(user) {
    currentUser = user;
    if (user) {
        // User is signed in
        console.log('User signed in:', user.email);
        updateAuthUI(user);
        
        // Load user data from Firestore
        loadUserData(user.uid);
    } else {
        // User is signed out
        console.log('User signed out');
        currentUser = null;
    }
});

// ============================================================================
// AUTH MODAL CONTROLS
// ============================================================================

function openAuthModal() {
    if (currentUser) {
        // If logged in, show profile view
        showProfileView();
    } else {
        // If not logged in, show login view
        showLoginView();
    }
    document.getElementById('authModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function showLoginView() {
    document.getElementById('loginView').style.display = 'block';
    document.getElementById('signUpView').style.display = 'none';
    document.getElementById('profileView').style.display = 'none';
}

function showSignUpView() {
    document.getElementById('loginView').style.display = 'none';
    document.getElementById('signUpView').style.display = 'block';
    document.getElementById('profileView').style.display = 'none';
}

function showProfileView() {
    document.getElementById('loginView').style.display = 'none';
    document.getElementById('signUpView').style.display = 'none';
    document.getElementById('profileView').style.display = 'block';
}

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

async function signUpWithEmail() {
    const email = document.getElementById('signUpEmail').value.trim();
    const password = document.getElementById('signUpPassword').value;
    
    // Basic validation
    if (!email || !password) {
        showToast('Please enter email and password');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters');
        return;
    }
    
    try {
        // Create user account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Create user document in Firestore
        await createUserDocument(user.uid, email);
        
        showToast('Account created successfully! 🙏');
        closeAuthModal();
        
    } catch (error) {
        console.error('Sign up error:', error);
        
        // Show user-friendly error messages
        if (error.code === 'auth/email-already-in-use') {
            showToast('This email is already registered');
        } else if (error.code === 'auth/invalid-email') {
            showToast('Invalid email address');
        } else if (error.code === 'auth/weak-password') {
            showToast('Password is too weak');
        } else {
            showToast('Error creating account. Please try again.');
        }
    }
}

async function signInWithEmail() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Basic validation
    if (!email || !password) {
        showToast('Please enter email and password');
        return;
    }
    
    try {
        // Sign in user
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        showToast('Welcome back! 🙏');
        closeAuthModal();
        
    } catch (error) {
        console.error('Sign in error:', error);
        
        // Show user-friendly error messages
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            showToast('Invalid email or password');
        } else if (error.code === 'auth/invalid-email') {
            showToast('Invalid email address');
        } else {
            showToast('Error signing in. Please try again.');
        }
    }
}

async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // Check if this is a new user
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // Create user document for new Google users
            await createUserDocument(user.uid, user.email);
        }
        
        showToast('Welcome! 🙏');
        closeAuthModal();
        
    } catch (error) {
        console.error('Google sign in error:', error);
        
        if (error.code === 'auth/popup-closed-by-user') {
            // User closed the popup, no need to show error
            return;
        } else if (error.code === 'auth/popup-blocked') {
            showToast('Please allow popups for Google sign in');
        } else {
            showToast('Error signing in with Google. Please try again.');
        }
    }
}

async function logOut() {
    try {
        await auth.signOut();
        showToast('Signed out successfully');
        closeAuthModal();
        
    } catch (error) {
        console.error('Sign out error:', error);
        showToast('Error signing out. Please try again.');
    }
}

// ============================================================================
// FIRESTORE USER DATA MANAGEMENT
// ============================================================================

async function createUserDocument(uid, email) {
    try {
        // Create user profile document
        await db.collection('users').doc(uid).set({
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            displayName: email.split('@')[0], // Use email prefix as default display name
            selectedFaith: selectedFaith || null
        });
        
        // Create user scores document
        await db.collection('user_scores').doc(uid).set({
            userId: uid,
            points: 0,
            streak: guidanceData.currentStreak || 0,
            longestStreak: guidanceData.longestStreak || 0,
            totalGuidances: 0,
            lastActive: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('User documents created successfully');
        
    } catch (error) {
        console.error('Error creating user document:', error);
    }
}

async function loadUserData(uid) {
    try {
        // Load user scores
        const scoresDoc = await db.collection('user_scores').doc(uid).get();
        
        if (scoresDoc.exists) {
            const data = scoresDoc.data();
            
            // Update UI with user data
            document.getElementById('userPointsDisplay').textContent = data.points || 0;
            document.getElementById('userStreakDisplay').textContent = (data.streak || 0) + ' days';
        }
        
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function updateAuthUI(user) {
    // Update profile view with user info
    document.getElementById('userEmailDisplay').textContent = user.email;
    
    // Update the profile button icon to show user is logged in
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.style.background = 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)';
        profileBtn.querySelector('span').textContent = '👤';
    }
}

// Close auth modal on outside click
document.addEventListener('DOMContentLoaded', function() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAuthModal();
            }
        });
    }
});
