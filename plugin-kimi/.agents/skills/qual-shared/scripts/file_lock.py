#!/usr/bin/env python3
"""
file_lock.py
Cross-platform file locking utility for Interpretive Orchestration.

Uses fcntl on Unix/Linux and msvcrt on Windows.
Provides fallback to threading.Lock() for platforms without native file locking.
"""

import os
import sys
import threading
from contextlib import contextmanager
from typing import Optional

# Platform detection
_IS_WINDOWS = sys.platform.startswith('win')
_IS_UNIX = not _IS_WINDOWS

# Try to import platform-specific modules
try:
    if _IS_UNIX:
        import fcntl
        HAS_FCNTL = True
    else:
        HAS_FCNTL = False
except ImportError:
    HAS_FCNTL = False

try:
    if _IS_WINDOWS:
        import msvcrt
        import win32file
        import win32con
        import pywintypes
        HAS_WIN32 = True
    else:
        HAS_WIN32 = False
except ImportError:
    HAS_WIN32 = False


class FileLock:
    """Cross-platform file locking context manager."""
    
    def __init__(self, file_obj, exclusive: bool = True):
        """
        Initialize file lock.
        
        Args:
            file_obj: File object to lock
            exclusive: True for exclusive lock, False for shared
        """
        self.file_obj = file_obj
        self.exclusive = exclusive
        self._lock: Optional[threading.Lock] = None
        
    def __enter__(self):
        """Acquire the lock."""
        if HAS_FCNTL and _IS_UNIX:
            # Unix: Use fcntl
            operation = fcntl.LOCK_EX if self.exclusive else fcntl.LOCK_SH
            fcntl.flock(self.file_obj.fileno(), operation)
            
        elif HAS_WIN32 and _IS_WINDOWS:
            # Windows: Use win32file
            handle = win32file._get_osfhandle(self.file_obj.fileno())
            flags = win32con.LOCKFILE_EXCLUSIVE_LOCK if self.exclusive else 0
            
            # Lock the entire file
            overlapped = pywintypes.OVERLAPPED()
            win32file.LockFileEx(
                handle,
                flags,
                0, 0,  # Offset high, low
                0xFFFFFFFF, 0xFFFFFFFF,  # Size high, low (entire file)
                overlapped
            )
            
        else:
            # Fallback: Use threading lock (process-local only)
            # This doesn't provide inter-process locking but prevents
            # race conditions within the same process
            self._lock = threading.Lock()
            self._lock.acquire()
            
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Release the lock."""
        if HAS_FCNTL and _IS_UNIX:
            fcntl.flock(self.file_obj.fileno(), fcntl.LOCK_UN)
            
        elif HAS_WIN32 and _IS_WINDOWS:
            handle = win32file._get_osfhandle(self.file_obj.fileno())
            overlapped = pywintypes.OVERLAPPED()
            win32file.UnlockFileEx(
                handle,
                0,  # Reserved
                0xFFFFFFFF, 0xFFFFFFFF,  # Size high, low
                overlapped
            )
            
        elif self._lock:
            self._lock.release()


@contextmanager
def lock_file(file_obj, exclusive: bool = True):
    """
    Context manager for file locking.
    
    Usage:
        with open('file.txt', 'w') as f:
            with lock_file(f):
                f.write('content')
    
    Args:
        file_obj: File object to lock
        exclusive: True for exclusive lock, False for shared
        
    Yields:
        FileLock object
    """
    lock = FileLock(file_obj, exclusive)
    try:
        lock.__enter__()
        yield lock
    finally:
        lock.__exit__(None, None, None)


def is_locking_available() -> bool:
    """
    Check if native file locking is available.
    
    Returns:
        True if native (cross-process) locking is available
    """
    return HAS_FCNTL or HAS_WIN32


def get_locking_info() -> dict:
    """
    Get information about the file locking capabilities.
    
    Returns:
        Dictionary with locking information
    """
    return {
        "platform": sys.platform,
        "is_windows": _IS_WINDOWS,
        "is_unix": _IS_UNIX,
        "has_fcntl": HAS_FCNTL,
        "has_win32": HAS_WIN32,
        "native_locking_available": is_locking_available(),
        "fallback_mode": not is_locking_available()
    }


# Convenience functions for common patterns

def atomic_write_json(filepath: str, data: dict) -> None:
    """
    Atomically write JSON data to file with locking.
    
    Args:
        filepath: Path to file
        data: Dictionary to serialize
    """
    import json
    from pathlib import Path
    
    path = Path(filepath)
    temp_path = path.with_suffix('.tmp')
    
    # Write to temp file first
    with open(temp_path, 'w', encoding='utf-8') as f:
        with lock_file(f, exclusive=True):
            json.dump(data, f, indent=2)
    
    # Atomic rename
    temp_path.replace(path)


def atomic_append_jsonl(filepath: str, data: dict) -> None:
    """
    Atomically append JSON line to file with locking.
    
    Args:
        filepath: Path to file
        data: Dictionary to serialize
    """
    import json
    
    with open(filepath, 'a', encoding='utf-8') as f:
        with lock_file(f, exclusive=True):
            f.write(json.dumps(data, default=str) + '\n')
