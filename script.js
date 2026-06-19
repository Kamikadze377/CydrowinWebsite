// hero

const pageHeroParallaxStrength = 0.120123456789;
const pageHeroParallaxLimit = 70;
const pageHeroes = [".hero", ".heroShop"]
    .map((selector) => {
        const element = document.querySelector(selector);
        const title = element ? element.querySelector("h1") : null;

        return element && title
            ? {
                element,
                title,
                measure: document.createElement("span")
            }
            : null;
    })
    .filter(Boolean);

// start

const start = document.querySelector(".start");

// invitation

const invitation = document.querySelector(".invitation");
const invitationImage = document.querySelector(".invitation img");
const invitationTitleRows = document.querySelectorAll(".invitation h1 span");
const invitationButton = document.querySelector(".invitation .button");
const invitationMeasure = invitation ? document.createElement("span") : null;

pageHeroes.forEach(({ measure }) => {
    measure.setAttribute("aria-hidden", "true");
    Object.assign(measure.style, {
        position: "fixed",
        left: "-9999px",
        top: "0",
        visibility: "hidden",
        whiteSpace: "nowrap",
        pointerEvents: "none"
    });
    document.body.appendChild(measure);
});

if (invitationMeasure) {
    invitationMeasure.setAttribute("aria-hidden", "true");
    Object.assign(invitationMeasure.style, {
        position: "fixed",
        left: "-9999px",
        top: "0",
        visibility: "hidden",
        whiteSpace: "nowrap",
        pointerEvents: "none"
    });
    document.body.appendChild(invitationMeasure);
}

function updatePageHeroParallax() {
    pageHeroes.forEach(({ element }) => {
        const rect = element.getBoundingClientRect();
        const offset = rect.top * pageHeroParallaxStrength;
        const clampedOffset = Math.max(-pageHeroParallaxLimit, Math.min(pageHeroParallaxLimit, offset));

        element.style.setProperty("--hero-parallax-y", `${clampedOffset.toFixed(2)}px`);
    });
}

function updatePageHeroTitleSize() {
    pageHeroes.forEach(({ element, title, measure }) => {
        element.style.removeProperty("--hero-title-size");

        const heroRect = element.getBoundingClientRect();
        const titleStyle = window.getComputedStyle(title);
        const rootFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
        const maxSize = parseFloat(titleStyle.fontSize);
        const minSize = Math.max(12, rootFontSize);
        const sidePadding = parseFloat(titleStyle.paddingLeft) + parseFloat(titleStyle.paddingRight);
        const verticalPadding = parseFloat(titleStyle.paddingTop) + parseFloat(titleStyle.paddingBottom);
        const visibleWidth = Math.min(heroRect.width, document.documentElement.clientWidth);
        const availableWidth = Math.max(0, visibleWidth - sidePadding);
        const titleBottom = parseFloat(titleStyle.bottom);
        const availableHeight = Math.max(
            1,
            element.clientHeight
            - verticalPadding
            - (Number.isFinite(titleBottom) ? titleBottom + rootFontSize : rootFontSize * 2)
        );

        measure.textContent = title.textContent;
        measure.style.font = titleStyle.font;
        measure.style.letterSpacing = titleStyle.letterSpacing;

        const textWidth = Math.max(1, measure.getBoundingClientRect().width);
        const titleHeight = Math.max(1, title.scrollHeight);
        const scale = Math.min(1, availableWidth / textWidth, availableHeight / titleHeight);
        const fittedSize = Math.max(minSize, maxSize * scale);

        element.style.setProperty("--hero-title-size", `${fittedSize.toFixed(2)}px`);
    });
}

function updatePageHeroes() {
    updatePageHeroParallax();
    updatePageHeroTitleSize();
}

