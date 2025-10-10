import '@testing-library/jest-dom'

// Mock Tauri APIs for testing
global.window = global.window || ({} as any)

// Mock window.__TAURI__
;(global.window as any).__TAURI__ = {
  tauri: {
    invoke: vi.fn(),
  },
  fs: {
    readBinaryFile: vi.fn(),
    writeBinaryFile: vi.fn(),
    createDir: vi.fn(),
    exists: vi.fn(),
  },
  path: {
    appDataDir: vi.fn(async () => '/mock/app/data'),
    pictureDir: vi.fn(async () => '/mock/pictures'),
  },
  dialog: {
    open: vi.fn(),
  },
}
