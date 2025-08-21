import { initUI } from '../ui.js';

const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn()
};

const mockElement = {
    addEventListener: jest.fn(),
    classList: {
        toggle: jest.fn(),
        contains: jest.fn(),
        remove: jest.fn()
    },
    contains: jest.fn(),
    checked: false,
    setAttribute: jest.fn()
};

const mockDocument = {
    getElementById: jest.fn(),
    addEventListener: jest.fn(),
    documentElement: {
        setAttribute: jest.fn()
    }
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage
});

Object.defineProperty(global, 'document', {
    value: mockDocument
});

describe('UI Controls', () => {
    let settingsIcon, settingsPanel, darkModeToggle;

    beforeEach(() => {
        jest.clearAllMocks();
        
        settingsIcon = { ...mockElement };
        settingsPanel = { ...mockElement };
        darkModeToggle = { ...mockElement };
        
        mockDocument.getElementById.mockImplementation((id) => {
            switch (id) {
                case 'settings-icon':
                    return settingsIcon;
                case 'settings-panel':
                    return settingsPanel;
                case 'dark-mode-toggle':
                    return darkModeToggle;
                default:
                    return null;
            }
        });
    });

    describe('initUI', () => {
        test('loads dark mode preference from localStorage on initialization', () => {
            mockLocalStorage.getItem.mockReturnValue('true');
            
            initUI();
            
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('darkMode');
            expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
            expect(darkModeToggle.checked).toBe(true);
        });

        test('loads light mode when dark mode is disabled', () => {
            mockLocalStorage.getItem.mockReturnValue('false');
            
            initUI();
            
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('darkMode');
            expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', '');
            expect(darkModeToggle.checked).toBe(false);
        });

        test('sets up settings icon click handler', () => {
            initUI();
            
            expect(settingsIcon.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        test('sets up document click handler for closing settings', () => {
            initUI();
            
            expect(mockDocument.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        test('sets up settings panel click handler to prevent propagation', () => {
            initUI();
            
            expect(settingsPanel.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        test('sets up dark mode toggle change handler', () => {
            initUI();
            
            expect(darkModeToggle.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
        });
    });

    describe('settings panel toggle behavior', () => {
        test('toggles settings panel visibility when settings icon is clicked', () => {
            initUI();
            
            const clickHandler = settingsIcon.addEventListener.mock.calls.find(
                call => call[0] === 'click'
            )[1];
            
            const mockEvent = { stopPropagation: jest.fn() };
            
            clickHandler(mockEvent);
            
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
            expect(settingsPanel.classList.toggle).toHaveBeenCalledWith('visible');
        });

        test('closes settings panel when clicking outside', () => {
            settingsPanel.classList.contains.mockReturnValue(true);
            settingsPanel.contains.mockReturnValue(false);
            
            initUI();
            
            const documentClickHandler = mockDocument.addEventListener.mock.calls.find(
                call => call[0] === 'click'
            )[1];
            
            const mockEvent = { target: {} };
            
            documentClickHandler(mockEvent);
            
            expect(settingsPanel.contains).toHaveBeenCalledWith(mockEvent.target);
            expect(settingsPanel.classList.remove).toHaveBeenCalledWith('visible');
        });

        test('does not close settings panel when clicking inside', () => {
            settingsPanel.classList.contains.mockReturnValue(true);
            settingsPanel.contains.mockReturnValue(true);
            
            initUI();
            
            const documentClickHandler = mockDocument.addEventListener.mock.calls.find(
                call => call[0] === 'click'
            )[1];
            
            const mockEvent = { target: {} };
            
            documentClickHandler(mockEvent);
            
            expect(settingsPanel.contains).toHaveBeenCalledWith(mockEvent.target);
            expect(settingsPanel.classList.remove).not.toHaveBeenCalled();
        });

        test('prevents event propagation when clicking on settings panel', () => {
            initUI();
            
            const panelClickHandler = settingsPanel.addEventListener.mock.calls.find(
                call => call[0] === 'click'
            )[1];
            
            const mockEvent = { stopPropagation: jest.fn() };
            
            panelClickHandler(mockEvent);
            
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });
    });

    describe('dark mode functionality', () => {
        test('enables dark mode when toggle is checked', () => {
            initUI();
            
            const changeHandler = darkModeToggle.addEventListener.mock.calls.find(
                call => call[0] === 'change'
            )[1];
            
            const mockEvent = { target: { checked: true } };
            
            changeHandler(mockEvent);
            
            expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('darkMode', true);
        });

        test('disables dark mode when toggle is unchecked', () => {
            initUI();
            
            const changeHandler = darkModeToggle.addEventListener.mock.calls.find(
                call => call[0] === 'change'
            )[1];
            
            const mockEvent = { target: { checked: false } };
            
            changeHandler(mockEvent);
            
            expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', '');
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('darkMode', false);
        });
    });
});
