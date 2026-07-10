import { describe, it, expect } from 'vitest';
import { detectLanguage } from './language.js';

describe('detectLanguage', () => {
  it('detects language from a known file extension', () => {
    expect(detectLanguage('contract.sol', '')).toBe('solidity');
    expect(detectLanguage('app.py', '')).toBe('python');
    expect(detectLanguage('Main.java', '')).toBe('java');
    expect(detectLanguage('server.go', '')).toBe('go');
    expect(detectLanguage('lib.rs', '')).toBe('rust');
    expect(detectLanguage('index.php', '')).toBe('php');
    expect(detectLanguage('Program.cs', '')).toBe('csharp');
    expect(detectLanguage('component.tsx', '')).toBe('typescript');
    expect(detectLanguage('script.js', '')).toBe('javascript');
  });

  it('falls back to content sniffing when extension is unknown', () => {
    expect(detectLanguage('file.txt', '#include <stdio.h>\nint main() {}')).toBe('cpp');
    expect(detectLanguage('file.txt', 'pragma solidity ^0.8.0;\ncontract Foo {}')).toBe('solidity');
    expect(detectLanguage('file.txt', 'def hello():\n    print("hi")')).toBe('python');
    expect(detectLanguage('file.txt', 'package main\nfunc main() {}')).toBe('go');
    expect(detectLanguage('file.txt', 'fn main() {\n    println!("hi");\n}')).toBe('rust');
    expect(detectLanguage('file.txt', '<?php\n$x = 1;\necho $x;')).toBe('php');
    expect(detectLanguage('file.txt', 'public class Foo {\n  public static void main() {}\n}')).toBe('java');
    expect(detectLanguage('file.txt', 'using System;\nnamespace Foo { }')).toBe('csharp');
  });

  it('defaults to javascript when nothing matches', () => {
    expect(detectLanguage('', 'const x = 1;')).toBe('javascript');
    expect(detectLanguage('mystery', 'just some plain text')).toBe('javascript');
  });

  it('prioritizes extension over content sniffing', () => {
    // .py extension should win even if content looks like C++
    expect(detectLanguage('script.py', '#include <stdio.h>')).toBe('python');
  });
});
