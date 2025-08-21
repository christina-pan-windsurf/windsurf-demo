const mockElements = {
  settingsIcon: {
    addEventListener: jest.fn(),
  },
  settingsPanel: {
    classList: {
      toggle: jest.fn(),
      contains: jest.fn(),
      remove: jest.fn(),
    },
    contains: jest.fn(),
    addEventListener: jest.fn(),
  },
  darkModeToggle: {
    checked: false,
    addEventListener: jest.fn(),
  },
  documentElement: {
    setAttribute: jest.fn(),
  },
};

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

const mockGetElementById = jest.fn((id) => {
  if (id === 'dark-mode-toggle') return mockElements.darkModeToggle;
  if (id === 'settings-icon') return mockElements.settingsIcon;
  if (id === 'settings-panel') return mockElements.settingsPanel;
  return null;
});

const mockAddEventListener = jest.fn();

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: {
    getElementById: mockGetElementById,
    documentElement: mockElements.documentElement,
    addEventListener: mockAddEventListener,
  },
  writable: true,
});

import { initUI } from '../ui.js';

describe('loadDarkMode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    
    mockGetElementById.mockImplementation((id) => {
      if (id === 'dark-mode-toggle') return mockElements.darkModeToggle;
      if (id === 'settings-icon') return mockElements.settingsIcon;
      if (id === 'settings-panel') return mockElements.settingsPanel;
      return null;
    });
  });

  test('loads dark mode when localStorage value is true', () => {
    mockLocalStorage.getItem.mockReturnValue('true');

    initUI();

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('darkMode');
    expect(mockElements.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    expect(mockElements.darkModeToggle.checked).toBe(true);
  });

  test('loads light mode when localStorage value is false', () => {
    mockLocalStorage.getItem.mockReturnValue('false');

    initUI();

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('darkMode');
    expect(mockElements.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', '');
    expect(mockElements.darkModeToggle.checked).toBe(false);
  });

  test('defaults to light mode when localStorage is empty', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    initUI();

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('darkMode');
    expect(mockElements.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', '');
    expect(mockElements.darkModeToggle.checked).toBe(false);
  });
});

describe('saveDarkMode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGetElementById.mockImplementation((id) => {
      if (id === 'dark-mode-toggle') return mockElements.darkModeToggle;
      if (id === 'settings-icon') return mockElements.settingsIcon;
      if (id === 'settings-panel') return mockElements.settingsPanel;
      return null;
    });
  });

  test('saves dark mode preference to localStorage', () => {
    initUI();

    const changeHandler = mockElements.darkModeToggle.addEventListener.mock.calls
      .find(call => call[0] === 'change')[1];

    const mockEvent = { target: { checked: true } };
    changeHandler(mockEvent);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('darkMode', true);
    expect(mockElements.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });

  test('saves light mode preference to localStorage', () => {
    initUI();

    const changeHandler = mockElements.darkModeToggle.addEventListener.mock.calls
      .find(call => call[0] === 'change')[1];

    const mockEvent = { target: { checked: false } };
    changeHandler(mockEvent);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('darkMode', false);
    expect(mockElements.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', '');
  });
});

describe('initUI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    
    mockElements.settingsPanel.classList.contains.mockReturnValue(false);
    mockElements.settingsPanel.contains.mockReturnValue(false);
    
    mockGetElementById.mockImplementation((id) => {
      if (id === 'dark-mode-toggle') return mockElements.darkModeToggle;
      if (id === 'settings-icon') return mockElements.settingsIcon;
      if (id === 'settings-panel') return mockElements.settingsPanel;
      return null;
    });
  });

  test('sets up settings panel toggle functionality', () => {
    initUI();

    expect(mockElements.settingsIcon.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));

    const clickHandler = mockElements.settingsIcon.addEventListener.mock.calls
      .find(call => call[0] === 'click')[1];

    const mockEvent = { stopPropagation: jest.fn() };
    clickHandler(mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockElements.settingsPanel.classList.toggle).toHaveBeenCalledWith('visible');
  });

  test('sets up document click handler to close settings panel', () => {
    initUI();

    expect(mockAddEventListener).toHaveBeenCalledWith('click', expect.any(Function));

    const documentClickHandler = mockAddEventListener.mock.calls
      .find(call => call[0] === 'click')[1];

    mockElements.settingsPanel.classList.contains.mockReturnValue(true);
    mockElements.settingsPanel.contains.mockReturnValue(false);

    const mockEvent = { target: {} };
    documentClickHandler(mockEvent);

    expect(mockElements.settingsPanel.classList.remove).toHaveBeenCalledWith('visible');
  });

  test('prevents settings panel from closing when clicking inside it', () => {
    initUI();

    expect(mockElements.settingsPanel.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));

    const panelClickHandler = mockElements.settingsPanel.addEventListener.mock.calls
      .find(call => call[0] === 'click')[1];

    const mockEvent = { stopPropagation: jest.fn() };
    panelClickHandler(mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  test('sets up dark mode toggle functionality', () => {
    initUI();

    expect(mockElements.darkModeToggle.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    const changeHandler = mockElements.darkModeToggle.addEventListener.mock.calls
      .find(call => call[0] === 'change')[1];

    expect(changeHandler).toBeDefined();
  });

  test('loads dark mode preference on initialization', () => {
    mockLocalStorage.getItem.mockReturnValue('true');

    initUI();

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('darkMode');
    expect(mockElements.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    expect(mockElements.darkModeToggle.checked).toBe(true);
  });
});
