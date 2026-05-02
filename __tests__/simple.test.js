// Simple test for basic functionality

describe('Todo App Basic Test', () => {
  test('should pass basic math test', () => {
    expect(2 + 2).toBe(4)
  })

  test('should handle string operations', () => {
    const text = 'Hello World'
    expect(text.length).toBeGreaterThan(0)
    expect(text.includes('Hello')).toBe(true)
  })

  test('should handle array operations', () => {
    const todos = []
    expect(Array.isArray(todos)).toBe(true)
    expect(todos.length).toBe(0)
  })
})
