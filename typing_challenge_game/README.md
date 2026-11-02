# KEYRUSH — Typing Challenge Arcade

A responsive, animated typing challenge game built with HTML5, CSS3, and vanilla JavaScript (ES6+). It includes two playable modes and a redesigned dark arcade interface.

## Run the project
1. Extract `KeyRush_Typing_Challenge_Final.zip`.
2. Open the `typing_challenge_game` folder in VS Code.
3. Open `index.html` with Live Server, or double-click `index.html` to open it in a browser.
4. Use your physical keyboard while playing.

No npm install, build step, framework, or backend is required. Google Fonts are used when internet is available; system font fallbacks are included.

## Game modes

### Mode A — Bubbles
- Five or more letter bubbles appear at the start and float upward.
- Type a visible letter to pop it for **+10 points**.
- An incorrect letter costs **2 points** and displays immediate feedback.
- A bubble reaching the top counts as a miss. The miss limit depends on difficulty.
- Bubble speed and spawn pressure increase by difficulty and score.

### Mode B — KeyMagnet
- A target letter and on-screen keyboard are displayed.
- Target letters are generated from JavaScript arrays.
- Choose Home row, Top row, or All letters; the chosen set changes the target pool and keyboard.
- Correct answers earn points based on response speed. Incorrect answers receive a difficulty-based score penalty.
- Correct answers, incorrect answers, accuracy, streak, and average correct-response time are tracked.

## Difficulty
Easy, Medium, and Hard change the session duration and gameplay pressure. In Bubbles, they also change bubble speed, spawn interval, active bubble count, and allowed misses. In KeyMagnet, they change duration and incorrect-answer penalty.

## Controls
- **Start session:** starts the selected mode and settings.
- **Restart:** immediately starts a fresh run with the same mode and settings.
- **Reset:** stops and clears the current run, then returns to its settings screen. It does not reload the page.
- **Pause / Resume:** pauses or resumes gameplay; `P` is also supported.
- **Exit session:** ends the current run and opens its results.
- `Esc`: ends the current run.

Timers, animation frames, keyboard listeners, and feedback timeouts are cleaned up when a session ends or is reset/restarted.

## Submission checklist
Submit the complete source folder, including `index.html`, `css/style.css`, `js/app.js`, and this README. Record a separate demo video showing the home screen, both modes, difficulty and key-set selection, gameplay, correct/incorrect feedback, Reset/Restart, and each mode's results screen.
