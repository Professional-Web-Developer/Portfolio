// Remembers which way a visitor chose to explore the site ("classic", "city",
// or "dismissed" when they closed the chooser). It only decides whether the
// first-visit chooser is shown again; it never redirects: "/" is always the
// classic site and "/city" is always Career City.

const KEY = 'explore-view';

export function readViewChoice() {
    try {
        return window.localStorage.getItem(KEY);
    } catch {
        return null;
    }
}

export function rememberViewChoice(choice) {
    try {
        window.localStorage.setItem(KEY, choice);
    } catch {
        /* storage unavailable: the choice just is not remembered */
    }
}
