/**
 * Test suite for UI module
 * Tests the user interface controls and settings management functionality
 */

import { initUI } from './ui.js';

const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
});
Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true
});

describe('UI Module', () => {
    let settingsIcon, settingsPanel, darkModeToggle, documentElement;

    beforeEach(() => {
        jest.clearAllMocks();
        
        document.body.innerHTML = `
            <div id="settings-icon"></div>
            <div id="settings-panel"></div>
            <input type="checkbox" id="dark-mode-toggle" />
        `;
        
        settingsIcon = document.getElementById('settings-icon');
        settingsPanel = document.getElementById('settings-panel');
        darkModeToggle = document.getElementById('dark-mode-toggle');
        
        documentElement = {
            setAttribute: jest.fn()
        };
        Object.defineProperty(document, 'documentElement', {
            value: documentElement,
            writable: true,
            configurable: true
        });
    });

    describe('loadDarkMode function', () => {
        test('should load dark mode when localStorage has "true"', () => {
            localStorageMock.getItem.mockReturnValue('true');
            
            initUI();
            
            expect(localStorageMock.getItem).toHaveBeenCalledWith('darkMode');
            expect(documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
            expect(darkModeToggle.checked).toBe(true);
        });

        test('should load light mode when localStorage has "false"', () => {
            localStorageMock.getItem.mockReturnValue('false');
            
            initUI();
            
            expect(localStorageMock.getItem).toHaveBeenCalledWith('darkMode');
            expect(documentElement.setAttribute).toHaveBeenCalledWith('data-theme', '');
            expect(darkModeToggle.checked).toBe(false);
        });

        test('should load light mode when localStorage returns null', () => {
            localStorageMock.getItem.mockReturnValue(null);
            
            initUI();
            
            expect(localStorageMock.getItem).toHaveBeenCalledWith('darkMode');
            expect(documentElement.setAttribute).toHaveBeenCalledWith('data-theme', '');
            expect(darkModeToggle.checked).toBe(false);
        });
    });

    describe('initUI function', () => {
        test('should initialize UI and load dark mode preference', () => {
            localStorageMock.getItem.mockReturnValue('true');
            
            initUI();
            
            expect(localStorageMock.getItem).toHaveBeenCalledWith('darkMode');
            expect(documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
        });

        test('should set up event listeners for all UI elements', () => {
            const addEventListenerSpy = jest.spyOn(Element.prototype, 'addEventListener');
            const documentAddEventListenerSpy = jest.spyOn(document, 'addEventListener');
            
            initUI();
            
            expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
            expect(documentAddEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
            
            addEventListenerSpy.mockRestore();
            documentAddEventListenerSpy.mockRestore();
        });
    });

    describe('Settings panel toggle functionality', () => {
        test('should toggle settings panel visibility when settings icon is clicked', () => {
            initUI();
            
            const clickEvent = new Event('click', { bubbles: true });
            settingsIcon.dispatchEvent(clickEvent);
            
            expect(settingsPanel.classList.contains('visible')).toBe(true);
            
            settingsIcon.dispatchEvent(clickEvent);
            
            expect(settingsPanel.classList.contains('visible')).toBe(false);
        });

        test('should stop event propagation when settings icon is clicked', () => {
            initUI();
            const clickEvent = new Event('click', { bubbles: true });
            const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
            
            settingsIcon.dispatchEvent(clickEvent);
            
            expect(stopPropagationSpy).toHaveBeenCalled();
        });
    });

    describe('Click outside detection', () => {
        test('should close settings panel when clicking outside while panel is visible', () => {
            initUI();
            settingsPanel.classList.add('visible');
            
            const clickEvent = new Event('click', { bubbles: true });
            document.body.dispatchEvent(clickEvent);
            
            expect(settingsPanel.classList.contains('visible')).toBe(false);
        });

        test('should not close settings panel when clicking inside the panel', () => {
            initUI();
            settingsPanel.classList.add('visible');
            
            settingsPanel.contains = jest.fn().mockReturnValue(true);
            
            const clickEvent = new Event('click', { bubbles: true });
            Object.defineProperty(clickEvent, 'target', { value: settingsPanel });
            document.dispatchEvent(clickEvent);
            
            expect(settingsPanel.classList.contains('visible')).toBe(true);
        });

        test('should do nothing when clicking outside while panel is not visible', () => {
            initUI();
            
            const clickEvent = new Event('click', { bubbles: true });
            document.body.dispatchEvent(clickEvent);
            
            expect(settingsPanel.classList.contains('visible')).toBe(false);
        });
    });

    describe('Event propagation control', () => {
        test('should stop event propagation when clicking inside settings panel', () => {
            initUI();
            const clickEvent = new Event('click', { bubbles: true });
            const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
            
            settingsPanel.dispatchEvent(clickEvent);
            
            expect(stopPropagationSpy).toHaveBeenCalled();
        });
    });

    describe('Dark mode toggle functionality', () => {
        test('should enable dark mode when toggle is checked', () => {
            initUI();
            
            darkModeToggle.checked = true;
            const changeEvent = new Event('change');
            Object.defineProperty(changeEvent, 'target', { value: { checked: true } });
            darkModeToggle.dispatchEvent(changeEvent);
            
            expect(documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', true);
        });

        test('should disable dark mode when toggle is unchecked', () => {
            initUI();
            
            darkModeToggle.checked = false;
            const changeEvent = new Event('change');
            Object.defineProperty(changeEvent, 'target', { value: { checked: false } });
            darkModeToggle.dispatchEvent(changeEvent);
            
            expect(documentElement.setAttribute).toHaveBeenCalledWith('data-theme', '');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', false);
        });
    });

    describe('saveDarkMode function integration', () => {
        test('should save dark mode preference to localStorage when enabled', () => {
            initUI();
            
            const changeEvent = new Event('change');
            Object.defineProperty(changeEvent, 'target', { value: { checked: true } });
            darkModeToggle.dispatchEvent(changeEvent);
            
            expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', true);
        });

        test('should save light mode preference to localStorage when disabled', () => {
            initUI();
            
            const changeEvent = new Event('change');
            Object.defineProperty(changeEvent, 'target', { value: { checked: false } });
            darkModeToggle.dispatchEvent(changeEvent);
            
            expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', false);
        });
    });
});
