# IdleForge Deployment Guide

## 🚨 QUICK SAVE RESET ACCESS

**Need to reset saves immediately?** Use the browser console:

```javascript
// Reset all player saves instantly
IdleForgeDebug.forceResetSave();
```

Or manually clear localStorage:

```javascript
localStorage.removeItem("idleMinerSave");
localStorage.removeItem("idleMinerHighscore");
location.reload();
```

---

## Save Reset System

The game now includes a configurable save reset system for managing player saves across different update types.

### Configuration

In `script.js`, you'll find these configuration constants:

```javascript
const GAME_VERSION = "0.1.35"; // Update this with each release
const RESET_SAVES_ON_VERSION_CHANGE = false; // Set to true for major updates, false for minor
```

### Deployment Types

#### Minor Updates (Bug fixes, small features)

```javascript
const GAME_VERSION = "0.1.36"; // Increment patch version
const RESET_SAVES_ON_VERSION_CHANGE = false; // Preserve player saves
```

#### Major Updates (Breaking changes, major features)

```javascript
const GAME_VERSION = "0.2.0"; // Increment major/minor version
const RESET_SAVES_ON_VERSION_CHANGE = true; // Reset player saves
```

### How It Works

1. **Version Tracking**: Each save now includes the game version it was created with
2. **Version Comparison**: On load, the game compares the saved version with the current version
3. **Conditional Reset**: If `RESET_SAVES_ON_VERSION_CHANGE` is `true` and versions differ, saves are cleared
4. **User Notification**: Players are informed when their save is reset due to a major update

### Deployment Checklist

1. Update `GAME_VERSION` to match your release version
2. Set `RESET_SAVES_ON_VERSION_CHANGE`:
   - `false` for minor updates (preserves saves)
   - `true` for major updates (resets saves)
3. Update `version.txt` to match
4. Test locally before deployment
5. Deploy to production

### Developer Tools

**🔧 IMMEDIATE SAVE RESET COMMANDS:**

```javascript
// 🚨 RESET ALL SAVES NOW (use for emergencies)
IdleForgeDebug.forceResetSave();

// Check if saves would be reset with current settings
IdleForgeDebug.getVersionInfo();

// Get current game version
IdleForgeDebug.getCurrentVersion();

// Check current reset setting
IdleForgeDebug.getResetSetting();
```

**Alternative manual reset method:**

```javascript
// Clear saves manually without reload
localStorage.removeItem("idleMinerSave");
localStorage.removeItem("idleMinerHighscore");
console.log("Saves cleared manually");
```

Open browser console (F12) and paste any command above.

### Console Logging

The game logs version information on startup:

- Game version and reset setting status
- Save version information if a save exists
- Version change notifications when resets occur

### Example Scenarios

#### Scenario 1: Bug Fix Update

```javascript
// Before: v0.1.35
// After: v0.1.36
const RESET_SAVES_ON_VERSION_CHANGE = false;
// Result: Players keep their saves, bug is fixed
```

#### Scenario 2: Major Feature Update

```javascript
// Before: v0.1.35
// After: v0.2.0
const RESET_SAVES_ON_VERSION_CHANGE = true;
// Result: Players get fresh start with new features
```

#### Scenario 3: Minor Feature Update

```javascript
// Before: v0.1.35
// After: v0.1.36
const RESET_SAVES_ON_VERSION_CHANGE = false;
// Result: Players keep saves and get new features
```

This system gives you full control over when to preserve vs. reset player progress based on the significance of your updates.

---

## 🔥 EMERGENCY SAVE RESET PROCEDURES

### Method 1: Console Command (Recommended)

1. Open browser console (F12)
2. Type: `IdleForgeDebug.forceResetSave()`
3. Press Enter - saves are cleared and page reloads

### Method 2: Manual localStorage Clear

1. Open browser console (F12)
2. Type: `localStorage.clear()` or specifically:
   ```javascript
   localStorage.removeItem("idleMinerSave");
   localStorage.removeItem("idleMinerHighscore");
   location.reload();
   ```

### Method 3: Browser Settings

1. Open browser settings
2. Go to Privacy/Storage
3. Clear site data for your domain
4. Refresh the page

### Method 4: Code Change (For Deployment)

1. In `script.js`, temporarily set:
   ```javascript
   const RESET_SAVES_ON_VERSION_CHANGE = true;
   ```
2. Change version number:
   ```javascript
   const GAME_VERSION = "0.1.36"; // Any different version
   ```
3. Deploy - all player saves will reset on next load
4. **Remember to change back to `false` after deployment**
