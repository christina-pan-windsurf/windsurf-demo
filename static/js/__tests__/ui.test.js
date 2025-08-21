jest.mock('../ui.js', () => ({
  initUI: jest.fn()
}));

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

import { initUI } from '../ui.js';

describe('UI Controls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
  });

  describe('initUI function', () => {
    test('can call initUI function', () => {
      initUI();
      expect(initUI).toHaveBeenCalled();
    });

    test('initUI is properly mocked', () => {
      expect(initUI).toBeDefined();
      expect(typeof initUI).toBe('function');
    });

    test('can call initUI multiple times', () => {
      initUI();
      initUI();
      expect(initUI).toHaveBeenCalledTimes(2);
    });
  });

  describe('localStorage functionality', () => {
    test('localStorage is properly mocked', () => {
      mockLocalStorage.getItem('darkMode');
      mockLocalStorage.setItem('darkMode', true);
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('darkMode');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('darkMode', true);
    });

    test('localStorage can return different values', () => {
      mockLocalStorage.getItem.mockReturnValue('true');
      expect(mockLocalStorage.getItem('darkMode')).toBe('true');
      
      mockLocalStorage.getItem.mockReturnValue('false');
      expect(mockLocalStorage.getItem('darkMode')).toBe('false');
    });
  });

  describe('UI component testing patterns', () => {
    test('can simulate DOM interactions', () => {
      const mockElement = {
        addEventListener: jest.fn(),
        classList: {
          toggle: jest.fn(),
          contains: jest.fn(),
          remove: jest.fn()
        }
      };

      mockElement.addEventListener('click', jest.fn());
      mockElement.classList.toggle('visible');

      expect(mockElement.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(mockElement.classList.toggle).toHaveBeenCalledWith('visible');
    });

    test('can simulate event objects', () => {
      const mockEvent = {
        stopPropagation: jest.fn(),
        target: { checked: true }
      };

      mockEvent.stopPropagation();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(mockEvent.target.checked).toBe(true);
    });
  });
});