function updateInvitationSize() {
    if (!start || !invitation || !invitationMeasure) return;

    start.style.removeProperty("--invitation-scale");

    const startRect = start.getBoundingClientRect();
    const startStyle = window.getComputedStyle(start);
    const invitationStyle = window.getComputedStyle(invitation);
    const title = invitation.querySelector("h1");
    const titleStyle = title ? window.getComputedStyle(title) : null;
    const buttonStyle = invitationButton ? window.getComputedStyle(invitationButton) : null;
    const rootFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
    const sidePadding = parseFloat(invitationStyle.paddingLeft) + parseFloat(invitationStyle.paddingRight);
    const visibleWidth = Math.min(startRect.width, document.documentElement.clientWidth);
    const availableWidth = Math.max(1, visibleWidth - sidePadding);
    const availableHeight = Math.max(1, start.clientHeight - (rootFontSize * 2));
    const imageBaseWidth = parseFloat(startStyle.getPropertyValue("--invitation-image-base-width")) || 0;
    const imageBaseHeight = invitationImage && invitationImage.naturalWidth
        ? imageBaseWidth * (invitationImage.naturalHeight / invitationImage.naturalWidth)
        : parseFloat(startStyle.getPropertyValue("--invitation-image-base-height")) || 0;
    const titleLineHeight = titleStyle ? parseFloat(titleStyle.lineHeight) || parseFloat(titleStyle.fontSize) * 1.35 : 0;
    const titleMarginTop = titleStyle ? parseFloat(titleStyle.marginTop) || 0 : 0;
    const titleMarginBottom = titleStyle ? parseFloat(titleStyle.marginBottom) || 0 : 0;
    const titleWidth = titleStyle ? [...invitationTitleRows].reduce((maxWidth, row) => {
        invitationMeasure.textContent = row.textContent;
        invitationMeasure.style.font = titleStyle.font;
        invitationMeasure.style.letterSpacing = titleStyle.letterSpacing;
        return Math.max(maxWidth, invitationMeasure.getBoundingClientRect().width);
    }, 0) : 0;
    const titleHeight = titleStyle ? titleMarginTop + invitationTitleRows.length * titleLineHeight + titleMarginBottom : 0;
    const buttonWidth = buttonStyle && invitationButton ? (() => {
        invitationMeasure.textContent = invitationButton.textContent;
        invitationMeasure.style.font = buttonStyle.font;
        invitationMeasure.style.letterSpacing = buttonStyle.letterSpacing;
        return invitationMeasure.getBoundingClientRect().width
            + (parseFloat(buttonStyle.paddingLeft) || 0)
            + (parseFloat(buttonStyle.paddingRight) || 0);
    })() : 0;
    const buttonLineHeight = buttonStyle ? parseFloat(buttonStyle.lineHeight) || parseFloat(buttonStyle.fontSize) * 1.2 : 0;
    const buttonHeight = buttonStyle
        ? buttonLineHeight + (parseFloat(buttonStyle.paddingTop) || 0) + (parseFloat(buttonStyle.paddingBottom) || 0)
        : 0;
    const contentWidth = Math.max(1, imageBaseWidth, titleWidth, buttonWidth);
    const contentHeight = Math.max(1, imageBaseHeight + titleHeight + buttonHeight);
    const scale = Math.min(1, availableWidth / contentWidth, availableHeight / contentHeight);

    start.style.setProperty("--invitation-scale", scale.toFixed(3));
}

function updateResponsiveElements() {
    updatePageHeroes();
    updateInvitationSize();
}

window.addEventListener("load", updateResponsiveElements);
window.addEventListener("resize", updateResponsiveElements);
window.addEventListener("scroll", updatePageHeroParallax, { passive: true });

if (document.fonts) {
    document.fonts.ready.then(updateResponsiveElements);
}

if (invitationImage && !invitationImage.complete) {
    invitationImage.addEventListener("load", updateInvitationSize);
}

// about

const about = document.querySelector(".about");
const aboutParallaxStrength = 0.120123456789;
const aboutParallaxLimit = 70;

function updateAboutParallax() {
    if (!about) return;

    const rect = about.getBoundingClientRect();
    const offset = rect.top * aboutParallaxStrength;
    const clampedOffset = Math.max(-aboutParallaxLimit, Math.min(aboutParallaxLimit, offset));

    about.style.setProperty("--about-parallax-y", `${clampedOffset.toFixed(2)}px`);
}

// gallery

window.addEventListener("load", updateAboutParallax);
window.addEventListener("scroll", updateAboutParallax);

const revealElements = document.querySelectorAll(".reveal-up");
let revealObserver = null;

function revealElement(element) {
    element.classList.add("visible");

    if (revealObserver) {
        revealObserver.unobserve(element);
    }
}

function revealPassedElements() {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    revealElements.forEach((element) => {
        if (element.classList.contains("visible")) return;

        const rect = element.getBoundingClientRect();

        if (rect.top <= viewportHeight * 0.9 || rect.bottom < 0) {
            revealElement(element);
        }
    });
}

if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                revealElement(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    revealElements.forEach((element) => revealObserver.observe(element));
} else {
    revealElements.forEach(revealElement);
}

window.addEventListener("load", revealPassedElements);
window.addEventListener("scroll", revealPassedElements, { passive: true });

// quick-message

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact-form');
    form && form.addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Dziękujemy — wiadomość została wysłana.');
        form.reset();
    });
});