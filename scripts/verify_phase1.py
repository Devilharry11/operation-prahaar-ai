#!/usr/bin/env python3
"""
OPERATION PRAHAAR AI - Phase 1 Verification Script
Run this script to verify your development environment, folder structure,
and responsible AI configuration invariants.
"""

import sys
import os
import shutil
import subprocess
from pathlib import Path

# ANSI Color Codes for Indian Defence-Inspired Command Center Terminal Output
RESET = "\033[0m"
BOLD = "\033[1m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
CYAN = "\033[36m"
RED = "\033[31m"
OLIVE = "\033[38;5;100m"


def print_banner():
    banner = f"""{OLIVE}{BOLD}
================================================================================
   ____  ____  ______ ____     _      _     ____       _      ___ 
  |  _ \\|  _ \\|  _   |  _ \\   / \\    / \\   |  _ \\     / \\    |_ _|
  | |_) | |_) | |_)  | | | | / _ \\  / _ \\  | |_) |   / _ \\    | | 
  |  __/|  _ <|  _   | |_| |/ ___ \\/ ___ \\ |  _ <   / ___ \\   | | 
  |_|   |_| \\_\\_| \\__|____//_/   \\_\\_/   \\_\\_| \\_\\ /_/   \\_\\ |___|
                                                                  
   OPERATION PRAHAAR AI — PHASE 1 FOUNDATION & READINESS AUDIT
   "Justice Through Intelligence. Protection Through Technology."
================================================================================{RESET}"""
    print(banner)


def check_step(title: str, condition: bool, details: str = "") -> bool:
    status = f"{GREEN}[PASS]{RESET}" if condition else f"{RED}[FAIL]{RESET}"
    print(f" {status} {BOLD}{title}{RESET}")
    if details:
        print(f"        {CYAN}--> {details}{RESET}")
    return condition


def main():
    print_banner()
    root_dir = Path(__file__).resolve().parent.parent
    all_passed = True

    print(f"\n{YELLOW}{BOLD}1. SYSTEM ENVIRONMENT CHECKS:{RESET}")

    # Python version check
    py_ver = sys.version_info
    py_ok = (py_ver.major == 3 and py_ver.minor >= 10)
    py_str = f"Python {py_ver.major}.{py_ver.minor}.{py_ver.micro} ({sys.executable})"
    if not check_step("Python Version (>= 3.10)", py_ok, py_str):
        all_passed = False

    # Git check
    git_bin = shutil.which("git")
    git_ok = git_bin is not None
    git_details = f"Detected at {git_bin}" if git_ok else "Git binary not found in PATH"
    if not check_step("Git Version Control System", git_ok, git_details):
        all_passed = False

    # Node.js check
    node_bin = shutil.which("node")
    npm_bin = shutil.which("npm")
    node_ok = node_bin is not None and npm_bin is not None
    node_details = f"Node: {node_bin}, NPM: {npm_bin}" if node_ok else "Node.js / npm not detected"
    if not check_step("Node.js & npm (Command Center Frontend)", node_ok, node_details):
        all_passed = False

    print(f"\n{YELLOW}{BOLD}2. DIRECTORY STRUCTURE VERIFICATION:{RESET}")
    required_dirs = [
        "backend",
        "backend/app",
        "backend/app/core",
        "backend/app/db",
        "backend/app/models",
        "backend/app/schemas",
        "backend/app/api",
        "backend/app/services",
        "edge",
        "frontend",
        "data/samples",
        "data/advisories",
        "docs",
        "scripts",
        "tests",
    ]
    dirs_ok = True
    for d in required_dirs:
        dir_path = root_dir / d
        if not dir_path.is_dir():
            dirs_ok = False
            print(f"        {RED}Missing: {d}{RESET}")
    if not check_step("Core Architecture Directories", dirs_ok, f"{len(required_dirs)} directories validated"):
        all_passed = False

    print(f"\n{YELLOW}{BOLD}3. REPOSITORY & DOCUMENTATION ARTIFACTS:{RESET}")
    required_files = [
        ".gitignore",
        ".env.example",
        "README.md",
        "docs/ARCHITECTURE.md",
        "docs/RESPONSIBLE_AI.md",
        "docs/HARDWARE_ROADMAP.md",
        "backend/requirements.txt",
        "backend/requirements-dev.txt",
        "edge/requirements-edge.txt",
        "backend/app/core/config.py",
        "edge/config.py",
    ]
    files_ok = True
    for f in required_files:
        fpath = root_dir / f
        if not fpath.is_file():
            files_ok = False
            print(f"        {RED}Missing: {f}{RESET}")
    if not check_step("Project Foundation Files", files_ok, f"{len(required_files)} files validated"):
        all_passed = False

    print(f"\n{YELLOW}{BOLD}4. RESPONSIBLE AI CONFIGURATION INVARIANTS:{RESET}")
    try:
        sys.path.insert(0, str(root_dir))
        from backend.app.core.config import settings

        rai_facial = (settings.ALLOW_FACIAL_RECOGNITION is False)
        rai_profiling = (settings.ALLOW_INDIVIDUAL_PROFILING is False)
        rai_human = (settings.REQUIRE_HUMAN_VERIFICATION is True)
        rai_privacy = (settings.PRIVACY_PRESERVING_MODE is True)

        check_step("Facial Recognition Prohibition", rai_facial, "ALLOW_FACIAL_RECOGNITION = False")
        check_step("Individual Profiling Prohibition", rai_profiling, "ALLOW_INDIVIDUAL_PROFILING = False")
        check_step("Mandatory Human-in-the-Loop", rai_human, "REQUIRE_HUMAN_VERIFICATION = True")
        check_step("Privacy-Preserving Spatial Analytics", rai_privacy, "PRIVACY_PRESERVING_MODE = True")

        if not (rai_facial and rai_profiling and rai_human and rai_privacy):
            all_passed = False
    except Exception as e:
        check_step("Responsible AI Invariant Load", False, f"Error: {e}")
        all_passed = False

    print(f"\n{YELLOW}{BOLD}5. EDGE CONSTRAINTS AUDIT (8 GB RAM LAPTOP BUDGET):{RESET}")
    try:
        from edge.config import edge_settings

        fps_ok = edge_settings.MAX_PROCESSING_FPS <= 15
        res_ok = edge_settings.FRAME_WIDTH <= 1280
        check_step("CPU Throttle Cap (FPS Limit)", fps_ok, f"Cap: {edge_settings.MAX_PROCESSING_FPS} fps")
        check_step("Frame Resolution Cap", res_ok, f"{edge_settings.FRAME_WIDTH}x{edge_settings.FRAME_HEIGHT}")
        if not (fps_ok and res_ok):
            all_passed = False
    except Exception as e:
        check_step("Edge Settings Load", False, f"Error: {e}")
        all_passed = False

    print("\n" + "=" * 80)
    if all_passed:
        print(f"{GREEN}{BOLD}>>> PHASE 1 FOUNDATION & VERIFICATION SUCCESSFUL! <<<{RESET}")
        print(f"{CYAN}Ready for user review and confirmation before advancing to Phase 2.{RESET}\n")
        return 0
    else:
        print(f"{RED}{BOLD}>>> PHASE 1 CHECKS ENCOUNTERED ISSUES. PLEASE REVIEW ABOVE. <<<{RESET}\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
