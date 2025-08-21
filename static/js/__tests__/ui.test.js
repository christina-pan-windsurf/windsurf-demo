const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const createMockElement = (additionalProps = {}) => ({
  addEventListener: jest.fn(),
  classList: {
    toggle: jest.fn(),
    contains: jest.fn(),
    remove: jest.fn()
  },
  contains: jest.fn(),
  setAttribute: jest.fn(),
  checked: false,
  ...additionalProps
});

let mockSettingsIcon, mockSettingsPanel, mockDarkModeToggle;

const mockDocument = {
  getElementById: jest.fn(),
  documentElement: {
    setAttribute: jest.fn()
  },
  addEventListener: jest.fn()
};

Object.defineProperty(window, 'document', {
  value: mockDocument
});

const setupGlobalMocks = () => {
  mockSettingsIcon = createMockElement();
  mockSettingsPanel = createMockElement();
  mockDarkModeToggle = createMockElement({ checked: false });
  
  mockDocument.getElementById.mockImplementation((id) => {
    switch (id) {
      case 'settings-icon': return mockSettingsIcon;
      case 'settings-panel': return mockSettingsPanel;
      case 'dark-mode-toggle': return mockDarkModeToggle;
      default: return createMockElement();
    }
  });
};

import { initUI } from '../ui.js';

describe('loadDarkMode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupGlobalMocks();
  });

  test('loads dark mode when localStorage returns true', () => {
    localStorageMock.getItem.mockReturnValue('true');
    
    initUI();
    
    expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    expect(mockDarkModeToggle.checked).toBe(true);
  });

  test('loads light mode when localStorage returns false', () => {
    localStorageMock.getItem.mockReturnValue('false');
    
    initUI();
    
    expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', '');
    expect(mockDarkModeToggle.checked).toBe(false);
  });

  test('loads light mode when localStorage returns null', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    initUI();
    
    expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', '');
    expect(mockDarkModeToggle.checked).toBe(false);
  });

  test('calls localStorage.getItem with correct key', () => {
    localStorageMock.getItem.mockReturnValue('false');
    
    initUI();
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('darkMode');
  });
});

describe('saveDarkMode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupGlobalMocks();
  });

  test('saves true value to localStorage', () => {
    const mockEvent = { target: { checked: true } };
    
    initUI();
    
    const changeHandler = mockDarkModeToggle.addEventListener.mock.calls.find(
      call => call[0] === 'change'
    )[1];
    
    changeHandler(mockEvent);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', true);
  });

  test('saves false value to localStorage', () => {
    const mockEvent = { target: { checked: false } };
    
    initUI();
    
    const changeHandler = mockDarkModeToggle.addEventListener.mock.calls.find(
      call => call[0] === 'change'
    )[1];
    
    changeHandler(mockEvent);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', false);
  });
});

describe('initUI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupGlobalMocks();
  });

  test('gets all required DOM elements', () => {
    initUI();
    
    expect(mockDocument.getElementById).toHaveBeenCalledWith('settings-icon');
    expect(mockDocument.getElementById).toHaveBeenCalledWith('settings-panel');
    expect(mockDocument.getElementById).toHaveBeenCalledWith('dark-mode-toggle');
  });

  test('loads dark mode preference on initialization', () => {
    localStorageMock.getItem.mockReturnValue('true');
    
    initUI();
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('darkMode');
    expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });

  test('settings icon click toggles panel visibility and prevents propagation', () => {
    const mockEvent = { stopPropagation: jest.fn() };
    
    initUI();
    
    const clickHandler = mockSettingsIcon.addEventListener.mock.calls.find(
      call => call[0] === 'click'
    )[1];
    
    clickHandler(mockEvent);
    
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockSettingsPanel.classList.toggle).toHaveBeenCalledWith('visible');
  });

  test('document click closes settings panel when clicking outside', () => {
    const mockEvent = { target: {} };
    
    mockSettingsPanel.contains.mockReturnValue(false);
    mockSettingsPanel.classList.contains.mockReturnValue(true);
    
    initUI();
    
    const documentClickHandler = mockDocument.addEventListener.mock.calls.find(
      call => call[0] === 'click'
    )[1];
    
    documentClickHandler(mockEvent);
    
    expect(mockSettingsPanel.classList.remove).toHaveBeenCalledWith('visible');
  });

  test('document click does not close panel when clicking inside settings', () => {
    const mockEvent = { target: {} };
    
    mockSettingsPanel.contains.mockReturnValue(true);
    mockSettingsPanel.classList.contains.mockReturnValue(true);
    
    initUI();
    
    const documentClickHandler = mockDocument.addEventListener.mock.calls.find(
      call => call[0] === 'click'
    )[1];
    
    documentClickHandler(mockEvent);
    
    expect(mockSettingsPanel.classList.remove).not.toHaveBeenCalled();
  });

  test('document click does nothing when panel is not visible', () => {
    const mockEvent = { target: {} };
    
    mockSettingsPanel.contains.mockReturnValue(false);
    mockSettingsPanel.classList.contains.mockReturnValue(false);
    
    initUI();
    
    const documentClickHandler = mockDocument.addEventListener.mock.calls.find(
      call => call[0] === 'click'
    )[1];
    
    documentClickHandler(mockEvent);
    
    expect(mockSettingsPanel.classList.remove).not.toHaveBeenCalled();
  });

  test('settings panel click prevents propagation', () => {
    const mockEvent = { stopPropagation: jest.fn() };
    
    initUI();
    
    const panelClickHandler = mockSettingsPanel.addEventListener.mock.calls.find(
      call => call[0] === 'click'
    )[1];
    
    panelClickHandler(mockEvent);
    
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  test('dark mode toggle change updates theme and saves preference', () => {
    const mockEvent = { target: { checked: true } };
    
    initUI();
    
    const changeHandler = mockDarkModeToggle.addEventListener.mock.calls.find(
      call => call[0] === 'change'
    )[1];
    
    changeHandler(mockEvent);
    
    expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', true);
  });

  test('dark mode toggle change to false sets light theme', () => {
    const mockEvent = { target: { checked: false } };
    
    initUI();
    
    const changeHandler = mockDarkModeToggle.addEventListener.mock.calls.find(
      call => call[0] === 'change'
    )[1];
    
    changeHandler(mockEvent);
    
    expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', '');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', false);
  });

  test('registers all required event listeners', () => {
    initUI();
    
    expect(mockSettingsIcon.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(mockDocument.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(mockSettingsPanel.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(mockDarkModeToggle.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
