export function depthMerge(toBeAdded, changed) {
    for (const entry of Object.entries(toBeAdded)) {
        let cursor = changed;
        let lastCursor = cursor;
        const paths = entry[0].split("\. ")
        for (const path of paths) {
            if (!cursor[path]) {
                cursor[path] = {};
            }
            lastCursor = cursor;
            cursor = cursor[path];
        }
        lastCursor = entry[1];
    }
}

export function titleCase(s) {
    if (!s) return s;
    const words = s.split(" ");

    for (let i = 0; i < words.length; i++) {
        if (words[i][0] === "(") {
            words[i] = words[i][0] + words[i][1].toUpperCase() + words[i].substr(2);
        } else {
            words[i] = words[i][0].toUpperCase() + words[i].substr(1);
        }
    }
    return words.join(" ");
}
