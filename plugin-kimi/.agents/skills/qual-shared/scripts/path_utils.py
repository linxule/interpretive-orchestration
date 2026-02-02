#!/usr/bin/env python3
"""
path_utils.py
Cross-platform path validation utilities for Interpretive Orchestration.

Provides standardized path validation, traversal protection, and file path utilities.
"""

import os
from pathlib import Path
from typing import Union, Optional, Tuple


class PathValidationError(ValueError):
    """Raised when path validation fails."""
    pass


def validate_project_path(
    project_path: Union[str, Path],
    must_exist: bool = False,
    create_if_missing: bool = False
) -> Path:
    """
    Validate and normalize a project path.
    
    Args:
        project_path: Path to validate
        must_exist: If True, raise error if path doesn't exist
        create_if_missing: If True, create directory if it doesn't exist
        
    Returns:
        Resolved Path object
        
    Raises:
        PathValidationError: If validation fails
    """
    # Check for null bytes (path injection)
    path_str = str(project_path)
    if '\x00' in path_str:
        raise PathValidationError("Invalid path: contains null bytes")
    
    # Resolve to absolute path
    try:
        resolved = Path(project_path).resolve()
    except (OSError, ValueError) as e:
        raise PathValidationError(f"Invalid path: {e}")
    
    # Check existence
    if must_exist and not resolved.exists():
        raise PathValidationError(f"Path does not exist: {resolved}")
    
    # Create if requested
    if create_if_missing and not resolved.exists():
        try:
            resolved.mkdir(parents=True, exist_ok=True)
        except OSError as e:
            raise PathValidationError(f"Cannot create directory: {e}")
    
    return resolved


def validate_path_within_project(
    project_path: Union[str, Path],
    target_path: Union[str, Path],
    allow_equal: bool = False
) -> Tuple[Path, Path]:
    """
    Validate that target path is within project path.
    
    Protects against path traversal attacks.
    
    Args:
        project_path: Root project directory
        target_path: Path to validate
        allow_equal: If True, allow target == project
        
    Returns:
        Tuple of (resolved_project, resolved_target)
        
    Raises:
        PathValidationError: If target is outside project
    """
    project = validate_project_path(project_path, must_exist=True)
    target = validate_project_path(target_path)
    
    try:
        # Get relative path from project to target
        rel = target.relative_to(project)
        
        # Check for traversal (relative_to would fail on '..')
        if not allow_equal and rel == Path('.'):
            raise PathValidationError("Target path cannot be the same as project path")
            
    except ValueError:
        raise PathValidationError(
            f"Path traversal detected: {target} is not within {project}"
        )
    
    return project, target


def validate_file_path(
    file_path: Union[str, Path],
    must_exist: bool = False,
    allowed_extensions: Optional[list] = None,
    max_filename_length: int = 255
) -> Path:
    """
    Validate a file path.
    
    Args:
        file_path: Path to file
        must_exist: If True, raise error if file doesn't exist
        allowed_extensions: List of allowed extensions (e.g., ['.json', '.md'])
        max_filename_length: Maximum filename length
        
    Returns:
        Resolved Path object
        
    Raises:
        PathValidationError: If validation fails
    """
    path = validate_project_path(file_path)
    
    # Check filename length
    if len(path.name) > max_filename_length:
        raise PathValidationError(
            f"Filename too long: {len(path.name)} chars (max {max_filename_length})"
        )
    
    # Check extension
    if allowed_extensions:
        ext = path.suffix.lower()
        if ext not in [e.lower() for e in allowed_extensions]:
            raise PathValidationError(
                f"Invalid file extension: {ext}. Allowed: {allowed_extensions}"
            )
    
    # Check existence
    if must_exist:
        if not path.exists():
            raise PathValidationError(f"File does not exist: {path}")
        if not path.is_file():
            raise PathValidationError(f"Path is not a file: {path}")
    
    return path


def safe_join(
    base_path: Union[str, Path],
    *path_parts: str
) -> Path:
    """
    Safely join paths while preventing traversal.
    
    Args:
        base_path: Base directory
        *path_parts: Path components to join
        
    Returns:
        Resolved path within base_path
        
    Raises:
        PathValidationError: If resulting path would escape base_path
    """
    base = validate_project_path(base_path, must_exist=True)
    
    # Join paths
    result = base.joinpath(*path_parts)
    
    # Validate result is still within base
    try:
        result.relative_to(base)
    except ValueError:
        raise PathValidationError(
            f"Path traversal detected: joining {path_parts} to {base} escapes base directory"
        )
    
    return result


def get_config_path(project_path: Union[str, Path]) -> Path:
    """
    Get the path to the project's config directory.
    
    Args:
        project_path: Project root
        
    Returns:
        Path to .interpretive-orchestration directory
    """
    project = validate_project_path(project_path, must_exist=True)
    return project / ".interpretive-orchestration"


def get_state_file_path(project_path: Union[str, Path]) -> Path:
    """
    Get the path to the project's state file.
    
    Args:
        project_path: Project root
        
    Returns:
        Path to config.json
    """
    return get_config_path(project_path) / "config.json"


def ensure_parent_exists(file_path: Union[str, Path]) -> Path:
    """
    Ensure parent directory exists for a file path.
    
    Args:
        file_path: Path to file
        
    Returns:
        Resolved Path object
    """
    path = Path(file_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def sanitize_filename(
    filename: str,
    replacement: str = "_",
    max_length: int = 255
) -> str:
    """
    Sanitize a filename for safe use.
    
    Args:
        filename: Original filename
        replacement: Character to replace invalid chars with
        max_length: Maximum length
        
    Returns:
        Sanitized filename
    """
    # Characters not allowed in filenames on most systems
    invalid_chars = '<>:"/\\|?*\x00-\x1f'
    
    # Replace invalid characters
    for char in invalid_chars:
        filename = filename.replace(char, replacement)
    
    # Remove leading/trailing dots and spaces
    filename = filename.strip('. ')
    
    # Limit length
    if len(filename) > max_length:
        name, ext = os.path.splitext(filename)
        max_name_length = max_length - len(ext)
        filename = name[:max_name_length] + ext
    
    # Handle empty result
    if not filename:
        filename = "unnamed"
    
    return filename


def is_path_traversal_attempt(path: Union[str, Path]) -> bool:
    """
    Check if a path contains traversal attempts.
    
    Args:
        path: Path to check
        
    Returns:
        True if path contains traversal patterns
    """
    path_str = str(path)
    
    # Check for null bytes
    if '\x00' in path_str:
        return True
    
    # Check for parent directory references
    parts = Path(path_str).parts
    if '..' in parts:
        return True
    
    # Check for absolute paths that might escape
    resolved = Path(path_str).resolve()
    if str(resolved).count('..') > 0:
        return True
    
    return False


# Convenience exports
__all__ = [
    'PathValidationError',
    'validate_project_path',
    'validate_path_within_project',
    'validate_file_path',
    'safe_join',
    'get_config_path',
    'get_state_file_path',
    'ensure_parent_exists',
    'sanitize_filename',
    'is_path_traversal_attempt',
]
