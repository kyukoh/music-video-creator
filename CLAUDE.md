# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Music Video Creator is a PHP-based web application for managing music video production projects. It allows users to organize songs into scenes with lyrics, descriptions, and associated media files (images/videos).

## Development Commands

### Starting the Application

```bash
# Navigate to public directory and start PHP built-in server
cd public
php -S localhost:8000

# Alternative: Using start scripts from project root
./start.sh   # Mac/Linux
start.bat    # Windows
```

### File Permissions (Unix/Linux/Mac)

```bash
# Set proper permissions for data directories
chmod 755 data/
chmod 755 data/projects/
```

## Architecture

### Technology Stack
- **Backend**: PHP 7.4+ (no framework, vanilla PHP)
- **Frontend**: Vanilla JavaScript (ES6+), TailwindCSS
- **Data Storage**: JSON files (no database)
- **Server**: PHP built-in server or Apache/Nginx

### Directory Structure

```
/
├── config.php              # Application configuration and constants
├── data/                   # Data storage directory
│   ├── projects.json       # Project list
│   └── projects/           # Individual project data
│       └── {project-id}/
│           ├── config.json # Project configuration
│           ├── scenes.json # Scene data
│           └── media/      # Media files
├── public/                 # Web root
│   ├── index.php          # Main application entry
│   ├── api/               # API endpoints
│   │   ├── media.php      # Media management API
│   │   ├── projects.php   # Project CRUD API
│   │   └── scenes.php     # Scene management API
│   └── assets/
│       └── js/
│           └── app.js     # Main JavaScript application (270KB)
├── src/                    # PHP classes
│   ├── MediaLibrary.php   # Media file management
│   ├── Project.php        # Project operations
│   └── Scene.php          # Scene operations
├── specs/                  # Project specifications (not AWS CDK)
│   ├── design.md          # System design document
│   ├── requirements.md    # Detailed requirements
│   ├── tasks.md          # Development tasks
│   └── ui-design.md      # UI/UX specifications
└── templates/              # HTML templates

```

### Key Components

1. **Project Management** (`src/Project.php`): Handles CRUD operations for projects stored as JSON
2. **Scene Management** (`src/Scene.php`): Manages scene data including lyrics, descriptions, and prompts
3. **Media Library** (`src/MediaLibrary.php`): File upload/deletion for images and videos
4. **Frontend App** (`public/assets/js/app.js`): Single-page application handling UI interactions

### API Endpoints

All APIs return JSON responses and use standard HTTP methods:

- `GET/POST/PUT/DELETE /api/projects.php` - Project management
- `GET/POST /api/scenes.php` - Scene operations (includes bulk upload)
- `GET/POST/DELETE /api/media.php` - Media file management

### Data Flow

1. Frontend makes AJAX calls to PHP API endpoints
2. API endpoints use PHP classes in `src/` to process requests
3. Data is persisted to JSON files in `data/` directory
4. Media files are stored in project-specific directories

## Important Considerations

- **No Package Manager**: This is a vanilla PHP/JS project without npm/composer
- **File-based Storage**: All data stored as JSON files, no database required
- **Japanese UI**: Application interface is primarily in Japanese
- **Local Development**: Designed for local use, not production deployment
- **Media Handling**: Supports image (jpg, png, gif) and video (mp4, mov, avi) files up to 100MB
- **Specifications**: The `specs/` directory contains project requirements and design documents (not AWS CDK as initially mentioned)