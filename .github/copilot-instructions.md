# Quadscorer - Darts Scoring Application

Quadscorer is a Laravel 11 web application for scoring darts games on quadro boards (dartboards with quadruple scoring rings). It supports X01 games with 2 players and features an interactive scoring interface with single, double, triple, and quadruple scoring options.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Setup
Run these commands in order to set up a fresh development environment:

```bash
# Copy environment configuration
cp .env.example .env

# Install PHP dependencies - NEVER CANCEL: Takes 3-4 minutes. Set timeout to 10+ minutes.
composer install --no-interaction --prefer-dist

# Generate application key
php artisan key:generate --ansi

# Create SQLite database
touch database/database.sqlite

# Run database migrations
php artisan migrate --ansi

# Install frontend dependencies - Takes ~7 seconds
npm install

# Build frontend assets - Takes ~2 seconds
npm run build
```

**CRITICAL TIMING REQUIREMENTS:**
- **NEVER CANCEL** `composer install` - takes 3-4 minutes, set timeout to 600+ seconds
- `npm install` completes in ~7 seconds
- `npm run build` completes in ~2 seconds
- Database migrations complete in <1 second

### Development Server Options

#### Option 1: Laravel Only (Recommended)
```bash
# Start Laravel development server
php artisan serve --host=0.0.0.0 --port=8000
```
Application will be available at `http://localhost:8000`

#### Option 2: Laravel Sail (Docker)
```bash
# Start with Docker (requires Docker)
./vendor/bin/sail up -d
```

#### Option 3: Concurrent Development Services
**WARNING**: `composer dev` command fails in CI environments due to Vite HMR restrictions. Use individual commands instead:
```bash
# Start server, queue, and logs separately
php artisan serve &
php artisan queue:listen --tries=1 &
php artisan pail --timeout=0 &
```

### Testing

#### PHP Tests
```bash
# Run PHPUnit tests - Completes in <1 second
php artisan test

# DO NOT use parallel testing (requires additional dependencies)
# php artisan test --parallel  # FAILS - ParaTest not installed
```

#### Code Quality
```bash
# Format code with Laravel Pint - Completes in ~1 second
./vendor/bin/pint

# Check for style issues without fixing
./vendor/bin/pint --test
```

## Validation Scenarios

### Complete End-to-End Testing
Always test these user scenarios after making changes:

1. **Game Setup Validation**:
   - Navigate to `http://localhost:8000`
   - Fill in Player 1 name (e.g., "Alice")
   - Fill in Player 2 name (e.g., "Bob") 
   - Set starting score (e.g., 301)
   - Enable "Quadro board?" checkbox
   - Click "Start game"
   - Verify navigation to `/x01` route

2. **Scoring System Validation**:
   - Verify both player scores display correctly
   - Click quadruple buttons (Q20, Q19, etc.) and verify 4x scoring
   - Click triple buttons (T20, T19, etc.) and verify 3x scoring  
   - Click double buttons (D20, D19, etc.) and verify 2x scoring
   - Click single number buttons and verify 1x scoring
   - Test special buttons: 0, 25, Bullseye (50)
   - Click "Enter!" to submit score and verify player score reduction
   - Click "Clear" to reset current dart entry

3. **Interface Validation**:
   - Verify score calculation displays (e.g., "80 + 60 + 20")
   - Verify remaining score updates correctly
   - Verify "Home" link returns to setup page
   - Test responsive design on different screen sizes

### Expected Scoring Values
- Single numbers (1-20): Face value
- Double (D1-D20): 2x face value  
- Triple (T1-T20): 3x face value
- **Quadruple (Q1-Q20): 4x face value** (unique to quadro boards)
- Single Bull (25): 25 points
- Bullseye (Double Bull): 50 points
- Miss (0): 0 points

## System Requirements

### Required Software
- **PHP**: 8.2+ (tested with PHP 8.3.6)
- **Composer**: 2.8+ (tested with Composer 2.8.11)
- **Node.js**: 20+ (tested with Node.js v20.19.5)
- **npm**: 10+ (tested with npm 10.8.2)

### Database
- **Primary**: SQLite (file-based, no server required)
- **Alternative**: MySQL, PostgreSQL (via Docker with Laravel Sail)

## Project Structure

### Key Files and Directories
- `app/Http/Controllers/X01Controller.php` - Main game logic and scoring validation
- `resources/views/index.blade.php` - Game setup form
- `resources/views/game.blade.php` - Interactive scoring interface  
- `routes/web.php` - Application routing (homepage and game routes)
- `database/database.sqlite` - SQLite database file (created during setup)
- `public/build/` - Compiled frontend assets (created by Vite)

### Frontend Architecture
- **Build System**: Vite 6.3.6
- **CSS Framework**: TailwindCSS 3.4.13 with Flowbite components
- **JavaScript**: Vanilla JS with axios for HTTP requests
- **Assets**: Images, CSS, and JS in `resources/` directory

### Backend Architecture  
- **Framework**: Laravel 11.44.1
- **Database ORM**: Eloquent (with migrations for users, cache, jobs)
- **Queue System**: Database-backed queues
- **Scoring Logic**: Uses PHP Data Structures (php-ds/php-ds) Set class for efficient scoring calculations

## Troubleshooting

### Common Issues
- **Vite HMR Error in CI**: Set `LARAVEL_BYPASS_ENV_CHECK=1` or use `npm run build` instead of `npm run dev`
- **Parallel Testing Fails**: Use `php artisan test` without `--parallel` flag  
- **Composer Timeout**: Increase timeout to 600+ seconds, composer install takes 3-4 minutes
- **Missing .env**: Copy from `.env.example` before running other commands
- **Database Errors**: Ensure `database/database.sqlite` file exists and is writable

### Development Workflow
1. **Always run setup commands** before making changes
2. **Test functionality** with actual gameplay scenarios
3. **Run code formatting** with `./vendor/bin/pint` before committing
4. **Run tests** with `php artisan test` to verify no regressions
5. **Manual validation** is required - automated tests are minimal

## Performance Expectations

### Build Times (Set appropriate timeouts)
- **composer install**: 3-4 minutes - **NEVER CANCEL**, set 600+ second timeout
- **npm install**: ~7 seconds
- **npm run build**: ~2 seconds  
- **php artisan test**: <1 second
- **./vendor/bin/pint**: ~1 second

### Application Performance
- Server startup: <1 second
- Database migrations: <1 second  
- Page load times: <100ms for both setup and game pages
- Scoring calculations: Instantaneous (client-side JavaScript with backend validation)

Always validate that your changes work with the complete user workflow: setup game → enter scores → verify calculations → complete game flow.