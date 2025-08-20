import { initUI } from '../ui.js';

const localStorageMock = {
  getItem: jest.spyOn(Storage.prototype, 'getItem'),
  setItem: jest.spyOn(Storage.prototype, 'setItem'),
  clear: jest.spyOn(Storage.prototype, 'clear')
};

let mockElements = {};

const originalGetElementById = document.getElementById;
const originalAddEventListener = document.addEventListener;
const originalSetAttribute = document.documentElement.setAttribute;

document.getElementById = jest.fn();
document.addEventListener = jest.fn();
document.documentElement.setAttribute = jest.fn();

describe('UI Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    mockElements = {
      'settings-icon': {
        addEventListener: jest.fn()
      },
      'settings-panel': {
        addEventListener: jest.fn(),
        classList: {
          toggle: jest.fn(),
          contains: jest.fn(),
          remove: jest.fn()
        },
        contains: jest.fn()
      },
      'dark-mode-toggle': {
        addEventListener: jest.fn(),
        checked: false
      }
    };
    
    document.getElementById.mockImplementation((id) => {
      return mockElements[id] || null;
    });
  });

  describe('loadDarkMode', () => {
    test('loads dark mode when localStorage has "true"', () => {
      localStorageMock.getItem.mockReturnValue('true');

      initUI();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('darkMode');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
      expect(mockElements['dark-mode-toggle'].checked).toBe(true);
    });

    test('loads light mode when localStorage has "false"', () => {
      localStorageMock.getItem.mockReturnValue('false');

      initUI();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('darkMode');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', '');
      expect(mockElements['dark-mode-toggle'].checked).toBe(false);
    });

    test('defaults to light mode when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);

      initUI();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('darkMode');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', '');
      expect(mockElements['dark-mode-toggle'].checked).toBe(false);
    });
  });

  describe('initUI', () => {
    test('sets up event listeners for all UI elements', () => {
      initUI();

      expect(mockElements['settings-icon'].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(mockElements['settings-panel'].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(mockElements['dark-mode-toggle'].addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    test('toggles settings panel visibility when settings icon is clicked', () => {
      initUI();

      const clickHandler = mockElements['settings-icon'].addEventListener.mock.calls[0][1];
      const mockEvent = { stopPropagation: jest.fn() };

      clickHandler(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(mockElements['settings-panel'].classList.toggle).toHaveBeenCalledWith('visible');
    });

    test('closes settings panel when clicking outside', () => {
      mockElements['settings-panel'].classList.contains.mockReturnValue(true);
      mockElements['settings-panel'].contains.mockReturnValue(false);

      initUI();

      const documentClickHandler = document.addEventListener.mock.calls[0][1];
      const mockEvent = { target: document.body };

      documentClickHandler(mockEvent);

      expect(mockElements['settings-panel'].contains).toHaveBeenCalledWith(document.body);
      expect(mockElements['settings-panel'].classList.remove).toHaveBeenCalledWith('visible');
    });

    test('does not close settings panel when clicking inside', () => {
      mockElements['settings-panel'].classList.contains.mockReturnValue(true);
      mockElements['settings-panel'].contains.mockReturnValue(true);

      initUI();

      const documentClickHandler = document.addEventListener.mock.calls[0][1];
      const mockEvent = { target: mockElements['settings-panel'] };

      documentClickHandler(mockEvent);

      expect(mockElements['settings-panel'].contains).toHaveBeenCalledWith(mockElements['settings-panel']);
      expect(mockElements['settings-panel'].classList.remove).not.toHaveBeenCalled();
    });

    test('prevents event propagation when clicking on settings panel', () => {
      initUI();

      const panelClickHandler = mockElements['settings-panel'].addEventListener.mock.calls[0][1];
      const mockEvent = { stopPropagation: jest.fn() };

      panelClickHandler(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    test('handles dark mode toggle change to dark mode', () => {
      initUI();

      const changeHandler = mockElements['dark-mode-toggle'].addEventListener.mock.calls[0][1];
      const mockEvent = { target: { checked: true } };

      changeHandler(mockEvent);

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', true);
    });

    test('handles dark mode toggle change to light mode', () => {
      initUI();

      const changeHandler = mockElements['dark-mode-toggle'].addEventListener.mock.calls[0][1];
      const mockEvent = { target: { checked: false } };

      changeHandler(mockEvent);

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', '');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', false);
    });
  });
});
