const HIPOLABS_URL = "http://universities.hipolabs.com/search?domain=";

const cache = new Map();

const queryDomain = async (domain) => {
    if (cache.has(domain)) return cache.get(domain);
    try {
        const res  = await fetch(`${HIPOLABS_URL}${encodeURIComponent(domain)}`);
        const data = await res.json();
        const name = data.length > 0 ? data[0].name : null;
        cache.set(domain, name);
        return name;
    } catch {
        cache.set(domain, null);
        return null;
    }
};

// Tries the full domain, then walks up through parent domains until a match is found.
// e.g. stu.ibu.edu.ba → ibu.edu.ba → edu.ba (stops when only one part remains)
const resolveCollege = async (email) => {
    const domain = email.split("@")[1];
    if (!domain) return null;

    const parts = domain.split(".");
    for (let i = 0; i < parts.length - 1; i++) {
        const candidate = parts.slice(i).join(".");
        const name = await queryDomain(candidate);
        if (name) return name;
    }
    return null;
};

module.exports = { resolveCollege };
