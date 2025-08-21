import { initUI } from '../ui.js';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const mockElements = {
  settingsIcon: { addEventListener: jest.fn() },
  settingsPanel: { 
    classList: { toggle: jest.fn(), contains: jest.fn(), remove: jest.fn() },
    contains: jest.fn(),
    addEventListener: jest.fn()
  },
  darkModeToggle: { 
    checked: false,
    addEventListener: jest.fn()
  }
};

const mockDocumentElement = {
  setAttribute: jest.fn()
};

Object.defineProperty(document, 'documentElement', {
  value: mockDocumentElement,
  writable: true
});

global.document.getElementById = jest.fn((id) => {
  switch (id) {
    case 'settings-icon':
      return mockElements.settingsIcon;
    case 'settings-panel':
      return mockElements.settingsPanel;
    case 'dark-mode-toggle':
      return mockElements.darkModeToggle;
    default:
      return null;
  }
});

global.document.addEventListener = jest.fn();

describe('initUI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockElements.settingsPanel.classList.contains.mockReturnValue(false);
    mockElements.settingsPanel.contains.mockReturnValue(false);
    mockElements.darkModeToggle.checked = false;
  });

  test('loads dark mode preference on initialization', () => {
    localStorageMock.getItem.mockReturnValue('true');
    
    initUI();

    expect(localStorageMock.getItem).toHaveBeenCalledWith('darkMode');
    expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    expect(mockElements.darkModeToggle.checked).toBe(true);
  });

  test('loads light mode when localStorage has false', () => {
    localStorageMock.getItem.mockReturnValue('false');
    
    initUI();

    expect(localStorageMock.getItem).toHaveBeenCalledWith('darkMode');
    expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith('data-theme', '');
    expect(mockElements.darkModeToggle.checked).toBe(false);
  });

  test('loads light mode when localStorage is null', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    initUI();

    expect(localStorageMock.getItem).toHaveBeenCalledWith('darkMode');
    expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith('data-theme', '');
    expect(mockElements.darkModeToggle.checked).toBe(false);
  });

  test('sets up settings icon click event listener', () => {
    initUI();

    expect(mockElements.settingsIcon.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  test('sets up document click event listener', () => {
    initUI();

    expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  test('sets up settings panel click event listener', () => {
    initUI();

    expect(mockElements.settingsPanel.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  test('sets up dark mode toggle change event listener', () => {
    initUI();

    expect(mockElements.darkModeToggle.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  test('settings icon click toggles settings panel visibility', () => {
    initUI();

    const settingsIconClickHandler = mockElements.settingsIcon.addEventListener.mock.calls[0][1];
    const mockEvent = { stopPropagation: jest.fn() };

    settingsIconClickHandler(mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockElements.settingsPanel.classList.toggle).toHaveBeenCalledWith('visible');
  });

  test('document click closes settings panel when clicking outside', () => {
    mockElements.settingsPanel.classList.contains.mockReturnValue(true);
    mockElements.settingsPanel.contains.mockReturnValue(false);
    
    initUI();

    const documentClickHandler = document.addEventListener.mock.calls[0][1];
    const mockEvent = { target: {} };

    documentClickHandler(mockEvent);

    expect(mockElements.settingsPanel.contains).toHaveBeenCalledWith(mockEvent.target);
    expect(mockElements.settingsPanel.classList.remove).toHaveBeenCalledWith('visible');
  });

  test('document click does not close settings panel when clicking inside', () => {
    mockElements.settingsPanel.classList.contains.mockReturnValue(true);
    mockElements.settingsPanel.contains.mockReturnValue(true);
    
    initUI();

    const documentClickHandler = document.addEventListener.mock.calls[0][1];
    const mockEvent = { target: {} };

    documentClickHandler(mockEvent);

    expect(mockElements.settingsPanel.contains).toHaveBeenCalledWith(mockEvent.target);
    expect(mockElements.settingsPanel.classList.remove).not.toHaveBeenCalled();
  });

  test('document click does not close settings panel when not visible', () => {
    mockElements.settingsPanel.classList.contains.mockReturnValue(false);
    
    initUI();

    const documentClickHandler = document.addEventListener.mock.calls[0][1];
    const mockEvent = { target: {} };

    documentClickHandler(mockEvent);

    expect(mockElements.settingsPanel.classList.remove).not.toHaveBeenCalled();
  });

  test('settings panel click prevents propagation', () => {
    initUI();

    const settingsPanelClickHandler = mockElements.settingsPanel.addEventListener.mock.calls[0][1];
    const mockEvent = { stopPropagation: jest.fn() };

    settingsPanelClickHandler(mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  test('dark mode toggle change to true updates theme and saves preference', () => {
    initUI();

    const darkModeToggleHandler = mockElements.darkModeToggle.addEventListener.mock.calls[0][1];
    const mockEvent = { target: { checked: true } };

    darkModeToggleHandler(mockEvent);

    expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', true);
  });

  test('dark mode toggle change to false updates theme and saves preference', () => {
    initUI();

    const darkModeToggleHandler = mockElements.darkModeToggle.addEventListener.mock.calls[0][1];
    const mockEvent = { target: { checked: false } };

    darkModeToggleHandler(mockEvent);

    expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith('data-theme', '');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', false);
  });

});
