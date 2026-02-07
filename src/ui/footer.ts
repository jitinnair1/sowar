import siteConfig from "../../site.toml";

export function renderFooter() {
    const footer = document.getElementById("footer");
    if (!footer) return;
    footer.innerHTML = `
        <div class="flex items-center gap-8">
            <span class="text-xs text-fg-muted">
                <a href="${siteConfig.project_url}" target="_blank">Star on GitHub</a>
            </span>
            <span class="text-xs text-fg-muted">
                <a href="${siteConfig.project_url}/issues" target="_blank">Report an Error</a>
            </span>
            <span id="build-date" class="text-xs text-fg-muted order-last">
              Last updated on ${BUILD_DATE}
            </span>
        </div>
    `;
}